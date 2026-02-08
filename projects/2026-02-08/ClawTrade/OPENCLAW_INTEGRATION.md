# 🤖 OpenClaw Agent 接入文档

> ClawTrade 虚拟货币交易平台 AI 建议接口规范

## 📚 目录
- [API 基础地址](#-api-基础地址)
- [概述](#-概述)
- [接口规范](#-接口规范)
  - [交易建议接口](#1-交易建议接口核心)
  - [状态检查接口](#2-状态检查接口)
- [决策逻辑建议](#-决策逻辑建议)
- [技术要求](#-技术要求)
- [集成步骤](#-集成步骤)
- [测试用例](#-测试用例)
- [支持币种列表](#-支持币种列表)
- [快速测试](#-快速测试立即可用)

---

## 🌐 API 基础地址

| 环境 | Base URL | 说明 |
|------|----------|------|
| **生产环境** | `https://clawtrade-production.up.railway.app` | Railway 部署，可直接使用 |
| **本地开发** | `http://localhost:3001` | 本地调试环境 |

**健康检查端点：** `GET /health`

```bash
# 测试生产环境是否正常
curl https://clawtrade-production.up.railway.app/health

# 预期响应
{
  "status": "healthy",
  "service": "ClawTrade API",
  "version": "1.0.0",
  "timestamp": "2026-02-08T10:30:00.000Z"
}
```

---

## 📋 概述

OpenClaw Agent 是 ClawTrade 平台的智能交易建议系统，负责分析市场数据并为用户提供 BUY/SELL/HOLD 建议。

**当前状态：** 后端使用 Mock 数据模拟 AI 建议
**目标：** 接入真实的 OpenClaw Agent 服务

---

## 🔌 接口规范

### 1. 交易建议接口（核心）

**接口地址：** `POST /api/openclaw/suggest`

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `coin_id` | string | ✅ | CoinGecko 币种 ID | `"bitcoin"` |
| `symbol` | string | ✅ | 币种符号 | `"BTC"` |
| `current_price` | number | ❌ | 当前价格（美元）<br>不传则后端自动获取 | `81000` |
| `user_cash` | number | ❌ | 用户剩余现金（美元） | `98500` |
| `user_positions` | object | ❌ | 用户持仓信息 | 见下方示例 |

**`user_positions` 结构：**
```json
{
  "BTC": {
    "amount": 0.5,        // 持有数量
    "avgCost": 79000      // 平均成本价
  },
  "ETH": {
    "amount": 2.3,
    "avgCost": 3200
  }
}
```

#### 请求示例

```json
{
  "coin_id": "bitcoin",
  "symbol": "BTC",
  "current_price": 81000,
  "user_cash": 98500,
  "user_positions": {
    "BTC": {
      "amount": 0.5,
      "avgCost": 79000
    }
  }
}
```

#### 响应格式

```json
{
  "success": true,
  "agent": "OpenClaw Agent v1.0",
  "timestamp": "2026-02-08T10:30:00.000Z",
  "suggestion": {
    "action": "BUY",
    "confidence": 0.75,
    "reason": "BTC 技术面显示超卖信号，RSI 接近 30，建议分批建仓",
    "suggested_amount": 5000,
    "risk_level": "MEDIUM",
    "entry_price": 81000,
    "target_price": 93150,
    "stop_loss": 74520
  }
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 | 可选值/范围 |
|------|------|------|------------|
| `success` | boolean | 请求是否成功 | `true` / `false` |
| `agent` | string | Agent 版本标识 | 如 `"OpenClaw Agent v1.0"` |
| `timestamp` | string | ISO 8601 时间戳 | `"2026-02-08T10:30:00.000Z"` |
| **suggestion** | object | **建议对象** | |
| `action` | string | 操作建议 | `"BUY"` / `"SELL"` / `"HOLD"` |
| `confidence` | number | 置信度 | `0.0 - 1.0` |
| `reason` | string | 建议理由（中文，1-2句话） | |
| `suggested_amount` | number | 建议交易金额（美元） | `> 0`（HOLD 时为 0） |
| `risk_level` | string | 风险等级 | `"LOW"` / `"MEDIUM"` / `"HIGH"` |
| `entry_price` | number | 建议入场价（BUY时） | 可选 |
| `target_price` | number | 目标价格（BUY时） | 可选 |
| `stop_loss` | number | 止损价格（BUY时） | 可选 |
| `current_pnl` | number | 当前盈亏百分比（SELL时） | 可选，如 `12.5` 表示盈利12.5% |
| `take_profit_price` | number | 止盈价格（SELL时） | 可选 |
| `stop_loss_price` | number | 止损价格（SELL时） | 可选 |
| `watch_price_above` | number | 关注上方价格（HOLD时） | 可选 |
| `watch_price_below` | number | 关注下方价格（HOLD时） | 可选 |

---

### 2. 状态检查接口

**接口地址：** `GET /api/openclaw/status`

#### 响应示例

```json
{
  "connected": true,
  "agent_version": "v1.0",
  "mode": "SUGGESTION_ASSISTANT",
  "capabilities": ["price_analysis", "trade_suggestion", "risk_assessment"],
  "message": "OpenClaw Agent 运行正常"
}
```

---

## 🧠 决策逻辑建议

### 基本策略框架

```
1. 数据收集
   ├─ 获取当前币种实时价格
   ├─ 分析技术指标（RSI、MACD、均线等）
   └─ 检查用户持仓和盈亏状态

2. 策略判断
   ├─ 【BUY】超卖信号 + 趋势向好
   ├─ 【SELL】已盈利 >10% 或亏损 >8%
   └─ 【HOLD】市场不明朗或在关键位置

3. 风险控制
   ├─ suggested_amount ≤ 用户现金 × 10%（最大 $5000）
   ├─ 设置合理的 target_price（+10% ~ +15%）
   └─ 设置止损位 stop_loss（-5% ~ -8%）
```

### 具体场景示例

#### 场景 1：用户无持仓 + 市场超卖

```json
{
  "action": "BUY",
  "confidence": 0.75,
  "reason": "BTC 技术面显示超卖信号，RSI 接近 30，建议分批建仓",
  "suggested_amount": 5000,
  "risk_level": "MEDIUM",
  "entry_price": 81000,
  "target_price": 93150,    // +15%
  "stop_loss": 74520        // -8%
}
```

#### 场景 2：用户有持仓 + 盈利 12%

```json
{
  "action": "SELL",
  "confidence": 0.70,
  "reason": "BTC 已盈利 12.0%，建议止盈一半仓位，锁定利润",
  "suggested_amount": 20250,  // 假设持仓 0.5 BTC × $81000 × 50%
  "risk_level": "LOW",
  "current_pnl": 12.0,
  "take_profit_price": 81000
}
```

#### 场景 3：市场震荡观望

```json
{
  "action": "HOLD",
  "confidence": 0.60,
  "reason": "当前市场震荡，BTC 在关键支撑位附近，建议观望等待更好入场点",
  "suggested_amount": 0,
  "risk_level": "LOW",
  "watch_price_above": 85050,  // +5%
  "watch_price_below": 76950   // -5%
}
```

---

## 🔧 技术要求

### 1. 性能要求
- ✅ 响应时间 < 3 秒
- ✅ 支持并发请求
- ✅ 错误时优雅降级

### 2. 安全要求
- ✅ 支持 CORS（允许前端跨域调用）
- ✅ 参数验证（防止注入攻击）
- ✅ 错误信息不暴露内部实现

### 3. 错误处理

**错误响应格式：**
```json
{
  "success": false,
  "message": "缺少币种信息"
}
```

**常见错误码：**
- `400 Bad Request` - 参数错误
- `500 Internal Server Error` - 服务内部错误
- `503 Service Unavailable` - 服务不可用

---

## 📡 集成步骤

### Step 1: 开发 OpenClaw Agent

根据上述接口规范，实现两个 API 端点：
- `POST /api/openclaw/suggest`
- `GET /api/openclaw/status`

### Step 2: 部署 OpenClaw 服务

部署到公网可访问的地址，如：
```
https://openclaw.yourdomain.com
```

### Step 3: 配置 ClawTrade 后端

修改 `server/.env` 文件，添加：
```bash
OPENCLAW_API_URL=https://openclaw.yourdomain.com
```

### Step 4: 替换 Mock 逻辑

修改 `server/src/routes/openclaw.ts`，将第 32 行的 Mock 代码：

```typescript
// ❌ 删除这部分
const strategies = generateMockStrategies(coin_id, symbol, price, user_cash, user_positions);
const suggestion = strategies[Math.floor(Math.random() * strategies.length)];
```

替换为真实 API 调用：

```typescript
// ✅ 替换为这部分
const openclawUrl = process.env.OPENCLAW_API_URL || 'http://localhost:8000';
const response = await fetch(`${openclawUrl}/api/openclaw/suggest`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    coin_id,
    symbol,
    current_price: price,
    user_cash,
    user_positions
  })
});

if (!response.ok) {
  throw new Error(`OpenClaw API 错误: ${response.statusText}`);
}

const data = await response.json();
const suggestion = data.suggestion;
```

### Step 5: 测试验证

```bash
# 测试 ClawTrade 生产环境（当前可用）
curl https://clawtrade-production.up.railway.app/api/openclaw/status

# 测试建议接口
curl -X POST https://clawtrade-production.up.railway.app/api/openclaw/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "coin_id": "bitcoin",
    "symbol": "BTC",
    "current_price": 81000,
    "user_cash": 100000,
    "user_positions": {}
  }'

# 如果你已经部署了 OpenClaw Agent，可以测试你的服务：
curl https://openclaw.yourdomain.com/api/openclaw/status
```

---

## 🧪 测试用例

### 测试用例 1：无持仓买入建议

**输入：**
```json
{
  "coin_id": "bitcoin",
  "symbol": "BTC",
  "current_price": 81000,
  "user_cash": 100000,
  "user_positions": {}
}
```

**预期输出：**
- `action`: `"BUY"` 或 `"HOLD"`
- `suggested_amount`: `0 - 10000`
- `confidence`: `> 0.5`

---

### 测试用例 2：有持仓盈利情况

**输入：**
```json
{
  "coin_id": "ethereum",
  "symbol": "ETH",
  "current_price": 3500,
  "user_cash": 50000,
  "user_positions": {
    "ETH": {
      "amount": 10,
      "avgCost": 3000
    }
  }
}
```

**预期输出：**
- `action`: `"SELL"`（因为盈利 16.7%）
- `current_pnl`: `16.7`
- `suggested_amount`: `> 0`

---

### 测试用例 3：市场不明朗观望

**输入：**
```json
{
  "coin_id": "cardano",
  "symbol": "ADA",
  "current_price": 0.5,
  "user_cash": 10000,
  "user_positions": {}
}
```

**预期输出：**
- `action`: `"HOLD"`
- `suggested_amount`: `0`
- `watch_price_above` 和 `watch_price_below` 有值

---

## 📞 支持币种列表

ClawTrade 支持以下 12 个币种，请确保你的 Agent 能处理：

| coin_id | symbol | 名称 |
|---------|--------|------|
| bitcoin | BTC | 比特币 |
| ethereum | ETH | 以太坊 |
| binancecoin | BNB | 币安币 |
| ripple | XRP | 瑞波币 |
| cardano | ADA | 艾达币 |
| solana | SOL | 索拉纳 |
| polkadot | DOT | 波卡 |
| dogecoin | DOGE | 狗狗币 |
| avalanche-2 | AVAX | 雪崩 |
| chainlink | LINK | 链接 |
| polygon | MATIC | 马蹄 |
| uniswap | UNI | 优尼 |

---

## 🔐 安全注意事项

1. **不要存储用户敏感信息** - 建议接口无状态设计
2. **限流保护** - 建议每个币种每秒最多 1 次请求
3. **数据验证** - 严格验证所有输入参数
4. **日志记录** - 记录所有建议决策，便于后续审计

---

## 📚 附录

### A. ClawTrade 后端当前实现

查看 Mock 版本实现：[server/src/routes/openclaw.ts](server/src/routes/openclaw.ts)

### B. 前端调用示例

前端通过以下方式调用建议接口：

```typescript
const response = await fetch('http://localhost:3001/api/openclaw/suggest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    coin_id: 'bitcoin',
    symbol: 'BTC',
    current_price: 81000,
    user_cash: userBalance,
    user_positions: userPositions
  })
});

const data = await response.json();
console.log(data.suggestion);
```

### C. 推荐的外部数据源

- **价格数据：** CoinGecko API (https://www.coingecko.com/api/documentation)
- **技术指标：** TradingView API 或自行计算
- **市场情绪：** Fear & Greed Index API

---

## 🚀 快速测试（立即可用）

你可以直接使用以下命令测试 ClawTrade 的生产环境：

### 1. 检查服务状态
```bash
curl https://clawtrade-production.up.railway.app/api/openclaw/status
```

### 2. 获取 BTC 交易建议
```bash
curl -X POST https://clawtrade-production.up.railway.app/api/openclaw/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "coin_id": "bitcoin",
    "symbol": "BTC",
    "user_cash": 10000
  }'
```

### 3. 获取 ETH 交易建议（有持仓）
```bash
curl -X POST https://clawtrade-production.up.railway.app/api/openclaw/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "coin_id": "ethereum",
    "symbol": "ETH",
    "current_price": 2500,
    "user_cash": 5000,
    "user_positions": {
      "ETH": {
        "amount": 2.5,
        "avgCost": 2200
      }
    }
  }'
```

### 4. 使用 Python 测试
```python
import requests

# 获取建议
response = requests.post(
    'https://clawtrade-production.up.railway.app/api/openclaw/suggest',
    json={
        'coin_id': 'bitcoin',
        'symbol': 'BTC',
        'user_cash': 10000
    }
)

print(response.json())
```

---

## 💬 联系方式

如有接口问题或需要技术支持，请联系 ClawTrade 开发团队。

**部署状态：**
- 生产环境：✅ 已部署到 Railway
- URL：https://clawtrade-production.up.railway.app
- 当前模式：Mock AI（等待接入真实 OpenClaw Agent）

**文档版本：** v1.0
**最后更新：** 2026-02-08
