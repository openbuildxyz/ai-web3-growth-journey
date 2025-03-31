import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import MilestoneAchievement from '../components/Achievement';

// 里程碑类型和描述
const MILESTONE_TYPES = [
  "首次登录",
  "第一次打卡",
  "连续打卡7天",
  "连续打卡1月",
  "连续打卡3月",
  "连续打卡1年",
  "中断后恢复打卡"
];

// 里程碑图片
const MILESTONE_IMAGES = [
  "/images/nft-first-login.png",
  "/images/nft-first-checkin.png",
  "/images/nft-7days.png",
  "/images/nft-1month.png",
  "/images/nft-3months.png",
  "/images/nft-1year.png",
  "/images/nft-resumed.png"
];

const MedalsPage = () => {
  const { userData, loading, contract } = useWallet();
  
  if (loading || !userData) {
    return <div className="medals-page loading">加载中...</div>;
  }
  
  return (
    <div className="medals-page">
      <h1>我的成就勋章</h1>
      
      <div className="checkin-stats">
        <p>连续打卡天数: <strong>{userData.consecutiveCheckIns || 0}</strong></p>
        <p>已获得成就: <strong>
          {userData.milestonesAchieved ? 
            userData.milestonesAchieved.filter(achieved => achieved).length : 0}
        </strong>/{MILESTONE_TYPES.length}</p>
      </div>
      
      <div className="achievements-grid">
        {MILESTONE_TYPES.map((milestone, index) => {
          const achieved = userData.milestonesAchieved ? 
            userData.milestonesAchieved[index] : false;
            
          return (
            <div 
              key={index} 
              className={`achievement-item ${achieved ? 'earned' : 'locked'}`}
            >
              <MilestoneAchievement 
                name={milestone}
                description={contract.getMilestoneDescription(index)}
                imageUrl={MILESTONE_IMAGES[index]}
                date={achieved ? userData.lastCheckInTime * 1000 : null}
                locked={!achieved}
              />
              <p className="achievement-status">
                {achieved ? '已获得' : '未解锁'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MedalsPage;