import React from 'react';

const DrawHistory = ({ totalDraws, totalRewards }) => {
  return (
    <div className="draw-history">
      <h3 className="history-title">您的抽卡历史</h3>
      <div className="history-stats">
        <div className="stat-item">
          <h4>总抽卡次数</h4>
          <p>{totalDraws}</p>
        </div>
        <div className="stat-item">
          <h4>总奖励</h4>
          <p>{totalRewards} TRI</p>
        </div>
      </div>
    </div>
  );
};

export default DrawHistory;
