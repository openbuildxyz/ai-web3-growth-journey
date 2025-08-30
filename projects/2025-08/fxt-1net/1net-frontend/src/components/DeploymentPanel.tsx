import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wallet, Upload, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { ContractSpec } from "./SmartContractBuilder";
import { useToast } from "@/hooks/use-toast";
import { ethers } from 'ethers';

interface DeploymentPanelProps {
  contractCode: string;
  contractSpec: ContractSpec | null;
}

interface DeploymentResult {
  txHash: string;
  contractAddress: string;
  network: string;
  gasUsed: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const DeploymentPanel: React.FC<DeploymentPanelProps> = ({ 
  contractCode, 
  contractSpec 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>("");
  const [network, setNetwork] = useState<string>("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState("sepolia");
  const [gasPrice, setGasPrice] = useState("20");
  const { toast } = useToast();

  const networks = [
    { id: "sepolia", name: "Sepolia Testnet", chainId: "0xaa36a7" },
    { id: "goerli", name: "Goerli Testnet", chainId: "0x5" },
    { id: "mumbai", name: "Mumbai Testnet", chainId: "0x13881" },
    { id: "mainnet", name: "Ethereum Mainnet", chainId: "0x1" },
  ];

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setIsConnected(true);
          setAccount(accounts[0]);
          
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const currentNetwork = networks.find(n => n.chainId === chainId);
          setNetwork(currentNetwork?.name || 'Unknown Network');
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to deploy contracts",
        variant: "destructive"
      });
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setIsConnected(true);
        setAccount(accounts[0]);
        
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const currentNetwork = networks.find(n => n.chainId === chainId);
        setNetwork(currentNetwork?.name || 'Unknown Network');

        toast({
          title: "Wallet Connected",
          description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MetaMask",
        variant: "destructive"
      });
    }
  };

  const switchNetwork = async (targetNetwork: string) => {
    const networkConfig = networks.find(n => n.id === targetNetwork);
    if (!networkConfig) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      });
      setNetwork(networkConfig.name);
      setSelectedNetwork(targetNetwork);
    } catch (error: any) {
      if (error.code === 4902) {
        toast({
          title: "Network Not Added",
          description: "Please add this network to MetaMask manually",
          variant: "destructive"
        });
      }
    }
  };

  const fetchCompiledContract = async (sourceCode: string) => {
    try {
      const response = await fetch("http://localhost:8000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: sourceCode })
      });
      if (!response.ok) {
        throw new Error("Failed to compile contract on backend");
      }
      const data = await response.json();
      // Expect { abi, bytecode } from backend
      return { abi: data.abi, bytecode: data.bytecode };
    } catch (error) {
      console.error("Compilation error:", error);
      throw new Error("Contract compilation failed: " + (error as Error).message);
    }
  };

  const deployContract = async () => {
    if (!isConnected || !contractCode) return;

    setIsDeploying(true);

    try {
      toast({
        title: "Compiling Contract",
        description: "Compiling your smart contract on backend...",
      });

      // Compile the contract via backend API
      const { abi, bytecode } = await fetchCompiledContract(contractCode);

      toast({
        title: "Compilation Successful",
        description: "Connecting to Ethereum network...",
      });

      // Connect to Ethereum provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create contract factory
      const factory = new ethers.ContractFactory(abi, bytecode, signer);

      // Prepare constructor arguments
      let deployArgs: any[] = [];
      if (contractSpec?.type === 'ERC20') {
        // ERC20 expects: name, symbol, (optionally initialSupply)
        deployArgs = [
          contractSpec.name || 'MyToken',
          contractSpec.symbol || 'MTKN',
          contractSpec.supply || '1000000'
        ];
      } else if (contractSpec?.type === 'ERC721') {
        // ERC721 expects: name, symbol
        deployArgs = [
          contractSpec.name || 'MyNFT',
          contractSpec.symbol || 'NFT'
        ];
      }

      // Prepare overrides object for gas price
      const overrides = {
        gasPrice: ethers.parseUnits(gasPrice, "gwei")
      };

      toast({
        title: "Deploying Contract",
        description: "Sending transaction to blockchain...",
      });

      // Deploy contract with overrides
      const contract = await factory.deploy(...deployArgs, overrides);
      const receipt = await contract.deploymentTransaction()?.wait();

      if (!receipt) {
        throw new Error('Deployment transaction failed');
      }

      const result: DeploymentResult = {
        txHash: receipt.hash,
        contractAddress: await contract.getAddress(),
        network: networks.find(n => n.id === selectedNetwork)?.name || "Unknown",
        gasUsed: receipt.gasUsed.toString()
      };

      setDeploymentResult(result);

      toast({
        title: "Contract Deployed Successfully!",
        description: `Contract deployed at ${result.contractAddress}`,
      });

    } catch (error: any) {
      console.error('Deployment error:', error);
      toast({
        title: "Deployment Failed",
        description: error.message || "Failed to deploy contract. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  const estimatedGasCost = () => {
    const baseCost = contractSpec?.type === 'ERC721' ? 2500000 : 1500000;
    const featureCost = (contractSpec?.features.length || 0) * 200000;
    return Math.floor((baseCost + featureCost) * parseFloat(gasPrice) / 1000000000);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Wallet Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Connect your MetaMask wallet to deploy your smart contract
              </p>
              <Button onClick={connectWallet} size="lg">
                <Wallet className="w-4 h-4 mr-2" />
                Connect MetaMask
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Account:</span>
                <Badge variant="outline" className="font-mono">
                  {account.substring(0, 6)}...{account.substring(38)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network:</span>
                <Badge variant="secondary">{network}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deployment Configuration */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Deployment Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="network">Target Network</Label>
                <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((net) => (
                      <SelectItem key={net.id} value={net.id}>
                        {net.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gasPrice">Gas Price (Gwei)</Label>
                <Input
                  id="gasPrice"
                  type="number"
                  value={gasPrice}
                  onChange={(e) => setGasPrice(e.target.value)}
                  placeholder="20"
                />
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <div className="space-y-1">
                  <p><strong>Estimated Gas:</strong> ~{estimatedGasCost().toLocaleString()} gas units</p>
                  <p><strong>Estimated Cost:</strong> ~{(estimatedGasCost() * parseFloat(gasPrice) / 1000000000).toFixed(4)} ETH</p>
                </div>
              </AlertDescription>
            </Alert>

            <Button 
              onClick={deployContract} 
              disabled={isDeploying || !contractCode}
              className="w-full"
              size="lg"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deploying Contract...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Deploy Contract
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Deployment Result */}
      {deploymentResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              Deployment Successful
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transaction Hash:</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {deploymentResult.txHash.substring(0, 10)}...{deploymentResult.txHash.substring(58)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(deploymentResult.txHash)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Contract Address:</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {deploymentResult.contractAddress.substring(0, 10)}...{deploymentResult.contractAddress.substring(32)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(deploymentResult.contractAddress)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network:</span>
                <Badge variant="outline">{deploymentResult.network}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gas Used:</span>
                <span className="text-sm font-medium">{parseInt(deploymentResult.gasUsed).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={`https://etherscan.io/tx/${deploymentResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Etherscan
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={`https://etherscan.io/address/${deploymentResult.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Contract
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};