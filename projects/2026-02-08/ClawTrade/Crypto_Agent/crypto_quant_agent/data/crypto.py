import ccxt
import pandas as pd
import os
from ..config import settings
from .base import DataLoader

class CryptoLoader(DataLoader):
    def fetch(self, symbol: str = None) -> pd.DataFrame:
        target_symbol = symbol or settings.CRYPTO_SYMBOL
        print(f"Fetching Crypto Data for {target_symbol}...")
        
        # Helper to configure proxy if env vars exist
        proxies = {}
        if os.environ.get('http_proxy'):
            proxies['http'] = os.environ.get('http_proxy')
        if os.environ.get('https_proxy'):
            proxies['https'] = os.environ.get('https_proxy')
            
        try:
            exchange = ccxt.binance()
            if proxies:
                exchange.proxies = proxies
            exchange.timeout = 10000 
            
            ohlcv = exchange.fetch_ohlcv(
                target_symbol, 
                timeframe=settings.CRYPTO_TIMEFRAME, 
                limit=settings.CRYPTO_LIMIT
            )
        except Exception as e:
            print(f"Binance failed ({e}), trying Kraken...")
            exchange = ccxt.kraken()
            if proxies:
                exchange.proxies = proxies
            exchange.timeout = 10000
            
            # Kraken symbols might differ slightly (e.g. XBT/USD), 
            # but CCXT tries to unify. If it fails, we might need a mapper.
            # For MVP, assuming standard symbols work or user provides correct one.
            ohlcv = exchange.fetch_ohlcv(
                target_symbol, 
                timeframe=settings.CRYPTO_TIMEFRAME, 
                limit=settings.CRYPTO_LIMIT
            )
        
        df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        df.set_index('timestamp', inplace=True)
        # Rename columns to standard names
        df = df.rename(columns={'open': 'Open', 'high': 'High', 'low': 'Low', 'close': 'Price', 'volume': 'Volume'})
        return df[['Open', 'High', 'Low', 'Price', 'Volume']]
