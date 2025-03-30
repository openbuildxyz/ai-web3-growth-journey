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
// 不再需要TrisolarisCoinABI因为我们使用ETH
import TrisolarisDraw from './contracts/TrisolarisDraw.json';

// Web3上下文
import { Web3Provider } from './context/Web3Context';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  // 不再需要triToken因为我们使用ETH
  const [gameContract, setGameContract] = useState(null);
  const [balance, setBalance] = useState(0);
  
  // 初始化Web3连接
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          console.log("正在初始化Web3连接...");
          console.log("合约地址:", {
            triToken: process.env.REACT_APP_TRI_TOKEN_ADDRESS,
            gameContract: process.env.REACT_APP_GAME_CONTRACT_ADDRESS
          });
          
          // 检查当前网络是否为 Hardhat 本地网络
          const networkId = await window.ethereum.request({ method: 'eth_chainId' });
          console.log("当前网络 ID:", parseInt(networkId, 16));
          
          // Hardhat 本地网络的链 ID 是 31337
          if (parseInt(networkId, 16) !== 31337) {
            alert("请将 MetaMask 切换到 Hardhat 本地网络 (ChainID: 31337, RPC URL: http://127.0.0.1:8545)");
            try {
              // 尝试切换到 Hardhat 本地网络
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x7A69' }], // 31337 的十六进制
              });
              console.log("成功切换到 Hardhat 本地网络");
            } catch (switchError) {
              // 如果网络不存在，尝试添加网络
              if (switchError.code === 4902) {
                try {
                  await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                      {
                        chainId: '0x7A69', // 31337 的十六进制
                        chainName: 'Hardhat Local',
                        rpcUrls: ['http://127.0.0.1:8545'],
                        nativeCurrency: {
                          name: 'Ethereum',
                          symbol: 'ETH',
                          decimals: 18
                        }
                      },
                    ],
                  });
                } catch (addError) {
                  console.error("添加网络失败:", addError);
                }
              } else {
                console.error("切换网络失败:", switchError);
              }
              // 网络问题未解决，不继续初始化
              return;
            }
          }
          
          // 请求账户访问
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const account = accounts[0];
          setAccount(account);
          console.log("已连接账户:", account);
          
          // 设置provider
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);
          
          // 初始化游戏合约 - 现在只需要游戏合约，不需要代币合约
          const signer = provider.getSigner();
          
          const gameContract = new ethers.Contract(
            process.env.REACT_APP_GAME_CONTRACT_ADDRESS,
            TrisolarisDraw.abi,
            signer
          );
          setGameContract(gameContract);
          
          // 将合约实例暴露到全局，方便调试
          window.trisolarisApp = {
            provider,
            signer,
            gameContract,
            ethers
          };
          
          console.log("合约初始化完成");
          
          // 获取ETH余额
          try {
            const balance = await provider.getBalance(account);
            setBalance(ethers.utils.formatEther(balance));
            console.log("当前ETH余额:", ethers.utils.formatEther(balance));
          } catch (balanceError) {
            console.error("获取余额失败:", balanceError);
          }
          
          // 监听账户变化
          window.ethereum.on('accountsChanged', (accounts) => {
            console.log("账户已切换:", accounts[0]);
            setAccount(accounts[0]);
          });
          
          // 监听网络变化
          window.ethereum.on('chainChanged', (chainId) => {
            console.log('网络已切换，重新加载页面');
            window.location.reload();
          });
          
          // 不再需要铸造代币函数，因为我们使用ETH
          
        } catch (error) {
          console.error("连接MetaMask失败", error);
        }
      } else {
        console.log("请安装MetaMask!");
      }
    };
    
    init();
  }, []);
  
  return (
    <Web3Provider value={{ account, provider, gameContract, balance, setBalance }}>
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