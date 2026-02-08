import requests
import pandas as pd
from ..config import settings
from .base import DataLoader

class OnChainLoader(DataLoader):
    def fetch(self, chain: str = None) -> pd.DataFrame:
        target_chain = chain or settings.TARGET_CHAIN
        if not target_chain:
            print("No chain specified for On-Chain data, skipping.")
            return pd.DataFrame()

        print(f"Fetching On-Chain Data for {target_chain}...")
        url = f"{settings.DEFILLAMA_HISTORICAL_TVL_URL}/{target_chain}"
        try:
            response = requests.get(url, timeout=10).json()
            
            if isinstance(response, list) and len(response) > 0 and 'tvl' in response[0]:
                df = pd.DataFrame(response)
                df['timestamp'] = pd.to_datetime(df['date'], unit='s')
                df.set_index('timestamp', inplace=True)
                df.sort_index(inplace=True)
                return df[['tvl']].rename(columns={'tvl': 'Chain_TVL'})
            else:
                print(f"Warning: No valid TVL data found for {target_chain}")
                return pd.DataFrame()
        except Exception as e:
            print(f"On-Chain Data Fetch Error: {e}")
            return pd.DataFrame()
