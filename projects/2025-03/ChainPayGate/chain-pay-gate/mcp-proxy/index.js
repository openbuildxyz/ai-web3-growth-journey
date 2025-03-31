const express = require('express');
const ethers = require('ethers');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
app.use(cors());
app.use(express.json());

// 简易日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 加载合约ABI (这里是模拟的，实际需要从编译后的合约获取)
const mockTokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const mockChainPayGateABI = [
  "function authorizations(address user) view returns (uint256 amount, uint256 used, uint256 validUntil, bool active)",
  "function getAuthorizationBalance(address user) view returns (uint256 remaining, uint256 validUntil)",
  "function callAPI(uint256 serviceId, string memory params) returns (uint256)",
  "function submitResponse(uint256 requestId, string memory result)",
  "function requests(uint256 requestId) view returns (address requester, uint256 serviceId, string params, uint256 timestamp, bool fulfilled, uint256 paidAmount)",
  "function services(uint256 serviceId) view returns (string name, string description, address provider, uint256 price, bool active)",
  "event NewRequest(uint256 requestId, address requester, uint256 serviceId, string params)",
  "event NewResponse(uint256 requestId, string result)"
];

// 区块链连接
const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// 智能合约连接(这里使用占位值)
let tokenContract;
let payGateContract;

// 模拟FAQ知识库
const faqKnowledgeBase = JSON.parse(process.env.FAQ_KNOWLEDGE_BASE || '{}');

// 连接到合约
function connectToContracts() {
  try {
    if (process.env.TOKEN_ADDRESS && process.env.TOKEN_ADDRESS !== 'TO_BE_UPDATED') {
      tokenContract = new ethers.Contract(
        process.env.TOKEN_ADDRESS,
        mockTokenABI,
        wallet
      );
      
      console.log("已连接到代币合约:", process.env.TOKEN_ADDRESS);
    }
    
    if (process.env.PAY_GATE_ADDRESS && process.env.PAY_GATE_ADDRESS !== 'TO_BE_UPDATED') {
      payGateContract = new ethers.Contract(
        process.env.PAY_GATE_ADDRESS,
        mockChainPayGateABI,
        wallet
      );
      
      console.log("已连接到支付网关合约:", process.env.PAY_GATE_ADDRESS);
      
      // 监听新请求事件
      listenForRequests();
    }
  } catch (error) {
    console.error("连接合约失败:", error);
  }
}

// 监听区块链上的请求事件
async function listenForRequests() {
  console.log("开始监听区块链请求事件...");
  
  payGateContract.on("NewRequest", async (requestId, requester, serviceId, params, event) => {
    console.log(`收到新请求 #${requestId}: 用户 ${requester}, 服务ID ${serviceId}, 参数: ${params}`);
    
    try {
      // 获取服务信息
      const service = await payGateContract.services(serviceId);
      console.log(`服务名称: ${service.name}`);
      
      // 获取请求详情
      const request = await payGateContract.requests(requestId);
      
      // 根据服务类型处理请求
      let result;
      
      if (service.name === "FAQ Knowledge Base") {
        result = await handleFaqRequest(params);
      } else if (service.name === "Weather API") {
        result = await handleWeatherRequest(params);
      } else {
        result = JSON.stringify({ error: "Unsupported service" });
      }
      
      // 提交响应回区块链
      await submitResponseToBlockchain(requestId, result);
      
    } catch (error) {
      console.error("处理请求失败:", error);
    }
  });
}

// 处理FAQ知识库请求
async function handleFaqRequest(question) {
  console.log(`处理FAQ问题: ${question}`);
  
  // 标准化问题 (转小写并去除额外的空格)
  const normalizedQuestion = question.toLowerCase().trim();
  
  // 查找问题
  if (faqKnowledgeBase[normalizedQuestion]) {
    return JSON.stringify({
      question: question,
      answer: faqKnowledgeBase[normalizedQuestion],
      source: "ChainPayGate FAQ Knowledge Base",
      timestamp: new Date().toISOString()
    });
  } else {
    // 如果没有精确匹配，尝试查找相似问题
    for (const [key, value] of Object.entries(faqKnowledgeBase)) {
      if (normalizedQuestion.includes(key) || key.includes(normalizedQuestion)) {
        return JSON.stringify({
          question: question,
          answer: value,
          source: "ChainPayGate FAQ Knowledge Base (Partial Match)",
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // 如果找不到任何相关问题
    return JSON.stringify({
      question: question,
      answer: "I'm sorry, I don't have information on that topic yet.",
      source: "ChainPayGate FAQ Knowledge Base",
      timestamp: new Date().toISOString()
    });
  }
}

// 处理天气API请求
async function handleWeatherRequest(location) {
  console.log(`处理天气请求: ${location}`);
  
  // 模拟天气数据
  const weatherData = {
    location: location,
    temperature: Math.floor(Math.random() * 30) + 5,
    condition: ["Sunny", "Cloudy", "Rainy", "Snowy"][Math.floor(Math.random() * 4)],
    humidity: Math.floor(Math.random() * 100),
    timestamp: new Date().toISOString()
  };
  
  return JSON.stringify(weatherData);
}

// 将结果提交回区块链
async function submitResponseToBlockchain(requestId, result) {
  if (!payGateContract) {
    console.error("支付网关合约未连接");
    return;
  }
  
  try {
    const tx = await payGateContract.submitResponse(requestId, result);
    await tx.wait();
    console.log(`响应已提交到区块链 (请求ID: ${requestId})`);
  } catch (error) {
    console.error("提交响应失败:", error);
  }
}

// API认证中间件
function authMiddleware(req, res, next) {
  // 从请求头或查询参数获取令牌
  const token = req.headers.authorization?.split(' ')[1] || req.query.token;
  
  if (!token) {
    return res.status(401).json({ error: "未提供认证令牌" });
  }
  
  try {
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "认证令牌无效" });
  }
}

// API路由

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MCP协议信息
app.get('/mcp/info', (req, res) => {
  res.json({
    protocol: "MCP",
    version: "1.0.0",
    name: "ChainPayGate MCP Proxy",
    description: "通用API支付网关MCP代理",
    supportedServices: [
      {
        id: 0,
        name: "FAQ Knowledge Base",
        description: "问答知识库服务",
        paramSchema: { type: "string", description: "问题内容" }
      },
      {
        id: 1,
        name: "Weather API",
        description: "获取城市天气信息",
        paramSchema: { type: "string", description: "城市名称" }
      }
    ]
  });
});

// 获取用户授权状态
app.get('/user/authorization/:address', async (req, res) => {
  try {
    if (!payGateContract) {
      return res.status(503).json({ error: "合约未连接" });
    }
    
    const address = req.params.address;
    
    // 获取用户授权信息
    const [remaining, validUntil] = await payGateContract.getAuthorizationBalance(address);
    
    res.json({
      address,
      remainingBalance: ethers.utils.formatEther(remaining),
      validUntil: new Date(validUntil.toNumber() * 1000).toISOString(),
      isActive: remaining.gt(0) && validUntil.toNumber() > Date.now() / 1000
    });
  } catch (error) {
    console.error("获取授权状态失败:", error);
    res.status(500).json({ error: "获取授权状态失败" });
  }
});

// 生成JWT身份令牌
app.post('/auth/token', async (req, res) => {
  try {
    const { address, signature, message } = req.body;
    
    if (!address || !signature || !message) {
      return res.status(400).json({ error: "缺少必要参数" });
    }
    
    // 验证签名
    const signerAddress = ethers.utils.verifyMessage(message, signature);
    
    if (signerAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: "签名验证失败" });
    }
    
    // 如果签名验证通过，需要检查用户是否有足够的授权
    if (payGateContract) {
      const [remaining, validUntil] = await payGateContract.getAuthorizationBalance(address);
      
      if (remaining.eq(0) || validUntil.toNumber() <= Math.floor(Date.now() / 1000)) {
        return res.status(403).json({ error: "没有有效的授权额度" });
      }
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { address: address.toLowerCase() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ token });
  } catch (error) {
    console.error("生成令牌失败:", error);
    res.status(500).json({ error: "生成令牌失败" });
  }
});

// MCP调用端点
app.post('/mcp/call', authMiddleware, async (req, res) => {
  try {
    const { serviceId, params } = req.body;
    const userAddress = req.user.address;
    
    if (serviceId === undefined || !params) {
      return res.status(400).json({ error: "缺少必要参数" });
    }
    
    // 验证用户授权
    if (payGateContract) {
      const [remaining, validUntil] = await payGateContract.getAuthorizationBalance(userAddress);
      
      if (remaining.eq(0) || validUntil.toNumber() <= Math.floor(Date.now() / 1000)) {
        return res.status(403).json({ error: "没有有效的授权额度" });
      }
      
      // 获取服务信息
      const service = await payGateContract.services(serviceId);
      
      if (!service.active) {
        return res.status(404).json({ error: "请求的服务不存在或未激活" });
      }
      
      if (remaining.lt(service.price)) {
        return res.status(402).json({ error: "授权额度不足" });
      }
      
      // 在区块链上调用服务
      const tx = await payGateContract.callAPI(serviceId, params);
      const receipt = await tx.wait();
      
      // 从事件中提取请求ID
      const requestEvent = receipt.events.find(e => e.event === 'NewRequest');
      const requestId = requestEvent.args.requestId.toNumber();
      
      // 注意：这里不等待结果返回，而是立即返回请求ID
      res.json({
        requestId,
        status: "processing",
        message: "请求已提交到区块链，结果将异步处理"
      });
    } else {
      // 如果合约未连接，模拟本地处理
      let result;
      
      if (serviceId === 0) { // FAQ Knowledge Base
        result = await handleFaqRequest(params);
      } else if (serviceId === 1) { // Weather API
        result = await handleWeatherRequest(params);
      } else {
        return res.status(404).json({ error: "服务不存在" });
      }
      
      res.json({
        status: "success",
        result: JSON.parse(result)
      });
    }
  } catch (error) {
    console.error("MCP调用失败:", error);
    res.status(500).json({ error: "MCP调用失败", details: error.message });
  }
});

// 获取请求结果
app.get('/mcp/result/:requestId', authMiddleware, async (req, res) => {
  try {
    if (!payGateContract) {
      return res.status(503).json({ error: "合约未连接" });
    }
    
    const requestId = req.params.requestId;
    
    // 获取请求信息
    const request = await payGateContract.requests(requestId);
    
    // 检查请求是否存在
    if (request.requester === ethers.constants.AddressZero) {
      return res.status(404).json({ error: "请求不存在" });
    }
    
    // 检查是否是请求者本人
    if (request.requester.toLowerCase() !== req.user.address.toLowerCase()) {
      return res.status(403).json({ error: "无权访问该请求" });
    }
    
    if (!request.fulfilled) {
      return res.json({
        requestId,
        status: "processing",
        message: "请求正在处理中"
      });
    }
    
    // 由于智能合约中没有直接存储响应结果的函数模拟，这里我们假设有一个响应映射
    // 实际实现需要从区块链获取响应结果
    res.json({
      requestId,
      status: "completed",
      result: { message: "模拟的响应结果" }
    });
  } catch (error) {
    console.error("获取结果失败:", error);
    res.status(500).json({ error: "获取结果失败" });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`MCP代理服务已启动，端口: ${PORT}`);
  connectToContracts();
}); 