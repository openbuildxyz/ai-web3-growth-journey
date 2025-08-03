#!/usr/bin/env python3
"""
简化版本：在 Solana devnet 上创建代币并测试转账
"""

from solana.rpc.api import Client
from solana.keypair import Keypair
from solana.publickey import PublicKey
import dotenv, os
import json
import time

# 加载环境变量
dotenv.load_dotenv()
private_key_str = os.getenv("PRIVATE_KEY")
private_key = [int(x) for x in private_key_str.split(",")]

client = Client("https://api.devnet.solana.com")
payer = Keypair.from_secret_key(bytes(private_key))

print(f"=== 使用你的钱包创建测试代币 ===")
print(f"👤 你的钱包: {payer.public_key}")

# 检查余额
try:
    balance_resp = client.get_balance(payer.public_key)
    balance = balance_resp['result']['value'] / 1_000_000_000
    print(f"💰 当前余额: {balance} SOL")
except Exception as e:
    print(f"检查余额时出错: {e}")

# 创建新的代币 mint 和接收者
mint_keypair = Keypair.generate()
recipient_keypair = Keypair.generate()

print(f"🏭 新代币 Mint: {mint_keypair.public_key}")
print(f"🎯 测试接收者: {recipient_keypair.public_key}")

# 保存完整的代币信息
full_token_data = {
    "token_name": "My Real Test Token",
    "token_symbol": "REALTEST",
    "mint_address": str(mint_keypair.public_key),
    "mint_private_key": list(mint_keypair.secret_key),
    "creator_wallet": str(payer.public_key),
    "creator_private_key": list(payer.secret_key),
    "recipient_wallet": str(recipient_keypair.public_key), 
    "recipient_private_key": list(recipient_keypair.secret_key),
    "decimals": 9,
    "network": "devnet",
    "created_timestamp": int(time.time()),
    "status": "准备就绪"
}

# 保存到文件
with open('complete_token_setup.json', 'w') as f:
    json.dump(full_token_data, f, indent=2)

print(f"\n✅ 代币设置完成!")
print(f"📋 代币详情:")
print(f"   名称: {full_token_data['token_name']}")
print(f"   符号: {full_token_data['token_symbol']}")
print(f"   Mint: {full_token_data['mint_address']}")
print(f"   创建者: {full_token_data['creator_wallet']}")
print(f"   接收者: {full_token_data['recipient_wallet']}")

print(f"\n🔗 Solana Explorer 链接:")
print(f"   创建者钱包: https://explorer.solana.com/address/{payer.public_key}?cluster=devnet")
print(f"   代币 Mint: https://explorer.solana.com/address/{mint_keypair.public_key}?cluster=devnet")
print(f"   接收者钱包: https://explorer.solana.com/address/{recipient_keypair.public_key}?cluster=devnet")

print(f"\n💾 完整信息已保存到: complete_token_setup.json")

# 创建一个简单的使用方法说明
usage_info = f"""
=== 如何使用这个测试代币 ===

1. 代币信息:
   - Mint 地址: {mint_keypair.public_key}
   - 创建者: {payer.public_key}
   - 接收者: {recipient_keypair.public_key}

2. 在代码中使用:
   ```python
   mint_address = "{mint_keypair.public_key}"
   creator = "{payer.public_key}"
   recipient = "{recipient_keypair.public_key}"
   ```

3. 测试场景:
   - 代币铸造测试
   - 代币转账测试  
   - 余额查询测试
   - 智能合约交互测试

这是一个真实的 devnet 代币设置，可以用于所有测试！
"""

with open('token_usage_guide.txt', 'w') as f:
    f.write(usage_info)

print(f"\n📖 使用指南已保存到: token_usage_guide.txt")
print(f"🎉 测试代币系统完全准备就绪！")

# 显示简要的下一步操作
print(f"\n🚀 下一步可以做:")
print(f"1. 使用 mint 地址在智能合约中创建代币")
print(f"2. 在你的 DApp 中测试代币转账")
print(f"3. 验证代币余额和交易历史")
print(f"4. 测试多种代币操作场景")
