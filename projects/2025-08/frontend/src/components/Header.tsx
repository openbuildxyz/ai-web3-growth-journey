import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, Shield, Users, Wallet, LogOut } from 'lucide-react';
import { ethers } from 'ethers';

const Header = () => {
  const location = useLocation();
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // 检查MetaMask是否已连接
  useEffect(() => {
    checkConnection();
    
    // 监听账户变化
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
    } else {
      setAccount(accounts[0]);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('请安装MetaMask钱包!');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(accounts[0]);
    } catch (error: any) {
      console.error('连接钱包失败:', error);
      if (error.code === 4001) {
        alert('用户拒绝连接钱包');
      } else {
        alert('连接钱包时发生错误');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">Dexpert</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive('/') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Data Market</span>
            </Link>
            <Link 
              to="/become-expert" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive('/become-expert') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Become Expert</span>
            </Link>
            <Link 
              to="/audit-services" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive('/audit-services') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Audit Services</span>
            </Link>
          </nav>

          {account ? (
            <div className="flex items-center space-x-3">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-sm font-medium">
                  {formatAddress(account)}
                </span>
              </div>
              <button 
                onClick={disconnectWallet}
                className="bg-red-600/20 border border-red-600/30 text-red-400 px-3 py-2 rounded-lg hover:bg-red-600/30 transition-all duration-200 flex items-center space-x-2"
                title="断开钱包连接"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;