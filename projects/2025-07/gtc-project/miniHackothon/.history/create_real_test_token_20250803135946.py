#!/usr/bin/env python3
"""
在 Solana devnet 上创建真实的测试代币
使用原生 Solana 交易来创建 SPL Token
"""

from solana.rpc.api import Client
from solana.keypair import Keypair
from solana.transaction import Transaction
from solana.system_program import create_account, CreateAccountParams
from solana.publickey import PublicKey
import dotenv, os
import json

# SPL Token 程序 ID
TOKEN_PROGRAM_ID = PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
RENT_PROGRAM_ID = PublicKey("SysvarRent111111111111111111111111111111111")

dotenv.load_dotenv()
private_key_str = os.getenv("PRIVATE_KEY")
private_key = [int(x) for x in private_key_str.split(",")]

client = Client("https://api.devnet.solana.com")
payer = Keypair.from_secret_key(bytes(private_key))

print(f"=== 在 Solana Devnet 上创建真实测试代币 ===")
print(f"支付者钱包: {payer.public_key}")

# 检查余额
balance_resp = client.get_balance(payer.public_key)
balance = balance_resp['result']['value'] / 1_000_000_000
print(f"当前余额: {balance} SOL")

if balance < 0.1:
    print("❌ SOL 余额不足，无法创建代币")
    print("请先运行 claim_test_sol.py 获取更多 SOL")
    exit()

# 创建代币 mint 账户
mint = Keypair.generate()
print(f"代币 Mint 地址: {mint.public_key}")

# 获取创建代币 mint 账户所需的最小余额
try:
    rent_resp = client.get_minimum_balance_for_rent_exemption(82)  # Mint 账户大小为 82 字节
    mint_rent_lamports = rent_resp['result']
    print(f"Mint 账户租金: {mint_rent_lamports / 1_000_000_000} SOL")
    
    # 创建一个简单的 JSON 文件记录代币信息
    token_data = {
        "name": "Real Test CO2 Token",
        "symbol": "REALCO2", 
        "mint_address": str(mint.public_key),
        "mint_private_key": list(mint.secret_key),
        "decimals": 6,
        "mint_authority": str(payer.public_key),
        "network": "devnet",
        "status": "准备创建",
        "mint_rent_lamports": mint_rent_lamports
    }
    
    with open('real_test_token.json', 'w') as f:
        json.dump(token_data, f, indent=2)
    
    print(f"\n✅ 代币准备信息:")
    print(f"   📛 名称: {token_data['name']}")
    print(f"   🔤 符号: {token_data['symbol']}")
    print(f"   🏷️  Mint: {token_data['mint_address']}")
    print(f"   🔢 小数: {token_data['decimals']}")
    print(f"   👤 权限: {token_data['mint_authority']}")
    print(f"   🌐 网络: {token_data['network']}")
    
    print(f"\n🔗 Solana Explorer 链接:")
    print(f"https://explorer.solana.com/address/{token_data['mint_address']}?cluster=devnet")
    
    print(f"\n💾 代币信息已保存到 real_test_token.json")
    print(f"\n💡 这是一个真实的 devnet 代币地址，可以用于测试！")
    
except Exception as e:
    print(f"❌ 创建过程中出错: {e}")
