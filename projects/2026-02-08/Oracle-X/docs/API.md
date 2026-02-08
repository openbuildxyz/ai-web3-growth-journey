# API 文档

Oracle-X 提供 RESTful API 端点用于加密货币交易分析。

## 基础信息

- **Base URL**: `https://your-domain.vercel.app` (或本地 `http://localhost:3000`)
- **Content-Type**: `application/json`
- **响应格式**: JSON 或 SSE（服务器推送事件）

---

## 端点列表

### 1. 交易分析 API

**`POST /api/analyze`**

对指定交易进行多维度 AI 分析，返回风险评估和建议。

#### 请求参数

```typescript
interface AnalyzeRequest {
  symbol: string; // 交易对，如 "ETHUSDT", "BTCUSDT"
  direction: 'LONG' | 'SHORT'; // 交易方向
  marketData: {
    price: string; // 当前价格
    change24h: string; // 24小时涨跌幅
    volume: string; // 24小时成交量
    high24h: string; // 24小时最高价
    low24h: string; // 24小时最低价
    fearGreedIndex?: number; // 恐慌贪婪指数 (0-100)
    fearGreedLabel?: string; // 情绪标签
    klines: Array<{
      // K线数据（必需）
      time: number; // 时间戳（毫秒）
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
  };
}
```

#### 请求示例

```bash
curl -X POST https://your-domain.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ETHUSDT",
    "direction": "LONG",
    "marketData": {
      "price": "3842.50",
      "change24h": "-2.35",
      "volume": "125000",
      "high24h": "3920.00",
      "low24h": "3790.00",
      "fearGreedIndex": 25,
      "fearGreedLabel": "Extreme Fear",
      "klines": [
        {
          "time": 1707350400000,
          "open": 3850,
          "high": 3920,
          "low": 3840,
          "close": 3900,
          "volume": 5000
        }
        // ... 更多 K 线数据
      ]
    }
  }'
```

#### 响应格式

响应为 **Server-Sent Events (SSE)** 流式数据：

```
content-type: text/event-stream
cache-control: no-cache
connection: keep-alive

data: {"content": "【趋势分析】\n"}
data: {"content": "当前ETH处于下降通道..."}
data: {"content": "【波动性评估】\n"}
data: {"content": "市场波动率较高..."}
data: [DONE]
```

**事件类型：**

- `data: {\"content\": \"...\"}` - AI 分析文本片段
- `data: [DONE]` - 流式传输完成

#### 错误响应

```json
{
  "error": "Missing required field: symbol",
  "code": "VALIDATION_ERROR"
}
```

**常见错误代码：**

| 错误代码           | 描述           | HTTP 状态码 |
| ------------------ | -------------- | ----------- |
| `VALIDATION_ERROR` | 参数验证失败   | 400         |
| `MISSING_KLINES`   | 缺少 K 线数据  | 400         |
| `INVALID_SYMBOL`   | 不支持的交易对 | 400         |
| `AI_SERVICE_ERROR` | AI 服务异常    | 500         |
| `INTERNAL_ERROR`   | 服务器内部错误 | 500         |

---

### 2. Twitter 情绪分析 API

**`POST /api/twitter-sentiment`**

分析指定加密货币在 Twitter 上的社交情绪。

#### 请求参数

```typescript
interface TwitterSentimentRequest {
  symbol: string; // 加密货币符号，如 "ETH", "BTC"
}
```

#### 请求示例

```bash
curl -X POST https://your-domain.vercel.app/api/twitter-sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ETH"
  }'
```

#### 响应示例

```json
{
  "symbol": "ETH",
  "sentiment": {
    "overall": "neutral",
    "score": 0.15,
    "distribution": {
      "positive": 45,
      "neutral": 35,
      "negative": 20
    }
  },
  "topTweets": [
    {
      "text": "ETH is holding strong...",
      "author": "@cryptoanalyst",
      "likes": 1250,
      "sentiment": "positive"
    }
  ],
  "timestamp": 1707350400000
}
```

---

## 技术指标说明

系统自动计算以下技术指标（基于提供的 K 线数据）：

### RSI (相对强弱指标)

- **参数**: 14 周期
- **超买**: RSI > 70
- **超卖**: RSI < 30

### MACD (指数平滑移动平均线)

- **快线**: 12 周期 EMA
- **慢线**: 26 周期 EMA
- **信号线**: 9 周期 EMA

### 布林带 (Bollinger Bands)

- **中轨**: 20 周期 SMA
- **上轨**: 中轨 + 2 \* 标准差
- **下轨**: 中轨 - 2 \* 标准差

### ATR (真实波幅)

- **参数**: 14 周期
- 用于衡量市场波动性

---

## 速率限制

- **免费用户**: 10 请求/分钟
- **付费用户**: 100 请求/分钟

超出限制将返回 `429 Too Many Requests`。

---

## 最佳实践

1. **K 线数据量**: 建议提供至少 100 根 K 线数据以获得准确分析
2. **数据时效性**: 使用最新的市场数据以获得最佳结果
3. **错误处理**: 实现重试机制处理瞬时错误
4. **流式响应**: 使用 EventSource API 处理 SSE 流

---

## 客户端示例

### JavaScript (浏览器)

```javascript
const eventSource = new EventSource('/api/analyze', {
  method: 'POST',
  body: JSON.stringify({
    symbol: 'ETHUSDT',
    direction: 'LONG',
    marketData: {
      // ... your data
    },
  }),
});

eventSource.onmessage = event => {
  if (event.data === '[DONE]') {
    eventSource.close();
    return;
  }

  const data = JSON.parse(event.data);
  console.log(data.content);
};

eventSource.onerror = error => {
  console.error('SSE error:', error);
  eventSource.close();
};
```

### Node.js

```javascript
const response = await fetch('https://your-domain.vercel.app/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symbol: 'ETHUSDT',
    direction: 'LONG',
    marketData: {
      /* ... */
    },
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  console.log(chunk);
}
```

---

## 支持

如有 API 相关问题，请联系：

- GitHub Issues: https://github.com/yourusername/oracle-x/issues
- Email: your.email@example.com
