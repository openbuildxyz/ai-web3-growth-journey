import React, { useState, useEffect } from 'react';
import './App.css';
import Web3 from 'web3';

function App() {
  const [credits, setCredits] = useState([]);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [price, setPrice] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [web3, setWeb3] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [userCredits, setUserCredits] = useState([]);

  // Mock data for demonstration
  useEffect(() => {
    setCredits([
      { id: 1, projectId: 'PROJ-001', standard: 'VCS', amount: 100, vintageYear: 2023 },
      { id: 2, projectId: 'PROJ-002', standard: 'GS', amount: 200, vintageYear: 2022 },
      { id: 3, projectId: 'PROJ-003', standard: 'CDM', amount: 150, vintageYear: 2021 }
    ]);
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // 连接到本地Hardhat测试网络
        await window.ethereum.request({ 
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x7A69', // 31337 in hex
            chainName: 'Hardhat Local',
            nativeCurrency: {
              name: 'Ether',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['http://localhost:8545']
          }]
        });
        
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3Instance.eth.getAccounts();
        setWalletAddress(accounts[0]);
        setWeb3(web3Instance);
        setIsConnected(true);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert('请安装MetaMask!');
    }
  };

  const handleTrade = async () => {
    if (!selectedCredit || !price || !walletAddress) return;
    if (!isConnected) {
      alert('请先连接您的钱包');
      return;
    }
    if (!selectedCredit.id) {
      alert('请选择有效的碳信用');
      return;
    }
    
    try {
      const contractAddress = '0x67d269191c92Caf3cD7723F116c85e6E9bf55933'; // 正确的碳积分合约地址
      const contractAbi = [
        {
          "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
          "name": "ownerOf",
          "outputs": [{"internalType": "address", "name": "", "type": "address"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {"internalType": "string", "name": "_projectId", "type": "string"},
            {"internalType": "string", "name": "_verificationStandard", "type": "string"},
            {"internalType": "uint256", "name": "_amount", "type": "uint256"},
            {"internalType": "uint256", "name": "_vintageYear", "type": "uint256"}
          ],
          "name": "mint",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {"internalType": "uint256", "name": "_id", "type": "uint256"},
            {"internalType": "address", "name": "_to", "type": "address"}
          ],
          "name": "transfer",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
          "name": "retire",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
          "name": "burn",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {"internalType": "uint256", "name": "_id", "type": "uint256"},
            {"internalType": "address", "name": "_buyer", "type": "address"},
            {"internalType": "uint256", "name": "_price", "type": "uint256"}
          ],
          "name": "trade",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        }
      ]
      const contract = new web3.eth.Contract(contractAbi, contractAddress);
      
      // 确保交易发起者是碳信用的所有者
      const ownerAddress = await contract.methods.ownerOf(selectedCredit.id).call();
      await contract.methods.trade(
        selectedCredit.id,
        walletAddress,
        web3.utils.toWei(price, 'ether')
      ).send({ from: walletAddress, value: web3.utils.toWei(price, 'ether') });
      
      alert(`Successfully traded credit ${selectedCredit.id} to ${walletAddress} for ${price} ETH`);
      
      // Add to transaction history
      setTransactionHistory(prev => [
        ...prev,
        {
          type: 'trade',
          creditId: selectedCredit.id,
          toAddress: walletAddress,
          price: price,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error trading credit:', error);
      alert(`Failed to trade credit: ${error.message}`);
      // Update transaction history with failed transaction
      setTransactionHistory(prev => [
        ...prev,
        {
          type: 'trade_failed',
          creditId: selectedCredit.id,
          toAddress: walletAddress,
          price: price,
          timestamp: new Date().toISOString(),
          error: error.message
        }
      ]);
    }
  };

  const handleBurn = async () => {
    if (!selectedCredit) return;
    
    try {
      const contractAddress = '0x67d269191c92Caf3cD7723F116c85e6E9bf55933'; // 新部署的碳积分合约地址
      const contractAbi = [
        {
          "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
          "name": "ownerOf",
          "outputs": [{"internalType": "address", "name": "", "type": "address"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {"internalType": "string", "name": "_projectId", "type": "string"},
            {"internalType": "string", "name": "_verificationStandard", "type": "string"},
            {"internalType": "uint256", "name": "_amount", "type": "uint256"},
            {"internalType": "uint256", "name": "_vintageYear", "type": "uint256"}
          ],
          "name": "mint",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {"internalType": "uint256", "name": "_id", "type": "uint256"},
            {"internalType": "address", "name": "_to", "type": "address"}
          ],
          "name": "transfer",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
          "name": "retire",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
          "name": "burn",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {"internalType": "uint256", "name": "_id", "type": "uint256"},
            {"internalType": "address", "name": "_buyer", "type": "address"},
            {"internalType": "uint256", "name": "_price", "type": "uint256"}
          ],
          "name": "trade",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        }
      ]
      const contract = new web3.eth.Contract(contractAbi, contractAddress);
      
      await contract.methods.burn(selectedCredit.id).send({ from: walletAddress });
      
      alert(`Successfully burned credit ${selectedCredit.id}`);
      // Update UI by removing burned credit
      setCredits(credits.filter(credit => credit.id !== selectedCredit.id));
      setSelectedCredit(null);
      
      // Add to transaction history
      setTransactionHistory(prev => [
        ...prev,
        {
          type: 'burn',
          creditId: selectedCredit.id,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error burning credit:', error);
      alert(`Failed to burn credit: ${error.message}`);
      // Update transaction history with failed transaction
      setTransactionHistory(prev => [
        ...prev,
        {
          type: 'burn_failed',
          creditId: selectedCredit.id,
          timestamp: new Date().toISOString(),
          error: error.message
        }
      ]);
    }
  };

  const fetchUserCredits = async () => {
    if (!web3 || !walletAddress) return;
    
    try {
      const contract = new web3.eth.Contract(
        [
          {
            "inputs": [{"internalType":"uint256","name":"_id","type":"uint256"}],
            "name": "ownerOf",
            "outputs": [{"internalType":"address","name":"","type":"address"}],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [{"internalType":"uint256","name":"","type":"uint256"}],
            "name": "credits",
            "outputs": [
              {"internalType":"uint256","name":"id","type":"uint256"},
              {"internalType":"string","name":"projectId","type":"string"},
              {"internalType":"string","name":"verificationStandard","type":"string"},
              {"internalType":"uint256","name":"amount","type":"uint256"},
              {"internalType":"uint256","name":"vintageYear","type":"uint256"},
              {"internalType":"address","name":"issuer","type":"address"},
              {"internalType":"address","name":"owner","type":"address"},
              {"internalType":"bool","name":"retired","type":"bool"}
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
            "stateMutability": "view",
            "type": "function"
          }
        ],
        "0x67d269191c92Caf3cD7723F116c85e6E9bf55933" // 合约地址
      );
      
      const userCredits = [];
      for (let i = 1; i <= await contract.methods.totalSupply().call(); i++) {
        const owner = await contract.methods.ownerOf(i).call();
        if (owner.toLowerCase() === walletAddress.toLowerCase()) {
          const credit = await contract.methods.credits(i).call();
          userCredits.push({
            id: credit.id,
            projectId: credit.projectId,
            standard: credit.verificationStandard,
            amount: credit.amount,
            vintageYear: credit.vintageYear
          });
        }
      }
      setUserCredits(userCredits);
    } catch (error) {
      console.error("Error fetching user credits:", error);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchUserCredits();
    }
  }, [isConnected, walletAddress]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>碳信用交易市场</h1>
        {!isConnected ? (
          <button onClick={connectWallet}>连接钱包</button>
        ) : (
          <div className="wallet-info">
            <span>已连接: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</span>
          </div>
        )}
      </header>

      <div className="content">
        <div className="user-credits-section">
          <h2>我的碳信用</h2>
          {userCredits.length > 0 ? (
            <div className="credits-grid">
              {userCredits.map(credit => (
                <div key={credit.id} className="credit-card">
                  <h3>项目: {credit.projectId}</h3>
                  <p>标准: {credit.standard}</p>
                  <p>数量: {credit.amount} 吨</p>
                  <p>年份: {credit.vintageYear}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>您的钱包地址下没有找到碳信用。</p>
          )}
        </div>

        <div className="marketplace-section">
          <h2>可用碳信用</h2>
          <ul>
            {credits.map(credit => (
              <li 
                key={credit.id} 
                onClick={() => setSelectedCredit(credit)}
                className={selectedCredit?.id === credit.id ? 'selected' : ''}
              >
                <span>Project: {credit.projectId}</span>
                <span>Standard: {credit.standard}</span>
                <span>Amount: {credit.amount} tons</span>
                <span>Year: {credit.vintageYear}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="credit-actions">
          <h2>碳信用操作</h2>
          {selectedCredit ? (
            <div className="selected-credit">
              <h3>已选碳信用 #{selectedCredit.id}</h3>
              
              <div className="form-group">
                <label>买家钱包地址:</label>
                <input 
                  type="text" 
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              
              <div className="form-group">
                <label>价格 (ETH):</label>
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.1"
                />
              </div>
              
              <div className="buttons">
                <button onClick={handleTrade}>交易碳信用</button>
                <button className="danger" onClick={handleBurn}>销毁碳信用</button>
              </div>
            </div>
          ) : (
            <p>请选择碳信用以执行操作</p>
          )}
        </div>
        
        <div className="transaction-history">
          <h2>交易历史</h2>
          <ul>
            {transactionHistory.map((tx, index) => (
              <li key={index}>
                <span>类型: {tx.type}</span>
                <span>碳信用ID: {tx.creditId}</span>
                {tx.toAddress && <span>接收方: {tx.toAddress.substring(0, 6)}...</span>}
                {tx.price && <span>价格: {tx.price} ETH</span>}
                <span>时间: {new Date(tx.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;