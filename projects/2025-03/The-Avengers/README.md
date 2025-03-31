# Web3 井字棋游戏

## 项目介绍

这是一个基于区块链的井字棋游戏，玩家可以通过连接钱包进行游戏。游戏状态和结果都存储在区块链上，确保游戏的公平性和透明度。

## 技术实现

本项目使用以下技术栈：

### 智能合约部分

- Solidity: 用于编写智能合约
- 使用了游戏状态管理和结果验证逻辑

### 前端部分

- React: 用于构建用户界面
- Ethers.js: 用于与区块链交互
- Web3Modal: 用于钱包连接

## 功能特点

- 创建游戏：玩家可以创建新的游戏并等待其他玩家加入
- 加入游戏：玩家可以加入等待中的游戏
- 游戏操作：玩家轮流在 3x3 棋盘上下棋
- 游戏结果：自动判断胜负和平局
- 游戏记录：所有游戏状态都记录在区块链上

## 如何使用

### 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装合约依赖（如果使用Hardhat或Truffle）
cd contracts
npm install
```

### 部署合约

```bash
cd contracts
# 使用你喜欢的部署工具部署合约
# 例如使用Hardhat
npx hardhat run scripts/deploy.js --network <network>
```

### 更新合约地址

部署合约后，在`frontend/src/App.js`中更新合约地址：

```javascript
const CONTRACT_ADDRESS = '你的合约地址';
```

### 运行前端

```bash
cd frontend
npm start
```

## 本地开发

1. 启动本地区块链（如 Hardhat 节点）
2. 部署合约到本地区块链
3. 将合约地址更新到前端代码
4. 启动前端应用

## 团队信息

这是黑客松项目，由团队开发。

## AI 辅助开发

本项目使用 AI 辅助开发，详细过程记录在`prompts.md`文件中。
