# Oracle-X MVP 开发文档

# 后端开发文档

## 1. 项目概述

**后端形态：** Next.js API Routes（与前端同一项目，无需独立后端服务）
**运行时：** Vercel Edge Runtime
**核心职责：**

1. **数据中转与增强：**
   - 接收前端通过 **Binance REST API** 获取的K线数据 (无需API Key)
   - 使用 `technicalindicators` 库进行技术指标计算 (RSI, MACD, BB, ATR)
   - 将指标数值转化为自然语言描述，注入 Prompt
2. **AI 代理层：**
   - 保护 Step AI 的 API Key 不暴露给前端
   - 调用 AI 大模型 API (阶跃星辰)，将流式响应透传给前端

---

## 2. API端点设计

MVP只需要**一个端点**：

### `POST /api/analyze`

| 属性     | 值                        |
| -------- | ------------------------- |
| 路径     | `/api/analyze`            |
| 方法     | `POST`                    |
| Runtime  | `edge`                    |
| 请求格式 | `application/json`        |
| 响应格式 | `text/event-stream` (SSE) |
| 超时     | 30秒 (Edge Runtime)       |

---

## 3. 请求参数定义

### 3.1 Request Body Schema

```typescript
{
  symbol: string;          // 交易对，如 "ETHUSDT"
  direction: "LONG" | "SHORT";  // 交易方向
  marketData: {
    price: string;         // 当前价格
    change24h: string;     // 24h涨跌幅百分比
    volume: string;        // 24h成交量
    high24h: string;       // 24h最高价
    low24h: string;        // 24h最低价
    fearGreedIndex: number | null;  // FGI值，可能为null
    fearGreedLabel: string | null;  // FGI标签
    klines: KlineData[] | null;     // K线数据，可能为null
  }
}
```

### 3.2 参数校验规则

| 字段                        | 校验                                                       | 失败处理           |
| --------------------------- | ---------------------------------------------------------- | ------------------ |
| `symbol`                    | 必填，必须在允许列表中 `["ETHUSDT", "BTCUSDT", "SOLUSDT"]` | 返回400            |
| `direction`                 | 必填，必须为 `"LONG"` 或 `"SHORT"`                         | 返回400            |
| `marketData.price`          | 必填                                                       | 返回400            |
| `marketData.klines`         | **必填** (需传入Binance API获取的最近24根1h K线数据)       | 返回400            |
| `marketData.fearGreedIndex` | 可选                                                       | Prompt中跳过该维度 |

---

## 4. 处理流程

```
请求进入
  │
  ▼
[1] 参数校验
  │ 失败 → 返回 400 { error: "Invalid parameters" }
  ▼
[2] 数据预处理
  │ - 将K线数组压缩为文本摘要
  │ - 计算简单技术指标
  ▼
[3] Prompt构造
  │ - 组装System Prompt
  │ - 组装User Prompt（含市场数据）
  ▼
[4] 调用AI API (stream: true)
  │ 失败 → 返回 500 { error: "AI service unavailable" }
  ▼
[5] 流式透传
  │ - 读取AI响应流
  │ - 转换为SSE格式
  │ - 逐chunk发送给前端
  ▼
[6] 流结束
  │ - 发送 data: [DONE]
  ▼
完成
```

---

## 5. 数据预处理逻辑

### 5.1 K线数据压缩

AI的Context Window有限，不能直接传24根K线的原始数据。需要预处理为文本摘要。

**压缩策略：**

从24根1h K线中提取以下信息：

1. **价格走势概述：** 24小时前的价格 vs 当前价格，整体方向
2. **关键价位：** 24h内的最高点和最低点及其出现时间
3. **成交量趋势：** 最近6根K线的成交量 vs 之前18根的平均成交量，判断放量/缩量
4. **波动率：** 计算24根K线收盘价的标准差，归一化为百分比
5. **连续涨跌：** 最近连续上涨/下跌的K线数量

**输出格式（纯文本，嵌入Prompt）：**

```
24h价格走势: 从 $3,800 到 $3,842 (+1.1%)
24h最高: $3,920 (12小时前)
24h最低: $3,790 (18小时前)
成交量趋势: 近6h平均成交量较前18h放大23%
波动率: 2.8% (中等)
最近走势: 连续3根阳线
```

### 5.2 技术指标计算（使用 `technicalindicators` 库）

后端需引入 `technicalindicators` 库进行计算，并将结果 **格式化为自然语言描述** 注入Prompt。

**计算指标列表：**

| 指标                       | 参数      | 信号判断逻辑 (后端预计算)                                  |
| :------------------------- | :-------- | :--------------------------------------------------------- |
| **RSI (14)**               | 14        | >70 (BEARISH/超买), <30 (BULLISH/超卖), 30-70 (NEUTRAL)    |
| **MACD (12,26,9)**         | 12, 26, 9 | Histogram > 0 (BULLISH/金叉), < 0 (BEARISH/死叉)           |
| **Bollinger Bands (20,2)** | 20, 2     | 价格位置 > 95% (BEARISH/上轨阻力), < 5% (BULLISH/下轨支撑) |
| **ATR (14)**               | 14        | 数值越高波动率越大                                         |

**输出格式示例（注入Prompt用）：**

```text
技术指标计算结果：
- RSI(14): 72.3 → 信号: BEARISH（超买区域）
- MACD: DIF 45.2, DEA 38.1, Histogram 7.1 → 信号: BULLISH（金叉）
- Bollinger Bands: 上轨 $3,950 / 中轨 $3,820 / 下轨 $3,690
  当前价格位于上轨附近（95%位置）→ 信号: BEARISH
- ATR(14): 85.3 → 波动率中等
```

---

## 6. Prompt工程

### 6.1 System Prompt

```
你是 Oracle-X，一个专业的加密货币交易风险评估引擎。你的职责是在用户执行交易前，基于当前市场数据进行多维度分析，帮助用户做出更明智的决策。

你的分析原则：
1. 客观中立：基于数据说话，不带情绪偏见
2. 风险优先：宁可错过机会，不可忽视风险
3. 简洁专业：每个维度2-3句话，不说废话
4. 明确结论：必须给出三级建议之一

输出格式要求：
- 使用以下固定结构输出
- 每个维度用【】标记标题
- 最终结论必须包含且仅包含以下三个emoji标记之一：🟢、🟡、🔴

输出结构：
【趋势分析】...
【波动性评估】...
【量价关系】...
【市场情绪】...（如有FGI数据）
【风险评估】...

---
最终建议：
🟢 建议执行 / 🟡 建议观望 / 🔴 高风险警告
（一句话总结理由）
```

### 6.2 User Prompt 模板

```
用户即将对 {symbol_display} 执行【{direction_cn}】操作。

当前市场数据快照：
- 当前价格: ${price}
- 24h涨跌: {change24h}%
- 24h成交量: {volume} {base_asset}
- 24h最高/最低: ${high24h} / ${low24h}
{fgi_section}
{klines_section}
{indicators_section}

请基于以上数据进行分析。
```

**动态段落：**

`{fgi_section}`（当FGI数据可用时）：

```
- 市场恐惧贪婪指数: {value}/100 ({label})
```

当FGI不可用时，此段留空。

`{klines_section}`（当K线数据可用时）：

```
最近24小时K线摘要：
{compressed_klines_text}
```

当K线不可用时：

```
注意：K线数据暂时不可用，请基于现有数据进行分析。
```

`{indicators_section}`（包含后端计算的详细指标）：

```
{formatted_indicators_text}
```

_(注：后端需将RSI、MACD、BB、ATR计算结果拼接为完整的文本块传入，格式参考 5.2 节示例)_

### 6.3 方向映射

| direction | direction_cn | symbol_display                |
| --------- | ------------ | ----------------------------- |
| `"LONG"`  | `做多`       | `"ETH/USDT"` (从symbol中解析) |
| `"SHORT"` | `做空`       | 同上                          |

---

## 7. AI API调用规范

## 7. AI API调用规范

### 7.1 主选方案：阶跃星辰 (Step AI)

使用阶跃星辰大模型作为核心分析引擎，该模型在逻辑推理与长文本处理上表现优异。

| 配置项      | 值                                                  |
| ----------- | --------------------------------------------------- |
| Endpoint    | `https://api.stepfun.com/v1/chat/completions`       |
| Model       | `step-1-8k` (通用分析) 或 `step-1-flash` (极速响应) |
| Temperature | `0.3`（保持分析客观性与一致性）                     |
| Max Tokens  | `1000`                                              |
| Stream      | `true`                                              |

**请求头：**

```
Authorization: Bearer {STEP_API_KEY}
Content-Type: application/json
```

**请求体结构（兼容OpenAI接口）：**

```json
{
  "model": "step-1-8k",
  "messages": [
    { "role": "system", "content": "{system_prompt}" },
    { "role": "user", "content": "{user_prompt}" }
  ],
  "temperature": 0.3,
  "max_tokens": 1000,
  "stream": true
}
```

### 7.2 API Key 配置

请确保在 `.env.local` 中配置以下环境变量：

```bash
# 阶跃星辰 API Key
```

_(注意：生产环境中请勿将Key直接提交到代码库，应通过Vercel Dashboard配置环境变量)_

---

## 8. SSE流式响应格式

### 8.1 响应头

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

### 8.2 数据格式

每个chunk的格式：

```
data: {"content": "文本片段"}\n\n
```

流结束标记：

```
data: [DONE]\n\n
```

### 8.3 AI API流到SSE流的转换逻辑

**OpenAI流式响应的原始格式：**

```
data: {"choices":[{"delta":{"content":"文本片段"}}]}
```

**转换步骤：**

1. 读取AI API的流式响应
2. 按行解析，提取 `choices[0].delta.content`
3. 如果 `content` 存在且非空，包装为 `data: {"content": "..."}\n\n` 发送
4. 如果收到 `data: [DONE]`，透传给前端

---

## 9. 错误处理

### 9.1 HTTP错误码

| 状态码 | 场景           | 响应体                                                        |
| ------ | -------------- | ------------------------------------------------------------- |
| 400    | 参数校验失败   | `{ "error": "Invalid parameters", "detail": "具体原因" }`     |
| 405    | 非POST请求     | `{ "error": "Method not allowed" }`                           |
| 500    | AI API调用失败 | `{ "error": "AI service unavailable", "detail": "具体错误" }` |
| 500    | 未知内部错误   | `{ "error": "Internal server error" }`                        |

### 9.2 流中断处理

如果AI API在流式传输过程中断开：

- 捕获异常
- 尝试发送一个最终的SSE事件：`data: {"error": "Stream interrupted"}\n\n`
- 然后发送 `data: [DONE]\n\n`
- 前端收到error事件后显示重试按钮

---

## 10. 环境变量

| 变量名           | 必填 | 说明                     | 示例                                                                |
| ---------------- | ---- | ------------------------ | ------------------------------------------------------------------- |
| `STEP_API_KEY`   | 是   | 阶跃星辰 API Key         | `7j3FucJpns4IMlVfBvRC6OBFb31Y5uugzFhf5EG2rx2pipQDnKPZBIyb9zCC8S7yx` |
| `AI_MODEL`       | 否   | 模型名，默认 `step-1-8k` | `step-1-flash`                                                      |
| `AI_BASE_URL`    | 否   | AI API基础URL            | `https://api.stepfun.com/v1`                                        |
| `AI_TEMPERATURE` | 否   | 温度参数，默认 `0.3`     | `0.5`                                                               |
| `AI_MAX_TOKENS`  | 否   | 最大token数，默认 `1000` | `800`                                                               |

通过 `AI_BASE_URL` 的配置，可以在不修改代码的情况下切换 OpenAI / 智谱 / Kimi 三个服务。

---

## 11. 安全考虑

### 11.1 API Key保护

- API Key仅存在于服务端环境变量中，前端永远无法访问
- 在Edge Runtime中通过 `process.env` 读取

### 11.2 请求限制

- MVP阶段不做复杂的Rate Limiting
- 但在参数校验中限制 `symbol` 必须在白名单内，防止注入
- `klines` 数组长度限制为最多 50 条，防止超大payload

### 11.3 Prompt注入防护

- `marketData` 中的所有字段都是数字/固定枚举值，不存在用户自由输入的文本
- `direction` 通过白名单校验
- 不存在Prompt注入风险
