import React from 'react';
import './GameBoard.css';

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

const GameBoard = ({ game, account, onMove, onBack }) => {
  // 判断当前用户是玩家1还是玩家2
  const isPlayer1 = account.toLowerCase() === game.player1.toLowerCase();
  const isPlayer2 = account.toLowerCase() === game.player2.toLowerCase();
  const isMyTurn = account.toLowerCase() === game.nextPlayer.toLowerCase();

  // 处理棋盘点击
  const handleCellClick = (index) => {
    // 检查是否可以点击
    if (game.state !== GAME_STATE.ACTIVE || !isMyTurn || game.board[index] !== 0) {
      return;
    }

    onMove(index);
  };

  // 渲染棋盘单元格
  const renderCell = (value, index) => {
    let content = '';

    if (value === 1) {
      content = 'X';
    } else if (value === 2) {
      content = 'O';
    }

    return (
      <div
        key={index}
        className={`cell ${value ? 'filled' : ''} ${isMyTurn && !value ? 'clickable' : ''}`}
        onClick={() => handleCellClick(index)}
      >
        {content}
      </div>
    );
  };

  // 获取游戏状态文本
  const getGameStatusText = () => {
    if (game.state === GAME_STATE.WAITING) {
      return '等待对手加入...';
    } else if (game.state === GAME_STATE.ACTIVE) {
      if (isMyTurn) {
        return '轮到你了，请下棋';
      } else {
        return '等待对手下棋...';
      }
    } else if (game.state === GAME_STATE.FINISHED) {
      if (game.result === GAME_RESULT.PLAYER1_WIN) {
        return isPlayer1 ? '恭喜，你赢了！' : '游戏结束，玩家1获胜';
      } else if (game.result === GAME_RESULT.PLAYER2_WIN) {
        return isPlayer2 ? '恭喜，你赢了！' : '游戏结束，玩家2获胜';
      } else {
        return '游戏平局';
      }
    }

    return '';
  };

  // 获取玩家身份文本
  const getPlayerRole = () => {
    if (isPlayer1) {
      return '你是玩家1 (X)';
    } else if (isPlayer2) {
      return '你是玩家2 (O)';
    } else {
      return '你是观察者';
    }
  };

  return (
    <div className="game-board">
      <h2>游戏 #{game.id}</h2>
      <p className="player-info">{getPlayerRole()}</p>
      <p className="status">{getGameStatusText()}</p>

      <div className="board">{game.board.map((cell, index) => renderCell(cell, index))}</div>

      <div className="game-info">
        <p>
          玩家1: {game.player1.slice(0, 6)}...{game.player1.slice(-4)}
        </p>
        <p>
          玩家2:{' '}
          {game.player2 ? `${game.player2.slice(0, 6)}...${game.player2.slice(-4)}` : '等待加入'}
        </p>
      </div>

      <button onClick={onBack} className="back-button">
        返回游戏列表
      </button>
    </div>
  );
};

export default GameBoard;
