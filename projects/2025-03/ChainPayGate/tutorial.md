# 链智付实现教程 (小白友好版)

本教程将帮助你理解并实现一个基本的"链智付"系统，即基于MCP的通用API支付网关。我会尽量用简单的语言解释概念，并提供具体步骤。

## 🧠 基本原理

### 什么是"链智付"系统？

简单来说，我们要构建一个系统，它允许：
1. 用户通过区块链交易调用任何API服务
2. 用户支付一些代币获取API服务结果
3. API返回的结果被记录在区块链上
4. 整个过程一步完成，无需注册、API密钥等繁琐步骤

这就像一个区块链版的"API自动售货机"，投币就能直接获取服务，不需要注册账号或管理API密钥。

### 系统组成部分

系统分为三个主要部分：

1. **前端界面**: 用户选择服务并发起请求的网页
2. **智能合约**: 处理支付和API调用的区块链程序
3. **MCP桥接服务**: 连接智能合约和各种API的中间件

## 🔨 实现步骤

### 第一步：设置开发环境 (5分钟)

```bash
# 创建项目文件夹
mkdir chain-pay-gate
cd chain-pay-gate

# 初始化前端项目
mkdir frontend
cd frontend
pnpm init
pnpm add next react react-dom ethers@5.7.2 web3modal @wagmi/core

# 初始化智能合约项目
cd ..
mkdir contracts
cd contracts
pnpm init
pnpm add -D hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
npx hardhat init
# 选择 "Create a JavaScript project"
```

### 第二步：编写智能合约 (15分钟)

在 `contracts/contracts` 目录创建以下文件：

#### 1. PayToken.sol - 支付代币

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PayToken is ERC20, Ownable {
    constructor() ERC20("Pay Token", "PAY") Ownable(msg.sender) {
        // 初始铸造一些代币给合约创建者
        _mint(msg.sender, 1000000 * 10**decimals());
    }
    
    // 让用户可以铸造测试代币(仅限测试用)
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
```

#### 2. APIPayGate.sol - 主要功能合约

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PayToken.sol";

contract APIPayGate is Ownable {
    // 支付代币
    PayToken public token;
    
    // API服务结构
    struct APIService {
        string name;
        string description;
        address provider;
        uint256 price;
        bool active;
    }
    
    // API调用请求结构
    struct APIRequest {
        address requester;
        uint256 serviceId;
        string params;
        uint256 timestamp;
        bool fulfilled;
    }
    
    // API调用结果结构
    struct APIResponse {
        string result;
        uint256 timestamp;
        bytes32 responseHash;
    }
    
    // 存储所有注册的API服务
    mapping(uint256 => APIService) public services;
    uint256 public serviceCount = 0;
    
    // 存储所有请求
    mapping(uint256 => APIRequest) public requests;
    
    // 存储所有回答
    mapping(uint256 => APIResponse) public responses;
    
    // 请求计数器
    uint256 public requestCount = 0;
    
    // 事件
    event ServiceRegistered(uint256 serviceId, string name, address provider, uint256 price);
    event ServiceUpdated(uint256 serviceId, string name, uint256 price, bool active);
    event NewRequest(uint256 requestId, address requester, uint256 serviceId, string params);
    event NewResponse(uint256 requestId, string result);
    
    constructor(address _tokenAddress) Ownable(msg.sender) {
        token = PayToken(_tokenAddress);
    }
    
    // 注册新的API服务
    function registerService(
        string memory _name,
        string memory _description,
        uint256 _price
    ) public returns (uint256) {
        uint256 serviceId = serviceCount++;
        
        services[serviceId] = APIService({
            name: _name,
            description: _description,
            provider: msg.sender,
            price: _price,
            active: true
        });
        
        emit ServiceRegistered(serviceId, _name, msg.sender, _price);
        
        return serviceId;
    }
    
    // 更新API服务
    function updateService(
        uint256 _serviceId,
        string memory _name,
        string memory _description,
        uint256 _price,
        bool _active
    ) public {
        APIService storage service = services[_serviceId];
        require(service.provider == msg.sender || owner() == msg.sender, "Not authorized");
        
        service.name = _name;
        service.description = _description;
        service.price = _price;
        service.active = _active;
        
        emit ServiceUpdated(_serviceId, _name, _price, _active);
    }
    
    // 调用API服务
    function callAPI(uint256 _serviceId, string memory _params) public returns (uint256) {
        APIService storage service = services[_serviceId];
        require(service.active, "Service not active");
        
        // 收取代币
        require(token.transferFrom(msg.sender, address(this), service.price), "Token transfer failed");
        
        // 创建新请求
        uint256 requestId = requestCount++;
        
        requests[requestId] = APIRequest({
            requester: msg.sender,
            serviceId: _serviceId,
            params: _params,
            timestamp: block.timestamp,
            fulfilled: false
        });
        
        emit NewRequest(requestId, msg.sender, _serviceId, _params);
        
        return requestId;
    }
    
    // 由MCP服务提交API响应(仅限合约拥有者或服务提供者)
    function submitResponse(
        uint256 _requestId,
        string memory _result
    ) public {
        // 确保请求存在且未被回答
        APIRequest storage request = requests[_requestId];
        require(_requestId < requestCount, "Request does not exist");
        require(!request.fulfilled, "Request already fulfilled");
        
        // 确保是服务提供者或合约所有者
        APIService storage service = services[request.serviceId];
        require(msg.sender == service.provider || msg.sender == owner(), "Not authorized");
        
        // 计算结果的哈希值
        bytes32 responseHash = keccak256(abi.encodePacked(_result, block.timestamp));
        
        // 存储响应
        responses[_requestId] = APIResponse({
            result: _result,
            timestamp: block.timestamp,
            responseHash: responseHash
        });
        
        // 标记请求已完成
        request.fulfilled = true;
        
        // 转账给服务提供者
        token.transfer(service.provider, service.price);
        
        emit NewResponse(_requestId, _result);
    }
    
    // 获取所有活跃服务
    function getActiveServices() public view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // 计算活跃服务数量
        for (uint256 i = 0; i < serviceCount; i++) {
            if (services[i].active) {
                activeCount++;
            }
        }
        
        // 创建结果数组
        uint256[] memory activeServiceIds = new uint256[](activeCount);
        
        // 填充结果数组
        uint256 index = 0;
        for (uint256 i = 0; i < serviceCount; i++) {
            if (services[i].active) {
                activeServiceIds[index] = i;
                index++;
            }
        }
        
        return activeServiceIds;
    }
    
    // 根据提供者获取服务
    function getServicesByProvider(address _provider) public view returns (uint256[] memory) {
        uint256 count = 0;
        
        // 计算该提供者的服务数量
        for (uint256 i = 0; i < serviceCount; i++) {
            if (services[i].provider == _provider) {
                count++;
            }
        }
        
        // 创建结果数组
        uint256[] memory providerServiceIds = new uint256[](count);
        
        // 填充结果数组
        uint256 index = 0;
        for (uint256 i = 0; i < serviceCount; i++) {
            if (services[i].provider == _provider) {
                providerServiceIds[index] = i;
                index++;
            }
        }
        
        return providerServiceIds;
    }
}
```

### 第三步：部署智能合约 (5分钟)

创建部署脚本 `scripts/deploy.js`:

```javascript
async function main() {
  // 部署代币合约
  const PayToken = await ethers.getContractFactory("PayToken");
  const token = await PayToken.deploy();
  await token.deployed();
  
  console.log("PayToken deployed to:", token.address);
  
  // 部署主合约
  const APIPayGate = await ethers.getContractFactory("APIPayGate");
  const paygate = await APIPayGate.deploy(token.address);
  await paygate.deployed();
  
  console.log("APIPayGate deployed to:", paygate.address);
  
  // 注册一些测试服务
  console.log("Registering test services...");
  
  // 注册天气API服务
  await paygate.registerService(
    "Weather API",
    "Get current weather for any location",
    ethers.utils.parseEther("5")
  );
  
  // 注册文件转换服务
  await paygate.registerService(
    "File Converter",
    "Convert files between different formats",
    ethers.utils.parseEther("10")
  );
  
  // 注册市场数据服务
  await paygate.registerService(
    "Market Data",
    "Real-time cryptocurrency market analysis",
    ethers.utils.parseEther("15")
  );
  
  console.log("Test services registered successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

执行部署:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 第四步：创建MCP桥接服务 (20分钟)

创建一个简单的Node.js服务，用于连接智能合约和各种API:

```bash
mkdir mcp-bridge
cd mcp-bridge
pnpm init
pnpm add express ethers@5.7.2 dotenv node-fetch
```

创建 `mcp-bridge/index.js`:
```javascript
const express = require('express');
const ethers = require('ethers');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());

// 合约ABI (从编译后的合约中获取)
const apiPayGateABI = require('../contracts/artifacts/contracts/APIPayGate.sol/APIPayGate.json').abi;

// 连接区块链
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const paygateContract = new ethers.Contract(
  process.env.PAYGATE_ADDRESS,
  apiPayGateABI,
  wallet
);

// 监听新请求事件
async function listenForRequests() {
  console.log('监听新的API调用请求...');
  
  paygateContract.on('NewRequest', async (requestId, requester, serviceId, params, event) => {
    console.log(`收到新请求 #${requestId}: Service ID ${serviceId}, Params: ${params}`);
    
    try {
      // 获取服务信息
      const service = await paygateContract.services(serviceId);
      console.log(`服务名称: ${service.name}`);
      
      // 根据服务类型调用不同的API
      let result;
      
      if (service.name === "Weather API") {
        result = await callWeatherAPI(params);
      } else if (service.name === "File Converter") {
        result = await callFileConverterAPI(params);
      } else if (service.name === "Market Data") {
        result = await callMarketDataAPI(params);
      } else {
        result = JSON.stringify({ error: "Unknown service" });
      }
      
      // 将结果提交回合约
      await submitResponseToContract(requestId, result);
    } catch (error) {
      console.error('处理请求时出错:', error);
    }
  });
}

// 调用天气API
async function callWeatherAPI(location) {
  try {
    console.log(`调用天气API, 地点: ${location}`);
    
    // 这里应该是真实的天气API调用，这里使用模拟数据
    const weatherData = {
      location: location,
      temperature: Math.floor(Math.random() * 30) + 5,
      condition: ["Sunny", "Cloudy", "Rainy", "Snowy"][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 100),
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(weatherData);
  } catch (error) {
    console.error('调用天气API出错:', error);
    return JSON.stringify({ error: "Failed to fetch weather data" });
  }
}

// 调用文件转换API
async function callFileConverterAPI(params) {
  try {
    const parsedParams = JSON.parse(params);
    console.log(`调用文件转换API, 文件哈希: ${parsedParams.fileHash}, 目标格式: ${parsedParams.targetFormat}`);
    
    // 模拟文件转换服务
    const result = {
      originalHash: parsedParams.fileHash,
      targetFormat: parsedParams.targetFormat,
      convertedFileUrl: `https://example.com/converted/${parsedParams.fileHash}.${parsedParams.targetFormat}`,
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(result);
  } catch (error) {
    console.error('调用文件转换API出错:', error);
    return JSON.stringify({ error: "Failed to convert file" });
  }
}

// 调用市场数据API
async function callMarketDataAPI(params) {
  try {
    const parsedParams = JSON.parse(params);
    console.log(`调用市场数据API, 代币: ${parsedParams.symbol}`);
    
    // 模拟市场数据API
    const price = Math.random() * 50000;
    const result = {
      symbol: parsedParams.symbol,
      price: price,
      change24h: (Math.random() * 10) - 5,
      volume24h: Math.random() * 1000000000,
      marketCap: price * (Math.random() * 1000000000),
      analysis: price > 30000 ? "Bullish trend detected" : "Bearish trend detected",
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(result);
  } catch (error) {
    console.error('调用市场数据API出错:', error);
    return JSON.stringify({ error: "Failed to fetch market data" });
  }
}

// 将结果提交回合约
async function submitResponseToContract(requestId, result) {
  try {
    const tx = await paygateContract.submitResponse(requestId, result);
    await tx.wait();
    console.log(`结果已提交给请求 #${requestId}`);
  } catch (error) {
    console.error('提交结果到合约时出错:', error);
  }
}

// 启动服务器和监听
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`MCP桥接服务运行在端口 ${PORT}`);
  listenForRequests();
});
```

创建 `.env` 文件:
```
PRIVATE_KEY=你的以太坊私钥
PAYGATE_ADDRESS=部署的APIPayGate合约地址
```

### 第五步：创建前端界面 (15分钟)

在 `frontend` 目录创建 Next.js 应用:

```bash
cd frontend
mkdir pages
mkdir components
```

创建 `pages/index.js`:
```jsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

// 导入合约ABI (从编译后的合约中获取)
const tokenABI = require('../../contracts/artifacts/contracts/PayToken.sol/PayToken.json').abi;
const paygateABI = require('../../contracts/artifacts/contracts/APIPayGate.sol/APIPayGate.json').abi;

// 合约地址(替换为你部署的地址)
const tokenAddress = "你的PayToken地址";
const paygateAddress = "你的APIPayGate地址";

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [apiParams, setApiParams] = useState('');
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 连接钱包
  async function connectWallet() {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      
      // 获取代币余额
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
      const balance = await tokenContract.balanceOf(address);
      setTokenBalance(ethers.utils.formatUnits(balance, 18));
      
      // 获取可用服务
      await loadServices(provider);
      
      // 监听合约事件
      setupEventListeners(provider);
    } catch (error) {
      console.error('连接钱包失败:', error);
    }
  }
  
  // 获取测试代币
  async function getTestTokens() {
    if (!signer) return;
    
    try {
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
      const tx = await tokenContract.mint(account, ethers.utils.parseUnits('100', 18));
      await tx.wait();
      
      // 更新余额
      const balance = await tokenContract.balanceOf(account);
      setTokenBalance(ethers.utils.formatUnits(balance, 18));
    } catch (error) {
      console.error('获取测试代币失败:', error);
    }
  }
  
  // 加载可用服务
  async function loadServices(provider) {
    try {
      const paygateContract = new ethers.Contract(paygateAddress, paygateABI, provider);
      const activeServiceIds = await paygateContract.getActiveServices();
      
      const servicesList = [];
      for (let i = 0; i < activeServiceIds.length; i++) {
        const id = activeServiceIds[i];
        const service = await paygateContract.services(id);
        
        servicesList.push({
          id: id.toString(),
          name: service.name,
          description: service.description,
          price: ethers.utils.formatUnits(service.price, 18),
          provider: service.provider
        });
      }
      
      setServices(servicesList);
    } catch (error) {
      console.error('加载服务失败:', error);
    }
  }
  
  // 授权代币给合约
  async function approveTokens(serviceId) {
    if (!signer) return;
    
    try {
      const service = services.find(s => s.id === serviceId);
      if (!service) return false;
      
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
      
      // 授权代币
      const tx = await tokenContract.approve(
        paygateAddress, 
        ethers.utils.parseUnits(service.price, 18)
      );
      await tx.wait();
      
      console.log('代币授权成功');
      return true;
    } catch (error) {
      console.error('代币授权失败:', error);
      return false;
    }
  }
  
  // 调用API
  async function callAPI() {
    if (!signer || !selectedService || !apiParams) return;
    
    try {
      setLoading(true);
      
      // 先授权代币
      const approved = await approveTokens(selectedService);
      if (!approved) {
        setLoading(false);
        return;
      }
      
      // 调用API
      const paygateContract = new ethers.Contract(paygateAddress, paygateABI, signer);
      const tx = await paygateContract.callAPI(selectedService, apiParams);
      await tx.wait();
      
      console.log('API调用成功');
    } catch (error) {
      console.error('API调用失败:', error);
    } finally {
      setLoading(false);
    }
  }
  
  // 设置事件监听
  function setupEventListeners(provider) {
    const paygateContract = new ethers.Contract(paygateAddress, paygateABI, provider);
    
    // 监听新响应
    paygateContract.on('NewResponse', async (requestId, result, event) => {
      console.log(`收到响应 #${requestId}: ${result}`);
      
      try {
        // 获取请求详情
        const request = await paygateContract.requests(requestId);
        const service = await paygateContract.services(request.serviceId);
        
        // 添加到响应列表
        setResponses(prev => [
          ...prev,
          {
            id: requestId.toString(),
            serviceName: service.name,
            params: request.params,
            result: result,
            timestamp: new Date().toISOString()
          }
        ]);
      } catch (error) {
        console.error('处理响应时出错:', error);
      }
    });
  }
  
  function renderParamsInput() {
    if (!selectedService) return null;
    
    const service = services.find(s => s.id === selectedService);
    if (!service) return null;
    
    if (service.name === "Weather API") {
      return (
        <input
          className="w-full p-2 border rounded-lg"
          placeholder="输入城市名称 (例如: Shanghai)"
          value={apiParams}
          onChange={(e) => setApiParams(e.target.value)}
        />
      );
    } else if (service.name === "File Converter") {
      return (
        <div className="space-y-2">
          <input
            className="w-full p-2 border rounded-lg"
            placeholder="输入文件哈希"
            value={apiParams.includes('"fileHash"') ? JSON.parse(apiParams).fileHash : ''}
            onChange={(e) => {
              setApiParams(JSON.stringify({ 
                fileHash: e.target.value, 
                targetFormat: apiParams.includes('"targetFormat"') ? JSON.parse(apiParams).targetFormat : 'pdf' 
              }));
            }}
          />
          <select
            className="w-full p-2 border rounded-lg"
            value={apiParams.includes('"targetFormat"') ? JSON.parse(apiParams).targetFormat : 'pdf'}
            onChange={(e) => {
              setApiParams(JSON.stringify({ 
                fileHash: apiParams.includes('"fileHash"') ? JSON.parse(apiParams).fileHash : '', 
                targetFormat: e.target.value 
              }));
            }}
          >
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
          </select>
        </div>
      );
    } else if (service.name === "Market Data") {
      return (
        <select
          className="w-full p-2 border rounded-lg"
          value={apiParams.includes('"symbol"') ? JSON.parse(apiParams).symbol : 'BTC'}
          onChange={(e) => {
            setApiParams(JSON.stringify({ symbol: e.target.value }));
          }}
        >
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="ETH">Ethereum (ETH)</option>
          <option value="SOL">Solana (SOL)</option>
          <option value="DOT">Polkadot (DOT)</option>
        </select>
      );
    } else {
      return (
        <textarea
          className="w-full p-2 border rounded-lg"
          rows="3"
          placeholder="输入API参数 (JSON格式)"
          value={apiParams}
          onChange={(e) => setApiParams(e.target.value)}
        />
      );
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">链智付 | ChainPayGate</h1>
      <p className="text-center mb-8">一键调用，即付即用: 区块链上的通用MCP支付网关</p>
      
      {!account ? (
        <button 
          className="w-full py-2 bg-blue-600 text-white rounded-lg"
          onClick={connectWallet}
        >
          连接钱包
        </button>
      ) : (
        <div>
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <p>账户: {account.slice(0, 6)}...{account.slice(-4)}</p>
            <p>余额: {tokenBalance} PAY</p>
            <button 
              className="mt-2 px-4 py-1 bg-green-500 text-white rounded-lg"
              onClick={getTestTokens}
            >
              获取测试代币
            </button>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">选择API服务</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div 
                  key={service.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:shadow-md ${selectedService === service.id ? 'border-blue-500 bg-blue-50' : ''}`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <h3 className="font-medium">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                  <p className="text-sm font-bold mt-2">价格: {service.price} PAY</p>
                </div>
              ))}
            </div>
          </div>
          
          {selectedService && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">设置API参数</h2>
              <div className="mb-4">
                {renderParamsInput()}
              </div>
              <button 
                className="w-full py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
                onClick={callAPI}
                disabled={loading || !apiParams}
              >
                {loading ? '处理中...' : '调用API并支付'}
              </button>
            </div>
          )}
          
          <div>
            <h2 className="text-xl font-semibold mb-2">API响应结果</h2>
            {responses.length === 0 ? (
              <p className="text-gray-500">还没有响应结果，调用API试试吧！</p>
            ) : (
              <div className="space-y-4">
                {responses.map((resp) => (
                  <div key={resp.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between">
                      <span className="font-medium">{resp.serviceName}</span>
                      <span className="text-sm text-gray-500">{new Date(resp.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm mt-1">参数: {resp.params}</p>
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-48">
                        {typeof resp.result === 'string' ? resp.result : JSON.stringify(resp.result, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 最后一步：启动和演示 (5分钟)

1. 启动本地区块链:
```bash
cd contracts
npx hardhat node
```

2. 部署合约 (新开一个终端):
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

3. 启动MCP桥接服务 (新开一个终端):
```bash
cd mcp-bridge
node index.js
```

4. 启动前端 (新开一个终端):
```bash
cd frontend
pnpm dev
```

5. 访问 http://localhost:3000 测试应用

## 演示说明

以下是演示流程:

1. 连接MetaMask钱包 (使用Hardhat提供的测试账户)
2. 获取测试代币
3. 选择一个API服务 (例如: 天气API)
4. 输入参数 (例如: "Shanghai")
5. 点击"调用API并支付"按钮
6. 等待MCP桥接服务处理请求
7. 查看API响应结果

## 黑客松版本的简化建议

由于时间限制，可以进行以下简化:

1. 使用少量预定义API服务，而不是完整的服务注册系统
2. 模拟API调用结果，而不是实际集成外部API
3. 使用已部署的测试网合约而不是本地部署
4. 简化前端界面，专注于核心功能

记住，黑客松的目标是展示概念的可行性，而不是构建完整的产品。优先实现核心功能，确保演示流畅，然后再添加额外功能。

祝你好运！ 