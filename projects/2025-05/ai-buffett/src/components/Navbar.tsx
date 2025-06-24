import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAuthStore } from '@/store/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

const Navbar = () => {
  const { isLoggedIn, login, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { address, isConnected } = useAccount();
  
  // 当钱包连接状态改变时更新认证状态
  useEffect(() => {
    if (isConnected && address && !isLoggedIn) {
      login();
    } else if (!isConnected && isLoggedIn) {
      logout();
    }
  }, [isConnected, address, isLoggedIn, login, logout]);

  const handleAuth = () => {
    // 钱包连接/断开连接由 RainbowKit 处理
    // 登录后导航到仪表板
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToStockAnalysis = () => {
    navigate('/stock-analysis');
  };

  const isDashboard = location.pathname === '/dashboard';

  return (
    <nav className="bg-white shadow-sm fixed top-0 w-full z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span 
              className="text-xl font-bold text-brand-blue cursor-pointer hover:text-blue-700"
              onClick={() => navigate('/')}
            >
              AI Buffett
            </span>
            <div className="ml-10 hidden md:flex space-x-4">
              <span 
                className="text-gray-600 hover:text-brand-blue cursor-pointer"
                onClick={handleGoToStockAnalysis}
              >
                数字货币/股票/金融产品分析
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <ConnectButton />
              
              {isLoggedIn && !isDashboard && (
                <Button 
                  variant="outline" 
                  className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white ml-2"
                  onClick={handleGoToDashboard}
                >
                  进入仪表板
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
