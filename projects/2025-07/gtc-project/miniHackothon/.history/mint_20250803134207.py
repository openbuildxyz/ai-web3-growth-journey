from solana.rpc.api import Client
from solana.keypair import Keypair
import dotenv

dotenv.load_dotenv()


# 领取2 SOL
client.request_airdrop(keypair.public_key, 2_000_000_000)