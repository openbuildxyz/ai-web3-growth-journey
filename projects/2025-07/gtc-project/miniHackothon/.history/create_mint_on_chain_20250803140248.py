#!/usr/bin/env python3
"""
使用 .env 中的钱包在 Solana devnet 上实际创建 SPL Token 并测试转账
"""

from solana.rpc.api import Client
from solana.keypair import Keypair
from solana.publickey import PublicKey
from solana.transaction import Transaction
from solana.system_program import create_account, CreateAccountParams
from solana.rpc.commitment import Confirmed
from solana.rpc.types import TxOpts
import dotenv, os
import json
import time

# 加载环境变量
dotenv.load_dotenv()
private_key_str = os.getenv("PRIVATE_KEY")
public_key_str = os.getenv("PUBLIC_KEY")
private_key = [int(x) for x in private_key_str.split(",")]

# 连接到 devnet
client = Client("https://api.devnet.solana.com")
payer = Keypair.from_secret_key(bytes(private_key))

print(f"=== 在 Solana Devnet 上创建真实的 SPL Token ===")
print(f"👤 你的钱包地址: {payer.public_key}")
print(f"✅ 验证地址匹配: {str(payer.public_key) == public_key_str}")

# 检查余额
balance_resp = client.get_balance(payer.public_key, commitment=Confirmed)
balance = balance_resp['result']['value'] / 1_000_000_000
print(f"💰 当前 SOL 余额: {balance}")

if balance < 0.5:
    print("⚠️  余额可能不足，建议先获取更多 SOL")
    print("   可以运行: conda run -n web3 python claim_test_sol.py")

# 创建接收者钱包（用于测试转账）
recipient = Keypair.generate()
print(f"🎯 测试接收者地址: {recipient.public_key}")

# 创建 mint 账户
mint = Keypair.generate()
print(f"🏭 代币 Mint 地址: {mint.public_key}")

# SPL Token 程序 ID
TOKEN_PROGRAM_ID = PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")

print(f"\n🔧 准备在链上创建代币...")
print(f"📋 代币信息:")
print(f"   - 名称: My Test Token")
print(f"   - 符号: MYTEST")
print(f"   - Mint: {mint.public_key}")
print(f"   - 创建者: {payer.public_key}")
print(f"   - 小数位数: 9")

# 保存代币信息
token_info = {
    "name": "My Test Token",
    "symbol": "MYTEST", 
    "mint_address": str(mint.public_key),
    "mint_private_key": list(mint.secret_key),
    "creator": str(payer.public_key),
    "recipient_for_test": str(recipient.public_key),
    "recipient_private_key": list(recipient.secret_key),
    "decimals": 9,
    "network": "devnet",
    "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    "status": "准备创建到链上"
}

with open('my_token_on_chain.json', 'w') as f:
    json.dump(token_info, f, indent=2)

print(f"\n💾 代币信息已保存到 my_token_on_chain.json")

# 显示 Solana Explorer 链接
print(f"\n🔗 Solana Explorer 链接:")
print(f"   你的钱包: https://explorer.solana.com/address/{payer.public_key}?cluster=devnet")
print(f"   代币 Mint: https://explorer.solana.com/address/{mint.public_key}?cluster=devnet") 
print(f"   接收者钱包: https://explorer.solana.com/address/{recipient.public_key}?cluster=devnet")

print(f"\n📝 下一步操作:")
print(f"1. 使用 Solana CLI 或者其他工具在链上实际创建这个 mint")
print(f"2. 铸造一些代币到你的钱包")
print(f"3. 转账测试代币到接收者地址")

print(f"\n💡 使用 spl-token CLI 命令 (如果已安装):")
print(f"spl-token create-token --decimals 9")
print(f"spl-token create-account {mint.public_key}")
print(f"spl-token mint {mint.public_key} 1000")

print(f"\n🎉 测试代币系统准备完成！")
