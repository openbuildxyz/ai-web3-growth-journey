#!/usr/bin/env python3
"""
使用真实的测试代币进行操作
"""

from solana.rpc.api import Client
from solana.keypair import Keypair
from solana.publickey import PublicKey
import dotenv, os
import json

dotenv.load_dotenv()
private_key_str = os.getenv("PRIVATE_KEY")
private_key = [int(x) for x in private_key_str.split(",")]

# 加载测试代币信息
with open('real_test_token.json', 'r') as f:
    token_data = json.load(f)

client = Client("https://api.devnet.solana.com")
wallet = Keypair.from_secret_key(bytes(private_key))
mint_keypair = Keypair.from_secret_key(bytes(token_data['mint_private_key']))

print(f"=== 测试代币信息 ===")
print(f"🎯 代币名称: {token_data['name']}")
print(f"🔤 代币符号: {token_data['symbol']}")
print(f"🏷️  Mint 地址: {token_data['mint_address']}")
print(f"👤 你的钱包: {wallet.public_key}")
print(f"🌐 网络: {token_data['network']}")

# 检查 mint 地址信息
try:
    mint_info = client.get_account_info(PublicKey(token_data['mint_address']))
    if mint_info['result']['value']:
        print(f"✅ 代币 Mint 账户存在")
        print(f"   所有者: {mint_info['result']['value']['owner']}")
        print(f"   数据长度: {len(mint_info['result']['value']['data'])} 字节")
    else:
        print(f"⚠️  代币 Mint 账户尚未在链上创建")
        print(f"   这是一个有效的地址，可以用于测试")
except Exception as e:
    print(f"ℹ️  检查 Mint 信息时: {e}")

print(f"\n🔗 在 Solana Explorer 中查看:")
print(f"   代币: https://explorer.solana.com/address/{token_data['mint_address']}?cluster=devnet")
print(f"   钱包: https://explorer.solana.com/address/{wallet.public_key}?cluster=devnet")

print(f"\n💡 这个测试代币可以用于:")
print(f"   - 代币转账测试")
print(f"   - 智能合约交互")
print(f"   - DeFi 协议测试")
print(f"   - 任何需要 SPL Token 的 devnet 测试")

print(f"\n📋 测试代币详情:")
print(f"   Mint: {token_data['mint_address']}")
print(f"   小数位数: {token_data['decimals']}")
print(f"   网络: Solana Devnet")
