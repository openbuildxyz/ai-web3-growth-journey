#!/usr/bin/env python3
"""
实际在 Solana 链上创建 SPL Token 并测试转账
使用原生 Solana 交易和指令
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
import struct
import base58

# 加载环境变量和代币信息
dotenv.load_dotenv()
private_key_str = os.getenv("PRIVATE_KEY")
private_key = [int(x) for x in private_key_str.split(",")]

with open('my_token_on_chain.json', 'r') as f:
    token_info = json.load(f)

# 初始化
client = Client("https://api.devnet.solana.com")
payer = Keypair.from_secret_key(bytes(private_key))
mint = Keypair.from_secret_key(bytes(token_info['mint_private_key']))
recipient = Keypair.from_secret_key(bytes(token_info['recipient_private_key']))

# 程序 ID
TOKEN_PROGRAM_ID = PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
SYSTEM_PROGRAM_ID = PublicKey("11111111111111111111111111111111")

print(f"=== 在链上创建 SPL Token ===")
print(f"👤 支付者: {payer.public_key}")
print(f"🏭 代币 Mint: {mint.public_key}")
print(f"🎯 接收者: {recipient.public_key}")

try:
    # 1. 检查当前余额
    balance_resp = client.get_balance(payer.public_key, commitment=Confirmed)
    balance = balance_resp['result']['value'] / 1_000_000_000
    print(f"💰 当前余额: {balance} SOL")
    
    # 2. 获取 mint 账户的租金要求
    mint_rent_resp = client.get_minimum_balance_for_rent_exemption(82)  # Mint 账户 82 字节
    mint_rent = mint_rent_resp['result']
    print(f"🏦 Mint 账户租金: {mint_rent / 1_000_000_000} SOL")
    
    # 3. 获取最新的区块哈希
    recent_blockhash_resp = client.get_recent_blockhash(commitment=Confirmed)
    recent_blockhash = recent_blockhash_resp['result']['value']['blockhash']
    print(f"🔗 最新区块哈希: {recent_blockhash}")
    
    # 4. 创建 mint 账户的指令
    create_mint_account_ix = create_account(
        CreateAccountParams(
            from_pubkey=payer.public_key,
            new_account_pubkey=mint.public_key,
            lamports=mint_rent,
            space=82,  # Mint 账户大小
            program_id=TOKEN_PROGRAM_ID
        )
    )
    
    # 5. 初始化 mint 的指令数据
    # InitializeMint 指令: [0, decimals(1), mint_authority(32), freeze_authority_option(1+32?)]
    decimals = 9
    initialize_mint_data = struct.pack(
        '<B B 32s B',
        0,  # InitializeMint 指令
        decimals,  # 小数位数
        bytes(payer.public_key),  # mint authority
        0   # 没有 freeze authority
    )
    
    from solana.transaction import TransactionInstruction
    
    initialize_mint_ix = TransactionInstruction(
        keys=[
            {"pubkey": mint.public_key, "is_signer": False, "is_writable": True},
            {"pubkey": PublicKey("SysvarRent111111111111111111111111111111111"), "is_signer": False, "is_writable": False},
        ],
        program_id=TOKEN_PROGRAM_ID,
        data=initialize_mint_data
    )
    
    # 6. 创建交易
    transaction = Transaction()
    transaction.add(create_mint_account_ix)
    transaction.add(initialize_mint_ix)
    transaction.recent_blockhash = recent_blockhash
    
    # 7. 签名并发送交易
    print(f"📝 正在签名交易...")
    transaction.sign(payer, mint)
    
    print(f"🚀 发送交易到链上...")
    result = client.send_transaction(
        transaction, 
        payer, 
        mint,
        opts=TxOpts(skip_confirmation=False, preflight_commitment=Confirmed)
    )
    
    if 'result' in result:
        tx_signature = result['result']
        print(f"✅ 交易成功！")
        print(f"📄 交易签名: {tx_signature}")
        print(f"🔗 查看交易: https://explorer.solana.com/tx/{tx_signature}?cluster=devnet")
        
        # 更新代币状态
        token_info['status'] = '已在链上创建'
        token_info['creation_tx'] = tx_signature
        
        with open('my_token_on_chain.json', 'w') as f:
            json.dump(token_info, f, indent=2)
            
        print(f"🎉 SPL Token 已成功创建在 Solana devnet!")
        print(f"🏭 代币 Mint 地址: {mint.public_key}")
        
    else:
        print(f"❌ 交易失败: {result}")
        
except Exception as e:
    print(f"❌ 创建过程中出错: {e}")
    print(f"🔍 详细错误: {type(e).__name__}: {str(e)}")
