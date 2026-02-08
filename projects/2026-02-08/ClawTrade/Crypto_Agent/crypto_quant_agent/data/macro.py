import yfinance as yf
import pandas as pd
from ..config import settings
from .base import DataLoader

class MacroLoader(DataLoader):
    def fetch(self) -> pd.DataFrame:
        print(f"Fetching Macro Data for {settings.MACRO_TICKERS}...")
        
        data = yf.download(
            settings.MACRO_TICKERS, 
            period=settings.MACRO_PERIOD, 
            progress=False
        )
        if data.empty:
                # Check if we got any data
                raise ValueError("Empty data returned from yfinance")

        if isinstance(data.columns, pd.MultiIndex):
            # Access 'Close' level
            df = data['Close']
        else:
            # If single ticker or flat columns, try to get Close
            if 'Close' in data.columns:
                df = data[['Close']]
            else:
                df = data # Assume it is close? Unlikely.
        
        rename_map = {'^GSPC': 'SPX', 'DX-Y.NYB': 'DXY'}
        df = df.rename(columns=rename_map)
        return df
