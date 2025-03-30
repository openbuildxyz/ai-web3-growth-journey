// src/pages/LoginPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import WalletConnect from '../components/WalletConnect';

const LoginPage = () => {
  const { connectWallet, isConnected } = useApp();
  const navigate = useNavigate();
  
  // 如果已连接，跳转到打卡页面
  React.useEffect(() => {
    if (isConnected) {
      navigate('/checkin');
    }
  }, [isConnected, navigate]);
  
  const handleConnect = (address) => {
    connectWallet(address);
  };
  
  return (
    <div className="login-page">
      <div className="login-container">
        <h1>运动打卡应用</h1>
        <p>连接钱包开始记录您的运动成就</p>
        <WalletConnect onConnect={handleConnect} />
      </div>
    </div>
  );
};

export default LoginPage;