import argparse
import sys
from .agent.core import CryptoQuantAgent

# Asset Mapping Configuration
ASSET_MAP = {
    'BTC': {'symbol': 'BTC/USD', 'chain': None}, 
    'ETH': {'symbol': 'ETH/USD', 'chain': 'Ethereum'},
    'SOL': {'symbol': 'SOL/USD', 'chain': 'Solana'},
    'BNB': {'symbol': 'BNB/USD', 'chain': 'BSC'},
    'ARB': {'symbol': 'ARB/USDT', 'chain': 'Arbitrum'},
    'OP': {'symbol': 'OP/USDT', 'chain': 'Optimism'},
}

def parse_input(user_input: str):
    """
    Simple parser to extract asset from user input string.
    Expected formats: "ETH: ..." or "Analyze ETH" or just "ETH"
    """
    if not user_input:
        return 'BTC', "General Analysis" # Default
    
    parts = user_input.split()
    first_word = parts[0].upper().replace(':', '')
    
    # Check if first word is a known asset
    if first_word in ASSET_MAP:
        return first_word, user_input
    
    # Check if any known asset is in the string
    for asset in ASSET_MAP:
        if asset in user_input.upper():
            return asset, user_input
            
    return 'BTC', user_input # Default Fallback

def main():
    # Support both CLI args and interactive/string input
    if len(sys.argv) > 1:
        # CLI Mode: python -m crypto_quant_agent.main "ETH: What is the outlook?"
        user_query = " ".join(sys.argv[1:])
    else:
        # Default or Interactive Mode
        print("--- Crypto-Quant Agent (AI Powered) ---")
        print("Please enter your prompt (e.g., 'ETH: Should I buy now?'):")
        try:
            user_query = input("> ")
        except EOFError:
            user_query = "BTC: Default run"

    # 1. Parse Intent
    asset_key, intent = parse_input(user_query)
    asset_config = ASSET_MAP.get(asset_key, ASSET_MAP['BTC'])
    
    symbol = asset_config['symbol']
    chain = asset_config['chain']
    
    # 2. Initialize Agent
    agent = CryptoQuantAgent()
    
    # 3. Run Agent
    # The agent handles gathering, analysis (including sector check), reporting, and viz
    report = agent.run(symbol, chain, user_query)
    
    # 4. Output
    print("\n" + "="*40)
    print(report)
    print("="*40 + "\n")
    
    # Save report to text file
    with open("report.txt", "w") as f:
        f.write(report)
    print("Report saved to: report.txt")

if __name__ == "__main__":
    main()
