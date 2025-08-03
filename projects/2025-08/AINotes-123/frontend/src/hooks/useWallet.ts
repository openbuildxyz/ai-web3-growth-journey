import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '../types';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const balance = await provider.getBalance(accounts[0].address);
          setWalletState({
            isConnected: true,
            address: accounts[0].address,
            balance: ethers.formatEther(balance),
          });
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('请安装 MetaMask 钱包');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);

      setWalletState({
        isConnected: true,
        address,
        balance: ethers.formatEther(balance),
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('连接钱包失败');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
    });
  };

  const mintNoteAsNFT = async (noteId: string, metadata: any) => {
    if (!walletState.isConnected) {
      throw new Error('请先连接钱包');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // 模拟NFT铸造过程（实际项目中需要部署智能合约）
      const mockTransaction = {
        to: '0x0000000000000000000000000000000000000000',
        value: ethers.parseEther('0.001'),
        data: ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify(metadata))),
      };

      const tx = await signer.sendTransaction(mockTransaction);
      await tx.wait();

      return {
        tokenId: Math.floor(Math.random() * 10000).toString(),
        transactionHash: tx.hash,
      };
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkConnection);
      window.ethereum.on('chainChanged', checkConnection);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', checkConnection);
        window.ethereum.removeListener('chainChanged', checkConnection);
      }
    };
  }, []);

  return {
    walletState,
    isConnecting,
    connectWallet,
    disconnectWallet,
    mintNoteAsNFT,
  };
};