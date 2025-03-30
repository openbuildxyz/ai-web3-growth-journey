import React from 'react';

const MilestoneAchievement = ({ name, imageUrl, description, date, locked }) => {
  return (
    <div className={`milestone ${locked ? 'locked' : 'earned'}`}>
      <div className="milestone-image">
        <img 
          src={locked ? '/images/locked.png' : imageUrl} 
          alt={name} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/default-nft.png'; // 图片加载失败时的替代图片
          }}
        />
      </div>
      <h3>{name}</h3>
      <p className="milestone-description">{description}</p>
      {!locked && date && (
        <div className="milestone-date">
          获得日期: {new Date(date).toLocaleDateString()}
        </div>
      )}
      <div className="milestone-status">
        {locked ? '未达成' : '已获得'}
      </div>
    </div>
  );
};

export default MilestoneAchievement;