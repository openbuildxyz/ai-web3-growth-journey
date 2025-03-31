# 链智付前端 (ChainPayGate Frontend)

链智付是一个基于区块链的通用MCP支付网关，让用户可以使用代币一键调用各种服务。

## 功能特点

- 连接Web3钱包（如MetaMask）进行身份验证
- 浏览并选择可用的API服务
- 使用代币进行一键支付调用
- 在链上记录调用记录和结果
- 支持多链环境（Hardhat测试网络和Mumbai测试网）

## 技术栈

- Next.js - React框架
- ethers.js - 以太坊交互库
- wagmi & Web3Modal - Web3钱包集成
- CSS - 原生样式（无UI框架）

## 快速开始

确保已安装Node.js（v16+）和pnpm。

1. 安装依赖：

```bash
pnpm install
```

2. 配置环境变量：

创建`.env.local`文件并填入以下内容（根据你的环境修改）：

```
NEXT_PUBLIC_MCP_API_URL=http://localhost:3001
NEXT_PUBLIC_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_PAY_GATE_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

3. 启动开发服务器：

```bash
pnpm dev
```

应用将在http://localhost:3000上运行。

## 项目结构

```
frontend/
├── components/      # React组件
├── pages/           # Next.js页面
├── public/          # 静态资源
├── styles/          # CSS样式
└── next.config.js   # Next.js配置
```

## 使用说明

1. 连接MetaMask钱包
2. 确保钱包中有足够的测试代币
3. 选择需要调用的API服务
4. 如果是首次使用，需要授权代币给支付网关合约
5. 输入或修改请求参数（JSON格式）
6. 点击"调用服务"按钮发送请求
7. 查看响应结果

## 演示

项目提供了几种示例服务：

- 天气查询：查询全球城市天气信息
- FAQ问答：基于区块链和Web3知识库的问答
- 文本翻译：将文本翻译成目标语言

## 注意事项

- 前端项目需要与MCP代理服务和智能合约配合使用
- 确保MCP代理服务在`http://localhost:3001`运行
- 为了演示方便，使用了固定的合约地址，实际部署时应修改 