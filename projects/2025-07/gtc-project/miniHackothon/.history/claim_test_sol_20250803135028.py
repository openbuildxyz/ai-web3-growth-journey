from solana.rpc.api import Client
from solana.keypair import Keypair
import dotenv, os
from spl.token.client import Token
from spl.token.constants import TOKEN_PROGRAM_ID

dotenv.load_dotenv()
private_key_str = os.getenv("PRIVATE_KEY")
private_key = [int(x) for x in private_key_str.split(",")]

client = Client("https://api.devnet.solana.com")
keypair = Keypair.from_secret_key(bytes(private_key))  # 用上一步生成的私钥

print(f"钱包地址: {keypair.public_key}")



# 用你的钱包
token = Token.create_mint(
    conn=client,
    payer=keypair,
    mint_authority=keypair.public_key,
    decimals=6,  # 代币小数位数
    program_id=TOKEN_PROGRAM_ID
)
print("你的co2代币Mint地址:", token.pubkey)