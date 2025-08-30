"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Wallet, 
  TrendingUp, 
  BarChart3, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  LogOut,
  ArrowRightLeft,
  Download,
  Upload,
  History,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ethers } from "ethers"
import axios from "axios"

// AgentSwap Contract ABI - imported from data/abi.json
const AGENT_SWAP_ABI = [
  "function swapTokenForToken(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin, address to) public",
  "function swapTokenForBnb(address tokenIn, uint256 amountIn, uint256 amountOutMin, address to) public",
  "function swapBnbForToken(address tokenOut, uint256 amountOutMin, address to) public payable"
];

// Contract address for AgentSwap - replace with actual contract address when deployed
const AGENT_SWAP_ADDRESS = "0x8f34751023D140C75A62B0809dB3E04c8F59428c";

// Token addresses (match the ones in the API)
const TOKEN_ADDRESSES = {
  "TWT": "0x4B0F1812e5Df2A09796481Ff14017e6005508003",
  "XVS": "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
  "CAKE": "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82"
};

// Token color scheme
const TOKEN_COLORS = {
  "TWT": "#F0B90B",
  "XVS": "#F3BA2F",
  "CAKE": "#8B5CF6"
};

// Fallback color for unknown tokens
const FALLBACK_COLOR = "#6366F1";

// Rebalance steps enum
enum RebalanceStep {
  NotStarted,
  FirstSwap,
  SecondSwap,
  Completed
}

// Token prediction interface
interface TokenPrediction {
  token: string;
  return_7d: number;
}

interface AIModelResponse {
  predictions: TokenPrediction[];
  new_allocation: Record<string, number>;
}

// Swap history interface
interface SwapHistoryItem {
  name: string;
  info: any;
  content?: {
    walletAddress: string;
    swapId: string;
    oldAllocation: Record<string, number>;
    newAllocation: Record<string, number>;
    strategy: string;
    timestamp: string;
  };
  downloadError?: string;
}

// Custom circular progress component
function CircularProgress({ 
  value, 
  color, 
  size = 120, 
  strokeWidth = 8, 
  label, 
  sublabel 
}: { 
  value: number; 
  color: string; 
  size?: number; 
  strokeWidth?: number; 
  label: string; 
  sublabel: string; 
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{value}%</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="font-medium text-lg">{label}</div>
        <div className="text-sm text-muted-foreground">{sublabel}</div>
      </div>
    </div>
  )
}

// Token allocation type
interface TokenAllocation {
  symbol: string;
  value: number;
  percentage: number;
  usdValue: number;
  color?: string;
}

// Portfolio data type
interface PortfolioData {
  address: string;
  balances: Record<string, string>;
  allocation: TokenAllocation[];
  totalValue: number;
}

export default function Dashboard() {
  const [selectedStrategy, setSelectedStrategy] = useState("Balanced")
  const [rebalanceStep, setRebalanceStep] = useState<RebalanceStep>(RebalanceStep.NotStarted)
  const [isProcessing, setIsProcessing] = useState(false)
  const [stepStatus, setStepStatus] = useState({
    firstSwap: false,
    secondSwap: false
  })
  const [transactionError, setTransactionError] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiPredictions, setAiPredictions] = useState<TokenPrediction[]>([])
  const [aiAllocation, setAiAllocation] = useState<Record<string, number>>({})
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [strategies, setStrategies] = useState<any[]>([])
  const [isLoadingStrategies, setIsLoadingStrategies] = useState(false)
  const [swapHistory, setSwapHistory] = useState<SwapHistoryItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  // Fetch portfolio data when session is available
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (status === "authenticated" && session?.user?.walletAddress) {
        try {
          setIsLoading(true);
          setError(null);
          
          const response = await fetch("/api/portfolio", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              walletAddress: session.user.walletAddress,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch portfolio data");
          }

          const data = await response.json();
          
          // Add colors to the allocation data
          const allocationsWithColors = data.allocation.map((item: TokenAllocation) => ({
            ...item,
            color: TOKEN_COLORS[item.symbol as keyof typeof TOKEN_COLORS] || FALLBACK_COLOR
          }));
          
          setPortfolio({
            ...data,
            allocation: allocationsWithColors
          });
        } catch (err) {
          console.error("Error fetching portfolio:", err);
          setError(err instanceof Error ? err.message : "Failed to fetch portfolio data");
        } finally {
          setIsLoading(false);
        }
      } else if (status === "authenticated" && !session?.user?.walletAddress) {
        setIsLoading(false);
        setError("No wallet connected. Please connect your wallet to view your portfolio.");
      }
    };

    fetchPortfolio();
  }, [session, status]);

  // Add a function to fetch AI strategies
  const fetchAIStrategies = async () => {
    setIsLoadingStrategies(true);
    
    // Directly set default strategies
    setStrategies([
      {
        id: "growth",
        name: "Growth",
        description: "Higher risk, higher potential returns",
        allocation: { WBNB: 60, BUSD: 20, CAKE: 20 },
      },
      {
        id: "balanced",
        name: "Balanced",
        description: "Moderate risk and returns",
        allocation: { WBNB: 40, BUSD: 40, CAKE: 20 },
      },
      {
        id: "conservative",
        name: "Conservative",
        description: "Lower risk, stable returns",
        allocation: { WBNB: 20, BUSD: 60, CAKE: 20 },
      },
    ]);
  
    setIsLoadingStrategies(false);
  };
  

  // Fetch strategies when the component mounts
  useEffect(() => {
    fetchAIStrategies();
  }, []);

  // Calculate the amounts for rebalancing based on selected strategy
  const calculateRebalanceAmounts = () => {
    if (!portfolio || !portfolio.allocation) return null;
    
    // Get current token allocations with USD values
    const currentTokens = portfolio.allocation.reduce((acc, token) => {
      acc[token.symbol] = {
        value: token.value,
        usdValue: token.usdValue,
        percentage: token.percentage
      };
      return acc;
    }, {} as Record<string, { value: number, usdValue: number, percentage: number }>);

    // Total portfolio value
    const totalUsdValue = portfolio.totalValue;
    
    // Determine target allocations - use AI if available, otherwise use predefined strategies
    let targetUsdValues: Record<string, number> = {};
    
    if (Object.keys(aiAllocation).length > 0) {
      // Use AI-suggested allocations if available
      targetUsdValues = Object.entries(aiAllocation).reduce((acc, [symbol, allocation]) => {
        acc[symbol] = allocation * totalUsdValue; // allocation is already in decimal (0-1)
        return acc;
      }, {} as Record<string, number>);
    } else {
      // Fallback to strategy-based allocation if AI suggestions not available
      const strategy = strategies.find(s => s.id === selectedStrategy);
      if (!strategy) return null;
      
      targetUsdValues = Object.entries(strategy.allocation).reduce((acc, [symbol, percentage]) => {
        acc[symbol] = (Number(percentage) / 100) * totalUsdValue;
        return acc;
      }, {} as Record<string, number>);
    }

    // Identify tokens to swap from and to based on USD value differences
    const swaps: {
      fromToken: string;
      toToken: string;
      fromTokenAmount: number;
      usdValueToSwap: number;
      fromCurrentUsd: number;
      fromTargetUsd: number;
      toCurrentUsd: number;
      toTargetUsd: number;
    }[] = [];

    // Find tokens that are over their target allocation in USD terms (potential sources)
    const overAllocatedTokens = Object.keys(currentTokens)
      .filter(symbol => {
        const targetUsd = targetUsdValues[symbol] || 0;
        return currentTokens[symbol].usdValue > targetUsd;
      })
      .sort((a, b) => 
        (currentTokens[b].usdValue - (targetUsdValues[b] || 0)) - 
        (currentTokens[a].usdValue - (targetUsdValues[a] || 0))
      );

    // Find tokens that are under their target allocation in USD terms (potential destinations)
    const underAllocatedTokens = Object.keys(currentTokens)
      .filter(symbol => {
        const targetUsd = targetUsdValues[symbol] || 0;
        return currentTokens[symbol].usdValue < targetUsd;
      })
      .sort((a, b) => 
        ((targetUsdValues[b] || 0) - currentTokens[b].usdValue) - 
        ((targetUsdValues[a] || 0) - currentTokens[a].usdValue)
      );

    // Create necessary swaps (from highest over-allocation to highest under-allocation in USD terms)
    if (overAllocatedTokens.length > 0 && underAllocatedTokens.length > 0) {
      // We'll only handle the top two priority swaps for simplicity
      for (let i = 0; i < Math.min(2, underAllocatedTokens.length); i++) {
        const toToken = underAllocatedTokens[i];
        const fromToken = overAllocatedTokens[0]; // Always use the most over-allocated token as source
        
        const fromCurrentUsd = currentTokens[fromToken].usdValue;
        const fromTargetUsd = targetUsdValues[fromToken] || 0;
        
        const toCurrentUsd = currentTokens[toToken].usdValue;
        const toTargetUsd = targetUsdValues[toToken] || 0;
        
        // Calculate how much USD value to swap
        const usdValueToSwap = Math.min(
          fromCurrentUsd - fromTargetUsd,
          toTargetUsd - toCurrentUsd
        );
        
        // Ensure we don't try to swap more than available
        if (usdValueToSwap > 0) {
          // Calculate the actual token amount to swap based on USD value
          // This assumes we have price data per token
          // In a real app, you would need precise price data
          const fromTokenPrice = fromCurrentUsd / currentTokens[fromToken].value;
          const fromTokenAmount = usdValueToSwap / fromTokenPrice;
          
          swaps.push({
            fromToken,
            toToken,
            fromTokenAmount,
            usdValueToSwap,
            fromCurrentUsd,
            fromTargetUsd,
            toCurrentUsd,
            toTargetUsd
          });
        }
      }
    }
    
    return {
      swaps,
      targetUsdValues,
      totalUsdValue,
      overAllocatedTokens,
      underAllocatedTokens
    };
  };

  // Add function to check if token is supported before swapping
  const checkTokenSupport = async (provider: ethers.BrowserProvider, tokenAddress: string) => {
    try {
      const contract = new ethers.Contract(AGENT_SWAP_ADDRESS, AGENT_SWAP_ABI, provider);
      // For AgentSwap contract, we'll assume tokens are supported and let the contract handle errors
      return true;
    } catch (error) {
      console.error("Error checking token support:", error);
      return false;
    }
  };

  // Update handleFirstSwap function with better error handling
  const handleFirstSwap = async () => {
    if (!window.ethereum || !session?.user?.walletAddress) {
      setTransactionError("MetaMask not installed or not connected");
      return;
    }

    const rebalanceData = calculateRebalanceAmounts();
    if (!rebalanceData || rebalanceData.swaps.length === 0) {
      setTransactionError("Failed to calculate swap amounts");
      return;
    }

    const firstSwap = rebalanceData.swaps[0];
    
    setIsProcessing(true);
    setRebalanceStep(RebalanceStep.FirstSwap);
    setTransactionError(null);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Get token addresses
      const fromToken = TOKEN_ADDRESSES[firstSwap.fromToken as keyof typeof TOKEN_ADDRESSES];
      const toToken = TOKEN_ADDRESSES[firstSwap.toToken as keyof typeof TOKEN_ADDRESSES];
      
      if (!fromToken || !toToken) {
        throw new Error(`Token address not found for ${firstSwap.fromToken} or ${firstSwap.toToken}`);
      }
      
      // Check if tokens are supported before proceeding
      console.log(`Attempting to swap ${firstSwap.fromToken} (${fromToken}) to ${firstSwap.toToken} (${toToken})`);
      
      // Try to create a contract instance
      const contract = new ethers.Contract(AGENT_SWAP_ADDRESS, AGENT_SWAP_ABI, signer);
      
      // Convert amount to Wei
      const amount = ethers.parseUnits(firstSwap.fromTokenAmount.toFixed(18), 18);
      
      // Check if we need to approve the token first
      try {
        // ERC20 minimal ABI just for approval
        const ERC20_ABI = [
          "function approve(address spender, uint256 amount) public returns (bool)",
          "function allowance(address owner, address spender) public view returns (uint256)"
        ];
        
        // Create token contract instance
        const tokenContract = new ethers.Contract(fromToken, ERC20_ABI, signer);
        
        // Check current allowance - wrapped in try/catch to handle tokens with non-standard implementations
        let needsApproval = true;
        try {
          const userAddress = await signer.getAddress();
          console.log(`Checking allowance for ${userAddress} to spend ${firstSwap.fromToken}`);
          const currentAllowance = await tokenContract.allowance(userAddress, AGENT_SWAP_ADDRESS);
          console.log(`Current allowance: ${currentAllowance.toString()}`);
          needsApproval = currentAllowance < amount;
        } catch (allowanceError) {
          console.warn(`Could not check allowance for ${firstSwap.fromToken}, proceeding with approval:`, allowanceError);
          // Continue with approval if we can't check allowance
        }
        
        // Always approve for CAKE token due to potential issues with allowance checks
        if (needsApproval || firstSwap.fromToken === "CAKE") {
          console.log(`Approving ${AGENT_SWAP_ADDRESS} to spend ${firstSwap.fromToken}`);
          // Set a very large approval amount to avoid future issues
          const maxApproval = ethers.parseUnits("999999999", 18);
          const approveTx = await tokenContract.approve(AGENT_SWAP_ADDRESS, maxApproval);
          await approveTx.wait();
          console.log("Approval successful");
        } else {
          console.log("Token already approved");
        }
      } catch (approvalError) {
        console.error("Approval error:", approvalError);
        throw new Error(`Failed to approve ${firstSwap.fromToken} for swap: ${approvalError instanceof Error ? approvalError.message : String(approvalError)}`);
      }
      
      // Execute the swap using swapTokenForToken
      const userAddress = await signer.getAddress();
      console.log(`Swapping ${amount.toString()} of ${firstSwap.fromToken} to ${firstSwap.toToken}`);
      console.log('=========== SWAP FUNCTION PARAMETERS ===========');
      console.log(`tokenIn address: ${fromToken}`);
      console.log(`tokenOut address: ${toToken}`);
      console.log(`amountIn (Wei): ${amount.toString()}`);
      console.log(`amountIn (decimal): ${ethers.formatUnits(amount, 18)}`);
      console.log(`amountOutMin: 0`);
      console.log(`to address: ${userAddress}`);
      console.log(`gas limit: 500000`);
      console.log(`contract address: ${AGENT_SWAP_ADDRESS}`);
      console.log(`caller address: ${userAddress}`);
      console.log('===============================================');
      
      try {
        console.log(`Sending swapTokenForToken transaction with parameters:
          - tokenIn: ${fromToken}
          - tokenOut: ${toToken}
          - amountIn: ${amount.toString()}
          - amountOutMin: 0
          - to: ${userAddress}
        `);
        
        // Set a high gas limit manually instead of estimating
        const tx = await contract.swapTokenForToken(fromToken, toToken, amount, 0, userAddress, {
          gasLimit: 500000 // Set a high fixed gas limit
        });
          
        console.log(`Transaction sent: ${tx.hash}`);
        console.log(`Waiting for transaction confirmation...`);
        
        await tx.wait();
        console.log(`Transaction confirmed!`);
        
        setTransactionHash(prev => ({ ...prev, firstSwap: tx.hash }));
        setStepStatus(prev => ({ ...prev, firstSwap: true }));
        
        // If there's a second swap, move to that step, otherwise mark as completed
        if (rebalanceData && rebalanceData.swaps.length > 1) {
          setRebalanceStep(RebalanceStep.SecondSwap);
        } else {
          setRebalanceStep(RebalanceStep.Completed);
          
          // Store swap log after successful rebalancing and wait for API response
          if (portfolio && rebalanceData) {
            const oldAllocation = portfolio.allocation.reduce((acc, token) => {
              acc[token.symbol] = token.percentage;
              return acc;
            }, {} as Record<string, number>);

            const newAllocation = Object.entries(rebalanceData.targetUsdValues).reduce((acc, [symbol, targetUsd]) => {
              acc[symbol] = (targetUsd / rebalanceData.totalUsdValue) * 100;
              return acc;
            }, {} as Record<string, number>);

            // Only show success if log storage succeeds
            const logStored = await storeSwapLog(oldAllocation, newAllocation);
            if (logStored) {
              setShowSuccess(true);
            }
          } else {
            // If no portfolio data, still show success for the swap itself
            setShowSuccess(true);
          }
          
          // Refresh portfolio data after a successful rebalance
          setTimeout(() => {
            if (session?.user?.walletAddress) {
              fetch("/api/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletAddress: session.user.walletAddress }),
              }).then(response => {
                if (response.ok) return response.json();
                throw new Error("Failed to refresh portfolio");
              }).then(data => {
                const allocationsWithColors = data.allocation.map((item: TokenAllocation) => ({
                  ...item,
                  color: TOKEN_COLORS[item.symbol as keyof typeof TOKEN_COLORS] || FALLBACK_COLOR
                }));
                
                setPortfolio({
                  ...data,
                  allocation: allocationsWithColors
                });
              }).catch(err => {
                console.error("Error refreshing portfolio:", err);
              });
            }
          }, 2000);
        }
      } catch (directSwapError: any) {
        // Log the full error object
        console.error("Direct swap error:", JSON.stringify(directSwapError, null, 2));
        
        // Extract as much information as possible
        const errorDetails = {
          message: directSwapError.message || "Unknown error",
          code: directSwapError.code,
          reason: directSwapError.reason,
          data: directSwapError.data,
          transaction: directSwapError.transaction
        };
        
        console.error("Error details:", errorDetails);
        
        if (directSwapError.reason && directSwapError.reason.includes("From-token not supported")) {
          throw new Error(`Token ${firstSwap.fromToken} is not supported by the contract. Please try a different token or address.`);
        } else if (directSwapError.reason && directSwapError.reason.includes("To-token not supported")) {
          throw new Error(`Token ${firstSwap.toToken} is not supported by the contract. Please try a different token or address.`);
        } else {
          throw new Error(`Swap failed: ${directSwapError.message || "Unknown error"}. Please check token addresses and try again.`);
        }
      }
    } catch (err) {
      console.error("First swap error:", err);
      setTransactionError(err instanceof Error ? err.message : `Failed to swap ${firstSwap.fromToken} to ${firstSwap.toToken}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Update handleSecondSwap function with proper scoping
  const handleSecondSwap = async () => {
    if (!window.ethereum || !session?.user?.walletAddress) {
      setTransactionError("MetaMask not installed or not connected");
      return;
    }

    const rebalanceData = calculateRebalanceAmounts();
    if (!rebalanceData || rebalanceData.swaps.length < 2) {
      setTransactionError("No second swap needed");
      setRebalanceStep(RebalanceStep.Completed);
      setShowSuccess(true);
      return;
    }

    const secondSwap = rebalanceData.swaps[1];
    
    setIsProcessing(true);
    setTransactionError(null);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Get token addresses
      const fromToken = TOKEN_ADDRESSES[secondSwap.fromToken as keyof typeof TOKEN_ADDRESSES];
      const toToken = TOKEN_ADDRESSES[secondSwap.toToken as keyof typeof TOKEN_ADDRESSES];
      
      if (!fromToken || !toToken) {
        throw new Error(`Token address not found for ${secondSwap.fromToken} or ${secondSwap.toToken}`);
      }
      
      // Check if tokens are supported before proceeding
      console.log(`Attempting to swap ${secondSwap.fromToken} (${fromToken}) to ${secondSwap.toToken} (${toToken})`);
      
      // Try to create a contract instance
      const contract = new ethers.Contract(AGENT_SWAP_ADDRESS, AGENT_SWAP_ABI, signer);
      
      // Convert amount to Wei
      const amount = ethers.parseUnits(secondSwap.fromTokenAmount.toFixed(18), 18);
      
      // Check if we need to approve the token first
      try {
        // ERC20 minimal ABI just for approval
        const ERC20_ABI = [
          "function approve(address spender, uint256 amount) public returns (bool)",
          "function allowance(address owner, address spender) public view returns (uint256)"
        ];
        
        // Create token contract instance
        const tokenContract = new ethers.Contract(fromToken, ERC20_ABI, signer);
        
        // Check current allowance - wrapped in try/catch to handle tokens with non-standard implementations
        let needsApproval = true;
        try {
          const userAddress = await signer.getAddress();
          console.log(`Checking allowance for ${userAddress} to spend ${secondSwap.fromToken}`);
          const currentAllowance = await tokenContract.allowance(userAddress, AGENT_SWAP_ADDRESS);
          console.log(`Current allowance: ${currentAllowance.toString()}`);
          needsApproval = currentAllowance < amount;
        } catch (allowanceError) {
          console.warn(`Could not check allowance for ${secondSwap.fromToken}, proceeding with approval:`, allowanceError);
          // Continue with approval if we can't check allowance
        }
        
        // Always approve for CAKE token due to potential issues with allowance checks
        if (needsApproval || secondSwap.fromToken === "CAKE") {
          console.log(`Approving ${AGENT_SWAP_ADDRESS} to spend ${secondSwap.fromToken}`);
          // Set a very large approval amount to avoid future issues
          const maxApproval = ethers.parseUnits("999999999", 18);
          const approveTx = await tokenContract.approve(AGENT_SWAP_ADDRESS, maxApproval);
          await approveTx.wait();
          console.log("Approval successful");
        } else {
          console.log("Token already approved");
        }
      } catch (approvalError) {
        console.error("Approval error:", approvalError);
        throw new Error(`Failed to approve ${secondSwap.fromToken} for swap: ${approvalError instanceof Error ? approvalError.message : String(approvalError)}`);
      }
      
      // Execute the swap using swapTokenForToken
      const userAddress = await signer.getAddress();
      console.log(`Swapping ${amount.toString()} of ${secondSwap.fromToken} to ${secondSwap.toToken}`);
      console.log('=========== SWAP FUNCTION PARAMETERS ===========');
      console.log(`tokenIn address: ${fromToken}`);
      console.log(`tokenOut address: ${toToken}`);
      console.log(`amountIn (Wei): ${amount.toString()}`);
      console.log(`amountIn (decimal): ${ethers.formatUnits(amount, 18)}`);
      console.log(`amountOutMin: 0`);
      console.log(`to address: ${userAddress}`);
      console.log(`gas limit: 500000`);
      console.log(`contract address: ${AGENT_SWAP_ADDRESS}`);
      console.log(`caller address: ${userAddress}`);
      console.log('===============================================');
      
      try {
        console.log(`Sending swapTokenForToken transaction with parameters:
          - tokenIn: ${fromToken}
          - tokenOut: ${toToken}
          - amountIn: ${amount.toString()}
          - amountOutMin: 0
          - to: ${userAddress}
        `);
        
        // Set a high gas limit manually instead of estimating
        const tx = await contract.swapTokenForToken(fromToken, toToken, amount, 0, userAddress, {
          gasLimit: 500000 // Set a high fixed gas limit
        });
          
          console.log(`Transaction sent: ${tx.hash}`);
          console.log(`Waiting for transaction confirmation...`);
          
          await tx.wait();
          console.log(`Transaction confirmed!`);
          
          setTransactionHash(prev => ({ ...prev, secondSwap: tx.hash }));
          setStepStatus(prev => ({ ...prev, secondSwap: true }));
          setRebalanceStep(RebalanceStep.Completed);
          setShowSuccess(true);
          
          // Store swap log after successful rebalancing
          if (portfolio && rebalanceData) {
            const oldAllocation = portfolio.allocation.reduce((acc, token) => {
              acc[token.symbol] = token.percentage;
              return acc;
            }, {} as Record<string, number>);

            const newAllocation = Object.entries(rebalanceData.targetUsdValues).reduce((acc, [symbol, targetUsd]) => {
              acc[symbol] = (targetUsd / rebalanceData.totalUsdValue) * 100;
              return acc;
            }, {} as Record<string, number>);

            storeSwapLog(oldAllocation, newAllocation);
          }
          
          // Refresh portfolio data after a successful rebalance
          setTimeout(() => {
            if (session?.user?.walletAddress) {
              fetch("/api/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletAddress: session.user.walletAddress }),
              }).then(response => {
                if (response.ok) return response.json();
                throw new Error("Failed to refresh portfolio");
              }).then(data => {
                const allocationsWithColors = data.allocation.map((item: TokenAllocation) => ({
                  ...item,
                  color: TOKEN_COLORS[item.symbol as keyof typeof TOKEN_COLORS] || FALLBACK_COLOR
                }));
                
                setPortfolio({
                  ...data,
                  allocation: allocationsWithColors
                });
              }).catch(err => {
                console.error("Error refreshing portfolio:", err);
              });
            }
          }, 2000);
        } catch (directSwapError: any) {
          // Log the full error object
          console.error("Direct swap error:", JSON.stringify(directSwapError, null, 2));
          
          // Extract as much information as possible
          const errorDetails = {
            message: directSwapError.message || "Unknown error",
            code: directSwapError.code,
            reason: directSwapError.reason,
            data: directSwapError.data,
            transaction: directSwapError.transaction
          };
          
          console.error("Error details:", errorDetails);
          
          if (directSwapError.reason && directSwapError.reason.includes("From-token not supported")) {
            throw new Error(`Token ${secondSwap.fromToken} is not supported by the contract. Please try a different token or address.`);
          } else if (directSwapError.reason && directSwapError.reason.includes("To-token not supported")) {
            throw new Error(`Token ${secondSwap.toToken} is not supported by the contract. Please try a different token or address.`);
          } else {
            throw new Error(`Swap failed: ${directSwapError.message || "Unknown error"}. Please check token addresses and try again.`);
          }
        }
    } catch (err) {
      console.error("Second swap error:", err);
      setTransactionError(err instanceof Error ? err.message : `Failed to swap ${secondSwap.fromToken} to ${secondSwap.toToken}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Update resetRebalanceProcess function
  const resetRebalanceProcess = () => {
    setRebalanceStep(RebalanceStep.NotStarted);
    setStepStatus({
      firstSwap: false,
      secondSwap: false
    });
    setTransactionError(null);
    setTransactionHash({});
    setShowSuccess(false);
  };

  // Format wallet address for display
  const formatWalletAddress = (address: string | null | undefined) => {
    if (!address) return null;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Compute the rebalance preview
  const rebalancePreview = calculateRebalanceAmounts();

  // Update the fetchAIPredictions function to ensure we check portfolio data
  const fetchAIPredictions = async (specificStrategy = selectedStrategy) => {
    if (!portfolio || !portfolio.allocation || portfolio.allocation.length === 0) {
      setAiError("No portfolio data available for prediction");
      return null;
    }

    setIsAiLoading(true);
    setAiError(null);

    try {
      // Create current allocation object for the AI model
      const currentAllocation = portfolio.allocation.reduce((acc, token) => {
        acc[token.symbol] = token.percentage / 100; // Convert percentage to decimal
        return acc;
      }, {} as Record<string, number>);

      // Call the AI model API with the selected strategy
      const response = await axios.post("/api/ai-prediction", {
        allocation: currentAllocation,
        strategy: specificStrategy
      });
      console.log("response", response.data);

      setAiPredictions(response.data.predictions);
      setAiAllocation(response.data.new_allocation);
      console.log("new_allocation (from response):", response.data.new_allocation);

      
      // If the API response includes strategy information, update our strategy data
      if (response.data.strategy) {
        const updatedStrategies = [...strategies];
        const strategyIndex = updatedStrategies.findIndex(s => s.id === response.data.strategy.id);
        
        if (strategyIndex >= 0) {
          updatedStrategies[strategyIndex] = response.data.strategy;
          setStrategies(updatedStrategies);
        }
      }
      
      // Force rebalance calculation update when AI allocation changes
      return response.data;
    } catch (err) {
      console.error("Error fetching AI predictions:", err);
      setAiError(err instanceof Error ? err.message : "Failed to fetch AI predictions");
      return null;
    } finally {
      setIsAiLoading(false);
    }
  };
  
  // Update the strategy selection handler to fetch new AI predictions when strategy changes
  const handleStrategyChange = async (strategy: string) => {
    setSelectedStrategy(strategy);
    if (portfolio && portfolio.allocation && portfolio.allocation.length > 0) {
      await fetchAIPredictions(strategy);
    }
  };

  // Replace the existing useEffect for fetching AI predictions with this one
  // that only runs when portfolio data changes, not on selectedStrategy changes
  useEffect(() => {
    if (portfolio && portfolio.allocation && portfolio.allocation.length > 0) {
      fetchAIPredictions(selectedStrategy);
      
    }
  }, [portfolio]); // Only depend on portfolio changes, not selectedStrategy

  // Log aiAllocation whenever it changes
  useEffect(() => {
    console.log('AI Allocation State:', aiAllocation);
  }, [aiAllocation]);

  // Fetch swap history when session is available
  useEffect(() => {
    if (status === "authenticated" && session?.user?.walletAddress) {
      fetchSwapHistory();
    }
  }, [status, session?.user?.walletAddress]);

  // Function to store swap log after successful rebalancing
  const storeSwapLog = async (oldAllocation: Record<string, number>, newAllocation: Record<string, number>): Promise<boolean> => {
    if (!session?.user?.walletAddress) return false;

    try {
      const swapData = {
        walletAddress: session.user.walletAddress,
        oldAllocation,
        newAllocation,
        strategy: selectedStrategy,
        timestamp: new Date().toISOString()
      };

      const response = await fetch("/api/storelogsr2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ swapData }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log("Swap log stored successfully:", result.storedObjectName);
        // Refresh swap history after storing new log
        fetchSwapHistory();
        return true;
      } else {
        console.error("Failed to store swap log:", result.error);
        setTransactionError(`Swap completed but failed to store log: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error("Error storing swap log:", error);
      setTransactionError(`Swap completed but failed to store log: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  // Function to fetch swap history
  const fetchSwapHistory = async () => {
    if (!session?.user?.walletAddress) return;

    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      const response = await fetch("/api/storelogsr2");
      const result = await response.json();

      if (result.success && result.bucket?.objects?.Contents) {
        const objects = result.bucket.objects.Contents;
        
        // Fetch content for each object
        const historyPromises = objects.map(async (obj: any) => {
          try {
            const objectName = obj.Key;
            const objectUrl = `https://cdn.techkareer.com/${objectName}`;
        
            const contentResponse = await fetch(objectUrl);
            const content = await contentResponse.json();
        
            return {
              name: objectName,
              info: obj,
              content,
              url: objectUrl
            };
          } catch (error) {
            return {
              name: obj.Key,
              info: obj,
              downloadError: `Failed to fetch content: ${error}`
            };
          }
        });

        const historyData = await Promise.all(historyPromises);
        console.log("session.user.walletAddress", session.user.walletAddress)
        // Filter only swap logs and sort by timestamp (newest first)
        const swapLogs = historyData
          .filter(item => item.name.includes(`${session.user.walletAddress?.toLowerCase()}-logs`) && item.content)
          .sort((a, b) => {
            const timeA = a.content?.timestamp ? new Date(a.content.timestamp).getTime() : 0;
            const timeB = b.content?.timestamp ? new Date(b.content.timestamp).getTime() : 0;
            return timeB - timeA;
          });

        setSwapHistory(swapLogs);
      } else {
        setHistoryError("No swap history found");
      }
    } catch (error) {
      setHistoryError(`Failed to fetch swap history: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Function to download object as JSON file
  const downloadObjectAsJson = async (objectName: string) => {
    try {
      const response = await fetch(`/api/store-logs?objectName=${objectName}`);
      const result = await response.json();
      
      if (result.success && result.object?.content) {
        // Create a blob with the JSON content
        const jsonContent = JSON.stringify(result.object.content, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = objectName;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to fetch object content for download');
      }
    } catch (error) {
      console.error('Error downloading object:', error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Neurobalance
              </h1>
              <p className="text-sm text-gray-400">Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {status === "authenticated" ? (
              <>
                <div className="hidden sm:flex items-center">
                  <span className="text-gray-400 mr-2 text-sm">{session.user.email}</span>
                </div>
                {session.user.walletAddress && (
                  <>
                    <Badge variant="outline" className="px-3 py-1 border-cyan-500/30 bg-cyan-500/10">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                      Wallet Connected
                    </Badge>
                    <div className="bg-gray-800 rounded-lg px-3 py-1 text-sm border border-gray-700">
                      {formatWalletAddress(session.user.walletAddress)}
                    </div>
                  </>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-700 text-white hover:bg-gray-800 flex items-center gap-2"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="border-gray-700 text-white hover:bg-gray-800">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700 border-0">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Portfolio Overview Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Portfolio Overview</h2>
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Portfolio Value</CardTitle>
                <CardDescription>Total assets on BNB Smart Chain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center space-x-2 animate-pulse">
                    <div className="h-8 w-32 bg-gray-700 rounded"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-400 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                ) : portfolio ? (
                  <>
                    <div className="text-3xl font-bold">
                      ${portfolio.totalValue.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                    </div>
                    <div className="flex items-center text-green-500">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Portfolio Balance</span>
                    </div>
                  </>
                ) : (
                  <div className="text-amber-400 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Connect wallet to view portfolio</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Allocation Analysis Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Allocation Analysis</h2>
          <div className="grid grid-cols-1 gap-6">
            {/* Current Allocation */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Current Allocation</CardTitle>
                <CardDescription>Your current token distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center">
                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600 text-center">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-amber-300">{error}</p>
                  </div>
                ) : portfolio && portfolio.allocation.length > 0 ? (
                  <>
                    <div className="flex justify-center">
                      <div className="w-48 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={portfolio.allocation}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="percentage"
                            >
                              {portfolio.allocation.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {portfolio.allocation.map((token) => (
                        <div key={token.symbol} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-2" 
                                style={{ backgroundColor: token.color }}
                              ></div>
                              <span className="font-medium">{token.symbol}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{token.percentage.toFixed(3)}%</span>
                              <span className="text-sm text-gray-400">
                                ${token.usdValue.toFixed(3)}
                              </span>
                            </div>
                          </div>
                          <Progress value={token.percentage} className="h-2" />
                          <div className="text-xs text-gray-400 flex justify-between">
                            <span>Balance: {token.value.toFixed(6)} {token.symbol}</span>
                            <span>~${token.usdValue.toFixed(3)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-700/30 p-6 rounded-lg border border-gray-600 text-center">
                    <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p>No tokens found in your wallet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Connect your wallet or add TWT/XVS/CAKE tokens to your wallet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* After Current Allocation and before Strategy & Rebalancing section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">AI Predictions</h2>
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">AI Model Predictions</CardTitle>
              <CardDescription>7-day return predictions and suggested allocation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isAiLoading ? (
                <div className="flex justify-center">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>
              ) : aiError ? (
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600 text-center">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-amber-300">{aiError}</p>
                </div>
              ) : aiPredictions.length > 0 ? (
                <>
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300">7-Day Return Predictions</h3>
                    {aiPredictions.map((prediction) => (
                      <div key={prediction.token} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-2" 
                              style={{ backgroundColor: TOKEN_COLORS[prediction.token as keyof typeof TOKEN_COLORS] || FALLBACK_COLOR }}
                            ></div>
                            <span className="font-medium">{prediction.token}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${prediction.return_7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {(prediction.return_7d * 100).toFixed(2)}%
                            </span>
                            <span className="text-sm text-gray-400">
                              7-day forecast
                            </span>
                          </div>
                        </div>
                        <Progress 
                          value={50 + (prediction.return_7d * 500)} 
                          className="h-2 bg-gray-700"
                        >
                          <div
                            className="h-full"
                            style={{
                              width: `${50 + (prediction.return_7d * 500)}%`,
                              backgroundColor: prediction.return_7d >= 0 ? '#10B981' : '#EF4444',
                              transition: "width 0.3s ease"
                            }}
                          />
                        </Progress>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-gray-700 my-4"></div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300">AI Suggested Allocation</h3>
                    <div className="flex justify-center mb-4">
                      <div className="w-48 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(aiAllocation).map(([token, allocation]) => ({
                                symbol: token,
                                percentage: allocation * 100,
                                color: TOKEN_COLORS[token as keyof typeof TOKEN_COLORS] || FALLBACK_COLOR
                              }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="percentage"
                            >
                              
                              {Object.entries(aiAllocation).map(([token, _], index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={TOKEN_COLORS[token as keyof typeof TOKEN_COLORS] || FALLBACK_COLOR} 
                                />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {Object.entries(aiAllocation).map(([token, allocation]) => (
                      <div key={token} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-2" 
                              style={{ backgroundColor: TOKEN_COLORS[token as keyof typeof TOKEN_COLORS] || FALLBACK_COLOR }}
                            ></div>
                            <span className="font-medium">{token}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{(allocation * 100).toFixed(2)}%</span>
                          </div>
                        </div>
                        <Progress value={allocation * 100} className="h-2 bg-gray-700">
                          <div
                            className="h-full"
                            style={{
                              width: `${allocation * 100}%`,
                              backgroundColor: TOKEN_COLORS[token as keyof typeof TOKEN_COLORS] || FALLBACK_COLOR,
                              transition: "width 0.3s ease"
                            }}
                          />
                        </Progress>
                      </div>
                    ))}

                    <Button 
                      className="w-full mt-2" 
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAIPredictions()}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Predictions
                    </Button>
                  </div>
                </>
              ) : (
                <div className="bg-gray-700/30 p-6 rounded-lg border border-gray-600 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p>No predictions available</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Connect your wallet or add tokens to get AI predictions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Strategy and Rebalance Section */}
        <section className="space-y-6 pb-8">
          <h2 className="text-2xl font-bold">Strategy & Rebalancing</h2>
          
          {/* Strategy Selection - Make it full width */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Investment Strategy</CardTitle>
              <CardDescription>Select your preferred risk profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="Balanced" onValueChange={setSelectedStrategy} className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="Growth" onClick={() => handleStrategyChange("Growth")}>Growth</TabsTrigger>
                  <TabsTrigger value="Balanced" onClick={() => handleStrategyChange("Balanced")}>Balanced</TabsTrigger>
                  <TabsTrigger value="Preservation" onClick={() => handleStrategyChange("Preservation")}>Preservation</TabsTrigger>
                </TabsList>

                {isLoadingStrategies ? (
                  <div className="flex justify-center mt-6">
                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                ) : strategies.map((strategy) => (
                  <TabsContent key={strategy.id} value={strategy.id === "conservative" ? "preservation" : strategy.id} className="mt-6">
                    <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-700 space-y-6">
                      <div>
                        <h3 className="font-medium text-lg mb-2">{strategy.name} Strategy</h3>
                        <p className="text-gray-300">{strategy.description}</p>
                        <div className="mt-2">
                          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20">
                            AI-Powered Allocation
                          </Badge>
                        </div>
                      </div>

                  {strategy?.allocation && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {Object.entries(strategy.allocation).map(([token, percentage]) => (
                        <div key={token} className="flex flex-col items-center">
                          <CircularProgress
                            value={typeof percentage === 'number' ? percentage : Number(percentage)}
                            color={TOKEN_COLORS[token as keyof typeof TOKEN_COLORS] || FALLBACK_COLOR}
                            label={token}
                            sublabel={`${typeof percentage === 'number' ? percentage : Number(percentage)}%`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Rebalance Action - Full width, positioned below strategy */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Rebalance Portfolio</CardTitle>
              <CardDescription>
                {showSuccess 
                  ? "Rebalancing completed successfully!" 
                  : `Follow the steps to rebalance according to the ${selectedStrategy} strategy`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6 py-4">
              {showSuccess ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Rebalance Complete!</h3>
                    <p className="text-sm text-gray-300">
                      Your portfolio has been successfully rebalanced according to the {selectedStrategy} strategy.
                    </p>
                    {Object.entries(transactionHash).length > 0 && (
                      <div className="mt-2 space-y-1">
                        {transactionHash.firstSwap && (
                          <a 
                            href={`https://bscscan.com/tx/${transactionHash.firstSwap}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-cyan-400 hover:text-cyan-300 underline block"
                          >
                            View First Swap on BscScan
                          </a>
                        )}
                        {transactionHash.secondSwap && (
                          <a 
                            href={`https://bscscan.com/tx/${transactionHash.secondSwap}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-cyan-400 hover:text-cyan-300 underline block"
                          >
                            View Second Swap on BscScan
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetRebalanceProcess}
                    className="mt-2"
                  >
                    Rebalance Again
                  </Button>
                </motion.div>
              ) : (
                <div className="w-full space-y-6">
                  {/* Current vs Target Allocation Summary */}
                  {rebalancePreview && (
                    <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600 mb-4">
                      <h4 className="text-sm font-medium mb-2">Rebalance Preview (USD Values)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span>Total Portfolio Value:</span>
                          <span className="font-medium">${rebalancePreview.totalUsdValue.toFixed(2)}</span>
                        </div>
                        
                        <div className="h-px bg-gray-600 my-2"></div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
                          {portfolio && Object.entries(rebalancePreview.targetUsdValues).map(([token, targetUsd]) => {
                            const currentToken = portfolio.allocation.find(t => t.symbol === token);
                            const currentUsd = currentToken?.usdValue || 0;
                            const diff = currentUsd - targetUsd;
                            const status = diff > 1 ? "over" : diff < -1 ? "under" : "balanced";
                            
                            return (
                              <div key={token} className="bg-gray-800/50 p-2 rounded border border-gray-700">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium flex items-center">
                                    <div 
                                      className="w-2 h-2 rounded-full mr-1" 
                                      style={{ backgroundColor: TOKEN_COLORS[token as keyof typeof TOKEN_COLORS] }}
                                    ></div>
                                    {token}
                                  </span>
                                  <Badge variant={status === "balanced" ? "outline" : status === "over" ? "destructive" : "default"} className="text-xs truncate">
                                    {status === "balanced" ? "OK" : status === "over" ? "Over" : "Under"}
                                  </Badge>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="truncate">Current: ${currentUsd.toFixed(2)}</span>
                                  <span className="truncate">Target: ${targetUsd.toFixed(2)}</span>
                                </div>
                                <Progress 
                                  value={Math.min(100, (currentUsd / targetUsd) * 100)} 
                                  className={`h-1.5 mt-1 ${
                                    status === "balanced" ? "bg-gray-700" : 
                                    status === "over" ? "bg-gray-700" : 
                                    "bg-gray-700"
                                  }`}
                                >
                                  <div
                                    className={`h-full ${
                                      status === "balanced" ? "bg-green-500" : 
                                      status === "over" ? "bg-red-500" : 
                                      "bg-blue-500"
                                    }`}
                                    style={{
                                      width: `${Math.min(100, (currentUsd / targetUsd) * 100)}%`,
                                      transition: "width 0.3s ease"
                                    }}
                                  />
                                </Progress>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Swap Details Section */}
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Required Swaps:</h4>
                            {rebalancePreview.swaps.length === 0 && (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/20">
                                No Swaps Needed
                              </Badge>
                            )}
                          </div>
                          
                          {rebalancePreview.swaps.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {rebalancePreview.swaps.map((swap, index) => (
                                <div key={index} className="flex flex-col space-y-1 bg-gray-800/70 p-3 rounded">
                                  <div className="flex justify-between items-center">
                                    <span className="flex items-center">
                                      <div 
                                        className="w-2 h-2 rounded-full mr-1" 
                                        style={{ backgroundColor: TOKEN_COLORS[swap.fromToken as keyof typeof TOKEN_COLORS] }}
                                      ></div>
                                      <span>From {swap.fromToken}</span>
                                    </span>
                                    <span className="text-sm truncate ml-2">
                                      ${swap.usdValueToSwap.toFixed(2)}&nbsp;
                                      <span className="text-xs text-gray-400">
                                        ({swap.fromTokenAmount.toFixed(4)})
                                      </span>
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center pl-4">
                                    <span className="flex items-center">
                                      <ArrowRightLeft className="w-3 h-3 mr-1 rotate-90" />
                                      <div 
                                        className="w-2 h-2 rounded-full mr-1" 
                                        style={{ backgroundColor: TOKEN_COLORS[swap.toToken as keyof typeof TOKEN_COLORS] }}
                                      ></div>
                                      <span>To {swap.toToken}</span>
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-gray-400 py-3 bg-gray-800/40 rounded border border-gray-700">
                              Your portfolio is already balanced according to the selected strategy
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rebalance Progress Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* Step 1: First Swap */}
                    <div className={`p-3 rounded-lg border ${stepStatus.firstSwap ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-700/30 border-gray-600'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {stepStatus.firstSwap ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                              ${rebalanceStep === RebalanceStep.FirstSwap && isProcessing ? 'border-cyan-500 border-t-transparent animate-spin' : 'border-gray-500'}`}></div>
                          )}
                          <div>
                            <span className="font-medium">1. First Swap</span>
                            {rebalancePreview && rebalancePreview.swaps[0] && (
                              <p className="text-xs text-gray-400 truncate max-w-[180px] sm:max-w-none">
                                {rebalancePreview.swaps[0].fromToken} → {rebalancePreview.swaps[0].toToken} 
                                (${rebalancePreview.swaps[0].usdValueToSwap.toFixed(2)})
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          disabled={isProcessing || (rebalanceStep !== RebalanceStep.NotStarted && rebalanceStep !== RebalanceStep.FirstSwap) || stepStatus.firstSwap || !(rebalancePreview && rebalancePreview.swaps.length > 0)}
                          onClick={handleFirstSwap}
                          className="flex items-center space-x-1"
                        >
                          <ArrowRightLeft className="w-4 h-4 mr-1" />
                          <span>Swap</span>
                        </Button>
                      </div>
                    </div>

                    {/* Step 2: Second Swap (if needed) */}
                    <div className={`p-3 rounded-lg border ${stepStatus.secondSwap ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-700/30 border-gray-600'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {stepStatus.secondSwap ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                              ${rebalanceStep === RebalanceStep.SecondSwap && isProcessing ? 'border-cyan-500 border-t-transparent animate-spin' : 'border-gray-500'}`}></div>
                          )}
                          <div>
                            <span className="font-medium">2. Second Swap</span>
                            {rebalancePreview && rebalancePreview.swaps[1] ? (
                              <p className="text-xs text-gray-400 truncate max-w-[180px] sm:max-w-none">
                                {rebalancePreview.swaps[1].fromToken} → {rebalancePreview.swaps[1].toToken}
                                (${rebalancePreview.swaps[1].usdValueToSwap.toFixed(2)})
                              </p>
                            ) : (
                              <p className="text-xs text-gray-400">Not needed for this rebalance</p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          disabled={isProcessing || rebalanceStep !== RebalanceStep.SecondSwap || stepStatus.secondSwap || !(rebalancePreview && rebalancePreview.swaps.length > 1)}
                          onClick={handleSecondSwap}
                          className="flex items-center space-x-1"
                        >
                          <ArrowRightLeft className="w-4 h-4 mr-1" />
                          <span>Swap</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {transactionError && (
                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-sm text-red-300">
                      <div className="flex items-start">
                        <AlertCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                        <span>{transactionError}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    size="lg"
                    variant="outline"
                    disabled={isProcessing || rebalanceStep === RebalanceStep.NotStarted || showSuccess}
                    onClick={resetRebalanceProcess}
                    className="w-full mt-4"
                  >
                    Reset Process
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gray-800/80 border-t border-gray-700">
              <div className="text-xs text-gray-400 text-center w-full">
                {isProcessing ? "Processing transaction..." : "Estimated gas fee: 0.0012 BNB (~$0.50)"}
              </div>
            </CardFooter>
          </Card>
        </section>

        {/* Swap History Section */}
        <section className="space-y-6 pb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center">
              <History className="w-6 h-6 mr-2" />
              Swap History
            </h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchSwapHistory}
              disabled={isLoadingHistory}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Portfolio Rebalancing History</CardTitle>
              <CardDescription>Your transaction history stored in the bucket</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingHistory ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>
              ) : historyError ? (
                <div className="bg-gray-700/30 p-6 rounded-lg border border-gray-600 text-center">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-amber-300">{historyError}</p>
                </div>
              ) : swapHistory.length > 0 ? (
                <div className="space-y-4">
                  {swapHistory.map((swap, index) => (
                    <div key={swap.name} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-lg">
                              {swap.content?.strategy || 'Unknown'} Strategy Rebalance
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20">
                                #{index + 1}
                              </Badge>
                            </div>
                          </div>
                          
                          {swap.content && (
                            <>
                              <div className="text-sm text-gray-400 mb-3">
                                <span>Timestamp: </span>
                                <span>{new Date(swap.content.timestamp).toLocaleString()}</span>
                                <span className="mx-2">|</span>
                                <span>Swap ID: </span>
                                <span className="font-mono text-xs">{swap.content.swapId}</span>
                              </div>
                              
                              {/* Object Name and Download */}
                              <div className="text-sm text-gray-400 mb-3 flex items-center justify-between">
                                <div className="flex items-center">
                                  <span>Object: </span>
                                  <button
                                    onClick={() => downloadObjectAsJson(swap.name)}
                                    className="font-mono text-xs text-cyan-400 hover:text-cyan-300 underline ml-1 flex items-center"
                                  >
                                    {swap.name}
                                    <Download className="w-3 h-3 ml-1" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => downloadObjectAsJson(swap.name)}
                                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-xs"
                                  >
                                    <Download className="w-3 h-3" />
                                    Download JSON
                                  </button>
                                  <a 
                                    href={`/api/store-logs?objectName=${swap.name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-xs"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    View Raw
                                  </a>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Old Allocation */}
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium text-gray-300">Previous Allocation</h4>
                                  <div className="space-y-1">
                                    {Object.entries(swap.content.oldAllocation).map(([token, percentage]) => (
                                      <div key={token} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center">
                                          <div 
                                            className="w-3 h-3 rounded-full mr-2" 
                                            style={{ backgroundColor: TOKEN_COLORS[token as keyof typeof TOKEN_COLORS] || FALLBACK_COLOR }}
                                          ></div>
                                          <span>{token}</span>
                                        </div>
                                        <span>{Number(percentage).toFixed(2)}%</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* New Allocation */}
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium text-gray-300">New Allocation</h4>
                                  <div className="space-y-1">
                                    {Object.entries(swap.content.newAllocation).map(([token, percentage]) => (
                                      <div key={token} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center">
                                          <div 
                                            className="w-3 h-3 rounded-full mr-2" 
                                            style={{ backgroundColor: TOKEN_COLORS[token as keyof typeof TOKEN_COLORS] || FALLBACK_COLOR }}
                                          ></div>
                                          <span>{token}</span>
                                        </div>
                                        <span className="text-green-400">{Number(percentage).toFixed(2)}%</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                          
                          {swap.downloadError && (
                            <div className="text-xs text-amber-400 mt-2">
                              <AlertCircle className="w-3 h-3 inline mr-1" />
                              {swap.downloadError}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-700/30 p-6 rounded-lg border border-gray-600 text-center">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p>No swap history found</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Complete a rebalancing to see your transaction history here
                  </p>
                </div>
              )}
            </CardContent>
            {/* <CardFooter className="bg-gray-800/80 border-t border-gray-700">
              <div className="text-xs text-gray-400 text-center w-full">
                Data stored securely on BNB Greenfield decentralized storage
              </div>
            </CardFooter> */}
          </Card>
        </section>
      </main>
    </div>
  )
}
