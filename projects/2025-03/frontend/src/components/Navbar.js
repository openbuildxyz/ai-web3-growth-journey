import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

function Navbar() {
  const { account, balance } = useWeb3();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-gem me-2"></i>
          Trisolaris
        </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">首页</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/play">抽卡游戏</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/profile">个人资料</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/leaderboard">排行榜</Link>
            </li>
          </ul>
          
          <div className="d-flex align-items-center text-light">
            {account ? (
              <>
                <span className="badge bg-success me-2">已连接</span>
                <span className="me-3">TRI: {parseFloat(balance).toFixed(2)}</span>
                <small className="text-muted">{account.substring(0, 6)}...{account.substring(account.length - 4)}</small>
              </>
            ) : (
              <button className="btn btn-outline-light btn-sm">
                连接钱包
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
