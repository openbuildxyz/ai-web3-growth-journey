# 链智付 (ChainPayGate)

链智付是一个基于区块链的通用MCP支付网关，让用户可以使用代币一键调用各种API服务。

## 项目架构

![项目架构图](./images/architecture.webp)

项目包含三个主要部分：

1. **智能合约（Contracts）**：基于Solidity的支付网关和代币合约
2. **MCP代理服务（MCP Proxy）**：连接区块链和外部API服务的中间层
3. **前端应用（Frontend）**：用户友好的Web3界面

## 核心功能

- **一站式API调用和支付**：用户只需一次交易即可完成支付和API调用
- **通用MCP连接器**：允许区块链应用访问任何外部服务
- **服务提供者接口**：API提供者可轻松接入系统并获得代币支付
- **链上验证**：所有API调用和结果都在链上记录，可查询和验证

## 解决的问题

链智付解决了以下问题：

1. **Web3应用与Web2服务的隔离**：传统Web3应用无法方便地访问外部API
2. **API调用和支付分离**：用户通常需要两个独立步骤才能完成服务请求
3. **API提供者缺少加密货币支付选项**：传统支付系统复杂且成本高

## 技术实现

- **智能合约**：基于Solidity的支付网关合约，管理服务注册、用户授权和支付
- **MCP连接层**：使用Node.js实现的服务，监听链上事件并调用外部API
- **前端界面**：基于React的Web3界面，集成钱包连接和服务调用

## 快速开始

### 前端

```bash
cd frontend
pnpm install
pnpm dev
```

### MCP代理服务

```bash
cd mcp-proxy
pnpm install
pnpm start
```

### 智能合约

```bash
cd contracts
pnpm install
pnpm hardhat compile
pnpm hardhat test
pnpm hardhat run scripts/deploy.js
```

## 演示场景

项目提供了以下演示服务：

1. **天气查询**：查询全球城市的天气信息
2. **FAQ问答**：基于区块链和Web3知识库的问答服务
3. **文本翻译**：将文本翻译成指定的目标语言

## 团队

- 肖杰克 (Jackie Xiao) - 全栈开发

## 许可证

MIT 