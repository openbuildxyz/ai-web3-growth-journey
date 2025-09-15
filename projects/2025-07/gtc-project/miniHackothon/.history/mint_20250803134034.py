from solana.keypair import Keypair

# 生成新的钱包
keypair = Keypair.generate()
print('public_key:', keypair.public_key)
print('private_key:', list(keypair.secret_key))
