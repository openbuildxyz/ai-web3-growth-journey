from ..analysis.processor import DataProcessor
from ..reporting.generator import ReportGenerator
import traceback

class CryptoQuantAgent:
    """
    Autonomous Agent that orchestrates the Crypto Analysis workflow.
    Cycle:
    1. Perceive: Parse user input, identify asset.
    2. Gather: Fetch specific asset data + Sector Overview (BTC/ETH/SOL).
    3. Analyze: Process data, calculate correlations, sentiment.
    4. Act: Generate AI Report.
    """
    def __init__(self):
        self.processor = DataProcessor()
        self.generator = ReportGenerator()
        
    def run(self, symbol: str, chain: str = None, user_query: str = ""):
        print(f"\n[Agent] Starting Analysis for {symbol}...")
        
        try:
            # 1. Gather Context (Target Asset)
            df, sentiment = self.processor.build_dataset(symbol=symbol, chain=chain)
            
            # 2. Gather Sector Context (Industry Trend)
            # "Industry can consider ETH Sol BTC performance to determine"
            sector_data = self.processor.get_sector_overview()
            
            # 3. Analyze & Generate Report
            # Pass sector_data to the generator
            report = self.generator.generate(
                df, sentiment, symbol, chain, 
                user_query=user_query,
                sector_data=sector_data
            )
            
            return report
            
        except Exception as e:
            print(f"[Agent] Error during execution: {e}")
            traceback.print_exc()
            return "An error occurred during analysis."
