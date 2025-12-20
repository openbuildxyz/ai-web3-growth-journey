from solana.rpc.api import Client
from solana.keypair import Keypair
from
client = Client("https://api.devnet.solana.com")
keypair = Keypair.from_secret_key(bytes(你的私钥list))  # 用上一步生成的私钥

# 领取2 SOL
client.request_airdrop(keypair.public_key, 2_000_000_000)