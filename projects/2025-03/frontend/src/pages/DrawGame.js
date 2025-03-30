import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { Web3Context } from '../context/Web3Context';
import CardDisplay from '../components/CardDisplay';
import DrawHistory from '../components/DrawHistory';
import { toast } from 'react-toastify';

const DrawGame = () => {
  const { account, gameContract, triToken, balance, setBalance } = useContext(Web3Context);
  const [drawPrice, setDrawPrice] = useState(0);
  const [jackpot, setJackpot] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastDrawnCard, setLastDrawnCard] = useState(null);
  const [userHistory, setUserHistory] = useState({
    lastCards: [],
    totalDraws: 0,
    totalRewards: 0
  });
  
  // 加载游戏数据
  useEffect(() => {
    const loadGameData = async () => {
      if (gameContract && account) {
        try {
          // 获取抽卡价格
          const price = await gameContract.drawPrice();
          setDrawPrice(ethers.utils.formatEther(price));
          
          // 获取奖池金额
          const jackpotBalance = await gameContract.jackpotBalance();
          setJackpot(ethers.utils.formatEther(jackpotBalance));
          
          // 获取用户历史
          const history = await gameContract.getUserHistory(account);
          setUserHistory({
            lastCards: history.lastCards,
            totalDraws: history.totalDraws.toNumber(),
            totalRewards: ethers.utils.formatEther(history.totalRewards)
          });
          
          // 监听抽卡事件
          gameContract.on("CardDrawn", (user, cardId, cardName, event) => {
            if (user.toLowerCase() === account.toLowerCase()) {
              setLastDrawnCard({
                id: cardId.toNumber(),
                name: cardName
              });
              setIsDrawing(false);
              
              // 更新用户历史
              loadGameData();
            }
          });
          
          // 监听三连事件
          gameContract.on("TripleMatch", (user, cardId, reward, event) => {
            if (user.toLowerCase() === account.toLowerCase()) {
              toast.success(`恭喜！您获得了三连奖励：${ethers.utils.formatEther(reward)} TRI！`);
              
              // 更新余额
              updateBalance();
            }
          });
        } catch (error) {
          console.error("Error loading game data", error);
        }
      }
    };
    
    loadGameData();
    
    // 清理事件监听器
    return () => {
      if (gameContract) {
        gameContract.removeAllListeners("CardDrawn");
        gameContract.removeAllListeners("TripleMatch");
      }
    };
  }, [gameContract, account]);
  
  // 更新余额
  const updateBalance = async () => {
    if (triToken && account) {
      const newBalance = await triToken.balanceOf(account);
      setBalance(ethers.utils.formatEther(newBalance));
    }
  };
  
  // 抽卡
  const handleDraw = async () => {
    if (!account) {
      toast.error("请先连接钱包");
      return;
    }
    
    if (parseFloat(balance) < parseFloat(drawPrice)) {
      toast.error("代币余额不足");
      return;
    }
    
    try {
      setIsDrawing(true);
      
      // 授权游戏合约使用代币
      const allowance = await triToken.allowance(account, gameContract.address);
      if (allowance.lt(ethers.utils.parseEther(drawPrice))) {
        const tx = await triToken.approve(
          gameContract.address,
          ethers.constants.MaxUint256
        );
        await tx.wait();
      }
      
      // 抽卡
      const tx = await gameContract.drawCard();
      await tx.wait();
      
      // 更新余额
      updateBalance();
    } catch (error) {
      console.error("Error drawing card", error);
      toast.error("抽卡失败，请重试");
      setIsDrawing(false);
    }
  };
  
  return (
    <div className="draw-game">
      <div className="game-info">
        <h1>Trisolaris抽卡游戏</h1>
        <div className="stats">
          <p>抽卡价格: {drawPrice} TRI</p>
          <p>奖池金额: {jackpot} TRI</p>
          <p>您的余额: {balance} TRI</p>
        </div>
      </div>
      
      <div className="card-section">
        <div className="current-cards">
          <h2>您的最近三张卡</h2>
          <div className="card-row">
            {userHistory.lastCards.map((cardId, index) => (
              <CardDisplay key={index} cardId={cardId.toNumber()} />
            ))}
            {Array(3 - userHistory.lastCards.length).fill().map((_, index) => (
              <div key={`empty-${index}`} className="empty-card">?</div>
            ))}
          </div>
        </div>
        
        {lastDrawnCard && (
          <div className="last-drawn">
            <h3>最近抽到的卡</h3>
            <CardDisplay cardId={lastDrawnCard.id} name={lastDrawnCard.name} />
          </div>
        )}
      </div>
      
      <div className="actions">
        <button 
          className="draw-button" 
          onClick={handleDraw} 
          disabled={isDrawing || parseFloat(balance) < parseFloat(drawPrice)}
        >
          {isDrawing ? "抽卡中..." : "抽卡"}
        </button>
      </div>
      
      <DrawHistory 
        totalDraws={userHistory.totalDraws} 
        totalRewards={userHistory.totalRewards} 
      />
    </div>
  );
};

export default DrawGame;