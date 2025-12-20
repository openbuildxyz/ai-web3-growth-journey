from spl.token.client import Token
from spl.token.constants import TOKEN_PROGRAM_ID

# 用你的钱包
token = Token.create_mint(
    conn=client,
    payer=keypair,
    mint_authority=keypair.public_key,
    decimals=6,  # 代币小数位数
    program_id=TOKEN_PROGRAM_ID
)
print("你的co2代币Mint地址:", token.pubkey)