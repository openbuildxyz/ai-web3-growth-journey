import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 组件
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DrawGame from './pages/DrawGame';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';

// 合约ABI
import TrisolarisCoinABI from './contracts/TrisolarisCoin.json';
import TrisolarisDraw from './contracts/TrisolarisDraw.json';

// Web3上下文
import { Web3Provider } from './context/Web3Context';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [triToken, setTriToken] = useState(null);
  const [gameContract, setGameContract] = useState(null);
  const [balance, setBalance] = useState(0);
  
  // 初始化Web3连接
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          // 请求账户访问
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const account = accounts[0];
          setAccount(account);
          
          // 设置provider
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);
          
          // 初始化合约
          const signer = provider.getSigner();
          const triToken = new ethers.Contract(
            process.env.REACT_APP_TRI_TOKEN_ADDRESS,
            TrisolarisCoinABI.abi,
            signer
          );
          setTriToken(triToken);
          
          const gameContract = new ethers.Contract(
            process.env.REACT_APP_GAME_CONTRACT_ADDRESS,
            TrisolarisDraw.abi,
            signer
          );
          setGameContract(gameContract);
          
          // 获取代币余额
          const balance = await triToken.balanceOf(account);
          setBalance(ethers.utils.formatEther(balance));
          
          // 监听账户变化
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
          });
        } catch (error) {
          console.error("Error connecting to MetaMask", error);
        }
      } else {
        console.log("Please install MetaMask!");
      }
    };
    
    init();
  }, []);
  
  return (
    <Web3Provider value={{ account, provider, triToken, gameContract, balance, setBalance }}>
      <Router>
        <div className="app">
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/play" element={<DrawGame />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </div>
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;