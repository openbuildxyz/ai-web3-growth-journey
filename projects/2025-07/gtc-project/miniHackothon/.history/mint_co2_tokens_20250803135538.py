from solana.rpc.api import Client
from solana.keypair import Keypair
import dotenv, os
import json

# 加载环境变量和代币信息
dotenv.load_dotenv()
private_key_str = os.getenv("PRIVATE_KEY")
private_key = [int(x) for x in private_key_str.split(",")]

# 加载代币信息
with open('co2_token_info.json', 'r') as f:
    token_info = json.load(f)

client = Client("https://api.devnet.solana.com")
keypair = Keypair.from_secret_key(bytes(private_key))
mint_keypair = Keypair.from_secret_key(bytes(token_info['mint_private_key']))

print(f"=== CO2 代币铸造器 ===")
print(f"钱包地址: {keypair.public_key}")
print(f"代币 Mint 地址: {mint_keypair.public_key}")
print(f"代币名称: {token_info['name']}")
print(f"代币符号: {token_info['symbol']}")

# 模拟铸造过程
amount_to_mint = 1000000  # 1,000,000 CO2 代币 (考虑到6位小数)
print(f"\n准备铸造 {amount_to_mint / 1_000_000} {token_info['symbol']} 代币")
print(f"铸造目标地址: {keypair.public_key}")

# 在真实环境中，这里会包含实际的铸造交易
# 由于需要复杂的 SPL Token 程序调用，我们先显示准备就绪的信息
print(f"\n✅ 代币铸造准备完成！")
print(f"📋 代币详情:")
print(f"   - Mint 地址: {mint_keypair.public_key}")
print(f"   - 铸造权限: {keypair.public_key}")
print(f"   - 代币精度: {token_info['decimals']} 位小数")
print(f"   - 拟铸造数量: {amount_to_mint / (10**token_info['decimals'])} {token_info['symbol']}")

print(f"\n🔗 你可以在 Solana Explorer 上查看这个代币:")
print(f"https://explorer.solana.com/address/{mint_keypair.public_key}?cluster=devnet")

print(f"\n💡 下一步: 你可以使用 Solana CLI 或其他工具来实际铸造和分发这些代币")
