# ⚡  CLAWTRADE — 加密货币模拟交易平台

> **Demo 开发需求文档 (PRD) v1.0** | 2026-02-08 | Hackathon Demo

---

## 1. 项目概述

**一句话描述**：中文版加密货币模拟交易平台，虚拟 $100,000 资金 + 真实行情 + 预留 OpenClaw AI Agent 接口。

**目标用户**：加密货币新手、策略学习者、交易练习用户

**技术栈**：

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React 18 + TypeScript + Vite | Tailwind CSS，Recharts 图表 |
| 部署 | Vercel | 前端托管 |
| 后端 | Node.js + Express + TypeScript | RESTful API |
| 数据库 | PostgreSQL + Prisma ORM | 用户、持仓、交易记录 |
| 行情 | CoinGecko API (免费层) | 实时价格，30秒刷新 |
| AI | OpenClaw Agent 接口（预留） | 后续接入 AI 交易助手 |

---

## 2. 项目结构

```
sim-trade/
├── client/                    # 前端 React
│   └── src/
│       ├── components/        # 可复用组件
│       ├── pages/             # Market, Trade, Portfolio, Signals, History
│       ├── hooks/             # 自定义 Hooks
│       ├── services/          # API 请求层
│       ├── store/             # Zustand 状态管理
│       └── types/             # TypeScript 类型
├── server/                    # 后端 Node.js
│   └── src/
│       ├── routes/            # API 路由
│       ├── controllers/       # 业务逻辑
│       ├── services/          # CoinGecko、OpenClaw 服务
│       └── middleware/        # auth, error, rate-limit
│   └── prisma/
│       └── schema.prisma      # 数据库 Schema
├── openclaw/                  # OpenClaw Skill 配置
│   ├── SKILL.md
│   └── scripts/trade.sh
└── docker-compose.yml         # 本地 PostgreSQL
```

---

## 3. 数据库设计 (PostgreSQL + Prisma)

### users 用户表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID (PK) | 用户 ID |
| username | VARCHAR(50) | 用户名 UNIQUE |
| email | VARCHAR(255) | 邮箱 UNIQUE |
| password_hash | VARCHAR(255) | 密码哈希 |
| initial_cash | DECIMAL(15,2) | 初始资金 DEFAULT 100000 |
| current_cash | DECIMAL(15,2) | 当前现金 DEFAULT 100000 |
| created_at | TIMESTAMP | 创建时间 |

### positions 持仓表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID (PK) | 持仓 ID |
| user_id | UUID (FK) | 关联 users |
| coin_id | VARCHAR(50) | CoinGecko ID (e.g. "bitcoin") |
| symbol | VARCHAR(10) | 币种符号 (e.g. "BTC") |
| amount | DECIMAL(20,8) | 持有数量 |
| avg_cost | DECIMAL(15,2) | 平均成本 |
| total_cost | DECIMAL(15,2) | 总成本 |

> **索引**：UNIQUE(user_id, coin_id)

### trades 交易记录表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID (PK) | 交易 ID |
| user_id | UUID (FK) | 关联 users |
| type | ENUM | BUY / SELL |
| coin_id | VARCHAR(50) | CoinGecko ID |
| symbol | VARCHAR(10) | 币种符号 |
| amount | DECIMAL(20,8) | 交易数量 |
| price | DECIMAL(15,8) | 成交价格 |
| total_value | DECIMAL(15,2) | 成交金额 |
| source | ENUM | WEB / OPENCLAW / API |
| created_at | TIMESTAMP | 交易时间 |

> **索引**：INDEX(user_id, created_at DESC)

### signals 交易信号表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID (PK) | 信号 ID |
| coin_id | VARCHAR(50) | CoinGecko ID |
| symbol | VARCHAR(10) | 币种符号 |
| type | ENUM | BULLISH / BEARISH |
| strength | ENUM | STRONG / MEDIUM / WEAK |
| message | TEXT | 信号描述 |
| price | DECIMAL(15,8) | 触发价格 |
| change_pct | DECIMAL(8,2) | 24H 涨跌幅 |
| source | ENUM | SYSTEM / OPENCLAW |
| created_at | TIMESTAMP | 生成时间 |

---

## 4. API 接口设计

基础路径：`/api/v1`

### 行情 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /market/prices | 获取 12 币种实时价格 |
| GET | /market/prices/:coinId | 单币种详情 |
| GET | /market/sparklines | 7日走势数据 |

### 交易 API（需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /trade/buy | 买入（body: coin_id, amount_usd, source） |
| POST | /trade/sell | 卖出（body: coin_id, amount_usd, source） |
| GET | /trade/history | 交易历史 |

**买入请求示例**：
```json
{
  "coin_id": "bitcoin",
  "symbol": "BTC", 
  "amount_usd": 5000,
  "source": "WEB"
}
```

### 持仓 API（需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /portfolio/summary | 资产概览（总资产/现金/持仓/PnL） |
| GET | /portfolio/positions | 持仓明细 |

### 信号 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /signals | 最新交易信号列表 |

### ⚡ OpenClaw 接口（预留）

> 当前返回 Mock 数据，后续接入真实 Agent 时只需实现接口逻辑。

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /openclaw/trade | Agent 发起交易指令 |
| GET | /openclaw/portfolio/:userId | Agent 查询用户持仓 |
| POST | /openclaw/signal | Agent 推送交易信号 |
| GET | /openclaw/market/:coinId | Agent 查询行情 |
| POST | /openclaw/webhook | Agent 事件回调 |
| GET | /openclaw/status | Agent 连接状态检查 |

**Agent 交易请求示例**：
```json
{
  "agent_id": "openclaw_agent_001",
  "user_id": "uuid",
  "action": "BUY",
  "coin_id": "ethereum",
  "amount_usd": 2000,
  "reason": "ETH 突破关键压力位",
  "confidence": 0.85,
  "strategy": "trend_following",
  "api_key": "sk_openclaw_xxx"
}
```

**认证**：Agent 通过 Header `X-OpenClaw-Key` 传递 API Key。

---

## 5. 前端设计

**风格**：深色交易所主题（黑底 #0a0e17，绿涨 #00c853，红跌 #ff1744，主色调 #00f0ff）

**字体**：Orbitron (标题) + JetBrains Mono (数据) + Noto Sans SC (中文)

**5 个核心页面**：

| 页面 | 路由 | 核心功能 |
|------|------|----------|
| 行情 | /market | 12 币种价格表 + 24H 涨跌 + 7D 迷你图，点击跳转交易 |
| 交易 | /trade/:coinId | 左侧图表+市场数据，右侧下单面板（买/卖、快速金额、订单预览） |
| 持仓 | /portfolio | 4 卡片概览 + 持仓明细表 + 资产饼图 |
| 信号 | /signals | AI 信号卡片（类型/强度/触发价格），点击跳转交易 |
| 记录 | /history | 交易历史表格（方向/币种/数量/价格/金额/时间） |

### 支持 12 个币种

BTC, ETH, SOL, DOGE, ADA, XRP, LINK, AVAX, DOT, UNI, LTC, MATIC

---

## 6. CoinGecko API 集成

| 端点 | 用途 | 缓存 |
|------|------|------|
| /simple/price | 批量实时价格+涨跌幅+成交量+市值 | 30秒 |
| /coins/markets?sparkline=true | 市场数据 + 7日迷你图 | 5分钟 |
| /coins/{id}/market_chart | 单币种 K 线数据 | 按需 |

**缓存策略**：后端作代理层统一管理请求频率（免费层 10-30次/分钟），CoinGecko 不可用时返回最后缓存 + 离线标识。

---

## 7. 开发步骤 (Claude Code 执行顺序)

### Phase 1：项目初始化
1. 初始化 monorepo（client/ + server/ + openclaw/）
2. 配置 TypeScript、docker-compose 启动 PostgreSQL
3. Prisma Schema + 初始迁移

### Phase 2：后端核心 API
4. Express 服务器 + 中间件（CORS、错误处理、rate-limit）
5. 用户注册/登录（JWT 认证）
6. CoinGecko 代理层 + 缓存
7. 交易 API（买入/卖出 + 余额校验 + 持仓更新）
8. 持仓查询 + 信号生成逻辑

### Phase 3：前端界面
9. Vite + React + TS 项目，全局布局 + 深色主题
10. 行情页（12 币种列表 + 迷你图表）
11. 交易页（图表 + 下单面板）
12. 持仓页（概览 + 饼图）+ 信号页 + 历史页
13. 连接后端 API + Zustand 状态管理

### Phase 4：OpenClaw 接口 + 部署
14. 实现 OpenClaw API 路由（Mock 版本）
15. 创建 OpenClaw Skill 配置文件
16. Vercel 部署前端 + 后端部署（Railway/Render）
17. PostgreSQL 部署（Supabase/Neon）
18. E2E 测试 + Demo 演示

---

## 8. Claude Code 启动提示词

将此文档作为 context 提供给 Claude Code，然后按 Phase 依次执行：

**Phase 1**：
> 请初始化 sim-trade 项目，monorepo 结构，client 用 Vite+React+TS，server 用 Express+TS+Prisma，配置 docker-compose 启动 PostgreSQL，按 PRD 中的 schema 创建数据库表

**Phase 2**：
> 请实现后端所有 API，包括 CoinGecko 代理（带缓存）、用户认证（JWT）、交易买卖（余额校验+持仓更新）、持仓查询、信号生成，参考 PRD 中的 API 设计

**Phase 3**：
> 请实现前端 5 个页面，深色交易所风格，Recharts 图表，连接后端 API，参考 PRD 中的前端设计

**Phase 4**：
> 请实现 OpenClaw 预留接口（Mock 版本）+ 部署配置（Vercel 前端 + 后端 + PSQL），参考 PRD 中的 OpenClaw 集成方案

---

*仅供 Hackathon Demo 使用，不构成投资建议。*
