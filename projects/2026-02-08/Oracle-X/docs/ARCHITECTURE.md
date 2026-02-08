# 系统架构文档

Oracle-X 采用现代化的全栈架构，融合前端展示、后端计算和 AI 分析三大核心模块。

---

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                        用户界面层                             │
│  ┌─────────────┐           ┌──────────────────────┐         │
│  │  Web 应用   │           │  Chrome 扩展         │         │
│  │  (Next.js)  │           │  (Side Panel)        │         │
│  └──────┬──────┘           └──────────┬───────────┘         │
└─────────┼──────────────────────────────┼─────────────────────┘
          │                              │
          └──────────────┬───────────────┘
                         │
          ┌──────────────▼──────────────────┐
          │       API 网关层 / 路由层        │
          │     (Next.js API Routes)       │
          │  ┌─────────────────────────┐   │
          │  │ /api/analyze            │   │
          │  │ /api/twitter-sentiment  │   │
          │  └─────────────────────────┘   │
          └──────────────┬──────────────────┘
                         │
          ┌──────────────▼──────────────────┐
          │        业务逻辑层                │
          │  ┌──────────┬──────────────┐    │
          │  │ 数据校验 │ 指标计算      │    │
          │  │ 数据预处理│ Prompt 构建 │    │
          │  └──────────┴──────────────┘    │
          └──────────────┬──────────────────┘
                         │
          ┌──────────────▼──────────────────┐
          │        外部服务层                │
          │  ┌──────────┬──────────────┐    │
          │  │ Binance  │ Step AI      │    │
          │  │ API      │ (阶跃星辰)    │    │
          │  │          │              │    │
          │  │ RapidAPI │              │    │
          │  │ (Twitter)│              │    │
          │  └──────────┴──────────────┘    │
          └─────────────────────────────────┘
```

---

## 核心模块

### 1. 前端层

#### Web 应用 (Next.js 14 App Router)

**技术栈：**

- React 18.3 + TypeScript 5.4
- Next.js 14.2.5 (App Router)
- CSS Modules
- lightweight-charts 5.1

**目录结构：**

```
app/
├── api/                 # API Routes
│   ├── analyze/
│   ├── twitter-sentiment/
│   └── ...
├── components/          # React 组件
│   ├── Header/
│   ├── MarketCard/
│   ├── TechnicalIndicators/
│   └── ...
├── hooks/               # 自定义 Hooks
│   ├── useBinanceData.ts
│   └── ...
├── globals.css
├── layout.tsx
└── page.tsx             # 主页面
```

**核心组件：**

1. **MarketCard**: 实时价格展示
2. **TechnicalIndicators**: 技术指标卡片
3. **UserProfile**: 用户画像分析
4. **AIAnalysisModal**: AI 分析弹窗（流式响应）
5. **ChartComponent**: K 线图表展示

#### Chrome 扩展

**结构：**

```
extension/
├── manifest.json        # 扩展配置
├── background.js        # 后台脚本
├── sidepanel/
│   ├── index.html
│   ├── panel.js
│   └── panel.css
└── icons/
```

**工作原理：**

1. 监听用户在交易所页面的操作
2. 侧边栏展示实时分析结果
3. 通过 `chrome.runtime.sendMessage` 与后台脚本通信
4. 调用主应用的 API 获取分析数据

---

### 2. API 层 (Next.js API Routes)

运行在 **Vercel Edge Runtime**，支持全球边缘节点部署。

#### 主要端点

**`/api/analyze` (POST)**

```typescript
// 数据流
Request → 参数校验 → K线处理 → 技术指标计算
       → Prompt构建 → 调用AI → SSE流式响应
```

**关键文件：**

- `app/api/analyze/route.ts`: 路由处理器
- `lib/validators.ts`: 参数校验
- `lib/kline-processor.ts`: K 线数据处理
- `lib/indicators.ts`: 技术指标计算
- `lib/prompt-builder.ts`: AI Prompt 构建
- `lib/ai-client.ts`: AI API 调用封装

---

### 3. 业务逻辑层

#### 技术指标计算 (`lib/indicators.ts`)

使用 [technicalindicators](https://github.com/anandanand84/technicalindicators) 库：

```typescript
import { RSI, MACD, BollingerBands, ATR } from 'technicalindicators';

export function calculateIndicators(klines: Kline[]) {
  const closes = klines.map(k => k.close);
  const highs = klines.map(k => k.high);
  const lows = klines.map(k => k.low);

  return {
    rsi: RSI.calculate({ values: closes, period: 14 }),
    macd: MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
    }),
    bb: BollingerBands.calculate({
      values: closes,
      period: 20,
      stdDev: 2,
    }),
    atr: ATR.calculate({
      high: highs,
      low: lows,
      close: closes,
      period: 14,
    }),
  };
}
```

#### Prompt 工程 (`lib/prompt-builder.ts`)

**系统 Prompt:**

- 定义 AI 角色（资深量化交易分析师）
- 设定输出格式（结构化分析）
- 明确禁止事项（不提供投资建议）

**用户 Prompt:**

- 市场数据（价格、涨跌幅、成交量）
- 技术指标（RSI、MACD、布林带、ATR）
- 交易意图（做多/做空）
- 用户画像（历史胜率、交易风格）

---

### 4. 外部服务层

#### Binance API

- **用途**: 获取实时市场数据和 K 线
- **端点**: `https://api.binance.com/api/v3/klines`
- **限流**: 1200 请求/分钟

#### Step AI (阶跃星辰)

- **用途**: 大语言模型 AI 分析
- **模型**: `step-3.5-flash` (默认)
- **特点**: 支持 SSE 流式响应
- **API**: `https://api.stepfun.com/v1/chat/completions`

#### RapidAPI (Twitter)

- **用途**: Twitter 情绪分析
- **服务**: twitter241
- **数据**: 推文、情绪评分、影响力 KOL

---

## 数据流

### 交易分析完整流程

```
1. 用户点击"做多"/"做空"按钮
   ↓
2. 前端调用 Binance API 获取 K 线数据
   ↓
3. POST 请求发送到 /api/analyze
   ↓
4. 后端校验参数 (validators.ts)
   ↓
5. 处理 K 线数据 (kline-processor.ts)
   - 数据清洗
   - 格式转换
   ↓
6. 计算技术指标 (indicators.ts)
   - RSI, MACD, BB, ATR
   ↓
7. 构建 AI Prompt (prompt-builder.ts)
   - 系统 Prompt + 用户 Prompt
   - 包含市场数据 + 技术指标
   ↓
8. 调用 Step AI API (ai-client.ts)
   - 流式请求
   - 设置温度、最大令牌数
   ↓
9. SSE 流式响应返回前端
   - 实时显示 AI 分析过程
   ↓
10. 分析完成，显示结论 Badge
    - 绿色: 建议执行
    - 黄色: 建议观望
    - 红色: 高风险警告
```

---

## 技术选型理由

| 技术                    | 选择原因                                   |
| ----------------------- | ------------------------------------------ |
| **Next.js 14**          | 支持 App Router、SSR、API Routes、边缘函数 |
| **TypeScript**          | 类型安全、大型项目可维护性                 |
| **Vercel Edge Runtime** | 全球边缘节点、低延迟、serverless           |
| **technicalindicators** | 成熟的技术分析库、支持主流指标             |
| **lightweight-charts**  | 高性能、TradingView 同源技术               |
| **Step AI**             | 国产模型、价格友好、支持流式响应           |

---

## 性能优化

### 前端

1. **React 18 Concurrent Features**
   - Suspense 边界处理异步组件
   - Transition API 优化 UI 响应

2. **图表性能**
   - lightweight-charts 使用 Canvas 渲染
   - 数据按需加载，避免一次性渲染大量数据

3. **代码分割**
   - Next.js 自动代码分割
   - 动态 import 懒加载非关键组件

### 后端

1. **边缘计算**
   - Vercel Edge Runtime 全球部署
   - 自动选择最近节点

2. **流式响应**
   - SSE 降低首字节时间 (TTFB)
   - 用户体验提升

3. **数据压缩**
   - K 线数据压缩传输
   - 只传递必要字段

---

## 扩展性设计

### 插件化架构

```
lib/
├── indicators/          # 技术指标（可扩展）
│   ├── rsi.ts
│   ├── macd.ts
│   └── custom-indicator.ts
├── data-sources/        # 数据源（可扩展）
│   ├── binance.ts
│   ├── coinbase.ts
│   └── custom-source.ts
└── ai-providers/        # AI 提供商（可扩展）
    ├── step-ai.ts
    ├── openai.ts
    └── custom-provider.ts
```

### 配置驱动

所有可配置项通过环境变量管理：

- AI 模型选择
- 技术指标参数
- API 超时时间
- 流式响应配置

---

## 安全设计

1. **API Key 保护**: 服务端环境变量，前端无法访问
2. **参数白名单校验**: 防止注入攻击
3. **请求大小限制**: 防止 Payload 攻击
4. **CORS 策略**: 限制跨域请求
5. **Rate Limiting**: 防止滥用（计划中）

---

## 部署架构

```
GitHub Repository
    ↓
[自动部署]
    ↓
Vercel Platform
    ↓
全球边缘节点 (CDN + Edge Functions)
    ↓
用户访问（最近节点响应）
```

---

## 未来架构演进

### Phase 1: 微服务化

- 将技术指标计算拆分为独立服务
- 引入消息队列处理异步任务

### Phase 2: 多模型集成

- 支持 OpenAI、Claude、Gemini 等多个 AI 模型
- 模型输出结果对比

### Phase 3: 实时数据流

- WebSocket 取代轮询
- 服务端推送价格变动

### Phase 4: 去中心化

- 用户数据存储在 IPFS
- 链上存储分析历史

---

## 参考资料

- [Next.js 文档](https://nextjs.org/docs)
- [Vercel Edge Runtime](https://vercel.com/docs/functions/edge-functions)
- [technicalindicators](https://github.com/anandanand84/technicalindicators)
- [Step AI API](https://platform.stepfun.com/docs/overview/概述)
