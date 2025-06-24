'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 定义Web3上下文类型
interface Web3ContextType {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

// 创建上下文
const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Web3Provider属性
interface Web3ProviderProps {
  children: ReactNode;
}

/**
 * Web3Provider组件
 * 提供Web3连接状态和方法
 */
export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 连接钱包
  const connect = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 这里是简化的实现，实际使用时需要替换为wagmi的连接逻辑
      // 例如: const result = await connectAsync({ connector: injected() });
      
      // 检查是否有window.ethereum
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          // 请求账户访问
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
            setChainId(parseInt(chainIdHex, 16));
            setIsConnected(true);
          }
        } catch (err) {
          console.error('MetaMask连接错误:', err);
          throw new Error('连接MetaMask失败');
        }
      } else {
        // 模拟连接成功
        console.log('未检测到MetaMask，使用模拟账户');
        setIsConnected(true);
        setAccount('0x0000000000000000000000000000000000000000');
        setChainId(1); // Ethereum Mainnet
      }
    } catch (err) {
      console.error('连接钱包失败:', err);
      setError(err instanceof Error ? err : new Error('连接钱包失败'));
    } finally {
      setIsLoading(false);
    }
  };

  // 断开连接
  const disconnect = async () => {
    setIsLoading(true);
    
    try {
      // 这里是简化的实现，实际使用时需要替换为wagmi的断开连接逻辑
      // 例如: await disconnectAsync();
      
      // 模拟断开连接
      setIsConnected(false);
      setAccount(null);
      setChainId(null);
    } catch (err) {
      console.error('断开连接失败:', err);
      setError(err instanceof Error ? err : new Error('断开连接失败'));
    } finally {
      setIsLoading(false);
    }
  };

  // 监听账户变化
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // 用户断开了连接
          setIsConnected(false);
          setAccount(null);
        } else if (accounts[0] !== account) {
          // 用户切换了账户
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        setChainId(parseInt(chainIdHex, 16));
      };

      // 添加事件监听器
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // 清理函数
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [account]);

  // 提供上下文值
  const contextValue: Web3ContextType = {
    isConnected,
    account,
    chainId,
    connect,
    disconnect,
    isLoading,
    error
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

// 自定义Hook，用于在组件中访问Web3上下文
export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3必须在Web3Provider内部使用');
  }
  return context;
};

export default Web3Provider;
