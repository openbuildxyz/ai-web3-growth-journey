# 快速开始指南

## 安装步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑.env文件，填入你的私钥和API密钥
```

### 3. 编译合约
```bash
npm run compile
```

### 4. 运行测试
```bash
npm test
```

### 5. 部署合约

**本地开发网络**
```bash
# 终端1
npm run node

# 终端2
npm run deploy:local
```

**测试网络**
```bash
# Polygon Mumbai
npm run deploy:mumbai

# Monad测试网
npm run deploy:monad
```

## 核心代码示例

### 智能合约使用

```solidity
// 发布内容
uint256 contentId = contentPlatform.publishContent("QmIPFSHash...");

// 点赞内容
contentPlatform.likeContent(contentId);

// 分享内容
contentPlatform.shareContent(contentId);
```

### SDK使用

```javascript
// 初始化
const sdk = new ContentPlatformSDK();
await sdk.initialize('polygon_mumbai');

// 发布内容
const platform = sdk.getPlatformContract();
const contentId = await platform.publishContent('QmHash...');

// 点赞
await platform.likeContent(contentId);

// 查询内容
const content = await platform.getContent(contentId);
console.log('点赞数:', content.likes);
console.log('收益:', content.totalEarnings, 'CPT');
```

## 文件结构

```
黑客松项目/
├── contracts/              # Solidity智能合约
│   ├── ContentToken.sol    # ERC20代币合约
│   └── ContentPlatform.sol # 平台主合约
├── scripts/                # 部署和管理脚本
│   ├── deploy.js          # 部署脚本
│   └── verify.js          # 验证脚本
├── test/                   # 测试文件
│   ├── ContentToken.test.js
│   └── ContentPlatform.test.js
├── sdk/                    # 前端SDK
│   └── index.js           # SDK主文件
├── examples/               # 使用示例
│   └── usage-examples.js  # 各种框架的集成示例
├── hardhat.config.js       # Hardhat配置
├── package.json           # 项目配置
├── README.md              # 完整文档
├── 代币经济实现详解.md    # 详细实现说明
└── QUICKSTART.md          # 本文件
```

## 下一步

1. 阅读 [README.md](README.md) 了解完整功能
2. 查看 [代币经济实现详解.md](代币经济实现详解.md) 理解实现细节
3. 参考 [examples/usage-examples.js](examples/usage-examples.js) 学习集成方法
4. 运行测试确保系统正常工作
5. 部署合约到测试网
6. 集成SDK到你的前端应用

## 获取帮助

- 查看错误日志
- 检查网络连接
- 确认配置正确
- 参考文档和示例代码

祝你开发顺利！🚀
