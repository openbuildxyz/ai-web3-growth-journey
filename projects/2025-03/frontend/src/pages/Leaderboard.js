import React, { useState, useEffect } from 'react';

function Leaderboard() {
  // 示例数据 - 在真实应用中，您需要从智能合约获取此数据
  const [leaderboardData, setLeaderboardData] = useState([
    { address: '0x1234...5678', totalRewards: '1250.45', totalDraws: 112 },
    { address: '0xabcd...efgh', totalRewards: '980.32', totalDraws: 95 },
    { address: '0x9876...5432', totalRewards: '756.18', totalDraws: 78 },
    { address: '0xijkl...mnop', totalRewards: '684.27', totalDraws: 67 },
    { address: '0x5432...1098', totalRewards: '521.93', totalDraws: 54 },
  ]);

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-10 mx-auto">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">Trisolaris 排行榜</h2>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                以下排行榜展示了游戏中获得奖励最多的玩家。
              </div>
              
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">钱包地址</th>
                      <th scope="col">总抽卡次数</th>
                      <th scope="col">总奖励 (TRI)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((player, index) => (
                      <tr key={index}>
                        <th scope="row">{index + 1}</th>
                        <td>{player.address}</td>
                        <td>{player.totalDraws}</td>
                        <td>{player.totalRewards}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="alert alert-warning mt-4">
                <i className="fas fa-exclamation-triangle me-2"></i>
                注意：目前排行榜数据仅为示例。在完整实现中，这些数据将从区块链获取。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
