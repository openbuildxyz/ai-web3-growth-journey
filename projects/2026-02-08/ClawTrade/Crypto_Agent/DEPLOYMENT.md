# Crypto Analysis API 部署指南

## 🚀 快速启动（本地测试）

### 1. 安装依赖
```bash
cd Crypto_Agent
pip install -r crypto_quant_agent/requirements.txt
```

### 2. 启动 API 服务
```bash
python api_server.py
```

服务将在 `http://localhost:8000` 启动

### 3. 测试接口
```bash
# 健康检查
curl http://localhost:8000/health

# 分析 BTC
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol": "BTC", "query": "现在适合买入吗？"}'

# 获取支持的币种
curl http://localhost:8000/api/supported-assets
```

---

## 📦 部署到 Railway

### 方法 1：通过 Railway CLI（推荐）

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 在 Crypto_Agent 目录下初始化项目
cd Crypto_Agent
railway init

# 4. 部署
railway up
```

### 方法 2：通过 GitHub

1. 将代码推送到 GitHub
2. 在 Railway 控制台连接 GitHub 仓库
3. 选择 `Crypto_Agent` 目录
4. Railway 会自动检测 Python 项目并部署

### 环境变量配置

在 Railway 控制台添加：

```
PORT=8000
GEMINI_API_KEY=你的Gemini_API_Key（如果需要）
```

---

## 🔗 集成到 ClawTrade 后端

### 1. 配置后端环境变量

在 `server/.env` 添加：
```bash
ANALYSIS_API_URL=https://your-analysis-api.up.railway.app
```

### 2. 重启后端
```bash
cd server
npm run dev
```

### 3. 测试完整流程

```bash
# 通过 ClawTrade 后端调用分析
curl -X POST http://localhost:3001/api/analysis/crypto \
  -H "Content-Type: application/json" \
  -d '{"symbol": "ETH", "query": "以太坊现在的趋势如何？"}'
```

---

## 🧪 测试用例

### 测试 1：BTC 分析
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC",
    "query": "比特币现在适合买入吗？"
  }'
```

### 测试 2：ETH 趋势分析
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ETH",
    "query": "以太坊未来走势如何？"
  }'
```

### 测试 3：SOL 风险评估
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "SOL",
    "query": "Solana 有什么风险？"
  }'
```

---

## 📊 API 响应示例

```json
{
  "success": true,
  "symbol": "BTC",
  "report": "【比特币 (BTC) 投资速报】\n\n✅ 核心观点: 技术面强势突破，短期看涨...\n\n📊 关键数据:\n- 当前价格: $81,234\n- 24h 涨跌: +2.3%\n- RSI: 62 (中性偏多)\n...",
  "metadata": {
    "asset": "BTC/USD",
    "chain": null,
    "supported_assets": ["BTC", "ETH", "SOL", "..."]
  }
}
```

---

## 🔧 故障排除

### 问题 1：依赖安装失败
```bash
# 使用国内镜像
pip install -r crypto_quant_agent/requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 问题 2：Gemini API 不可用
- 检查代理配置
- 确认 API Key 有效
- 查看 Crypto_Agent/crypto_quant_agent/config/settings.py

### 问题 3：Railway 部署失败
- 确认 requirements.txt 路径正确
- 检查 Python 版本（需要 3.9+）
- 查看 Railway 日志

---

## 🌐 架构图

```
┌─────────────┐
│   前端      │
│  (Vercel)   │
└──────┬──────┘
       │
       ↓
┌─────────────────────┐
│   ClawTrade 后端    │
│   (Railway)         │
│  Node.js/Express    │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│ Crypto Analysis API │
│    (Railway)        │
│   Python/Flask      │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│   Crypto Agent      │
│ - Binance API       │
│ - DefiLlama         │
│ - Gemini AI         │
└─────────────────────┘
```

---

## 📝 支持的币种

- BTC, ETH, SOL, BNB
- ARB, OP, ADA, DOT
- DOGE, AVAX, LINK, MATIC, UNI

查看完整列表：`GET /api/supported-assets`

---

**准备就绪！🎉 Crypto Agent API 现在可以部署和使用了。**
