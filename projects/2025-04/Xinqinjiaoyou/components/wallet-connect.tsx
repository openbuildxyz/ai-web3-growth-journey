'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Wallet } from 'lucide-react';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
}

export function WalletConnect({ onConnect }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      // 检查是否安装了 MetaMask
      if (typeof window.ethereum !== 'undefined') {
        // 请求用户授权连接钱包
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          onConnect?.(accounts[0]);
        }
      } else {
        alert('请安装 MetaMask 钱包');
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
      alert('连接钱包失败，请重试');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    // 这里可以添加断开连接后的清理逻辑
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <Wallet className="h-6 w-6" />
          <h3 className="text-lg font-semibold">连接钱包</h3>
        </div>
        
        {address ? (
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">已连接钱包地址：</span>
              <span className="text-sm font-mono">{address}</span>
            </div>
            <Button 
              variant="destructive" 
              onClick={disconnectWallet}
              className="w-full"
            >
              断开连接
            </Button>
          </div>
        ) : (
          <Button 
            onClick={connectWallet} 
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? '连接中...' : '连接钱包'}
          </Button>
        )}
      </div>
    </Card>
  );
} 