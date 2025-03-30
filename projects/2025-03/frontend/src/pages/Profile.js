import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';

function Profile() {
  const { account, triToken, gameContract } = useWeb3();
  const [userHistory, setUserHistory] = useState({
    totalDraws: 0,
    totalRewards: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!account || !gameContract) return;
      
      try {
        setLoading(true);
        const history = await gameContract.getUserHistory(account);
        
        setUserHistory({
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

  if (!account) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-warning">
          请先连接您的钱包以查看个人资料
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">个人资料</h2>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
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
                      <p className="text-muted">{account}</p>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
