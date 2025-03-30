import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import '../index.css';

// 用于展示钱包地址的工具函数
const shortenAddress = (address) => {
  return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';
};

function Profile() {
  const { account, gameContract, provider, setAccount } = useWeb3();
  const [userHistory, setUserHistory] = useState({
    lastCards: [],
    totalDraws: 0,
    totalRewards: 0
  });
  const [loading, setLoading] = useState(true);
  const [connectingWallet, setConnectingWallet] = useState(false);

  // 连接钱包函数
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("请安装MetaMask!");
      return;
    }
    
    try {
      setConnectingWallet(true);
      
      // 请求用户授权
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error("连接钱包失败:", error);
      alert("连接钱包失败，请重试");
    } finally {
      setConnectingWallet(false);
    }
  };
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!account || !gameContract) return;
      
      try {
        setLoading(true);
        const history = await gameContract.getUserHistory(account);
        
        setUserHistory({
          lastCards: history.lastCards || [],
          totalDraws: history.totalDraws.toNumber(),
          totalRewards: ethers.utils.formatEther(history.totalRewards)
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [account, gameContract]);
  
  // 检查钱包连接状态
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0 && !account) {
            setAccount(accounts[0]);
          }
        } catch (error) {
          console.error("检查钱包连接状态失败:", error);
        }
      }
    };
    
    checkConnection();
  }, [account, setAccount]);

  if (!account) {
    return (
      <div className="container mt-5 text-center">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h2 className="mb-0">连接钱包</h2>
          </div>
          <div className="card-body">
            <p className="mb-4">请连接您的钱包以查看个人资料和游戏记录</p>
            <button 
              className="btn btn-lg btn-primary" 
              onClick={connectWallet}
              disabled={connectingWallet}
            >
              {connectingWallet ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  连接中...
                </>
              ) : "连接钱包"}
            </button>
          </div>
          <div className="card-footer text-muted">
            <small>需要安装MetaMask扩展程序</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h2 className="mb-0">个人资料</h2>
              <button 
                className="btn btn-light btn-sm" 
                onClick={connectWallet}
              >
                {shortenAddress(account)}
              </button>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">正在加载您的游戏数据...</p>
                </div>
              ) : (
                <>
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <div className="text-center">
                        <div className="rounded-circle bg-light p-3 mx-auto" style={{ width: "100px", height: "100px" }}>
                          <i className="fas fa-user fa-3x text-primary mt-2"></i>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-8">
                      <h4>账户地址</h4>
                      <p className="text-muted d-flex align-items-center">
                        <span className="me-2">{account}</span>
                        <button 
                          className="btn btn-sm btn-outline-secondary" 
                          onClick={() => navigator.clipboard.writeText(account)}
                          title="复制地址"
                        >
                          复制
                        </button>
                      </p>
                      <p>
                        <button 
                          className="btn btn-success btn-sm" 
                          onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}
                        >
                          在区块浏览器中查看
                        </button>
                      </p>
                    </div>
                  </div>
                  
                  <div className="row mt-4">
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body text-center">
                          <h5 className="card-title">总抽卡次数</h5>
                          <p className="card-text display-4">{userHistory.totalDraws}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body text-center">
                          <h5 className="card-title">总奖励</h5>
                          <p className="card-text display-4">{parseFloat(userHistory.totalRewards).toFixed(2)} TRI</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {userHistory.lastCards && userHistory.lastCards.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-center mb-3">近期抽取的卡牌</h4>
                      <div className="card-row justify-content-center">
                        {userHistory.lastCards.slice(0, 3).map((cardId, index) => (
                          <div key={index} className="text-center">
                            <div className="card-container">
                              <div className="card-inner">
                                <div className="card-front">
                                  <img 
                                    src={require(`../images/${cardId.toNumber()}.png`)} 
                                    alt={`Card ${cardId.toNumber()}`} 
                                    className="card-image" 
                                    onError={(e) => {
                                      e.target.onerror = null; 
                                      e.target.src = require('../images/1.png');
                                    }}
                                  />
                                </div>
                                <div className="card-back">
                                  <h4>卡片 #{cardId.toNumber()}</h4>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="card-footer">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">连接状态: {account ? '已连接' : '未连接'}</span>
                <button className="btn btn-primary" onClick={() => window.location.href = '/play'}>前往抽卡</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
