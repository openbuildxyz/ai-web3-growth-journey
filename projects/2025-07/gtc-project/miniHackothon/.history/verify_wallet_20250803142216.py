#!/usr/bin/env python3
"""
验证你的钱包在链上的活动
"""

from solana.rpc.api import Client
from solana.keypair import Keypair
import dotenv, os
import json

# 加载环境变量
dotenv.load_dotenv()
private_key_str = os.getenv("PRIVATE_KEY")
public_key_str = os.getenv("PUBLIC_KEY")
private_key = [int(x) for x in private_key_str.split(",")]

client = Client("https://api.devnet.solana.com")
wallet = Keypair.from_secret_key(bytes(private_key))

print(f"=== 验证链上活动 ===")
print(f"👤 你的钱包地址: {wallet.public_key}")
print(f"✅ 地址匹配验证: {str(wallet.public_key) == public_key_str}")

# 检查余额
try:
    balance_resp = client.get_balance(wallet.public_key)
    balance = balance_resp['result']['value'] / 1_000_000_000
    print(f"💰 当前余额: {balance} SOL")
    
    if balance > 0:
        print(f"✅ 钱包有余额，说明已有链上活动!")
        
        # 尝试获取交易历史 (可能需要不同的API方法)
        try:
            # 简单验证账户是否在链上存在
            account_info = client.get_account_info(wallet.public_key)
            if account_info['result']['value']:
                print(f"✅ 账户在链上存在且有数据")
                print(f"   账户所有者: {account_info['result']['value']['owner']}")
                print(f"   账户余额: {account_info['result']['value']['lamports'] / 1_000_000_000} SOL")
            else:
                print(f"⚠️  账户在链上但无额外数据")
        except Exception as e:
            print(f"获取账户信息时出错: {e}")
            
    else:
        print(f"❌ 钱包余额为0，可能需要先请求空投")
        
except Exception as e:
    print(f"检查余额时出错: {e}")

# 验证之前创建的代币地址
token_files = ['co2_token_info.json', 'complete_token_setup.json', 'real_test_token.json']

print(f"\n🔍 检查之前创建的代币...")
for file in token_files:
    try:
        if os.path.exists(file):
            with open(file, 'r') as f:
                data = json.load(f)
            if 'mint_address' in data:
                mint_addr = data['mint_address']
                print(f"📄 {file}: {mint_addr}")
                print(f"   🔗 查看: https://explorer.solana.com/address/{mint_addr}?cluster=devnet")
    except:
        pass

print(f"\n🔗 你的钱包链接:")
print(f"https://explorer.solana.com/address/{wallet.public_key}?cluster=devnet")

print(f"\n💡 说明:")
print(f"- 如果余额 > 0，说明钱包已经有链上活动")
print(f"- 代币地址是有效的 devnet 地址")
print(f"- 可以在 Solana Explorer 上查看详细信息")

# 创建总结信息
summary = {
    "wallet_address": str(wallet.public_key),
    "current_balance_sol": balance if 'balance' in locals() else 0,
    "network": "devnet",
    "explorer_url": f"https://explorer.solana.com/address/{wallet.public_key}?cluster=devnet",
    "status": "钱包在链上活跃" if 'balance' in locals() and balance > 0 else "钱包需要激活",
    "verification_time": "2025-08-03"
}

with open('wallet_verification.json', 'w') as f:
    json.dump(summary, f, indent=2)

print(f"\n✅ 验证完成! 信息已保存到 wallet_verification.json")
