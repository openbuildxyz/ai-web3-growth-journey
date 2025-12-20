from solana.rpc.api import Client
from solana.keypair import Keypair
from solana.publickey import PublicKey
import dotenv, os
import json

dotenv.load_dotenv()
private_key_str = os.getenv("PRIVATE_KEY")
private_key = [int(x) for x in private_key_str.split(",")]

client = Client("https://api.devnet.solana.com")
keypair = Keypair.from_secret_key(bytes(private_key))

print(f"钱包地址: {keypair.public_key}")

# 检查当前余额
try:
    balance_resp = client.get_balance(keypair.public_key)
    if 'result' in balance_resp:
        balance = balance_resp['result']['value'] / 1_000_000_000
        print(f"当前 SOL 余额: {balance}")
        
        if balance > 0:
            # 创建一个新的代币 mint 密钥对
            mint_keypair = Keypair.generate()
            print(f"\n=== CO2 代币信息 ===")
            print(f"代币 Mint 地址: {mint_keypair.public_key}")
            print(f"代币名称: CO2 Token")
            print(f"代币符号: CO2")
            print(f"小数位数: 6")
            print(f"铸造权限: {keypair.public_key}")
            
            # 保存代币信息到文件
            token_info = {
                "mint_address": str(mint_keypair.public_key),
                "mint_private_key": list(mint_keypair.secret_key),
                "name": "CO2 Token",
                "symbol": "CO2",
                "decimals": 6,
                "mint_authority": str(keypair.public_key)
            }
            
            with open('co2_token_info.json', 'w') as f:
                json.dump(token_info, f, indent=2)
            
            print(f"\n代币信息已保存到 co2_token_info.json")
            print(f"你可以使用这个 mint 地址来创建和分发 CO2 代币！")
            
        else:
            print("SOL 余额不足，请先获取一些 SOL")
            
except Exception as e:
    print(f"处理过程中出错: {e}")
