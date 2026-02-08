"""
Crypto Agent API Server
提供 RESTful API 供 OpenClaw 调用分析功能
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.dirname(__file__))

from crypto_quant_agent.agent.core import CryptoQuantAgent

app = Flask(__name__)
CORS(app)  # 允许跨域

# Asset Mapping
ASSET_MAP = {
    'BTC': {'symbol': 'BTC/USD', 'chain': None},
    'ETH': {'symbol': 'ETH/USD', 'chain': 'Ethereum'},
    'SOL': {'symbol': 'SOL/USD', 'chain': 'Solana'},
    'BNB': {'symbol': 'BNB/USD', 'chain': 'BSC'},
    'ARB': {'symbol': 'ARB/USDT', 'chain': 'Arbitrum'},
    'OP': {'symbol': 'OP/USDT', 'chain': 'Optimism'},
    'ADA': {'symbol': 'ADA/USDT', 'chain': 'Cardano'},
    'DOT': {'symbol': 'DOT/USDT', 'chain': 'Polkadot'},
    'DOGE': {'symbol': 'DOGE/USDT', 'chain': None},
    'AVAX': {'symbol': 'AVAX/USDT', 'chain': 'Avalanche'},
    'LINK': {'symbol': 'LINK/USDT', 'chain': 'Ethereum'},
    'MATIC': {'symbol': 'MATIC/USDT', 'chain': 'Polygon'},
    'UNI': {'symbol': 'UNI/USDT', 'chain': 'Ethereum'}
}

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({
        'status': 'healthy',
        'service': 'Crypto Analysis Agent',
        'version': '1.0.0'
    })

@app.route('/api/analyze', methods=['POST'])
def analyze_crypto():
    """
    加密货币分析接口

    请求参数:
        {
            "symbol": "BTC",
            "query": "现在适合买入吗？"
        }

    返回:
        {
            "success": true,
            "symbol": "BTC",
            "report": "AI 生成的分析报告...",
            "metadata": {
                "asset": "BTC/USD",
                "chain": null
            }
        }
    """
    try:
        data = request.json

        # 参数验证
        symbol = data.get('symbol', 'BTC').upper()
        query = data.get('query', f'{symbol} 市场分析')

        # 检查是否支持该币种
        if symbol not in ASSET_MAP:
            return jsonify({
                'success': False,
                'message': f'不支持的币种: {symbol}。支持的币种: {", ".join(ASSET_MAP.keys())}'
            }), 400

        # 获取配置
        asset_config = ASSET_MAP[symbol]
        trading_symbol = asset_config['symbol']
        chain = asset_config['chain']

        # 初始化 Agent
        agent = CryptoQuantAgent()

        # 执行分析
        print(f"🔍 分析请求: {symbol} - {query}")
        report = agent.run(trading_symbol, chain, query)

        # 返回结果
        return jsonify({
            'success': True,
            'symbol': symbol,
            'report': report,
            'metadata': {
                'asset': trading_symbol,
                'chain': chain,
                'supported_assets': list(ASSET_MAP.keys())
            }
        })

    except Exception as e:
        print(f"❌ 分析失败: {e}")
        import traceback
        traceback.print_exc()

        return jsonify({
            'success': False,
            'message': f'分析失败: {str(e)}'
        }), 500

@app.route('/api/supported-assets', methods=['GET'])
def get_supported_assets():
    """获取支持的币种列表"""
    assets = []
    for symbol, config in ASSET_MAP.items():
        assets.append({
            'symbol': symbol,
            'trading_pair': config['symbol'],
            'chain': config['chain']
        })

    return jsonify({
        'success': True,
        'assets': assets
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"""
╔════════════════════════════════════════╗
║   🚀 Crypto Analysis API 启动成功     ║
╠════════════════════════════════════════╣
║  端口: {str(port).ljust(33)}║
║  支持币种: {str(len(ASSET_MAP)).ljust(29)}║
╚════════════════════════════════════════╝

📊 可用接口:
  - GET  /health              健康检查
  - POST /api/analyze         分析接口
  - GET  /api/supported-assets 支持的币种
    """)

    app.run(host='0.0.0.0', port=port, debug=True)
