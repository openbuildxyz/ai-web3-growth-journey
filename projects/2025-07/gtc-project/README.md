# 🌱 Green Trace (绿色足迹)

一个基于区块链的环保行为激励平台，让每一次环保行为都价值连城。

## 📋 项目简介

Green Trace 是一个创新的去中心化应用（DApp），旨在通过代币激励机制鼓励用户参与环保行为。用户上传环保行为的图片，通过AI智能识别验证后获得GTC代币奖励。

## ✨ 核心功能

### 🎯 智能环保行为识别
- **AI图像分析**：集成Google Gemini AI，智能识别图片中的环保行为
- **碳足迹评估**：自动判断行为是增碳还是减碳
- **置信度评分**：AI对识别结果的把握度评估

### 💰 代币激励机制
- **GTC代币奖励**：验证环保行为后获得代币奖励
- **区块链记录**：所有环保行为永久记录在区块链上
- **透明可追溯**：用户可查看自己的环保贡献历史

### 🔐 去中心化特性
- **Web3集成**：支持多种钱包连接（MetaMask等）
- **智能合约**：基于以太坊的智能合约管理代币分发
- **用户主权**：用户完全控制自己的数据和资产

## 🛠️ 技术栈

### 前端技术
- **React 18** - 现代化前端框架
- **TypeScript** - 类型安全的JavaScript
- **Tailwind CSS** - 实用优先的CSS框架
- **Lucide React** - 优雅的图标库

### Web3技术
- **Wagmi** - React Hooks for Ethereum
- **Ethers.js** - 以太坊JavaScript API
- **MetaMask** - 以太坊钱包集成

### AI服务
- **Google Gemini AI** - 图像识别和分析
- **RESTful API** - 与AI服务通信

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn
- MetaMask 钱包

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/green-trace-protocol.git
cd green-trace-protocol
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **配置环境变量**
```bash
cp .env.example .env.local
```
编辑 `.env.local` 文件，添加必要的环境变量：
```env
NEXT_PUBLIC_GOOGLE_AI_KEY=your_google_ai_api_key
NEXT_PUBLIC_CONTRACT_ADDRESS=your_smart_contract_address
```

4. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
```

5. **访问应用**
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📱 使用指南

### 连接钱包
1. 点击页面右上角的"连接钱包"按钮
2. 选择你的以太坊钱包（如MetaMask）
3. 授权连接请求

### 上传环保行为
1. 点击"立即上传我的善举"按钮
2. 选择包含环保行为的图片文件
3. 等待AI智能识别和分析
4. 查看识别结果和置信度评分
5. 确认后获得GTC代币奖励

### 查看历史记录
- 在个人中心查看所有上传的环保行为
- 查看获得的代币奖励历史
- 查看碳足迹减少统计

## 🏗️ 项目结构

```
green-trace-protocol/
├── src/
│   ├── components/          # React组件
│   │   ├── HeroSection.tsx # 主页英雄区域
│   │   └── ui/             # UI组件库
│   ├── pages/              # 页面组件
│   ├── styles/             # 样式文件
│   └── utils/              # 工具函数
├── public/                 # 静态资源
├── contracts/              # 智能合约
└── docs/                   # 文档
```

## 🔧 核心组件说明

### HeroSection.tsx
主页的核心组件，包含：
- 文件上传功能
- AI图像识别集成
- 用户钱包连接
- 环保行为验证逻辑

### AI识别流程
1. 用户选择图片文件
2. 图片转换为base64格式
3. 调用Google Gemini AI API
4. 解析AI返回的JSON结果
5. 根据置信度判断是否奖励代币

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献
1. Fork 本项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 开发规范
- 使用TypeScript进行类型安全开发
- 遵循ESLint代码规范
- 编写单元测试
- 保持代码注释完整

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。


---

**让我们一起为地球的可持续发展贡献力量！** 🌍💚
