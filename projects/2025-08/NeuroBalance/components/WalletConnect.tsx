"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";

// Define global Ethereum provider type
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

// Extend the session user type to include walletAddress
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      walletAddress?: string | null;
    };
  }
}

export default function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { data: session, update } = useSession();

  // Access the current wallet address from the session
  const currentWalletAddress = session?.user?.walletAddress;

  // Check if MetaMask is installed on component mount
  useEffect(() => {
    const checkMetaMask = async () => {
      const installed = typeof window !== 'undefined' && !!window.ethereum?.isMetaMask;
      setIsMetaMaskInstalled(installed);
      
      // If MetaMask is installed, check if already connected
      if (installed && !walletAddress && !currentWalletAddress) {
        try {
          const accounts = await window.ethereum?.request({
            method: "eth_accounts"
          });
          
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error("Error checking existing accounts:", error);
        }
      }
    };
    
    checkMetaMask();
    
    // Setup account change listener
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setWalletAddress(null);
        toast({
          title: "Wallet Disconnected",
          description: "Your MetaMask wallet has been disconnected",
          variant: "default",
        });
      } else {
        setWalletAddress(accounts[0]);
      }
    };
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [currentWalletAddress, toast, walletAddress]);

  const connectMetaMask = async () => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      window.open('https://metamask.io/download/', '_blank');
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Request wallet accounts
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const address = accounts[0];
      setWalletAddress(address);

      // Only update if user is logged in
      if (session?.user) {
        // Save wallet address to database
        const response = await fetch("/api/user/wallet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ walletAddress: address }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to update wallet address");
        }

        // Update session
        await update({
          ...session,
          user: {
            ...session.user,
            walletAddress: address,
          },
        });

        toast({
          title: "MetaMask Connected",
          description: "Your wallet has been successfully linked to your account",
          variant: "default",
        });
      } else {
        toast({
          title: "MetaMask Connected",
          description: "Please sign in to link this wallet to your account",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("MetaMask connection error:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // If the wallet is already connected through the session
  if (currentWalletAddress) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-green-500/10 text-green-400 px-3 py-2 rounded-lg border border-green-500/20">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm truncate max-w-[180px] font-mono">
            {`${currentWalletAddress.substring(0, 6)}...${currentWalletAddress.substring(
              currentWalletAddress.length - 4
            )}`}
          </span>
        </div>
      </div>
    );
  }

  // If a wallet is connected but not saved to session yet
  if (walletAddress && !currentWalletAddress) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-amber-500/10 text-amber-400 px-3 py-2 rounded-lg border border-amber-500/20">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm truncate max-w-[180px] font-mono">
            {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
          </span>
          {!session?.user && <span className="text-xs">(Sign in to save)</span>}
        </div>
      </div>
    );
  }

  // If MetaMask is not installed
  if (isMetaMaskInstalled === false) {
    return (
      <Button
        onClick={() => window.open('https://metamask.io/download/', '_blank')}
        variant="outline"
        className="border-orange-500/30 bg-orange-500/10 text-white hover:bg-orange-500/20 flex items-center space-x-2"
      >
        <AlertCircle className="w-4 h-4 text-orange-400" />
        <span>Install MetaMask</span>
      </Button>
    );
  }

  // Default connect button
  return (
    <Button
      onClick={connectMetaMask}
      disabled={isConnecting}
      variant="outline"
      className="border-orange-500/30 bg-orange-500/10 text-white hover:bg-orange-500/20 flex items-center space-x-2"
    >
      <Wallet className="w-4 h-4 text-orange-400" />
      <span>{isConnecting ? "Connecting..." : "Connect MetaMask"}</span>
    </Button>
  );
} 