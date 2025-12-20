'use client';

import { useState, useEffect } from 'react';
import { connectWallet } from '@/lib/web3';

interface WalletConnectProps {
  onAccountChange: (account: string | null) => void;
}

export default function WalletConnect({ onAccountChange }: WalletConnectProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 检查是否已连接钱包
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            onAccountChange(accounts[0]);
          }
        } catch (error) {
          console.error('检查钱包连接失败:', error);
        }
      }
    };
    
    checkConnection();

    // 监听账户变化
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          onAccountChange(accounts[0]);
        } else {
          setAccount(null);
          onAccountChange(null);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [onAccountChange]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const connectedAccount = await connectWallet();
      setAccount(connectedAccount);
      onAccountChange(connectedAccount);
    } catch (error: any) {
      alert(error.message || '连接钱包失败');
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (account) {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-green-700 font-medium">
          🔗 {formatAddress(account)}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors"
    >
      {loading ? '连接中...' : '🦊 连接 MetaMask'}
    </button>
  );
} 