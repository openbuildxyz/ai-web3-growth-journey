import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import MilestoneAchievement from '../components/Achievement';
import { MILESTONE_TYPES, getMilestoneDescription } from '../services/storageService';

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

const CheckInPage = () => {
  const { userData, handleCheckIn, loading, getNextCheckInTime, showAchievement, newAchievement } = useApp();
  const [nextCheckInTime, setNextCheckInTime] = useState(null);
  const [countdown, setCountdown] = useState('');
  
  // 加载下一次可打卡时间
  useEffect(() => {
    const loadNextCheckInTime = () => {
      if (userData && userData.hasCheckedIn) {
        const nextTime = getNextCheckInTime();
        setNextCheckInTime(nextTime);
      }
    };
    
    loadNextCheckInTime();
  }, [userData, getNextCheckInTime]);
  
  // 倒计时更新
  useEffect(() => {
    if (!nextCheckInTime) return;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = nextCheckInTime - now;
      
      if (diff <= 0) {
        setCountdown('可以打卡了');
        clearInterval(timer);
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setCountdown(`${hours}小时 ${minutes}分钟 ${seconds}秒`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [nextCheckInTime]);
  
  // 打卡处理
  const onCheckIn = async () => {
    const result = await handleCheckIn();
    if (result.success) {
      // 打卡成功，更新下次可打卡时间
      const nextTime = getNextCheckInTime();
      setNextCheckInTime(nextTime);
    } else {
      alert(result.error || "打卡失败");
    }
  };
  
  // 检查是否可以打卡
  const canCheckIn = () => {
    if (!userData) return false;
    
    // 如果设置了下次打卡时间并且还未到
    if (nextCheckInTime && Date.now() < nextCheckInTime) return false;
    
    return true;
  };
  
  if (!userData) {
    return <div className="checkin-page loading">加载用户数据中...</div>;
  }
  
  return (
    <div className="checkin-page">
      <h1>运动打卡</h1>
      
      <div className="checkin-stats">
        <p>当前连续打卡次数: <strong>{userData.consecutiveCheckIns || 0}</strong></p>
        <p>上次打卡时间: {
          userData.lastCheckInTime ? 
            new Date(userData.lastCheckInTime * 1000).toLocaleString() : 
            '尚未打卡'
        }</p>
        
        {nextCheckInTime && Date.now() < nextCheckInTime && (
          <p className="next-checkin-time">
            下次可打卡时间: {countdown}
          </p>
        )}
      </div>
      
      <button 
        onClick={onCheckIn} 
        className={`checkin-btn ${loading || !canCheckIn() ? 'disabled' : ''}`}
        disabled={loading || !canCheckIn()}
      >
        {loading ? '处理中...' : (
          nextCheckInTime && Date.now() < nextCheckInTime ? 
            `需等待 ${countdown}` : '打卡'
        )}
      </button>
      
      {userData.milestonesAchieved && userData.milestonesAchieved.some(achieved => achieved) && (
        <div className="milestones-section">
          <h2>已获得的成就</h2>
          <div className="milestones-grid">
            {userData.milestonesAchieved.map((achieved, index) => (
              achieved && (
                <MilestoneAchievement 
                  key={index}
                  name={MILESTONE_TYPES[index]}
                  description={getMilestoneDescription(index)}
                  imageUrl={MILESTONE_IMAGES[index]}
                  date={userData.lastCheckInTime * 1000}
                  locked={false}
                />
              )
            ))}
          </div>
        </div>
      )}
      
      {showAchievement && newAchievement && (
        <div className="achievement-animation">
          <h2>恭喜获得新成就!</h2>
          <MilestoneAchievement 
            name={newAchievement.name}
            description={getMilestoneDescription(newAchievement.type)}
            imageUrl={MILESTONE_IMAGES[newAchievement.type]}
            date={Date.now()}
            locked={false}
          />
        </div>
      )}
    </div>
  );
};

export default CheckInPage;