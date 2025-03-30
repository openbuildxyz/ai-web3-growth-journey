import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 mx-auto text-center">
          <h1 className="display-4 mb-4">Welcome to Trisolaris</h1>
          <p className="lead mb-4">
            一款基于Web3的卡牌抽奖游戏，匹配三张相同的卡牌赢取丰厚奖励！
          </p>
          
          <div className="card bg-dark text-white mb-4">
            <div className="card-body p-5">
              <h2 className="mb-3">游戏规则</h2>
              <p>1. 使用TRI代币抽取卡牌</p>
              <p>2. 抽取三张相同的卡牌获得奖励</p>
              <p>3. 卡牌稀有度不同，奖励倍数也不同</p>
              <p>4. 传说级卡牌三连可额外获得奖池奖励</p>
              <Link to="/play" className="btn btn-primary btn-lg mt-3">
                开始游戏
              </Link>
            </div>
          </div>
          
          <div className="row mt-5">
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">普通水晶</h5>
                  <p className="card-text">概率: 60%<br/>奖励: 1.1倍</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">稀有宝石</h5>
                  <p className="card-text">概率: 30%<br/>奖励: 1.5倍</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">史诗珠宝</h5>
                  <p className="card-text">概率: 9%<br/>奖励: 2倍</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-4 mx-auto">
              <div className="card h-100 bg-warning text-dark">
                <div className="card-body">
                  <h5 className="card-title">传说神器</h5>
                  <p className="card-text">概率: 1%<br/>奖励: 4倍 + 奖池</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
