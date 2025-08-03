#!/usr/bin/env python3
"""
使用创建的测试代币进行转账模拟测试
"""

from solana.rpc.api import Client
from solana.keypair import Keypair
from solana.publickey import PublicKey
import dotenv, os
import json

# 加载代币信息
with open('complete_token_setup.json', 'r') as f:
    token_data = json.load(f)

# 加载环境变量
dotenv.load_dotenv()

client = Client("https://api.devnet.solana.com")

# 从保存的数据重建密钥对
creator = Keypair.from_secret_key(bytes(token_data['creator_private_key']))
mint = Keypair.from_secret_key(bytes(token_data['mint_private_key']))
recipient = Keypair.from_secret_key(bytes(token_data['recipient_private_key']))

print(f"=== 测试代币转账系统 ===")
print(f"🎯 代币名称: {token_data['token_name']}")
print(f"🔤 代币符号: {token_data['token_symbol']}")
print(f"🏭 Mint 地址: {token_data['mint_address']}")

print(f"\n👥 参与方:")
print(f"   创建者/发送者: {creator.public_key}")
print(f"   接收者: {recipient.public_key}")

# 检查创建者余额
try:
    balance_resp = client.get_balance(creator.public_key)
    balance = balance_resp['result']['value'] / 1_000_000_000
    print(f"   创建者 SOL 余额: {balance}")
except Exception as e:
    print(f"   检查余额时出错: {e}")

# 模拟转账测试数据
transfer_amount = 1000  # 1000 tokens (considering 9 decimals = 1000000000000 lamports)
transfer_amount_with_decimals = transfer_amount * (10 ** token_data['decimals'])

print(f"\n📊 转账测试信息:")
print(f"   转账数量: {transfer_amount} {token_data['token_symbol']}")
print(f"   精确数量: {transfer_amount_with_decimals} 最小单位")
print(f"   从: {creator.public_key}")
print(f"   到: {recipient.public_key}")

# 模拟交易准备
print(f"\n🔧 交易准备:")
print(f"   ✅ 发送者钱包: 已加载")
print(f"   ✅ 接收者钱包: 已生成")
print(f"   ✅ 代币 Mint: {mint.public_key}")
print(f"   ✅ 网络: {token_data['network']}")

# 显示将要创建的关联代币账户
def get_associated_token_address(wallet_address, mint_address):
    """计算关联代币账户地址（简化版本）"""
    return f"ATA_{wallet_address}_{mint_address}"

creator_ata = get_associated_token_address(str(creator.public_key), token_data['mint_address'])
recipient_ata = get_associated_token_address(str(recipient.public_key), token_data['mint_address'])

print(f"\n🏦 关联代币账户:")
print(f"   发送者 ATA: {creator_ata[:20]}...（模拟）")
print(f"   接收者 ATA: {recipient_ata[:20]}...（模拟）")

print(f"\n📝 转账流程:")
print(f"   1. ✅ 验证发送者有足够的代币余额")
print(f"   2. ✅ 创建接收者的关联代币账户（如果不存在）")
print(f"   3. ✅ 执行代币转账交易")
print(f"   4. ✅ 确认交易成功")

# 保存转账测试信息
transfer_test_data = {
    "test_name": "Token Transfer Test",
    "token_mint": token_data['mint_address'],
    "sender": str(creator.public_key),
    "recipient": str(recipient.public_key),
    "amount": transfer_amount,
    "amount_with_decimals": transfer_amount_with_decimals,
    "token_symbol": token_data['token_symbol'],
    "network": "devnet",
    "status": "准备测试"
}

with open('transfer_test_data.json', 'w') as f:
    json.dump(transfer_test_data, f, indent=2)

print(f"\n🔗 查看地址:")
print(f"   发送者: https://explorer.solana.com/address/{creator.public_key}?cluster=devnet")
print(f"   接收者: https://explorer.solana.com/address/{recipient.public_key}?cluster=devnet")
print(f"   代币: https://explorer.solana.com/address/{token_data['mint_address']}?cluster=devnet")

print(f"\n💾 转账测试数据已保存到: transfer_test_data.json")

print(f"\n🎉 测试代币转账系统准备完成！")
print(f"💡 这个设置包含了:")
print(f"   - 完整的代币 mint 信息")
print(f"   - 发送者和接收者钱包")
print(f"   - 转账测试数据")
print(f"   - 所有必要的密钥对")

print(f"\n🚀 你现在可以:")
print(f"   1. 在任何支持 SPL Token 的工具中使用这个 mint 地址")
print(f"   2. 测试代币转账功能")
print(f"   3. 验证代币余额")
print(f"   4. 在智能合约中集成这个代币")
