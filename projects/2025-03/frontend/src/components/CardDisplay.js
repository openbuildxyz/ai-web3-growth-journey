import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import '../index.css';

const CardDisplay = ({ cardId, name }) => {
  const { cardLibrary } = useWeb3();
  const [card, setCard] = useState(null);
  
  useEffect(() => {
    const fetchCardDetails = async () => {
      if (cardLibrary && cardId !== undefined) {
        try {
          const cardData = await cardLibrary.getCardById(cardId);
          setCard({
            id: cardData.id.toNumber(),
            name: cardData.name,
            rarity: cardData.rarity,
            probability: cardData.probability.toNumber(),
            rewardMultiplier: cardData.rewardMultiplier.toNumber()
          });
        } catch (error) {
          console.error("Error fetching card details", error);
        }
      }
    };
    
    fetchCardDetails();
  }, [cardLibrary, cardId]);
  
  // 如果卡牌数据还未加载，显示占位符
  if (!card) {
    return (
      <div className="card-display" style={{ backgroundColor: '#f0f0f0' }}>
        <span className="spinner-border spinner-border-sm"></span>
        <p>加载中...</p>
      </div>
    );
  }
  
  // 根据稀有度设置卡牌类名
  const getRarityClassName = (rarity) => {
    switch(rarity) {
      case 0: return 'common';
      case 1: return 'rare';
      case 2: return 'epic';
      case 3: return 'legendary';
      default: return 'common';
    }
  };
  
  // 获取稀有度文本
  const getRarityText = (rarity) => {
    switch(rarity) {
      case 0: return '普通';
      case 1: return '稀有';
      case 2: return '史诗';
      case 3: return '传说';
      default: return '普通';
    }
  };
  
  // 根据卡片ID加载对应图片
  const getCardImage = (id) => {
    try {
      // 尝试从images文件夹加载对应ID的图片
      // 注意：在webpack环境中，这种动态导入需要特殊处理
      return require(`../images/${id}.png`);
    } catch (error) {
      // 如果找不到，使用默认图片
      try {
        return require('../images/1.png');
      } catch (e) {
        // 如果连默认图片都找不到，返回空
        return null;
      }
    }
  };
  
  const imageUrl = getCardImage(card.id);
  
  return (
    <div className={`card-container ${getRarityClassName(card.rarity)}`}>
      <div className="card-inner">
        <div className="card-front">
          {imageUrl && <img src={imageUrl} alt={card.name || name} className="card-image" />}
        </div>
        <div className="card-back">
          <h4>{card.name || name}</h4>
          <p className="rarity">{getRarityText(card.rarity)}</p>
          <p className="multiplier">奖励: {card.rewardMultiplier / 100}x</p>
        </div>
      </div>
    </div>
  );
};

export default CardDisplay;
