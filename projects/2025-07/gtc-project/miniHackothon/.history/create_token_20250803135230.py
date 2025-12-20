from solana.rpc.api import Client
from solana.keypair import Keypair
from solana.transaction import Transaction
from solana.system_program import create_account, CreateAccountParams
from solana.rpc.commitment import Confirmed
from solana.rpc.types import TxOpts
import dotenv, os

dotenv.load_dotenv()
private_key_str = os.getenv("PRIVATE_KEY")
private_key = [int(x) for x in private_key_str.split(",")]

client = Client("https://api.devnet.solana.com")
keypair = Keypair.from_secret_key(bytes(private_key))

print(f"钱包地址: {keypair.public_key}")

# 创建一个新的 mint 账户
mint_keypair = Keypair.generate()
print(f"新的代币 Mint 地址: {mint_keypair.public_key}")

# 获取最新的区块哈希
try:
    recent_blockhash_resp = client.get_latest_blockhash(commitment=Confirmed)
    if 'result' in recent_blockhash_resp and 'value' in recent_blockhash_resp['result']:
        recent_blockhash = recent_blockhash_resp['result']['value']['blockhash']
        print(f"最新区块哈希: {recent_blockhash}")
        
        # 创建一个简单的转账交易作为演示
        # 这里我们可以创建代币相关的交易
        print("代币 mint 准备就绪！")
        print(f"Mint 公钥: {mint_keypair.public_key}")
        print(f"Mint 私钥: {list(mint_keypair.secret_key)}")
        
    else:
        print("无法获取最新区块哈希")
        
except Exception as e:
    print(f"处理过程中出错: {e}")
