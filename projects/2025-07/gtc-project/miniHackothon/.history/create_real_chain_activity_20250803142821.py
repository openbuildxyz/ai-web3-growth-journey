#!/usr/bin/env python3
"""
简化版本：创建链上SOL转账来证明真实的链上活动
这将在Solana Explorer上显示真实的交易记录
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

print(f"=== 创建真实的链上转账活动 ===")
print(f"👤 发送者: {sender.public_key}")

# 创建多个接收者进行测试
recipients = []
for i in range(3):
    recipient = Keypair.generate()
    recipients.append(recipient)
    print(f"🎯 接收者{i+1}: {recipient.public_key}")

# 检查余额
balance_resp = client.get_balance(sender.public_key)
balance = balance_resp['result']['value'] / 1_000_000_000
print(f"💰 发送者余额: {balance} SOL")

if balance < 0.3:
    print("❌ 余额不足")
    exit()

successful_transfers = []

print(f"\n🚀 开始执行链上转账...")

try:
    for i, recipient in enumerate(recipients):
        print(f"\n🔄 转账 {i+1}/3 到 {recipient.public_key}...")
        
        # 转账金额 (递减)
        transfer_amount = (50 - i*10) * 1_000_000  # 0.05, 0.04, 0.03 SOL
        
        # 创建转账交易 (不需要区块哈希，系统会自动处理)
        transfer_tx = Transaction()
        transfer_ix = transfer(
            TransferParams(
                from_pubkey=sender.public_key,
                to_pubkey=recipient.public_key,
                lamports=transfer_amount
            )
        )
        transfer_tx.add(transfer_ix)
        
        # 简单的发送方式
        try:
            result = client.send_transaction(transfer_tx, sender)
            
            if isinstance(result, dict) and 'result' in result:
                tx_signature = result['result']
                print(f"✅ 转账成功!")
                print(f"💸 金额: {transfer_amount / 1_000_000_000} SOL")
                print(f"📄 交易签名: {tx_signature}")
                
                successful_transfers.append({
                    "recipient": str(recipient.public_key),
                    "recipient_private_key": list(recipient.secret_key),
                    "amount_sol": transfer_amount / 1_000_000_000,
                    "transaction_signature": tx_signature,
                    "transfer_number": i + 1
                })
                
                # 等待一下避免频率限制
                time.sleep(2)
                
            else:
                print(f"⚠️  转账可能失败，但继续尝试下一个")
                
        except Exception as e:
            print(f"⚠️  转账 {i+1} 遇到问题: {e}")
            continue

    if successful_transfers:
        print(f"\n🎉 链上转账活动创建成功!")
        print(f"✅ 成功完成 {len(successful_transfers)} 次转账")
        
        # 保存所有成功的转账信息
        final_activity = {
            "sender": str(sender.public_key),
            "total_transfers": len(successful_transfers),
            "total_amount_sent": sum(t['amount_sol'] for t in successful_transfers),
            "transfers": successful_transfers,
            "network": "devnet",
            "timestamp": int(time.time()),
            "status": "链上活动已创建"
        }
        
        with open('real_on_chain_activity.json', 'w') as f:
            json.dump(final_activity, f, indent=2)
        
        print(f"\n📋 转账总结:")
        for i, transfer in enumerate(successful_transfers):
            print(f"   {i+1}. {transfer['amount_sol']} SOL → {transfer['recipient']}")
            print(f"      🔗 https://explorer.solana.com/tx/{transfer['transaction_signature']}?cluster=devnet")
        
        print(f"\n🔗 查看发送者钱包:")
        print(f"https://explorer.solana.com/address/{sender.public_key}?cluster=devnet")
        
        print(f"\n💾 详细信息已保存到: real_on_chain_activity.json")
        print(f"🎊 现在你可以在Solana Explorer上看到真实的转账记录了!")
        
        # 检查最终余额
        final_balance_resp = client.get_balance(sender.public_key)
        final_balance = final_balance_resp['result']['value'] / 1_000_000_000
        print(f"\n💰 转账后余额: {final_balance} SOL")
        
    else:
        print(f"❌ 没有成功的转账")

except Exception as e:
    print(f"❌ 整体操作失败: {e}")
    import traceback
    traceback.print_exc()

print(f"\n✨ 链上活动测试完成!")
