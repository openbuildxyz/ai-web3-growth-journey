import pandas as pd
from ..data.crypto import CryptoLoader
from ..data.macro import MacroLoader
from ..data.onchain import OnChainLoader
from ..data.sentiment import SentimentLoader

class DataProcessor:
    def __init__(self):
        self.crypto_loader = CryptoLoader()
        self.macro_loader = MacroLoader()
        self.onchain_loader = OnChainLoader()
        self.sentiment_loader = SentimentLoader()

    def build_dataset(self, symbol: str, chain: str = None):
        # 1. Fetch Data
        crypto_df = self.crypto_loader.fetch(symbol=symbol)
        macro_df = self.macro_loader.fetch() # Macro is global
        sentiment = self.sentiment_loader.fetch() # Sentiment is global (mostly)
        
        tvl_df = pd.DataFrame()
        if chain:
            tvl_df = self.onchain_loader.fetch(chain=chain)

        # 2. Preprocess Indices (Timezone Naive)
        for d in [crypto_df, macro_df, tvl_df]:
            if not d.empty and d.index.tz is not None:
                d.index = d.index.tz_localize(None)

        # 3. Merge
        # Start with Crypto as base
        df = crypto_df.join(macro_df, how='left') # Use left join to keep Crypto timeline (includes weekends)
        if not tvl_df.empty:
            df = df.join(tvl_df, how='left')
            df['Chain_TVL'] = df['Chain_TVL'].ffill() # Forward fill TVL

        # Forward fill Macro data (SPX, DXY) for weekends
        if 'SPX' in df.columns:
            df['SPX'] = df['SPX'].ffill()
        if 'DXY' in df.columns:
            df['DXY'] = df['DXY'].ffill()

        # Drop rows where we don't have Price (Crypto is the master)
        df_clean = df.dropna(subset=['Price']).copy()

        # 4. Calculate Indicators
        if not df_clean.empty:
            # Correlation
            if 'SPX' in df_clean.columns:
                df_clean['Corr_SPX'] = df_clean['Price'].rolling(window=30).corr(df_clean['SPX'])
            
            # Bollinger Bands (20, 2)
            df_clean['BB_Middle'] = df_clean['Price'].rolling(window=20).mean()
            df_clean['BB_Std'] = df_clean['Price'].rolling(window=20).std()
            df_clean['BB_Upper'] = df_clean['BB_Middle'] + (2 * df_clean['BB_Std'])
            df_clean['BB_Lower'] = df_clean['BB_Middle'] - (2 * df_clean['BB_Std'])
            
            # Williams %R (14)
            if 'High' in df_clean.columns and 'Low' in df_clean.columns:
                period = 14
                # Use min_periods=1 to get values earlier if needed, or stick to period
                df_clean['Highest_High'] = df_clean['High'].rolling(window=period).max()
                df_clean['Lowest_Low'] = df_clean['Low'].rolling(window=period).min()
                # Handle division by zero
                denominator = df_clean['Highest_High'] - df_clean['Lowest_Low']
                # Replace 0 with NaN to avoid Inf
                denominator = denominator.replace(0, float('nan'))
                
                df_clean['WillR'] = ((df_clean['Highest_High'] - df_clean['Price']) / denominator) * -100
                
                # Clean up temp columns
                df_clean.drop(columns=['BB_Std', 'Highest_High', 'Lowest_Low'], inplace=True)
        
        return df_clean, sentiment

    def get_sector_overview(self) -> dict:
        """
        Fetches performance data for Sector Leaders (BTC, ETH, SOL)
        to determine broader market trend.
        """
        sector_assets = ['BTC/USD', 'ETH/USD', 'SOL/USD']
        overview = {}
        
        print("\n--- Generating Sector Overview ---")
        for symbol in sector_assets:
            try:
                # Reuse loader but maybe we can optimize later
                # For now, fetching full history is okay
                df = self.crypto_loader.fetch(symbol=symbol)
                if not df.empty:
                    latest_price = df['Price'].iloc[-1]
                    price_7d = df['Price'].iloc[-7] if len(df) >= 7 else df['Price'].iloc[0]
                    change_7d = ((latest_price - price_7d) / price_7d) * 100
                    overview[symbol] = {
                        "price": latest_price,
                        "change_7d": change_7d
                    }
            except Exception as e:
                print(f"Failed to fetch sector data for {symbol}: {e}")
        
        return overview
