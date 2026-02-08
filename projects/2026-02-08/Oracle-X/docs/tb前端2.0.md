Oracle-X 前端完整集成方案：Binance真实数据 + 专业图表 + AI分析
核心答案：用 lightweight-charts + Binance WebSocket，一套组合拳搞定
你需要的不是一堆零散的组件拼凑，而是一条清晰的数据管线：

Plain Text

Binance REST API（历史K线）
↓
lightweight-charts（专业K线图渲染）
↓
Binance WebSocket（实时更新K线）
↓
trading-signals（计算技术指标）
↓
POST /api/analyze（打包发给后端AI）
↓
SSE 流式返回（前端渲染分析结果）
下面逐层拆解。

一、图表层：TradingView lightweight-charts
这是TradingView官方开源的轻量级图表库，免费、无需申请Key、MIT协议（需注明出处），是加密货币项目做K线图的事实标准。 1

属性 详情
包名 lightweight-charts
安装 npm install lightweight-charts
体积 ~45KB gzipped（极轻）
支持图表类型 Candlestick、Line、Area、Bar、Histogram
交互能力 缩放、拖拽、十字光标、Tooltip
React集成 官方有React教程，用 useRef + useEffect 即可
为什么选它而不是其他： 你的产品叫Oracle-X，面向的是交易者。交易者每天看的就是TradingView。当评委看到你的图表和TradingView一模一样的视觉风格时，会立刻产生"这是专业产品"的感觉。这种心理暗示比任何花哨的自定义图表都有效。 2

二、数据层：Binance API（REST + WebSocket 双通道）
2.1 初始加载：REST API 拿历史K线
Plain Text

GET https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1h&limit=100
免费、无需API Key、无需注册。 返回的是一个二维数组，每条K线包含：

索引 含义 用途
0 Open time (ms timestamp) 图表X轴
1 Open price K线开盘价
2 High price K线最高价
3 Low price K线最低价
4 Close price K线收盘价
5 Volume 成交量（柱状图）
6 Close time -
7 Quote asset volume USDT计价成交量
8 Number of trades 成交笔数
你需要把这个数组转换为 lightweight-charts 需要的格式：

TypeScript

// Binance返回的原始格式 → lightweight-charts需要的格式
{
time: openTime / 1000, // 秒级时间戳
open: parseFloat(kline[1]),
high: parseFloat(kline[2]),
low: parseFloat(kline[3]),
close: parseFloat(kline[4]),
}
2.2 实时更新：WebSocket 推送最新K线
Plain Text

wss://stream.binance.com:9443/ws/ethusdt@kline_1h
WebSocket每秒推送当前正在形成的K线数据。收到数据后：

如果 x === false（K线未收盘）→ 调用 candlestickSeries.update() 更新当前K线
如果 x === true（K线已收盘）→ 这根K线定型，下一根新K线开始
关键字段映射：

WebSocket字段 含义
k.t K线开始时间
k.o 开盘价
k.h 最高价
k.l 最低价
k.c 收盘价
k.v 成交量
k.x 是否已收盘（boolean）
3

三、完整的前端架构（升级版）
之前的方案是一个极简交易面板。现在你要"更完整"，那我们把页面升级为左右分栏布局，让它看起来像一个真正的交易终端：

Plain Text

┌─────────────────────────────────────────────────────────────┐
│ 🔮 Oracle-X ETH/USDT ▾ $3,842.50 ▼-2.35% │
├────────────────────────────────┬────────────────────────────┤
│ │ │
│ │ 📊 Technical Indicators │
│ K线图区域 │ ┌──────────────────────┐ │
│ (lightweight-charts) │ │ RSI(14) 72.3 ●超买│ │
│ │ │ MACD ▲ 金叉 Bullish│ │
│ - 蜡烛图 │ │ BB% 95% ●上轨 │ │
│ - 成交量柱状图 │ │ ATR 85.3 中等 │ │
│ - 可缩放/拖拽 │ └──────────────────────┘ │
│ │ │
│ │ 👤 Trading Profile │
│ │ ┌──────────────────────┐ │
│ │ │ Swing · L62% S41% │ │
│ │ │ Risk: Med · 147 txns │ │
│ │ └──────────────────────┘ │
│ │ │
│ │ 🌡️ Market Sentiment │
│ │ ┌──────────────────────┐ │
│ │ │ Fear & Greed: 25 │ │
│ │ │ ████░░░░░░ Ext. Fear │ │
│ │ └──────────────────────┘ │
│ │ │
├────────────────────────────────┤ ┌──────────┐┌──────────┐ │
│ 1h 4h 1d 1w (时间周期切换) │ │ 🟢 LONG ││ 🔴 SHORT │ │
└────────────────────────────────┴──┴──────────┘└──────────┘──┘
左侧（约60%宽度）： 专业K线图，带成交量副图，支持时间周期切换。这是"门面"，让产品看起来像一个真正的交易工具。

右侧（约40%宽度）： 指标面板 + 用户画像 + 市场情绪 + 操作按钮。这是"大脑"，展示Oracle-X的分析能力。

四、组件清单与职责（升级版）
4.1 新增/修改的组件
组件 职责 依赖
KlineChart.tsx 核心图表组件，渲染K线+成交量 lightweight-charts
TimeframeSelector.tsx 时间周期切换（1h/4h/1d/1w） 无
VolumeChart.tsx 成交量柱状图（集成在K线图下方） lightweight-charts
IndicatorPanel.tsx 右侧指标面板容器 无
IndicatorCard.tsx 单个指标卡片（RSI/MACD/BB/ATR） trading-signals
SentimentGauge.tsx 恐惧贪婪指数条形图 无
4.2 新增的Hooks
Hook 职责 数据源
useBinanceKlines(symbol, interval) 获取历史K线 + WebSocket实时更新 Binance REST + WS
useTechnicalIndicators(klines) 接收K线数据，计算所有技术指标 trading-signals
五、KlineChart.tsx 详细设计
这是整个前端最关键的新组件。

5.1 Props
Prop 类型 说明
klines KlineData[] K线数据数组
onKlineUpdate (kline: KlineData) => void K线更新回调（用于同步指标计算）
5.2 初始化流程
组件挂载时，用 useRef 创建一个容器div
调用 createChart(containerRef.current, options) 创建图表实例
调用 chart.addCandlestickSeries() 添加K线序列
调用 chart.addHistogramSeries() 添加成交量序列（放在K线下方，用不同的priceScale）
将 klines 数据通过 candlestickSeries.setData() 和 volumeSeries.setData() 灌入
调用 chart.timeScale().fitContent() 自动适配时间轴
5.3 图表配置
TypeScript

// 深色主题配置（与整体UI一致）
const chartOptions = {
layout: {
background: { color: '#0d1117' },
textColor: '#8b949e',
},
grid: {
vertLines: { color: '#1c2128' },
horzLines: { color: '#1c2128' },
},
crosshair: {
mode: 0, // Normal模式，十字光标跟随鼠标
},
rightPriceScale: {
borderColor: '#30363d',
},
timeScale: {
borderColor: '#30363d',
timeVisible: true,
secondsVisible: false,
},
}

// K线颜色配置
const candlestickOptions = {
upColor: '#3fb68b', // 涨 - 绿色
downColor: '#ff5353', // 跌 - 红色
borderUpColor: '#3fb68b',
borderDownColor: '#ff5353',
wickUpColor: '#3fb68b',
wickDownColor: '#ff5353',
}

// 成交量颜色配置
const volumeOptions = {
priceFormat: { type: 'volume' },
priceScaleId: 'volume', // 独立的价格轴
}

// 成交量区域占图表底部20%
chart.priceScale('volume').applyOptions({
scaleMargins: { top: 0.8, bottom: 0 },
})
5.4 实时更新逻辑
当WebSocket推送新K线数据时：

Plain Text

收到WebSocket消息
↓
解析 k.o, k.h, k.l, k.c, k.v, k.t, k.x
↓
构造 { time, open, high, low, close } 对象
↓
candlestickSeries.update(candleData) ← 更新/追加K线
volumeSeries.update(volumeData) ← 更新/追加成交量
↓
调用 onKlineUpdate(candleData) ← 通知父组件，触发指标重算
lightweight-charts 的 .update() 方法非常智能：如果传入的 time 和最后一根K线相同，它会更新那根K线；如果 time 更大，它会追加一根新K线。这正好和Binance WebSocket的行为匹配——未收盘的K线持续更新，收盘后推送新K线。

5.5 组件销毁
Plain Text

组件卸载时：

1. chart.remove() ← 销毁图表实例，释放Canvas
2. WebSocket.close() ← 关闭连接
   六、useBinanceKlines Hook 详细设计
   这个Hook是整个数据管线的核心，它同时管理REST初始加载和WebSocket实时更新。

6.1 接口定义
TypeScript

function useBinanceKlines(symbol: string, interval: string): {
klines: KlineData[]; // 完整K线数组（历史+实时）
currentPrice: string; // 最新价格
priceChange24h: string; // 24h涨跌幅
volume24h: string; // 24h成交量
loading: boolean; // 是否正在加载历史数据
connected: boolean; // WebSocket是否已连接
}
6.2 内部状态机
Plain Text

[INIT] → 发起REST请求拿历史K线
↓ 成功
[LOADED] → 建立WebSocket连接
↓ 连接成功
[STREAMING] → 持续接收实时数据
↓ 连接断开
[RECONNECTING] → 3秒后重连（最多5次）
↓ 重连成功
[STREAMING]
6.3 关键实现细节
REST请求：

Plain Text

GET https://api.binance.com/api/v3/klines
?symbol={symbol}
&interval={interval}
&limit=100
WebSocket连接：

Plain Text

wss://stream.binance.com:9443/ws/{symbol.toLowerCase()}@kline\_{interval}
symbol或interval变化时的处理：

关闭旧的WebSocket连接
清空klines状态
重新发起REST请求
建立新的WebSocket连接
24h涨跌幅的获取： K线WebSocket不直接提供24h涨跌幅。有两种方案：

方案A（推荐）： 同时建立一个 {symbol}@ticker 的WebSocket，专门获取24h统计数据
方案B： 组件挂载时用REST GET /api/v3/ticker/24hr?symbol={symbol} 拿一次，之后用K线数据自己算
方案A更准确，且之前的 useBinancePrice Hook已经实现了这个功能。两个WebSocket可以合并为一个Combined Stream：

Plain Text

wss://stream.binance.com:9443/stream?streams=ethusdt@kline_1h/ethusdt@ticker
这样只需要一个WebSocket连接就能同时拿到K线更新和24h行情数据。 3

七、useTechnicalIndicators Hook 详细设计
这个Hook接收K线数据，用 trading-signals 库计算所有技术指标，并格式化为可以直接展示在UI上和注入Prompt的结构。

7.1 接口定义
TypeScript

function useTechnicalIndicators(klines: KlineData[]): {
indicators: {
rsi: { value: number; signal: 'BULLISH' | 'BEARISH' | 'SIDEWAYS'; label: string };
macd: { macd: number; signal: number; histogram: number; crossover: string };
bollingerBands: { upper: number; middle: number; lower: number; percentB: number };
atr: { value: number; volatilityLevel: string };
};
// 格式化为文本，可直接注入Prompt
summaryText: string;
}
7.2 计算逻辑
从K线数组中提取收盘价数组 closes、最高价数组 highs、最低价数组 lows：

指标 trading-signals 用法 输出
RSI(14) new RSI(14) → 逐个 nextValue(close) 数值 + 信号状态
MACD(12,26,9) new MACD({ indicator: EMA, longInterval: 26, shortInterval: 12, signalInterval: 9 }) DIF、DEA、Histogram
Bollinger Bands(20,2) new BollingerBands(20, 2) → 逐个 nextValue(close) 上轨、中轨、下轨
ATR(14) new ATR(14) → 逐个 nextValue({ high, low, close }) 波动率数值
7.3 信号标签生成
Plain Text

RSI > 70 → "超买 (Overbought)" + BEARISH信号
RSI < 30 → "超卖 (Oversold)" + BULLISH信号
RSI 30-70 → "中性 (Neutral)" + SIDEWAYS信号

MACD Histogram > 0 且递增 → "金叉 (Golden Cross)" + BULLISH
MACD Histogram < 0 且递减 → "死叉 (Death Cross)" + BEARISH

BB %B > 0.95 → "触及上轨" + BEARISH
BB %B < 0.05 → "触及下轨" + BULLISH

ATR相对于价格的百分比：

> 3% → "高波动"
> 1-3% → "中等波动"
> < 1% → "低波动"
> 7.4 summaryText 输出格式
> 这个字段直接注入到后端Prompt中，是连接前端展示和AI分析的桥梁：

Plain Text

技术指标实时计算结果：

- RSI(14): 72.3 → 超买区域 (BEARISH)
- MACD(12,26,9): DIF 45.2 / DEA 38.1 / Histogram +7.1 → 金叉 (BULLISH)
- Bollinger Bands(20,2): 上轨 $3,950 / 中轨 $3,820 / 下轨 $3,690 / %B 95% → 触及上轨 (BEARISH)
- ATR(14): $85.3 (2.2%) → 中等波动

信号汇总: 4个指标中 2个看空 / 1个看多 / 1个中性
八、时间周期切换 TimeframeSelector.tsx
支持的周期
显示 Binance interval 含义
1H 1h 1小时K线（默认）
4H 4h 4小时K线
1D 1d 日K线
1W 1w 周K线
切换行为
用户点击不同周期时：

更新 interval 状态
useBinanceKlines 检测到 interval 变化 → 关闭旧WS → 重新REST加载 → 建立新WS
useTechnicalIndicators 检测到 klines 变化 → 重新计算所有指标
图表和指标面板同步更新
Demo价值： 评委看到你切换时间周期时，图表和指标同时刷新，会意识到这不是mock数据——这是真实的市场数据在实时计算。

九、数据流：从用户点击到AI分析
当用户点击 LONG 或 SHORT 时，前端需要把当前所有数据打包发给后端：

9.1 打包的数据结构
TypeScript

// 点击按钮时，从各个Hook中收集数据
const analysisRequest = {
symbol: "ETHUSDT",
direction: "LONG",
timeframe: "1h", // 当前选中的时间周期
marketData: {
price: currentPrice, // 来自 useBinanceKlines
change24h: priceChange24h, // 来自 useBinanceKlines
volume24h: volume24h, // 来自 useBinanceKlines
high24h: high24h,
low24h: low24h,
fearGreedIndex: fgiValue, // 来自 useFearGreed
fearGreedLabel: fgiLabel,
klines: klines.slice(-24), // 最近24根K线原始数据
},
indicators: {
rsi: indicators.rsi,
macd: indicators.macd,
bollingerBands: indicators.bollingerBands,
atr: indicators.atr,
summaryText: indicators.summaryText, // 格式化文本，直接注入Prompt
}
}
9.2 后端收到后的处理
后端不需要再自己算指标了（之前方案中的"数据预处理"步骤大幅简化）：

Plain Text

收到请求
↓
参数校验
↓
直接使用前端传来的 indicators.summaryText
↓
拼接K线摘要（从klines数组中提取趋势信息）
↓
构造Prompt（System + User + 指标数据 + K线摘要）
↓
调用AI API（stream: true）
↓
SSE流式返回
这意味着后端变得更薄了。 技术指标的计算全部在前端完成（trading-signals 是纯JS库，在浏览器中运行），后端只负责Prompt组装和AI API代理。这对5小时开发来说是好事——前后端可以更独立地开发。

十、完整依赖清单
Bash

# 核心

npm install lightweight-charts # K线图表
npm install trading-signals # 技术指标计算

# 已有（Next.js项目自带）

# react, react-dom, typescript, tailwindcss

# 可选

npm install clsx # 条件className
总共只新增2个npm包。 没有重型依赖，没有需要特殊配置的native模块，Vercel部署零障碍。
