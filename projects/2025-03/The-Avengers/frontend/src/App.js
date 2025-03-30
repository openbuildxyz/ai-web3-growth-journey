import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import GameBoard from './components/GameBoard';
import GameList from './components/GameList';
import TicTacToeABI from './contracts/TicTacToe.json';

// 合约地址，部署后需要更新
const CONTRACT_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';

// 配置Web3Modal
const providerOptions = {
  // 可以添加其他钱包提供者
  // 例如WalletConnect等
};

// 定义RPC URL
const RPC_URL = 'http://172.16.136.198:8545';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [games, setGames] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [web3Modal, setWeb3Modal] = useState(null);

  // 初始化Web3Modal
  useEffect(() => {
    const modal = new Web3Modal({
      network: 'custom',
      cacheProvider: true,
      providerOptions: providerOptions,
      theme: 'dark',
      rpc: {
        // 使用自定义RPC URL
        31337: RPC_URL, // 假设是Hardhat默认链ID
      },
    });
    setWeb3Modal(modal);

    // 如果有缓存的提供者，自动连接
    if (modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  // 初始化Web3连接
  const connectWallet = async () => {
    try {
      if (!web3Modal) return;

      setLoading(true);

      // 使用Web3Modal获取提供者
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts();
      const address = accounts[0];

      const contract = new ethers.Contract(CONTRACT_ADDRESS, TicTacToeABI.abi, signer);

      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setAccount(address);
      setError(null);

      // 监听账户变化
      instance.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      // 监听链变化
      instance.on('chainChanged', () => {
        window.location.reload();
      });

      // 监听断开连接
      instance.on('disconnect', () => {
        disconnectWallet();
      });

      // 设置事件监听
      setupEventListeners(contract);
      setLoading(false);
    } catch (error) {
      console.error('连接钱包失败:', error);
      setError('连接钱包失败，请重试。');
      setLoading(false);
    }
  };

  // 断开钱包连接
  const disconnectWallet = async () => {
    if (web3Modal) {
      web3Modal.clearCachedProvider();
    }
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount(null);
    setCurrentGame(null);
  };

  // 设置合约事件监听
  const setupEventListeners = (contractInstance) => {
    if (!contractInstance) return;

    // 监听游戏创建事件
    contractInstance.on('GameCreated', (gameId, player) => {
      console.log('新游戏已创建:', gameId.toString());
      fetchGames();
    });

    // 监听游戏加入事件
    contractInstance.on('GameJoined', (gameId, player) => {
      console.log('玩家已加入游戏:', gameId.toString());
      fetchGames();
      if (currentGame && currentGame.id === gameId.toNumber()) {
        loadGame(gameId.toNumber());
      }
    });

    // 监听游戏移动事件
    contractInstance.on('MoveMade', (gameId, player, position) => {
      console.log('玩家下棋:', gameId.toString(), position.toString());
      fetchGames();
      if (currentGame && currentGame.id === gameId.toNumber()) {
        loadGame(gameId.toNumber());
      }
    });

    // 监听游戏结束事件
    contractInstance.on('GameFinished', (gameId, result) => {
      console.log('游戏结束:', gameId.toString(), result.toString());
      fetchGames();
      if (currentGame && currentGame.id === gameId.toNumber()) {
        loadGame(gameId.toNumber());
      }
    });
  };

  // 创建新游戏
  const createGame = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      const tx = await contract.createGame();
      await tx.wait();

      // 刷新游戏列表
      fetchGames();
      setLoading(false);
    } catch (error) {
      console.error('创建游戏失败:', error);
      setError('创建游戏失败，请重试。');
      setLoading(false);
    }
  };

  // 加入游戏
  const joinGame = async (gameId) => {
    if (!contract) return;

    try {
      setLoading(true);
      const tx = await contract.joinGame(gameId);
      await tx.wait();

      // 加载游戏信息
      loadGame(gameId);
      setLoading(false);
    } catch (error) {
      console.error('加入游戏失败:', error);
      setError('加入游戏失败，请重试。');
      setLoading(false);
    }
  };

  // 进行游戏操作
  const makeMove = async (gameId, position) => {
    if (!contract) return;

    try {
      setLoading(true);
      const tx = await contract.makeMove(gameId, position);
      await tx.wait();

      // 刷新游戏信息
      loadGame(gameId);
      setLoading(false);
    } catch (error) {
      console.error('下棋失败:', error);
      setError('下棋失败，请重试。');
      setLoading(false);
    }
  };

  // 获取所有游戏
  const fetchGames = async () => {
    if (!contract) return;

    try {
      const gameCount = await contract.gameCounter();
      const gameList = [];

      for (let i = gameCount - 1; i >= 0; i--) {
        const gameInfo = await contract.getGameInfo(i);
        gameList.push({
          id: i,
          player1: gameInfo.player1,
          player2: gameInfo.player2,
          state: gameInfo.state,
          result: gameInfo.result,
        });
      }

      setGames(gameList);
    } catch (error) {
      console.error('获取游戏列表失败:', error);
    }
  };

  // 加载特定游戏信息
  const loadGame = async (gameId) => {
    if (!contract) return;

    try {
      const gameInfo = await contract.getGameInfo(gameId);

      setCurrentGame({
        id: gameId,
        player1: gameInfo.player1,
        player2: gameInfo.player2,
        nextPlayer: gameInfo.nextPlayer,
        board: gameInfo.board,
        state: gameInfo.state,
        result: gameInfo.result,
      });
    } catch (error) {
      console.error('加载游戏信息失败:', error);
    }
  };

  // 初始化合约
  useEffect(() => {
    if (contract) {
      fetchGames();
      setupEventListeners(contract);
    }
  }, [contract]);

  // 设置自动刷新 - 每10秒更新一次游戏状态
  useEffect(() => {
    let intervalId;

    if (contract && autoRefresh) {
      intervalId = setInterval(() => {
        fetchGames();
        if (currentGame) {
          loadGame(currentGame.id);
        }
      }, 10000); // 10秒刷新一次
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [contract, currentGame, autoRefresh]);

  return (
    <div className="app">
      <h1>Web3 井字棋</h1>

      {!account ? (
        <button onClick={connectWallet} disabled={loading}>
          {loading ? '连接中...' : '连接钱包'}
        </button>
      ) : (
        <>
          <p>已连接账户: {account}</p>
          <button onClick={disconnectWallet} className="disconnect-btn">
            断开连接
          </button>

          <div className="auto-refresh">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <label htmlFor="autoRefresh">自动刷新游戏状态</label>
          </div>

          {currentGame ? (
            <GameBoard
              game={currentGame}
              account={account}
              onMove={(position) => makeMove(currentGame.id, position)}
              onBack={() => setCurrentGame(null)}
            />
          ) : (
            <>
              <button onClick={createGame} disabled={loading}>
                {loading ? '处理中...' : '创建新游戏'}
              </button>

              <button onClick={fetchGames} disabled={loading} style={{ marginLeft: '10px' }}>
                刷新游戏列表
              </button>

              <GameList games={games} account={account} onJoin={joinGame} onSelect={loadGame} />
            </>
          )}

          {error && <p className="error">{error}</p>}
        </>
      )}
    </div>
  );
}

export default App;
