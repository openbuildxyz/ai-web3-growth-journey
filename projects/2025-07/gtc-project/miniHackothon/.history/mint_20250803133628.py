from solana.keypair import Keypair

# 生成新的钱包
keypair = Keypair.generate()
print("公钥:", keypair.pubkey())
print("私钥:", list(keypair.secret()))