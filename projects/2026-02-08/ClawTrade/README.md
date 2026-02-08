# 🚀 ClawTrade V2 - 加密货币模拟交易平台

> 基于真实行情数据的模拟交易系统，支持 OpenClaw AI 交易助手

## 📋 项目特性

✅ **真实行情数据** - 通过 CoinGecko API 获取实时价格
✅ **模拟资金交易** - 虚拟 $100,000 资金进行无风险交易
✅ **完整交易功能** - 买入/卖出/持仓管理/交易历史
✅ **AI 交易助手** - OpenClaw 智能建议系统（Mock 版本）
✅ **实时数据同步** - 后端缓存 + 前端自动刷新
✅ **单用户 Demo** - 简化架构，快速部署

---

## 🏗️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 18 + Vite + Recharts |
| **后端** | Node.js + Express + TypeScript |
| **数据库** | PostgreSQL + Prisma ORM |
| **行情** | CoinGecko API（免费版）|
| **部署** | Vercel (前端) + Railway (后端) |

---

## 📁 项目结构

```
clawTrade/
├── client/                 # 前端 React 应用
│   ├── src/
│   │   ├── ClawTradeV2.jsx # 主组件（连接后端）
│   │   ├── api.js          # API 客户端
│   │   └── main.jsx        # 入口文件
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # 后端 API 服务
│   ├── src/
│   │   ├── index.ts        # Express 服务器
│   │   ├── db.ts           # Prisma 客户端
│   │   ├── priceService.ts # 价格服务（CoinGecko）
│   │   └── routes/         # API 路由
│   │       ├── trade.ts    # 交易接口
│   │       ├── portfolio.ts# 持仓接口
│   │       ├── market.ts   # 行情接口
│   │       └── openclaw.ts # AI 接口
│   ├── prisma/
│   │   └── schema.prisma   # 数据库模型
│   └── package.json
│
└── README.md               # 本文件
```

---

## 🚀 快速开始（本地测试）

### 前置要求

- Node.js 18+
- PostgreSQL 数据库（或 Supabase 账号）

### 步骤 1️⃣：创建数据库

**选项 A：使用 Supabase（推荐）**

1. 访问 [supabase.com](https://supabase.com)，创建新项目
2. 进入 Settings → Database → Connection String
3. 复制连接字符串（格式：`postgresql://postgres:[password]@[host]:5432/postgres`）

**选项 B：本地 PostgreSQL**

```bash
# macOS
brew install postgresql
brew services start postgresql
createdb clawtrade
```

### 步骤 2️⃣：配置后端

```bash
cd server

# 1. 安装依赖
npm install

# 2. 创建 .env 文件
cp .env.example .env

# 3. 编辑 .env，填入数据库连接字符串
# DATABASE_URL="postgresql://postgres:password@host:5432/postgres"

# 4. 生成 Prisma Client
npm run prisma:generate

# 5. 推送数据库模式
npm run prisma:push

# 6. 初始化数据（创建 demo 用户）
npm run seed
```

### 步骤 3️⃣：启动后端

```bash
# 在 server/ 目录下
npm run dev

# 看到以下输出表示成功：
# ╔════════════════════════════════════════╗
# ║   🚀 ClawTrade API Server 启动成功    ║
# ╠════════════════════════════════════════╣
# ║  端口: 3001                            ║
# ║  环境: development                     ║
# ╚════════════════════════════════════════╝
```

### 步骤 4️⃣：配置前端

```bash
cd client

# 1. 安装依赖
npm install

# 2. 创建 .env 文件（可选，默认已正确配置）
cp .env.example .env
```

### 步骤 5️⃣：启动前端

```bash
# 在 client/ 目录下
npm run dev

# 访问: http://localhost:5173
```

---

## 🧪 测试指南

### 1. 健康检查

```bash
# 测试后端是否运行
curl http://localhost:3001/health

# 预期响应：
# {"status":"healthy","service":"ClawTrade API",...}
```

### 2. 获取行情数据

```bash
# 获取所有币种价格
curl http://localhost:3001/api/market/prices

# 预期响应：包含 BTC、ETH 等币种的实时价格
```

### 3. 查询持仓

```bash
# 获取 demo 用户持仓
curl http://localhost:3001/api/portfolio

# 预期响应：
# {
#   "success": true,
#   "cash": 100000,
#   "positions": [],
#   "summary": {...}
# }
```

### 4. 执行买入交易

```bash
# 买入 $1000 的 BTC
curl -X POST http://localhost:3001/api/trade/buy \
  -H "Content-Type: application/json" \
  -d '{
    "coin_id": "bitcoin",
    "symbol": "BTC",
    "name": "Bitcoin",
    "icon": "₿",
    "amount_usd": 1000,
    "source": "WEB"
  }'

# 预期响应：
# {
#   "success": true,
#   "message": "✅ 买入 0.01234567 BTC @ $81,000.00",
#   "new_balance": 99000
# }
```

### 5. 测试 OpenClaw AI 建议

```bash
# 获取 BTC 交易建议
curl -X POST http://localhost:3001/api/openclaw/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "coin_id": "bitcoin",
    "symbol": "BTC",
    "current_price": 81000,
    "user_cash": 99000
  }'

# 预期响应：
# {
#   "success": true,
#   "agent": "OpenClaw Agent v1.0 (Mock)",
#   "suggestion": {
#     "action": "BUY",
#     "confidence": 0.75,
#     "reason": "BTC 技术面显示超卖信号...",
#     "suggested_amount": 5000
#   }
# }
```

### 6. 前端功能测试清单

在浏览器中访问 `http://localhost:5173`，测试以下功能：

- [ ] **行情页**：显示 12 个币种的实时价格
- [ ] **交易页**：
  - [ ] 选择币种后显示详细图表
  - [ ] 买入功能（输入金额 → 点击买入）
  - [ ] 卖出功能（有持仓时）
  - [ ] 点击"AI 建议"按钮，显示 Mock 建议
- [ ] **持仓页**：显示持仓明细和资产饼图
- [ ] **信号页**：显示涨跌幅超过 3% 的币种信号
- [ ] **历史页**：显示所有交易记录

---

## 🎯 核心 API 接口

### 行情 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/market/prices` | 获取所有币种价格 |

### 交易 API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/trade/buy` | 买入币种 |
| POST | `/api/trade/sell` | 卖出币种 |
| GET | `/api/trade/history` | 交易历史 |

### 持仓 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/portfolio` | 持仓概览 |

### OpenClaw AI API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/openclaw/suggest` | 获取交易建议 |
| GET | `/api/openclaw/status` | Agent 状态检查 |

---

## 🐛 常见问题

### 1. 后端启动报错：`DATABASE_URL` 未定义

**解决方案**：检查 `server/.env` 文件是否存在，并正确配置数据库连接字符串。

### 2. 前端无法连接后端

**解决方案**：
- 确认后端运行在 `http://localhost:3001`
- 检查浏览器控制台是否有 CORS 错误
- 确认 `vite.config.js` 中的代理配置正确

### 3. CoinGecko API 限流

**解决方案**：后端已实现 30 秒缓存，如果仍然限流，等待 1 分钟后重试。

### 4. Prisma 迁移失败

**解决方案**：
```bash
cd server
npx prisma migrate reset  # 重置数据库
npm run prisma:push        # 重新推送模式
npm run seed               # 重新初始化数据
```

---

## 📦 部署到生产环境

### 后端部署（Railway）

1. 访问 [railway.app](https://railway.app)，连接 GitHub 仓库
2. 添加 PostgreSQL 插件
3. 设置环境变量：
   - `DATABASE_URL`（自动生成）
   - `CORS_ORIGIN=https://你的前端域名.vercel.app`
4. 部署命令：
   ```bash
   npm run build && npm start
   ```

### 前端部署（Vercel）

1. 访问 [vercel.com](https://vercel.com)，导入仓库
2. 设置环境变量：
   - `VITE_API_URL=https://你的后端域名.railway.app`
3. 部署设置：
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

---

## 🤖 OpenClaw 接入说明

当前版本为 **Mock 模式**，返回随机生成的交易建议。

### 接入真实 OpenClaw Agent

1. 修改 `server/src/routes/openclaw.ts`
2. 替换 Mock 策略生成逻辑
3. 连接真实 OpenClaw API
4. 添加 Agent API Key 认证

---

## 📝 开发日志

- **v2.0.0** - 2026-02-08
  - ✅ 完整后端 API 实现
  - ✅ 前端连接后端
  - ✅ OpenClaw Mock 接口
  - ✅ PostgreSQL + Prisma ORM
  - ✅ 本地测试验证

- **v1.0.0** - 2026-02-08
  - ✅ 纯前端 Demo 版本
  - ✅ CoinGecko 直连
  - ✅ localStorage 存储

---

## 📄 License

MIT License - 仅供学习使用，不构成投资建议

---

## 🙋 支持

如有问题，请提交 Issue 或联系开发者。

**祝你交易愉快！** 📈💰
