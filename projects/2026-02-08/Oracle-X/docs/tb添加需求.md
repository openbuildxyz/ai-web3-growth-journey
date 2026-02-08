Oracle-X MVP 实现方案：Chrome Extension + 视觉监听
一、整体架构概览
整个系统分为三层：浏览器插件层（前端）、分析服务层（后端）、外部数据层（第三方 API）。信息流是单向管线式的：

Plain Text

Chrome Extension（截图 + 用户意图）
↓
Backend API（识别 → 数据获取 → 指标计算 → LLM 分析）
↓
Chrome Extension（结果渲染）
二、Chrome Extension 层
2.1 插件形态
采用 Manifest V3 规范开发，包含以下组件：

组件 职责
Service Worker (background.js) 监听用户触发事件（点击图标 / 快捷键），调用 captureVisibleTab() 截图，与后端通信
Side Panel 主要的结果展示区域，固定在浏览器右侧，用户不离开交易页面即可查看分析结果
Popup（可选） 极简状态指示器，显示"分析中…"或快速设置入口
2.2 权限声明
插件需要申请的权限极少，保持最小权限原则：

activeTab：仅在用户主动触发时获取当前标签页的截图权限
sidePanel：启用侧边栏面板
storage：存储用户偏好设置（如风险偏好、常用交易对）
不需要 tabs、webRequest、<all_urls> 等敏感权限，这对用户信任和应用商店审核都是加分项。

2.3 用户交互流程
触发方式（二选一，建议都支持）：

点击浏览器工具栏的 Oracle-X 图标
自定义快捷键（如 Ctrl+Shift+O）
触发后的流程：

截图阶段：Service Worker 调用 captureVisibleTab()，获取当前可见页面的 base64 PNG 图片。这一步是瞬时完成的，用户无感知。

Side Panel 弹出：自动打开右侧面板，进入"分析中"状态。面板内显示截图缩略图 + 加载动画，让用户确认"Oracle-X 看到了什么"。

识别结果确认：后端返回识别结果后，面板显示"检测到 Binance · BTC/USDT 永续合约"，同时出现意图选择：做多 / 做空 / 仅分析市场。这一步既是功能需要（补全用户意图），也是一个信任建立的交互——用户看到 AI 准确识别了自己的交易场景。

分析结果流式输出：用户选择意图后，面板切换到结果视图，内容以 SSE 流式方式逐步呈现。

2.4 Side Panel 界面结构
Side Panel 是用户与 Oracle-X 交互的唯一界面，需要在有限的宽度（约 360-420px）内高效传达信息。布局分为四个区块，从上到下依次是：

区块一：场景识别卡片 展示 AI 识别出的平台 Logo、交易对名称、合约类型。附带一个"重新截图"按钮，允许用户刷新。

区块二：Alpha Score 仪表盘 一个圆形仪表盘，中心显示 0-100 的综合评分，颜色从红（强烈不建议）到绿（强烈建议）渐变。仪表盘下方用一句话总结："当前市场环境对做多 BTC/USDT 呈 中度有利。"

区块三：多维分析雷达图 + 展开详情 一个五维雷达图，维度包括：趋势强度、动量、波动率、市场情绪、量价关系。每个维度可点击展开，查看具体指标数据和 AI 的解读。

区块四：AI 建议（流式输出） 最核心的区域。以自然语言给出结构化建议，包括：方向判断、建议入场区间、止损位、止盈目标、风险提示。文字以打字机效果逐字出现，增强"AI 正在思考"的感知。

三、后端分析服务层
3.1 技术选型
组件 选择 理由
框架 Next.js API Routes 或 FastAPI 前者与前端同栈，后者 Python 生态对数据处理更友好
多模态 LLM GPT-4o（首选）/ Kimi Vision / 智谱 GLM-4V 场景识别需要强视觉理解能力
文本 LLM GPT-4o 或赞助商模型 综合分析与建议生成
技术指标计算 trading-signals（Node）或 pandas-ta（Python） 成熟的开源指标库
市场数据 Binance 公开 API 无需 API Key，覆盖主流交易对
3.2 API 设计
整个后端只需要暴露 两个端点：

端点一：POST /api/recognize

输入：base64 截图图片
输出：JSON 格式的识别结果 { platform, pair, trade_type, direction_hint }
职责：调用多模态 LLM 识别截图中的交易平台和交易对
响应时间目标：1-2 秒
端点二：POST /api/analyze（SSE 流式响应）

输入：{ pair, trade_type, user_intent, user_profile? }
输出：SSE 事件流，依次推送各分析模块的结果
职责：获取市场数据 → 计算技术指标 → 组装 Prompt → 调用 LLM → 流式返回
SSE 事件序列：
event: market_data — 推送原始市场数据摘要（当前价、24h 涨跌幅、成交量）
event: indicators — 推送技术指标计算结果（RSI、MACD、布林带等）
event: alpha_score — 推送综合评分
event: analysis_stream — 流式推送 AI 分析文本（逐 token）
event: done — 分析完成信号
3.3 后端处理管线（Pipeline）
当 /api/analyze 被调用后，后端按以下顺序执行：

Step 1：市场数据获取（并行请求）

同时向 Binance API 发起多个请求：

K 线数据：GET /api/v3/klines，拉取 1h 和 4h 两个时间周期，各 100 根
最新价格与 24h 统计：GET /api/v3/ticker/24hr
深度数据：GET /api/v3/depth，获取买卖盘口前 20 档
资金费率（永续合约）：GET /fapi/v1/fundingRate
所有请求并行发出，总耗时取决于最慢的那个，通常在 200-500ms。

Step 2：技术指标计算

基于拿到的 K 线数据，使用 trading-signals 或 pandas-ta 在服务端计算以下指标：

趋势类：EMA(7/25/99)、MACD(12,26,9)
动量类：RSI(14)、Stochastic RSI
波动率类：Bollinger Bands(20,2)、ATR(14)
量价类：OBV、VWAP
计算是纯数学运算，耗时可忽略不计（<50ms）。

Step 3：Prompt 组装与 LLM 调用

将所有数据组装成一个结构化的 Prompt，发送给 LLM。Prompt 的核心结构如下：

Plain Text

System: 你是 Oracle-X，一个专业的加密货币交易分析师...

Context:

- 交易对: BTC/USDT 永续合约
- 用户意图: 做多
- 用户画像: [如有] 偏好短线、风险承受中等
- 当前价格: $97,432
- 24h 涨跌: +2.3%
- 技术指标: RSI=62, MACD=柱状图翻红第3根, 价格在布林带中轨上方...
- 买卖盘深度: 卖方挂单在 $98,000 处有大额阻力...
- 资金费率: 0.01%（正常偏多）

Task: 基于以上数据，给出综合评分(0-100)和详细分析...
LLM 以流式方式返回结果，后端通过 SSE 逐 token 转发给前端。

四、外部数据层
4.1 Binance 公开 API
MVP 阶段只对接 Binance 一个数据源，原因是：覆盖面最广（几乎所有主流交易对都有）、公开接口无需认证、文档完善、稳定性高。

API 用途 是否需要 Key
GET /api/v3/klines K 线历史数据 ❌
GET /api/v3/ticker/24hr 24h 行情统计 ❌
GET /api/v3/depth 订单簿深度 ❌
GET /fapi/v1/fundingRate 永续合约资金费率 ❌
GET /fapi/v1/openInterest 持仓量 ❌
重要说明： 即使用户截图的是 OKX 或 Uniswap 的界面，后端依然使用 Binance 的数据来分析同一个交易对。对于 MVP 来说，这完全合理——Binance 的流动性最深，价格最具代表性。未来版本可以根据识别出的平台切换数据源。

4.2 多模态 LLM API
用于截图识别和综合分析。MVP 阶段建议使用 GPT-4o，因为它的视觉理解能力目前最强，对交易界面的识别准确率最高。如果黑客松有赞助商模型（如 Kimi、智谱），可以在综合分析阶段替换以展示赞助商集成。

五、数据流完整时序
以一次完整的用户操作为例，从触发到结果展示的全流程：

Plain Text

T+0s 用户在 Binance 看 BTC/USDT，按下 Ctrl+Shift+O
T+0.05s Extension 截取当前页面，获得 base64 图片
T+0.1s Side Panel 打开，显示截图缩略图 + "识别中..."
T+0.1s Extension 发送截图到 POST /api/recognize
T+1.5s 后端返回 { platform: "Binance", pair: "BTC/USDT", type: "perpetual" }
T+1.5s Side Panel 显示识别结果，等待用户选择意图
T+3s 用户点击"做多"
T+3s Extension 发送分析请求到 POST /api/analyze (SSE)
T+3.3s 后端并行拉取 Binance 市场数据（~300ms）
T+3.4s 后端计算技术指标（~50ms）
T+3.5s SSE 推送 market_data 事件 → Side Panel 渲染行情摘要
T+3.6s SSE 推送 indicators 事件 → Side Panel 渲染雷达图
T+3.8s SSE 推送 alpha_score 事件 → Side Panel 渲染仪表盘
T+4-8s SSE 流式推送 analysis_stream → Side Panel 逐字渲染 AI 建议
T+8s SSE 推送 done → 分析完成
从用户按下快捷键到看到第一个有意义的信息（识别结果），约 1.5 秒。到完整分析结果呈现，约 5-8 秒。 这个体验在黑客松 Demo 中是完全可接受的。

六、Personal Profiling 的 MVP 模拟策略
在 Side Panel 的设置区域，提供一个简单的"交易风格"选择器：

风格选项：保守型 / 均衡型 / 激进型
偏好选项：短线（<4h）/ 波段（1-7d）/ 趋势（>7d）
用户的选择会被注入到 LLM 的 Prompt 中，作为 user_profile 参数。例如，一个"激进型 + 短线"用户会收到更关注动量指标和短期入场点的建议，而"保守型 + 趋势"用户会收到更关注大周期趋势和风险控制的建议。

这在技术上只是 Prompt 的条件分支，但在叙事上可以讲成"Oracle-X 根据你的交易风格提供个性化建议"，为未来真正的历史数据学习埋下伏笔。
