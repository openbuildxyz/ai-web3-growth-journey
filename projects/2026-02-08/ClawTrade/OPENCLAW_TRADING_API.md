# 🚀 OpenClaw 交易接口集成文档

> ClawTrade 交易执行 API - OpenClaw 自动交易集成指南

---

## 📋 概述

本文档说明 OpenClaw 如何通过 API 直接执行买入/卖出操作，并获取交易结果。

**核心流程：**
```
OpenClaw 分析 → 决定买入/卖出 → 调用 Railway API → 执行交易 → 返回结果
```

---

## 🌐 API 基础信息

| 环境 | Base URL |
|------|----------|
| **生产环境** | `https://clawtrade-production.up.railway.app` |
| **本地开发** | `http://localhost:3001` |

**健康检查：**
```bash
curl https://clawtrade-production.up.railway.app/health
```

---

## 📡 交易接口规范

### 1. 买入接口

**端点：** `POST /api/trade/buy`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `coin_id` | string | ✅ | CoinGecko 币种 ID | `"bitcoin"` |
| `symbol` | string | ✅ | 币种符号 | `"BTC"` |
| `name` | string | ❌ | 币种名称 | `"Bitcoin"` |
| `icon` | string | ❌ | 币种图标 | `"₿"` |
| `amount_usd` | number | ✅ | 购买金额（美元） | `1000` |
| `source` | string | ❌ | 交易来源标识 | `"OPENCLAW"` |

**请求示例：**
```json
{
  "coin_id": "bitcoin",
  "symbol": "BTC",
  "name": "Bitcoin",
  "icon": "₿",
  "amount_usd": 1000,
  "source": "OPENCLAW"
}
```

**成功响应：**
```json
{
  "success": true,
  "message": "✅ 买入 0.01234567 BTC @ $81000.00",
  "new_balance": 99000,
  "trade": {
    "type": "BUY",
    "symbol": "BTC",
    "amount": 0.01234567,
    "price": 81000,
    "total": 1000
  }
}
```

**失败响应：**
```json
{
  "success": false,
  "message": "余额不足，当前余额: $500.00"
}
```

**HTTP 状态码：**
- `200 OK` - 成功
- `400 Bad Request` - 参数错误或余额不足
- `500 Internal Server Error` - 服务器错误

---

### 2. 卖出接口

**端点：** `POST /api/trade/sell`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `coin_id` | string | ✅ | CoinGecko 币种 ID | `"bitcoin"` |
| `symbol` | string | ✅ | 币种符号 | `"BTC"` |
| `amount_usd` | number | ✅ | 卖出金额（美元） | `500` |
| `source` | string | ❌ | 交易来源标识 | `"OPENCLAW"` |

**请求示例：**
```json
{
  "coin_id": "bitcoin",
  "symbol": "BTC",
  "amount_usd": 500,
  "source": "OPENCLAW"
}
```

**成功响应：**
```json
{
  "success": true,
  "message": "✅ 卖出 0.00617284 BTC @ $81000.00",
  "new_balance": 99500,
  "trade": {
    "type": "SELL",
    "symbol": "BTC",
    "amount": 0.00617284,
    "price": 81000,
    "total": 500
  }
}
```

**失败响应：**
```json
{
  "success": false,
  "message": "无 BTC 持仓可卖出"
}
```

---

### 3. 查询持仓接口

**端点：** `GET /api/portfolio`

**响应示例：**
```json
{
  "success": true,
  "cash": 98500,
  "totalValue": 105000,
  "positions": [
    {
      "symbol": "BTC",
      "amount": 0.5,
      "avgCost": 79000,
      "currentPrice": 81000,
      "value": 40500,
      "pnl": 2500,
      "pnlPercent": 3.16
    }
  ]
}
```

---

### 4. 交易历史接口

**端点：** `GET /api/trade/history`

**响应示例：**
```json
{
  "success": true,
  "trades": [
    {
      "id": 1,
      "type": "buy",
      "symbol": "BTC",
      "amount": 0.01234567,
      "price": 81000,
      "total": 1000,
      "source": "OPENCLAW",
      "time": "2026-02-08 14:30:00"
    }
  ]
}
```

---

## 🐍 Python SDK

### 完整代码

```python
import requests
from typing import Optional, Dict, Any

class ClawTradeAPI:
    """ClawTrade 交易 API 客户端"""

    def __init__(self, base_url: str = "https://clawtrade-production.up.railway.app"):
        self.base_url = base_url
        self.headers = {"Content-Type": "application/json"}

    def buy(
        self,
        coin_id: str,
        symbol: str,
        amount_usd: float,
        name: str = "",
        icon: str = "●"
    ) -> Optional[Dict[str, Any]]:
        """
        买入加密货币

        Args:
            coin_id: CoinGecko 币种 ID (如 "bitcoin")
            symbol: 币种符号 (如 "BTC")
            amount_usd: 购买金额（美元）
            name: 币种名称（可选）
            icon: 币种图标（可选）

        Returns:
            成功返回交易结果，失败返回 None
        """
        url = f"{self.base_url}/api/trade/buy"
        payload = {
            "coin_id": coin_id,
            "symbol": symbol,
            "name": name or symbol,
            "icon": icon,
            "amount_usd": amount_usd,
            "source": "OPENCLAW"
        }

        try:
            response = requests.post(url, json=payload, headers=self.headers, timeout=10)
            result = response.json()

            if result.get('success'):
                print(f"✅ {result['message']}")
                print(f"💰 剩余余额: ${result['new_balance']:.2f}")
                return result
            else:
                print(f"❌ 买入失败: {result.get('message')}")
                return None
        except Exception as e:
            print(f"❌ 请求异常: {e}")
            return None

    def sell(
        self,
        coin_id: str,
        symbol: str,
        amount_usd: float
    ) -> Optional[Dict[str, Any]]:
        """
        卖出加密货币

        Args:
            coin_id: CoinGecko 币种 ID
            symbol: 币种符号
            amount_usd: 卖出金额（美元）

        Returns:
            成功返回交易结果，失败返回 None
        """
        url = f"{self.base_url}/api/trade/sell"
        payload = {
            "coin_id": coin_id,
            "symbol": symbol,
            "amount_usd": amount_usd,
            "source": "OPENCLAW"
        }

        try:
            response = requests.post(url, json=payload, headers=self.headers, timeout=10)
            result = response.json()

            if result.get('success'):
                print(f"✅ {result['message']}")
                print(f"💰 剩余余额: ${result['new_balance']:.2f}")
                return result
            else:
                print(f"❌ 卖出失败: {result.get('message')}")
                return None
        except Exception as e:
            print(f"❌ 请求异常: {e}")
            return None

    def get_portfolio(self) -> Optional[Dict[str, Any]]:
        """获取当前持仓"""
        url = f"{self.base_url}/api/portfolio"
        try:
            response = requests.get(url, timeout=10)
            return response.json()
        except Exception as e:
            print(f"❌ 获取持仓失败: {e}")
            return None

    def get_trade_history(self) -> Optional[Dict[str, Any]]:
        """获取交易历史"""
        url = f"{self.base_url}/api/trade/history"
        try:
            response = requests.get(url, timeout=10)
            return response.json()
        except Exception as e:
            print(f"❌ 获取交易历史失败: {e}")
            return None


# 使用示例
if __name__ == "__main__":
    # 初始化 API 客户端
    api = ClawTradeAPI()

    # 示例 1: 买入 BTC
    print("🤖 OpenClaw 执行买入操作")
    result = api.buy(
        coin_id="bitcoin",
        symbol="BTC",
        amount_usd=1000,
        name="Bitcoin",
        icon="₿"
    )

    if result:
        print(f"交易成功！买入 {result['trade']['amount']} BTC")

    # 示例 2: 查询持仓
    print("\n📊 查询当前持仓")
    portfolio = api.get_portfolio()
    if portfolio:
        print(f"余额: ${portfolio['cash']:.2f}")
        for pos in portfolio.get('positions', []):
            print(f"  {pos['symbol']}: {pos['amount']} (盈亏 {pos['pnlPercent']:.2f}%)")

    # 示例 3: 卖出 BTC
    print("\n🤖 OpenClaw 执行卖出操作")
    result = api.sell(
        coin_id="bitcoin",
        symbol="BTC",
        amount_usd=500
    )
```

---

## 🔄 集成到 OpenClaw 分析流程

### 完整示例

```python
from clawtrade_api import ClawTradeAPI
import anthropic

# 初始化
trader = ClawTradeAPI()
claude = anthropic.Anthropic(api_key="your-key")

def analyze_and_trade(coin_id: str, symbol: str):
    """OpenClaw 分析并执行交易"""

    # 1. 获取当前持仓和余额
    portfolio = trader.get_portfolio()
    cash = portfolio['cash']
    positions = portfolio['positions']

    # 2. 调用 AI 模型分析
    message = claude.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""你是加密货币交易专家。分析 {symbol}，当前余额 ${cash}，
            持仓: {positions}。
            返回 JSON 格式：
            {{
              "action": "BUY/SELL/HOLD",
              "amount_usd": 1000,
              "reason": "理由"
            }}"""
        }]
    )

    # 3. 解析 AI 建议
    import json
    suggestion = json.loads(message.content[0].text)

    # 4. 执行交易
    action = suggestion['action']
    amount = suggestion.get('amount_usd', 0)

    if action == 'BUY' and amount > 0:
        print(f"🤖 OpenClaw 决定买入 {symbol}: {suggestion['reason']}")
        trader.buy(coin_id, symbol, amount)

    elif action == 'SELL' and amount > 0:
        print(f"🤖 OpenClaw 决定卖出 {symbol}: {suggestion['reason']}")
        trader.sell(coin_id, symbol, amount)

    else:
        print(f"🤖 OpenClaw 建议观望 {symbol}: {suggestion['reason']}")

# 运行
analyze_and_trade("bitcoin", "BTC")
```

---

## 🧪 测试命令

### 使用 cURL 测试

```bash
# 测试健康检查
curl https://clawtrade-production.up.railway.app/health

# 测试买入 BTC
curl -X POST https://clawtrade-production.up.railway.app/api/trade/buy \
  -H "Content-Type: application/json" \
  -d '{
    "coin_id": "bitcoin",
    "symbol": "BTC",
    "name": "Bitcoin",
    "icon": "₿",
    "amount_usd": 100,
    "source": "OPENCLAW"
  }'

# 测试卖出 BTC
curl -X POST https://clawtrade-production.up.railway.app/api/trade/sell \
  -H "Content-Type: application/json" \
  -d '{
    "coin_id": "bitcoin",
    "symbol": "BTC",
    "amount_usd": 50,
    "source": "OPENCLAW"
  }'

# 查询持仓
curl https://clawtrade-production.up.railway.app/api/portfolio

# 查询交易历史
curl https://clawtrade-production.up.railway.app/api/trade/history
```

---

## 📊 支持的币种

| 币种 | symbol | coin_id |
|------|--------|---------|
| 比特币 | BTC | `bitcoin` |
| 以太坊 | ETH | `ethereum` |
| 币安币 | BNB | `binancecoin` |
| 索拉纳 | SOL | `solana` |
| 瑞波币 | XRP | `ripple` |
| 卡尔达诺 | ADA | `cardano` |
| 波卡 | DOT | `polkadot` |
| 狗狗币 | DOGE | `dogecoin` |
| 雪崩 | AVAX | `avalanche-2` |
| 链接 | LINK | `chainlink` |
| 马蹄 | MATIC | `polygon` |
| 优尼 | UNI | `uniswap` |

完整列表：https://api.coingecko.com/api/v3/coins/list

---

## ⚠️ 注意事项

### 1. 错误处理
```python
result = trader.buy(coin_id="bitcoin", symbol="BTC", amount_usd=1000)

if result is None:
    # 交易失败，可能是余额不足或网络错误
    print("交易失败，请检查日志")
elif result['success']:
    # 交易成功
    print(f"成功买入 {result['trade']['amount']} BTC")
```

### 2. 余额检查
在买入前先查询余额，避免余额不足：
```python
portfolio = trader.get_portfolio()
if portfolio['cash'] < amount_usd:
    print("余额不足")
    return
```

### 3. 持仓检查
在卖出前检查是否有持仓：
```python
portfolio = trader.get_portfolio()
position = next((p for p in portfolio['positions'] if p['symbol'] == symbol), None)
if not position:
    print(f"无 {symbol} 持仓")
    return
```

### 4. 网络超时
所有请求设置了 10 秒超时，可根据需要调整：
```python
response = requests.post(url, json=payload, timeout=10)
```

### 5. 交易来源标识
使用 `source="OPENCLAW"` 标识交易来源，方便追踪和分析：
```python
payload = {
    "source": "OPENCLAW"  # 标识来自 OpenClaw
}
```

---

## 🚀 快速开始清单

- [ ] 安装 Python 依赖: `pip install requests anthropic`
- [ ] 复制 `ClawTradeAPI` 类代码
- [ ] 测试连接: `curl https://clawtrade-production.up.railway.app/health`
- [ ] 测试买入接口
- [ ] 测试卖出接口
- [ ] 集成到 OpenClaw 分析流程
- [ ] 添加错误处理和日志记录

---

## 📞 技术支持

**生产环境：** https://clawtrade-production.up.railway.app
**API 文档版本：** v1.0
**最后更新：** 2026-02-08

如有问题，请联系 ClawTrade 开发团队。

---

## 🎯 完整流程示例

```python
#!/usr/bin/env python3
"""OpenClaw 自动交易示例"""

from clawtrade_api import ClawTradeAPI
import time

def main():
    # 初始化 API
    api = ClawTradeAPI()

    # 分析目标币种
    targets = [
        {"coin_id": "bitcoin", "symbol": "BTC"},
        {"coin_id": "ethereum", "symbol": "ETH"},
        {"coin_id": "solana", "symbol": "SOL"}
    ]

    for target in targets:
        print(f"\n{'='*50}")
        print(f"🔍 分析 {target['symbol']}...")

        # 这里调用你的 AI 分析模型
        # suggestion = your_ai_analysis(target)

        # 示例：简单买入策略
        suggestion = {
            "action": "BUY",
            "amount_usd": 500,
            "reason": "技术指标显示买入信号"
        }

        if suggestion['action'] == 'BUY':
            api.buy(
                coin_id=target['coin_id'],
                symbol=target['symbol'],
                amount_usd=suggestion['amount_usd']
            )

        # 间隔 1 秒，避免请求过快
        time.sleep(1)

    # 查看最终持仓
    print(f"\n{'='*50}")
    print("📊 最终持仓情况")
    portfolio = api.get_portfolio()
    if portfolio:
        print(f"💰 余额: ${portfolio['cash']:.2f}")
        print(f"📈 总资产: ${portfolio['totalValue']:.2f}")
        for pos in portfolio.get('positions', []):
            print(f"  • {pos['symbol']}: {pos['amount']:.6f} (盈亏 {pos['pnlPercent']:.2f}%)")

if __name__ == "__main__":
    main()
```

**执行：**
```bash
python openclaw_trader.py
```

**预期输出：**
```
==================================================
🔍 分析 BTC...
✅ 买入 0.00617284 BTC @ $81000.00
💰 剩余余额: $99500.00

==================================================
🔍 分析 ETH...
✅ 买入 0.20000000 ETH @ $2500.00
💰 剩余余额: $99000.00

==================================================
📊 最终持仓情况
💰 余额: $99000.00
📈 总资产: $100500.00
  • BTC: 0.006173 (盈亏 1.23%)
  • ETH: 0.200000 (盈亏 0.80%)
```

---

**准备就绪！🚀 OpenClaw 现在可以直接调用 ClawTrade API 执行交易了。**
