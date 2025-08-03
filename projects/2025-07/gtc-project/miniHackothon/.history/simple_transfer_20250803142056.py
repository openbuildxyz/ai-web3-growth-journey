#!/usr/bin/env python3
"""
简单的 SOL 转账来创建链上记录
"""

from solana.rpc.api import Client
from solana.keypair import Keypair
from solana.transaction import Transaction
from solana.system_program import transfer, TransferParams
import dotenv, os
import json
import time

# 加载环境变量
dotenv.load_dotenv()
private_key_str = os.getenv("PRIVATE_KEY")
private_key = [int(x) for x in private_key_str.split(",")]

client = Client("https://api.devnet.solana.com")
sender = Keypair.from_secret_key(bytes(private_key))

# 创建接收者
recipient = Keypair.generate()

print(f"=== 简单的链上转账测试 ===")
print(f"👤 发送者: {sender.public_key}")
print(f"🎯 接收者: {recipient.public_key}")

# 检查余额
balance_resp = client.get_balance(sender.public_key)
balance = balance_resp['result']['value'] / 1_000_000_000
print(f"💰 发送者余额: {balance} SOL")

if balance < 0.1:
    print("❌ 余额不足")
    exit()

try:
    print(f"\n🔄 创建转账交易...")
    
    # 转账金额
    transfer_amount = 50_000_000  # 0.05 SOL
    
    # 获取最新区块哈希
    try:
        blockhash_resp = client.get_latest_blockhash()
        recent_blockhash = blockhash_resp['result']['value']['blockhash']
    except:
        # 如果上面的方法不行，使用简化版本
        recent_blockhash = None
    
    # 创建转账交易
    if recent_blockhash:
        transfer_tx = Transaction(recent_blockhash=recent_blockhash)
    else:
        transfer_tx = Transaction()
    
    transfer_ix = transfer(
        TransferParams(
            from_pubkey=sender.public_key,
            to_pubkey=recipient.public_key,
            lamports=transfer_amount
        )
    )
    transfer_tx.add(transfer_ix)
    transfer_tx.sign(sender)
    
    print(f"📤 发送交易...")
    result = client.send_transaction(transfer_tx, sender)
    
    if 'result' in result:
        tx_signature = result['result']
        print(f"✅ 转账成功!")
        print(f"💸 转账金额: {transfer_amount / 1_000_000_000} SOL")
        print(f"📄 交易签名: {tx_signature}")
        
        # 保存信息
        activity_info = {
            "sender": str(sender.public_key),
            "recipient": str(recipient.public_key),
            "recipient_private_key": list(recipient.secret_key),
            "amount_sol": transfer_amount / 1_000_000_000,
            "transaction_signature": tx_signature,
            "network": "devnet",
            "timestamp": int(time.time())
        }
        
        with open('simple_transfer.json', 'w') as f:
            json.dump(activity_info, f, indent=2)
        
        print(f"\n🔗 查看交易:")
        print(f"   交易详情: https://explorer.solana.com/tx/{tx_signature}?cluster=devnet")
        print(f"   发送者: https://explorer.solana.com/address/{sender.public_key}?cluster=devnet")
        print(f"   接收者: https://explorer.solana.com/address/{recipient.public_key}?cluster=devnet")
        
        print(f"\n🎉 成功! 现在你可以在 Solana Explorer 上看到真实的交易了!")
        print(f"💾 信息已保存到: simple_transfer.json")
        
    else:
        print(f"❌ 交易失败: {result}")
        
except Exception as e:
    print(f"❌ 错误: {e}")
    import traceback
    traceback.print_exc()
