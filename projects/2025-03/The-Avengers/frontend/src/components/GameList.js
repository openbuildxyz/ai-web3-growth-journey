import React from 'react';
import './GameList.css';

// 游戏状态常量
const GAME_STATE = {
  WAITING: 0,
  ACTIVE: 1,
  FINISHED: 2,
};

// 游戏结果常量
const GAME_RESULT = {
  ONGOING: 0,
  PLAYER1_WIN: 1,
  PLAYER2_WIN: 2,
  DRAW: 3,
};

const GameList = ({ games, account, onJoin, onSelect }) => {
  // 获取游戏状态文本
  const getGameStateText = (game) => {
    if (game.state === GAME_STATE.WAITING) {
      return '等待玩家加入';
    } else if (game.state === GAME_STATE.ACTIVE) {
      return '游戏进行中';
    } else if (game.state === GAME_STATE.FINISHED) {
      if (game.result === GAME_RESULT.PLAYER1_WIN) {
        return '玩家1获胜';
      } else if (game.result === GAME_RESULT.PLAYER2_WIN) {
        return '玩家2获胜';
      } else {
        return '游戏平局';
      }
    }

    return '';
  };

  // 判断用户是否可以加入游戏
  const canJoinGame = (game) => {
    return (
      game.state === GAME_STATE.WAITING && game.player1.toLowerCase() !== account.toLowerCase()
    );
  };

  // 判断用户是否参与了游戏
  const isInGame = (game) => {
    return (
      game.player1.toLowerCase() === account.toLowerCase() ||
      game.player2.toLowerCase() === account.toLowerCase()
    );
  };

  // 判断用户是否可以查看游戏
  const canViewGame = (game) => {
    return game.state !== GAME_STATE.WAITING || isInGame(game);
  };

  if (games.length === 0) {
    return <div className="no-games">暂无游戏，请创建新游戏</div>;
  }

  return (
    <div className="game-list">
      <h2>游戏列表</h2>

      <div className="list">
        {games.map((game) => (
          <div key={game.id} className={`game-item ${isInGame(game) ? 'is-in-game' : ''}`}>
            <div className="game-details">
              <h3>游戏 #{game.id}</h3>
              <p className="game-state">{getGameStateText(game)}</p>
              <p className="player">
                玩家1: {game.player1.slice(0, 6)}...{game.player1.slice(-4)}
              </p>
              {game.player2 && (
                <p className="player">
                  玩家2: {game.player2.slice(0, 6)}...{game.player2.slice(-4)}
                </p>
              )}
            </div>

            <div className="game-actions">
              {canJoinGame(game) && (
                <button className="join-button" onClick={() => onJoin(game.id)}>
                  加入游戏
                </button>
              )}

              {canViewGame(game) && (
                <button className="view-button" onClick={() => onSelect(game.id)}>
                  查看游戏
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameList;
