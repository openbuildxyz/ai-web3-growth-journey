# Config for Crypto-Quant Dashboard

# Crypto
CRYPTO_SYMBOL = 'BTC/USD'
CRYPTO_TIMEFRAME = '1d'
CRYPTO_LIMIT = 365  # 1 year of data

# Macro
MACRO_TICKERS = ['^GSPC', 'DX-Y.NYB']  # S&P 500, Dollar Index
MACRO_PERIOD = '2y'  # Fetch more to ensure overlap

# On-Chain
DEFILLAMA_CHAINS_URL = "https://api.llama.fi/v2/chains"
DEFILLAMA_HISTORICAL_TVL_URL = "https://api.llama.fi/v2/historicalChainTvl"
TARGET_CHAIN = "Ethereum"

# Sentiment
SENTIMENT_URL = "https://api.alternative.me/fng/?limit=1"

# Visualization
STYLE_FONT = 'Times New Roman'
STYLE_COLOR_PRIMARY = '#1f77b4'  # Executive Blue-ish
STYLE_COLOR_SECONDARY = '#ff7f0e'
STYLE_COLOR_BG = '#f5f5f5'

# AI
GEMINI_API_KEY = "AIzaSyB7vNMkB7QeZ8Af7o3Npyk22-Jb8AqkOQM"
