# 🔍 Crypto 分析报告 API 文档

## 📌 基础信息

- **Base URL**: `http://localhost:3001` (开发环境) / `https://your-domain.com` (生产环境)
- **Content-Type**: `application/json`
- **前端调用方式**: 已封装在 `client/src/api.js` 中

---

## 1️⃣ 获取深度分析报告

### 接口信息
- **方法**: `POST`
- **路径**: `/api/analysis/crypto`
- **描述**: 调用 AI Agent 对指定加密货币进行深度分析

### 请求参数
```json
{
  "symbol": "BTC",           // 必填，币种代码（大写）
  "query": "现在适合买入吗？"  // 可选，自定义分析问题
}
```

### 支持的币种
```
BTC, ETH, SOL, BNB, ARB, OP, ADA, DOT, DOGE, AVAX, LINK, MATIC, UNI
```

### 成功响应
**状态码**: `200 OK`

```json
{
  "success": true,
  "symbol": "BTC",
  "report": "基于当前市场数据分析...",  // AI 生成的完整分析报告（Markdown 格式）
  "metadata": {
    "asset": "BTC/USD",
    "chain": null,
    "supported_assets": ["BTC", "ETH", "SOL", "BNB", ...]
  }
}
```

### 错误响应
**状态码**: `400 Bad Request` / `500 Internal Server Error`

```json
{
  "success": false,
  "message": "错误描述"
}
```

### cURL 示例
```bash
curl -X POST http://localhost:3001/api/analysis/crypto \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC",
    "query": "现在适合买入吗？"
  }'
```

### JavaScript 调用示例
```javascript
// 使用封装的函数（推荐）
import { analyzeCrypto } from './api.js';

// 基础调用
const result = await analyzeCrypto('BTC');

// 自定义问题
const result = await analyzeCrypto('ETH', '未来一周价格趋势预测');

console.log(result.report);  // 获取分析报告
```

```javascript
// 原生 fetch 调用
const response = await fetch('http://localhost:3001/api/analysis/crypto', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    symbol: 'BTC',
    query: '技术面分析'
  })
});

const data = await response.json();
if (data.success) {
  console.log(data.report);
}
```

---

## 2️⃣ 获取支持的币种列表

### 接口信息
- **方法**: `GET`
- **路径**: `/api/analysis/supported-assets`
- **描述**: 获取所有支持分析的加密货币列表

### 请求参数
无需参数

### 成功响应
**状态码**: `200 OK`

```json
{
  "success": true,
  "assets": [
    {
      "symbol": "BTC",
      "trading_pair": "BTC/USD",
      "chain": null
    },
    {
      "symbol": "ETH",
      "trading_pair": "ETH/USD",
      "chain": "Ethereum"
    },
    {
      "symbol": "SOL",
      "trading_pair": "SOL/USD",
      "chain": "Solana"
    }
    // ... 更多币种
  ]
}
```

### cURL 示例
```bash
curl http://localhost:3001/api/analysis/supported-assets
```

### JavaScript 调用示例
```javascript
import { getSupportedAssets } from './api.js';

const data = await getSupportedAssets();
console.log(data.assets);  // 获取币种列表

// 用于下拉菜单
data.assets.forEach(asset => {
  console.log(`${asset.symbol} - ${asset.trading_pair}`);
});
```

---

## 3️⃣ 检查分析服务状态

### 接口信息
- **方法**: `GET`
- **路径**: `/api/analysis/status`
- **描述**: 检查后端分析服务是否可用

### 请求参数
无需参数

### 成功响应（服务正常）
**状态码**: `200 OK`

```json
{
  "success": true,
  "analysis_service": {
    "status": "healthy",
    "service": "Crypto Analysis Agent",
    "version": "1.0.0"
  }
}
```

### 错误响应（服务不可用）
**状态码**: `503 Service Unavailable`

```json
{
  "success": false,
  "message": "分析服务不可用"
}
```

### cURL 示例
```bash
curl http://localhost:3001/api/analysis/status
```

### JavaScript 调用示例
```javascript
const response = await fetch('http://localhost:3001/api/analysis/status');
const data = await response.json();

if (data.success) {
  console.log('分析服务正常运行');
} else {
  console.error('分析服务不可用');
}
```

---

## 🛠️ 错误处理

### 常见错误码
| HTTP Code | 说明 | 解决方案 |
|-----------|------|----------|
| 400 | 请求参数错误（缺少 symbol 或不支持的币种） | 检查 symbol 是否在支持列表中 |
| 500 | 分析服务内部错误 | 检查后端日志，稍后重试 |
| 503 | 分析服务不可用 | 确认 Python 分析服务是否启动 |

### 错误处理最佳实践
```javascript
async function safeAnalyzeCrypto(symbol, query) {
  try {
    const result = await analyzeCrypto(symbol, query);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('分析失败:', error.message);

    // 返回友好的错误信息
    return {
      success: false,
      error: error.message || '分析服务暂时不可用，请稍后重试'
    };
  }
}

// 使用
const result = await safeAnalyzeCrypto('BTC', '市场分析');
if (result.success) {
  console.log(result.data.report);
} else {
  alert(result.error);
}
```

---

## 🚀 完整使用流程

### 推荐流程
```javascript
// 1. 检查服务状态（可选，推荐在应用启动时检查）
const statusCheck = async () => {
  const response = await fetch('http://localhost:3001/api/analysis/status');
  const data = await response.json();
  return data.success;
};

// 2. 获取支持的币种（可选，用于 UI 下拉菜单）
const { assets } = await getSupportedAssets();
const symbolList = assets.map(a => a.symbol);

// 3. 请求分析报告
const analysis = await analyzeCrypto('BTC', '技术面分析');

// 4. 渲染报告（使用 Markdown 渲染库）
import { marked } from 'marked';
const htmlContent = marked(analysis.report);
document.getElementById('report').innerHTML = htmlContent;
```

### React 组件示例
```jsx
import { useState } from 'react';
import { analyzeCrypto } from './api.js';
import ReactMarkdown from 'react-markdown';

function CryptoAnalysis() {
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (symbol) => {
    setLoading(true);
    try {
      const result = await analyzeCrypto(symbol);
      setReport(result.report);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => handleAnalyze('BTC')}>
        分析 BTC
      </button>
      {loading && <p>分析中...</p>}
      {report && <ReactMarkdown>{report}</ReactMarkdown>}
    </div>
  );
}
```

---

## 📦 前端 API 封装（可直接使用）

位于 `client/src/api.js`:

```javascript
/**
 * 深度分析加密货币
 * @param {string} symbol - 币种代码（如 'BTC'）
 * @param {string} query - 分析问题（可选）
 * @returns {Promise<Object>} 分析结果
 * @throws {Error} 分析失败时抛出错误
 */
export async function analyzeCrypto(symbol, query) {
  const res = await fetch(`${API_BASE_URL}/api/analysis/crypto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, query })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '分析失败');
  return data;
}

/**
 * 获取支持的分析币种
 * @returns {Promise<Object>} 币种列表
 */
export async function getSupportedAssets() {
  const res = await fetch(`${API_BASE_URL}/api/analysis/supported-assets`);
  return res.json();
}
```

---

## 🔧 环境配置

### 服务端配置
文件: `server/.env`

```bash
# 分析服务地址（Python API Server）
ANALYSIS_API_URL=http://localhost:8000  # 本地开发
# ANALYSIS_API_URL=https://your-railway-app.railway.app  # 生产环境

# 服务端口
PORT=3001

# CORS 配置
CORS_ORIGIN=http://localhost:5173
```

### 前端配置
文件: `client/.env`

```bash
# API 服务地址
VITE_API_URL=http://localhost:3001  # 本地开发
# VITE_API_URL=https://your-api.com  # 生产环境
```

### Python 分析服务配置
文件: `Crypto_Agent/.env`

```bash
# API 端口
PORT=8000

# API 密钥（如需要）
OPENAI_API_KEY=your_openai_api_key
TAVILY_API_KEY=your_tavily_api_key
```

---

## 📊 数据格式详解

### 分析报告格式（report 字段）
分析报告以 **Markdown 格式** 返回，通常包含以下部分：

```markdown
# BTC 市场分析报告

## 📈 当前价格
- 价格: $45,234.56
- 24h 涨跌: +2.34%
- 交易量: $28.5B

## 🔍 技术分析
- 支撑位: $44,000
- 阻力位: $47,000
- RSI: 65 (中性偏多)

## 💡 投资建议
基于当前市场情况...

## ⚠️ 风险提示
加密货币投资存在高风险...
```

### 完整响应示例
```json
{
  "success": true,
  "symbol": "BTC",
  "report": "# BTC 市场分析报告\n\n## 📈 当前价格\n- 价格: $45,234.56\n...",
  "metadata": {
    "asset": "BTC/USD",
    "chain": null,
    "supported_assets": [
      "BTC", "ETH", "SOL", "BNB", "ARB", "OP",
      "ADA", "DOT", "DOGE", "AVAX", "LINK", "MATIC", "UNI"
    ]
  }
}
```

---

## ⚡ 性能优化建议

### 1. 缓存策略
```javascript
// 简单内存缓存
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟

async function cachedAnalyzeCrypto(symbol, query) {
  const cacheKey = `${symbol}:${query || 'default'}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('使用缓存');
    return cached.data;
  }

  const data = await analyzeCrypto(symbol, query);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
```

### 2. 超时处理
```javascript
async function analyzeCryptoWithTimeout(symbol, query, timeout = 15000) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('请求超时')), timeout)
  );

  return Promise.race([
    analyzeCrypto(symbol, query),
    timeoutPromise
  ]);
}
```

### 3. 重试机制
```javascript
async function analyzeCryptoWithRetry(symbol, query, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await analyzeCrypto(symbol, query);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`重试 ${i + 1}/${maxRetries}...`);
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

---

## 📌 重要提示

### ⏱️ 响应时间
- **预估时间**: 3-10 秒（取决于币种和查询复杂度）
- **建议**: 前端显示 Loading 动画

### 📝 报告渲染
- **格式**: Markdown
- **推荐库**:
  - React: `react-markdown`
  - Vue: `vue-markdown`
  - 原生: `marked.js`

### 🔒 安全注意事项
- 不要在前端暴露 API 密钥
- 生产环境使用 HTTPS
- 考虑添加请求频率限制

### 💰 成本控制
- 建议使用缓存减少重复请求
- 可在后端添加请求频率限制
- 监控 AI API 调用量

---

## 🎯 OpenClaw 团队接入要点

### 核心接口
```
POST /api/analysis/crypto
```

### 必传参数
```json
{
  "symbol": "BTC",  // 13 种币种之一
  "query": "自定义问题"  // 可选
}
```

### 返回格式
```json
{
  "success": true,
  "report": "完整的 Markdown 格式分析报告"
}
```

### 支持币种
```
BTC, ETH, SOL, BNB, ARB, OP, ADA, DOT, DOGE, AVAX, LINK, MATIC, UNI
```

### 前端集成
```javascript
import { analyzeCrypto } from './api.js';

const result = await analyzeCrypto('BTC', '市场分析');
// result.report 即为完整报告（Markdown 格式）
```

---

## 📞 技术支持

如有问题，请检查：
1. Python 分析服务是否启动（端口 8000）
2. Node.js 后端服务是否启动（端口 3001）
3. 环境变量是否正确配置
4. 网络连接是否正常

---

**文档版本**: v1.0.0
**最后更新**: 2026-02-08
**维护团队**: ClawTrade Development Team
