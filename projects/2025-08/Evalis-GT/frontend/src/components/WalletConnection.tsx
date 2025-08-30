import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Wallet, ExternalLink, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { linkWallet, getMyTokenBalance } from '../api/studentService';

interface WalletConnectionProps {
  onWalletConnected?: (walletAddress: string) => void;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({ onWalletConnected }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentWallet, setCurrentWallet] = useState<string | null>(null);
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    show: boolean;
  }>({ type: 'info', message: '', show: false });

  useEffect(() => {
    // Check if MetaMask is available
    setIsMetaMaskAvailable(typeof window !== 'undefined' && !!(window as any).ethereum);
    
    // Check if wallet is already connected
    checkExistingWallet();
  }, []);

  const checkExistingWallet = async () => {
    try {
      const response = await getMyTokenBalance();
      if (response.walletLinked && response.walletAddress) {
        setCurrentWallet(response.walletAddress);
      }
    } catch (error) {
      // Wallet not linked yet
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const connectWithMetaMask = async () => {
    if (!isMetaMaskAvailable) {
      showNotification('error', 'MetaMask is not installed. Please install MetaMask browser extension.');
      return;
    }

    try {
      setIsConnecting(true);
      
      // Request account access
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        const address = accounts[0];
        await handleWalletLink(address);
      }
    } catch (error: any) {
      console.error('MetaMask connection error:', error);
      showNotification('error', 'Failed to connect with MetaMask: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleManualLink = async () => {
    if (!walletAddress || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      showNotification('error', 'Please enter a valid Ethereum wallet address (42 characters starting with 0x)');
      return;
    }

    await handleWalletLink(walletAddress);
  };

  const handleWalletLink = async (address: string) => {
    try {
      setIsConnecting(true);
      
      const response = await linkWallet(address);
      
      setCurrentWallet(address);
      setWalletAddress('');
      showNotification('success', 'Wallet linked successfully! You can now receive EVT tokens and NFT certificates.');
      
      if (onWalletConnected) {
        onWalletConnected(address);
      }
      
    } catch (error: any) {
      console.error('Wallet linking error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to link wallet';
      showNotification('error', errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('info', 'Address copied to clipboard!');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (currentWallet) {
    return (
      <Card className="border border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Wallet Connected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div>
              <p className="text-sm text-gray-600">Connected Address:</p>
              <p className="font-mono text-sm font-medium">{formatAddress(currentWallet)}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(currentWallet)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://sepolia.etherscan.io/address/${currentWallet}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-green-700 text-sm">
              ✅ Ready to receive EVT tokens and NFT certificates!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Your Wallet
        </CardTitle>
        <p className="text-sm text-gray-600">
          Link your Web3 wallet to receive EVT tokens and NFT certificates for your academic achievements.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {notification.show && (
          <Alert className={`${
            notification.type === 'success' ? 'border-green-200 bg-green-50' :
            notification.type === 'error' ? 'border-red-200 bg-red-50' :
            'border-blue-200 bg-blue-50'
          }`}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        )}

        {/* MetaMask Connection */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Option 1: Connect with MetaMask</h4>
          <Button
            onClick={connectWithMetaMask}
            disabled={!isMetaMaskAvailable || isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <>Connecting...</>
            ) : (
              <>
                <img 
                  src="https://metamask.io/images/metamask-fox.svg" 
                  alt="MetaMask" 
                  className="w-5 h-5 mr-2"
                />
                Connect with MetaMask
              </>
            )}
          </Button>
          {!isMetaMaskAvailable && (
            <p className="text-sm text-gray-500 text-center">
              MetaMask not detected. <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Install MetaMask
              </a>
            </p>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        {/* Manual Address Input */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Option 2: Enter Wallet Address Manually</h4>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="0x742d35Cc6479C13A7c1230Ab5D8d8F8d8e8E8f8..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="font-mono text-sm"
            />
            <Button
              onClick={handleManualLink}
              disabled={!walletAddress || isConnecting}
              variant="outline"
              className="w-full"
            >
              {isConnecting ? 'Linking...' : 'Link Wallet Address'}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Enter your Ethereum wallet address (42 characters starting with 0x)
          </p>
        </div>

        {/* Information */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h5 className="font-medium text-blue-900 mb-2">Why connect a wallet?</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Receive EVT tokens for good grades (20-100 EVLT based on performance)</li>
            <li>• Get NFT certificates with badge tiers (Bronze, Silver, Gold, Platinum, Diamond)</li>
            <li>• Track your academic achievements on the blockchain</li>
            <li>• Showcase your verified credentials</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletConnection;
