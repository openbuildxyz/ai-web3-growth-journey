import React, { createContext, useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import SportCheckInContract from '../utils/contractUtils';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 检查是否已连接
  useEffect(() => {
    const checkIfConnected = async () => {
      if (window.ethereum) {
        try {
          const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await ethProvider.listAccounts();
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            setProvider(ethProvider);
            
            // 创建合约实例
            const sportContract = new SportCheckInContract(ethProvider);
            setContract(sportContract);
            
            // 加载用户数据
            await loadUserData(accounts[0], sportContract);
          }
        } catch (error) {
          console.error("检查连接状态失败:", error);
        }
      }
    };
    
    checkIfConnected();
  }, []);

  // 监听账户变化
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
      // 移除合约事件监听
      if (contract) {
        contract.removeEventListeners();
      }
    };
  }, [contract]);

  // 账户变化处理
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length > 0) {
      setAddress(accounts[0]);
      setIsConnected(true);
      
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethProvider);
      
      // 更新合约实例
      const sportContract = new SportCheckInContract(ethProvider);
      setContract(sportContract);
      
      // 加载新账户数据
      await loadUserData(accounts[0], sportContract);
    } else {
      setAddress(null);
      setIsConnected(false);
      setProvider(null);
      setContract(null);
      setUserData(null);
    }
  };

  // 加载用户数据
  const loadUserData = async (userAddress, contractInstance) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await contractInstance.getUserData(userAddress);
      if (response.success) {
        setUserData(response.data);
        
        // 设置事件监听
        contractInstance.setupEventListeners(userAddress, {
          onMilestoneAchieved: (milestoneType, tokenId) => {
            // 通知用户达成里程碑
            // 这里可以调用 onAchievementEarned 函数
            console.log(`里程碑达成: ${milestoneType}, TokenID: ${tokenId}`);
            // 重新加载用户数据
            loadUserData(userAddress, contractInstance);
          },
          onCheckedIn: (timestamp, consecutiveCount) => {
            console.log(`打卡成功: 连续 ${consecutiveCount} 天`);
            // 更新用户数据
            loadUserData(userAddress, contractInstance);
          },
          onFirstLogin: (timestamp) => {
            console.log(`首次登录: ${new Date(timestamp * 1000).toLocaleString()}`);
            loadUserData(userAddress, contractInstance);
          }
        });
      } else {
        // 首次使用，数据为空是正常的
        console.log("用户可能还未登录合约系统");
      }
    } catch (error) {
      console.error("加载用户数据失败:", error);
      setError("加载用户数据失败");
    } finally {
      setLoading(false);
    }
  };

  // 连接钱包
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        setLoading(true);
        const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts && accounts.length) {
          setAddress(accounts[0]);
          setIsConnected(true);
          setProvider(ethProvider);
          
          // 创建合约实例
          const sportContract = new SportCheckInContract(ethProvider);
          setContract(sportContract);
          
          // 加载用户数据
          await loadUserData(accounts[0], sportContract);
        }
      } else {
        alert('请安装MetaMask或其他支持以太坊的钱包');
      }
    } catch (error) {
      console.error('连接钱包失败', error);
      setError('连接钱包失败');
    } finally {
      setLoading(false);
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    setProvider(null);
    setContract(null);
    setUserData(null);
    
    // 移除事件监听
    if (contract) {
      contract.removeEventListeners();
    }
  };

  // 首次登录
  const doFirstLogin = async () => {
    if (!contract) return { success: false, error: "未连接合约" };
    setLoading(true);
    
    try {
      const result = await contract.firstLogin();
      if (result.success) {
        // 首次登录成功后立即加载用户数据
        await loadUserData(address, contract);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  // 打卡
  const doCheckIn = async () => {
    if (!contract) return { success: false, error: "未连接合约" };
    setLoading(true);
    
    try {
      const result = await contract.checkIn();
      if (result.success) {
        // 打卡成功后立即加载用户数据
        await loadUserData(address, contract);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  // 获取下一次可打卡时间
  const getNextCheckInTime = async () => {
    if (!contract || !address) return null;
    return await contract.getNextAvailableCheckInTime(address);
  };

  // 重新加载用户数据
  const refreshUserData = async () => {
    if (!contract || !address) return;
    await loadUserData(address, contract);
  };

  return (
    <WalletContext.Provider value={{ 
      address, 
      isConnected, 
      provider,
      contract,
      userData,
      loading,
      error,
      connectWallet, 
      disconnectWallet,
      doFirstLogin,
      doCheckIn,
      getNextCheckInTime,
      refreshUserData
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet必须在WalletProvider内使用');
  }
  return context;
}
