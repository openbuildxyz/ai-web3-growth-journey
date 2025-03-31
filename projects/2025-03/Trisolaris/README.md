# Trisolaris - Web3 卡牌抽卡游戏

Trisolaris 是一个基于区块链的卡牌抽卡游戏，玩家可以使用 TRI 代币抽取不同稀有度的卡牌，并有机会获得三连奖励。

![Trisolaris Card Game](https://via.placeholder.com/800x400?text=Trisolaris+Card+Game)

## 🚀 技术栈

- **前端**: React.js, ethers.js
- **智能合约**: Solidity
- **开发工具**: Hardhat
- **测试环境**: Hardhat Network
- **Web3 集成**: MetaMask

## 📂 项目结构

```
trisolaris/
├── contracts/               # 智能合约
│   ├── CardLibrary.sol      # 卡牌库合约
│   ├── TrisolarisCoin.sol   # TRI 代币合约
│   └── TrisolarisDraw.sol   # 抽卡游戏合约
├── frontend/                # 前端应用
│   ├── public/              # 静态资源
│   └── src/                 # 源代码
│       ├── components/      # UI 组件
│       ├── context/         # React 上下文
│       ├── contracts/       # 合约 ABI
│       └── pages/           # 应用页面
├── scripts/                 # 部署脚本
│   ├── deploy.js            # 主网部署脚本
│   └── deploy-local.js      # 本地部署脚本
├── test/                    # 测试文件
├── .env.example             # 环境变量示例
├── hardhat.config.js        # Hardhat 配置
└── package.json             # 项目依赖
```

## ⚙️ 环境设置

### 前提条件

- Node.js (v14 或更高版本)
- npm 或 pnpm
- MetaMask 钱包浏览器扩展

### 安装步骤

1. 克隆仓库:

```bash
git clone <repository-url>
cd trisolaris
```

2. 安装依赖:

```bash
# 项目根目录
pnpm install

# 前端目录
cd frontend
npm install
cd ..
```

3. 环境变量配置:

```bash
# 复制示例环境文件
cp .env.example .env

# 编辑 .env 文件，填入必要的配置
```

## 🔥 本地开发

### 运行本地区块链节点

```bash
pnpm run node
```

这将启动一个本地 Hardhat 网络节点，并提供 20 个测试账户，每个账户有 10000 ETH。

### 部署智能合约到本地网络

```bash
pnpm run deploy:local
```

部署成功后，终端将显示合约地址，请将这些地址添加到前端目录下的 `.env` 文件:

```
REACT_APP_TRI_TOKEN_ADDRESS=<你的 TrisolarisCoin 合约地址>
REACT_APP_GAME_CONTRACT_ADDRESS=<你的 TrisolarisDraw 合约地址>
```

### 配置 MetaMask

1. 打开 MetaMask
2. 添加新网络:
   - 网络名称: Hardhat
   - RPC URL: http://127.0.0.1:8545
   - 链 ID: 31337
   - 符号: ETH

3. 导入测试账户:
   - 复制 Hardhat 节点控制台显示的任一私钥
   - 在 MetaMask 中点击"导入账户"
   - 粘贴私钥

### 启动前端应用

```bash
cd frontend
npm start
```

应用将在 http://localhost:3000 启动。

## 🎮 游戏玩法

1. 连接你的 MetaMask 钱包
2. 获取 TRI 代币
3. 前往"抽卡"页面开始游戏
4. 如果连续抽到三张相同稀有度的卡牌，将获得奖励!

## 🔧 测试

运行智能合约测试:

```bash
pnpm run test
```

## 📦 部署到测试网/主网

1. 配置环境变量:
   - 在 `.env` 文件中设置:
     ```
     PRIVATE_KEY=<你的钱包私钥>
     MUMBAI_URL=<Mumbai 测试网 RPC URL>
     POLYGON_URL=<Polygon 主网 RPC URL>
     ```

2. 部署到 Mumbai 测试网:
   ```bash
   pnpm run deploy:mumbai
   ```

3. 部署到 Polygon 主网:
   ```bash
   pnpm run deploy:polygon
   ```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个 Pull Request

## 📄 许可证

该项目采用 MIT 许可证。

## 🙏 鸣谢

- OpenZeppelin 提供安全合约库
- Chainlink VRF 提供可验证的随机性
