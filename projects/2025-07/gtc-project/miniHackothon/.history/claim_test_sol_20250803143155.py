from solana.rpc.api import Client
from solana.keypair import Keypair
from solana.system_program import SYS_PROGRAM_ID
from solana.transaction import Transaction
from solana.rpc.types import TxOpts
from solana.rpc.commitment import Confirmed
import dotenv, os
import json

dotenv.load_dotenv()
private_key_str = os.getenv("PRIVATE_KEY")
private_key = [int(x) for x in private_key_str.split(",")]

client = Client("https://api.devnet.solana.com")
keypair = Keypair.from_secret_key(bytes(private_key))

print(f"钱包地址: {keypair.public_key}")

# 检查余额
try:
    balance_resp = client.get_balance(keypair.public_key, commitment=Confirmed)
    if balance_resp['result']:
        balance = balance_resp['result']['value'] / 1_000_000_000  # 转换为SOL
        print(f"当前余额: {balance} SOL")
    else:
        print("无法获取余额")
except Exception as e:
    print(f"获取余额时出错: {e}")

# 如果余额不足，请求空投
if balance < 1:
    print("余额不足，请求空投...")
    try:
        airdrop_resp = client.request_airdrop(keypair.public_key, 2_000_000_000)  # 2 SOL
        if 'result' in airdrop_resp:
            print(f"空投请求成功，交易签名: {airdrop_resp['result']}")
        else:
            print("空投请求失败")
    except Exception as e:
        print(f"空投请求时出错: {e}")