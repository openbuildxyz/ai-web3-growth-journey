# 去中心化碳足迹追踪与交易平台

一个结合 AI 验证和智能合约的区块链碳信用交易平台。

## 项目结构

- `/contracts`: 碳信用铸造/交易的智能合约
- `/ai-models`: AI 数据验证模块
- `/frontend`: 去中心化应用用户界面
- `/scripts`: 部署和实用工具脚本

## 技术栈

- 区块链: Ethereum/Solidity (EVM 兼容)
- AI: Python/TensorFlow 用于数据验证
- 前端: React/Vue 集成 Web3
- 预言机: Chainlink/API3 用于价格数据

## 快速开始

1. 安装依赖: `npm install`
2. 编译合约: `npx hardhat compile`
3. 启动开发服务器: `npm run dev`
