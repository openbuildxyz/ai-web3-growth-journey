import React from 'react';
import { Search, FileText, User, FolderSync as Sync } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewNote: () => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, onNewNote }) => {
  const { walletState, isConnecting, connectWallet, disconnectWallet } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">AI PLANNER</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="搜索笔记..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {walletState.isConnected && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Sync className="h-4 w-4 text-green-500" />
                <span>已同步</span>
              </div>
            )}

            <button
              onClick={onNewNote}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
            >
              + 新建笔记
            </button>

            {walletState.isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  <div className="text-gray-900 font-medium">
                    {formatAddress(walletState.address!)}
                  </div>
                  <div className="text-gray-500">
                    {parseFloat(walletState.balance!).toFixed(4)} ETH
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium disabled:opacity-50"
              >
                {isConnecting ? '连接中...' : '连接钱包'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};