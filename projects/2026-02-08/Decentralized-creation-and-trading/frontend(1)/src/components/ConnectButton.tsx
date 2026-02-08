import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

interface ConnectButtonProps {
  // 可选属性
}

export const ConnectButton: React.FC<ConnectButtonProps> = () => {
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // 检查是否已经连接了钱包
    if (typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum);
      web3.eth.getAccounts().then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      });

      // 监听账户变化
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          setAccount('');
          setIsConnected(false);
        }
      });
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.requestAccounts();
        setAccount(accounts[0]);
        setIsConnected(true);
      } catch (error) {
        console.error('连接钱包失败:', error);
      }
    } else {
      alert('请安装MetaMask钱包');
    }
  };

  const truncateAddress = (address: string) => {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  };

  return (
    <button
      onClick={connectWallet}
      className="btn btn-primary"
    >
      {isConnected ? truncateAddress(account) : '连接钱包'}
    </button>
  );
};