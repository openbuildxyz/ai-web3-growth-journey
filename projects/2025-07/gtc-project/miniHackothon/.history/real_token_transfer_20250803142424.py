#!/usr/bin/env python3
"""
真正在链上创建SPL Token并进行代币转账
使用spl-token命令行工具
"""

import subprocess
import dotenv
import os
import json
from solana.keypair import Keypair

# 加载环境变量
dotenv.load_dotenv()
private_key_str = os.getenv("PRIVATE_KEY")
private_key = [int(x) for x in private_key_str.split(",")]
wallet = Keypair.from_secret_key(bytes(private_key))

print(f"=== 真正在链上创建SPL Token并转账 ===")
print(f"👤 你的钱包: {wallet.public_key}")

# 创建接收者钱包
recipient = Keypair.generate()
print(f"🎯 接收者钱包: {recipient.public_key}")

# 保存接收者私钥到临时文件
recipient_key_file = "recipient_keypair.json"
with open(recipient_key_file, 'w') as f:
    json.dump(list(recipient.secret_key), f)

print(f"\n🔧 步骤1: 安装spl-token CLI工具...")

try:
    # 检查是否已安装spl-token
    result = subprocess.run(['spl-token', '--version'], capture_output=True, text=True)
    if result.returncode == 0:
        print(f"✅ spl-token已安装: {result.stdout.strip()}")
    else:
        print(f"📦 安装spl-token工具...")
        # 使用cargo安装spl-token-cli
        subprocess.run(['cargo', 'install', 'spl-token-cli'], check=True)
        print(f"✅ spl-token安装完成")
except FileNotFoundError:
    print(f"⚠️  需要先安装Rust和Cargo")
    print(f"请运行: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh")
    exit(1)
except subprocess.CalledProcessError:
    print(f"❌ 安装spl-token失败")
    exit(1)

print(f"\n🔧 步骤2: 配置Solana CLI...")

# 配置Solana CLI指向devnet
try:
    subprocess.run(['solana', 'config', 'set', '--url', 'https://api.devnet.solana.com'], check=True)
    print(f"✅ Solana CLI配置为devnet")
    
    # 检查当前配置
    result = subprocess.run(['solana', 'config', 'get'], capture_output=True, text=True)
    print(f"📋 当前配置:\n{result.stdout}")
    
except subprocess.CalledProcessError as e:
    print(f"❌ 配置Solana CLI失败: {e}")
    exit(1)

print(f"\n🔧 步骤3: 创建SPL Token...")

try:
    # 创建新的token mint
    result = subprocess.run([
        'spl-token', 'create-token', 
        '--decimals', '6'
    ], capture_output=True, text=True)
    
    if result.returncode == 0:
        # 提取token地址
        lines = result.stdout.strip().split('\n')
        token_address = None
        for line in lines:
            if 'Creating token' in line:
                token_address = line.split()[-1]
                break
        
        if token_address:
            print(f"✅ Token创建成功!")
            print(f"🏭 Token地址: {token_address}")
            
            # 创建token账户
            print(f"\n🔧 步骤4: 创建token账户...")
            result = subprocess.run([
                'spl-token', 'create-account', token_address
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"✅ Token账户创建成功")
                
                # 铸造代币
                print(f"\n🔧 步骤5: 铸造代币...")
                mint_amount = "1000"  # 铸造1000个代币
                result = subprocess.run([
                    'spl-token', 'mint', token_address, mint_amount
                ], capture_output=True, text=True)
                
                if result.returncode == 0:
                    print(f"✅ 铸造成功! 铸造了 {mint_amount} 个代币")
                    
                    # 给接收者空投SOL用于交易费
                    print(f"\n🔧 步骤6: 给接收者空投SOL...")
                    result = subprocess.run([
                        'solana', 'airdrop', '1', str(recipient.public_key)
                    ], capture_output=True, text=True)
                    
                    if result.returncode == 0:
                        print(f"✅ 接收者空投成功")
                        
                        # 为接收者创建token账户
                        print(f"\n🔧 步骤7: 为接收者创建token账户...")
                        result = subprocess.run([
                            'spl-token', 'create-account', token_address, 
                            '--owner', str(recipient.public_key)
                        ], capture_output=True, text=True)
                        
                        if result.returncode == 0:
                            print(f"✅ 接收者token账户创建成功")
                            
                            # 转账代币
                            print(f"\n🔧 步骤8: 转账代币给接收者...")
                            transfer_amount = "100"  # 转账100个代币
                            result = subprocess.run([
                                'spl-token', 'transfer', token_address, 
                                transfer_amount, str(recipient.public_key)
                            ], capture_output=True, text=True)
                            
                            if result.returncode == 0:
                                print(f"✅ 代币转账成功!")
                                print(f"💸 转账了 {transfer_amount} 个代币给 {recipient.public_key}")
                                
                                # 查看余额
                                print(f"\n📊 查看余额...")
                                result = subprocess.run([
                                    'spl-token', 'balance', token_address
                                ], capture_output=True, text=True)
                                
                                if result.returncode == 0:
                                    sender_balance = result.stdout.strip()
                                    print(f"💰 发送者余额: {sender_balance}")
                                
                                result = subprocess.run([
                                    'spl-token', 'balance', token_address, 
                                    '--owner', str(recipient.public_key)
                                ], capture_output=True, text=True)
                                
                                if result.returncode == 0:
                                    recipient_balance = result.stdout.strip()
                                    print(f"💰 接收者余额: {recipient_balance}")
                                
                                # 保存完整信息
                                token_info = {
                                    "token_address": token_address,
                                    "sender": str(wallet.public_key),
                                    "recipient": str(recipient.public_key),
                                    "recipient_private_key": list(recipient.secret_key),
                                    "minted_amount": mint_amount,
                                    "transferred_amount": transfer_amount,
                                    "sender_balance": sender_balance,
                                    "recipient_balance": recipient_balance,
                                    "network": "devnet",
                                    "status": "链上转账完成"
                                }
                                
                                with open('successful_token_transfer.json', 'w') as f:
                                    json.dump(token_info, f, indent=2)
                                
                                print(f"\n🎉 SPL Token转账完全成功!")
                                print(f"📋 总结:")
                                print(f"   🏭 Token地址: {token_address}")
                                print(f"   👤 发送者: {wallet.public_key}")
                                print(f"   🎯 接收者: {recipient.public_key}")
                                print(f"   💸 转账数量: {transfer_amount}")
                                
                                print(f"\n🔗 在Solana Explorer查看:")
                                print(f"   Token: https://explorer.solana.com/address/{token_address}?cluster=devnet")
                                print(f"   发送者: https://explorer.solana.com/address/{wallet.public_key}?cluster=devnet")
                                print(f"   接收者: https://explorer.solana.com/address/{recipient.public_key}?cluster=devnet")
                                
                                print(f"\n💾 信息已保存到: successful_token_transfer.json")
                            else:
                                print(f"❌ 代币转账失败: {result.stderr}")
                        else:
                            print(f"❌ 创建接收者token账户失败: {result.stderr}")
                    else:
                        print(f"❌ 接收者空投失败: {result.stderr}")
                else:
                    print(f"❌ 铸造代币失败: {result.stderr}")
            else:
                print(f"❌ 创建token账户失败: {result.stderr}")
        else:
            print(f"❌ 无法解析token地址")
    else:
        print(f"❌ 创建token失败: {result.stderr}")

except subprocess.CalledProcessError as e:
    print(f"❌ 执行命令失败: {e}")
except Exception as e:
    print(f"❌ 意外错误: {e}")

# 清理临时文件
if os.path.exists(recipient_key_file):
    os.remove(recipient_key_file)
