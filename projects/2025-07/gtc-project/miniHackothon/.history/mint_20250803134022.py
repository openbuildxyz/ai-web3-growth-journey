from solana.keypair import Keypair

# 生成新的钱包
keypair = Keypair.generate()
print('':", keypair.public_key)
print("私钥:", list(keypair.secret_key))
