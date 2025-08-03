from solana.rpc.api import Client
from solana.keypair import Keypair
import dotenv, os

dotenv.load_dotenv()
private_key_str = os.getenv("PRIVATE_KEY")
private_key = [int(x) for x in private_key_str.split(",")]

client = Client("https://api.devnet.solana.com")
keypair = Keypair.from_secret_key(bytes(private_key))  # 用上一步生成的私钥

print(f"钱包地址: {keypair.public_key}")

# 领取2 SOL
result = client.request_airdrop(keypair.public_key, 2_000_000_000)
print(f"空投请求结果: {result}")