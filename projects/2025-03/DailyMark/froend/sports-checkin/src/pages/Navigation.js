import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const Navigation = () => {
  const { address, disconnectWallet } = useApp();
  
  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-logo">运动打卡</div>
        <div className="nav-links">
          <Link to="/checkin" className="nav-link">打卡</Link>
          <Link to="/medals" className="nav-link">勋章</Link>
        </div>
        <div className="nav-wallet">
          <span className="address">{address?.substr(0, 6)}...{address?.substr(-4)}</span>
          <button onClick={disconnectWallet} className="disconnect-btn">断开连接</button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
