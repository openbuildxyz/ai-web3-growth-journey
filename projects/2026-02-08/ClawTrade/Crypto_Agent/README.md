# 全维度加密量化看板 (Crypto-Quant Dashboard)

这是一个基于 AI 驱动的加密货币量化分析 Agent，旨在提供机构级的市场洞察。它融合了宏观经济数据、链上数据、技术指标以及市场情绪，生成简洁有力的投资速报。

## 核心特性

- **多维数据融合**: 整合 Crypto (Binance/Kraken), Macro (S&P 500, DXY), On-chain (DefiLlama), Sentiment (Alternative.me)。
- **AI 智能研报**: 集成 Gemini 2.0 Flash，生成"极度精简、观点鲜明"的中文投资速报 (Executive Summary)。
- **Agent 框架**: 自主执行 "感知-收集-分析-决策" 闭环，包含行业基准分析 (BTC/ETH/SOL)。

## 系统架构

项目采用模块化设计：

- `agent/`: 核心 Agent 逻辑，协调各模块工作。
- `data/`: 数据采集层，使用策略模式适配不同数据源 (Crypto, Macro, Onchain, Sentiment)。
- `analysis/`: 数据处理与计算引擎 (技术指标、相关性、行业对比)。
- `reporting/`: 研报生成器，对接 Gemini API。
- `config/`: 全局配置管理。

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置环境

本项目支持代理配置（推荐在中国大陆地区使用）：

```bash
export https_proxy=http://127.0.0.1:7897 
export http_proxy=http://127.0.0.1:7897 
export all_proxy=socks5://127.0.0.1:7897
```

*Gemini API Key 默认已配置在 `config/settings.py` 中。*

### 3. 运行 Agent

**基本用法**:
```bash
python -m crypto_quant_agent.main "BTC: 现在的趋势如何？"
```

**支持的资产**:
- BTC, ETH, SOL, BNB, ARB, OP 等。

**交互模式**:
直接运行 `python -m crypto_quant_agent.main` 进入交互式对话。

## 输出结果

运行结束后，系统会生成：
1.  **`report.txt`**: AI 生成的纯文本投资速报。
2.  终端直接输出简报内容。

## 技术栈

- **Language**: Python 3.9+
- **Data**: pandas, ccxt, yfinance, requests
- **AI**: google-generativeai (Gemini)

---
*Powered by Gemini 2.0 & Python Data Stack*

