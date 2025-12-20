#!/usr/bin/env python3
"""
简化版本：通过转账创建链上活动记录
"""

from solana.rpc.api import Client
from solana.keypair import Keypair
from solana.publickey import PublicKey
from solana.transaction import Transaction
from solana.system_program import transfer, TransferParams
import dotenv, os
import json
import time

# 加载环境变量
dotenv.load_dotenv()
private_key_str = os.getenv("PRIVATE_KEY")
private_key = [int(x) for x in private_key_str.split(",")]

# 加载 CO2 代币信息
with open('co2_token_info.json', 'r') as f:
    co2_token = json.load(f)

client = Client("https://api.devnet.solana.com")
sender = Keypair.from_secret_key(bytes(private_key))

# 创建接收者
recipient = Keypair.generate()

print(f"=== 创建链上活动记录 ===")
print(f"👤 发送者 (你的钱包): {sender.public_key}")
print(f"🎯 接收者: {recipient.public_key}")
print(f"🏭 CO2 Token Mint: {co2_token['mint_address']}")

# 检查发送者余额
balance_resp = client.get_balance(sender.public_key)
balance = balance_resp['result']['value'] / 1_000_000_000
print(f"💰 发送者余额: {balance} SOL")

try:
    print(f"\n🔄 步骤 1: 给接收者空投 SOL...")
    
    # 给接收者空投
    airdrop_resp = client.request_airdrop(recipient.public_key, 1_000_000_000)  # 1 SOL
    if 'result' in airdrop_resp:
        airdrop_tx = airdrop_resp['result']
        print(f"✅ 接收者空投成功!")
        print(f"🔗 空投交易: https://explorer.solana.com/tx/{airdrop_tx}?cluster=devnet")
        
        # 等待确认
        time.sleep(8)
        
        # 检查接收者余额
        recipient_balance_resp = client.get_balance(recipient.public_key)
        recipient_balance = recipient_balance_resp['result']['value'] / 1_000_000_000
        print(f"🎯 接收者现在有: {recipient_balance} SOL")
    
    print(f"\n🔄 步骤 2: 从你的钱包转账 SOL 给接收者...")
    
    # 创建转账交易
    transfer_amount = 100_000_000  # 0.1 SOL
    
    # 获取最新区块哈希
    blockhash_resp = client.get_recent_blockhash()
    recent_blockhash = blockhash_resp['result']['value']['blockhash']
    
    # 创建转账交易
    transfer_tx = Transaction(recent_blockhash=recent_blockhash)
    transfer_ix = transfer(
        TransferParams(
            from_pubkey=sender.public_key,
            to_pubkey=recipient.public_key,
            lamports=transfer_amount
        )
    )
    transfer_tx.add(transfer_ix)
    
    # 签名并发送
    transfer_tx.sign(sender)
    
    print(f"📤 发送转账交易...")
    result = client.send_transaction(transfer_tx, sender)
    
    if 'result' in result:
        transfer_tx_sig = result['result']
        print(f"✅ 转账成功!")
        print(f"🔗 转账交易: https://explorer.solana.com/tx/{transfer_tx_sig}?cluster=devnet")
        print(f"💸 转账金额: {transfer_amount / 1_000_000_000} SOL")
        
        # 等待确认
        time.sleep(8)
        
        # 检查最终余额
        final_sender_balance = client.get_balance(sender.public_key)['result']['value'] / 1_000_000_000
        final_recipient_balance = client.get_balance(recipient.public_key)['result']['value'] / 1_000_000_000
        
        print(f"\n📊 最终余额:")
        print(f"   发送者: {final_sender_balance} SOL")
        print(f"   接收者: {final_recipient_balance} SOL")
        
        # 保存链上活动信息
        on_chain_activity = {
            "sender_wallet": str(sender.public_key),
            "recipient_wallet": str(recipient.public_key),
            "recipient_private_key": list(recipient.secret_key),
            "co2_token_mint": co2_token['mint_address'],
            "airdrop_tx": airdrop_tx if 'airdrop_tx' in locals() else None,
            "transfer_tx": transfer_tx_sig,
            "transfer_amount_sol": transfer_amount / 1_000_000_000,
            "network": "devnet",
            "timestamp": time.time(),
            "status": "链上活动已创建"
        }
        
        with open('on_chain_activity.json', 'w') as f:
            json.dump(on_chain_activity, f, indent=2)
        
        print(f"\n🎉 链上活动记录已创建!")
        print(f"📋 交易信息:")
        print(f"   发送者: {sender.public_key}")
        print(f"   接收者: {recipient.public_key}")
        print(f"   转账金额: {transfer_amount / 1_000_000_000} SOL")
        
        print(f"\n🔗 在 Solana Explorer 查看:")
        print(f"   你的钱包: https://explorer.solana.com/address/{sender.public_key}?cluster=devnet")
        print(f"   接收者钱包: https://explorer.solana.com/address/{recipient.public_key}?cluster=devnet")
        print(f"   转账交易: https://explorer.solana.com/tx/{transfer_tx_sig}?cluster=devnet")
        if 'airdrop_tx' in locals():
            print(f"   空投交易: https://explorer.solana.com/tx/{airdrop_tx}?cluster=devnet")
        
        print(f"\n💾 活动信息已保存到: on_chain_activity.json")
        print(f"🎊 现在你可以在 Solana Explorer 上看到真实的交易记录了!")
        
    else:
        print(f"❌ 转账失败: {result}")
        
except Exception as e:
    print(f"❌ 操作失败: {e}")
    import traceback
    traceback.print_exc()
