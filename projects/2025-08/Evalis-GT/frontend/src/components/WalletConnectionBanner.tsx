import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Wallet, X } from 'lucide-react';
import { getMyTokenBalance } from '../api/studentService';

interface WalletConnectionBannerProps {
  onConnectWallet?: () => void;
}

const WalletConnectionBanner: React.FC<WalletConnectionBannerProps> = ({ onConnectWallet }) => {
  const [isWalletLinked, setIsWalletLinked] = useState<boolean | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    checkWalletStatus();
  }, []);

  const checkWalletStatus = async () => {
    try {
      const response = await getMyTokenBalance();
      setIsWalletLinked(response.walletLinked);
    } catch (error) {
      setIsWalletLinked(false);
    }
  };

  if (isWalletLinked === null || isWalletLinked || isDismissed) {
    return null;
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50 mb-6">
      <Wallet className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          <span className="text-yellow-800 font-medium">
            🎁 Connect your wallet to automatically receive EVLT tokens and NFT certificates for good grades!
          </span>
          <p className="text-yellow-700 text-sm mt-1">
            When you score 75% or higher, you'll automatically receive badge rewards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
            onClick={onConnectWallet}
          >
            Connect Wallet
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDismissed(true)}
            className="text-yellow-600 hover:text-yellow-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default WalletConnectionBanner;
