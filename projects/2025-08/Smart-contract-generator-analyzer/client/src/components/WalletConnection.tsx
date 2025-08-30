import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function WalletConnection() {
  const { account, isConnected, chainId, connect, disconnect, switchToSepolia } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const { toast } = useToast();

  const SEPOLIA_CHAIN_ID = 11155111;
  const isOnSepolia = chainId === SEPOLIA_CHAIN_ID;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to MetaMask",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchNetwork = async () => {
    setIsSwitching(true);
    try {
      await switchToSepolia();
      toast({
        title: "Network Switched",
        description: "Successfully switched to Sepolia testnet",
      });
    } catch (error) {
      toast({
        title: "Network Switch Failed",
        description: error instanceof Error ? error.message : "Failed to switch network",
        variant: "destructive",
      });
    } finally {
      setIsSwitching(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 11155111: return 'Sepolia Testnet';
      case 5: return 'Goerli Testnet';
      case 137: return 'Polygon';
      default: return `Chain ID: ${chainId}`;
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <Button
          data-testid="button-connect-wallet"
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <i className="fas fa-wallet mr-2"></i>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <div className="text-sm">
          <p className="font-medium">{formatAddress(account!)}</p>
          <p className="text-muted-foreground text-xs">
            {chainId ? getNetworkName(chainId) : 'Unknown Network'}
          </p>
        </div>
      </div>

      {!isOnSepolia && (
        <Button
          data-testid="button-switch-sepolia"
          onClick={handleSwitchNetwork}
          disabled={isSwitching}
          variant="outline"
          size="sm"
          className="bg-yellow-500/20 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/30"
        >
          <i className="fas fa-network-wired mr-2"></i>
          {isSwitching ? 'Switching...' : 'Switch to Sepolia'}
        </Button>
      )}

      {isOnSepolia && (
        <Badge className="bg-green-500/20 text-green-600 border-green-500/20">
          <i className="fas fa-check mr-1"></i>
          Sepolia Ready
        </Badge>
      )}

      <Button
        data-testid="button-disconnect"
        onClick={disconnect}
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground"
      >
        <i className="fas fa-sign-out-alt"></i>
      </Button>
    </div>
  );
}