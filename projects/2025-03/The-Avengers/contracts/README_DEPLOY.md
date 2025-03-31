# 井字棋游戏智能合约部署指南

本文档提供了部署井字棋游戏智能合约的详细步骤。

## 前提条件

1. 已安装 Node.js 和 npm
2. 已安装 Git

## 设置环境

1. 克隆本仓库到本地
2. 进入 contracts 目录
   ```
   cd contracts
   ```
3. 安装依赖
   ```
   npm install
   ```

## 配置环境变量

1. 在 contracts 目录中创建`.env`文件
2. 添加以下配置，替换为你自己的值：

   ```
   # 部署账户私钥
   PRIVATE_KEY=your_private_key_here

   # 以太坊测试网Sepolia RPC URL
   SEPOLIA_URL=your_sepolia_rpc_url_here

   # Scroll Sepolia测试网 RPC URL
   SCROLL_URL=your_scroll_rpc_url_here
   ```

## 编译合约

```
npx hardhat compile
```

## 部署合约

### 部署到本地 Hardhat 网络

```
npx hardhat run scripts/deploy.ts
```

### 部署到 Sepolia 测试网

```
npx hardhat run scripts/deploy.ts --network sepolia
```

### 部署到 Scroll Sepolia 测试网

```
npx hardhat run scripts/deploy.ts --network scrollSepolia
```

## 验证合约

部署成功后，你会看到合约地址输出。你可以使用区块链浏览器验证合约并与之交互：

- Etherscan (Sepolia): https://sepolia.etherscan.io/
- Scroll Explorer (Scroll Sepolia): https://sepolia.scrollscan.com/

## 合约功能

井字棋游戏合约提供以下功能：

1. `createGame()`: 创建新游戏
2. `joinGame(gameId)`: 加入已存在的游戏
3. `makeMove(gameId, position)`: 在游戏中行棋
4. `getGameInfo(gameId)`: 获取游戏信息

## 注意事项

- 确保在部署到公共网络前有足够的测试网代币
- 永远不要在生产环境中使用示例私钥
- 在真实环境中使用合约时，确保进行充分的安全审计
