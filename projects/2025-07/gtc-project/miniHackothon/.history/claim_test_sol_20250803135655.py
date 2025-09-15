from solana.rpc.api import Client
from solana.keypair import Keypair
from solana.system_program import SYS_PROGRAM_ID
from solana.transaction import Transaction
from solana.rpc.types import TxOpts
from solana.rpc.commitment import Confirmed
import dotenv, os
import json

dotenv.load_dotenv()
private_key_str = os.getenv("PRIVATE_KEY")
private_key = [int(x) for x in private_key_str.split(",")]

client = Client("https://api.devnet.solana.com")
keypair = Keypair.from_secret_key(bytes(private_key))

print(f"钱包地址: {keypair.public_key}")

# 检查余额
try:
    balance_resp = client.get_balance(keypair.public_key, commitment=Confirmed)
    if balance_resp['result']:
        balance = balance_resp['result']['value'] / 1_000_000_000  # 转换为SOL
        print(f"当前余额: {balance} SOL")
    else:
        print("无法获取余额")
except Exception as e:
    print(f"获取余额时出错: {e}")

# 如果余额不足，请求空投
if balance < 1:
    print("余额不足，请求空投...")
    try:
        airdrop_resp = client.request_airdrop(keypair.public_key, 2_000_000_000)  # 2 SOL
        if 'result' in airdrop_resp:
            print(f"空投请求成功，交易签名: {airdrop_resp['result']}")
        else:
            print("空投请求失败")
    except Exception as e:
        print(f"空投请求时出错: {e}")

# 创建测试代币
print("\n=== 创建测试代币 ===")
test_token_keypair = Keypair.generate()
print(f"测试代币 Mint 地址: {test_token_keypair.public_key}")

# 保存测试代币信息
test_token_info = {
    "name": "Test CO2 Token",
    "symbol": "TESTCO2",
    "mint_address": str(test_token_keypair.public_key),
    "mint_private_key": list(test_token_keypair.secret_key),
    "decimals": 6,
    "mint_authority": str(keypair.public_key),
    "network": "devnet"
}

with open('test_token_info.json', 'w') as f:
    json.dump(test_token_info, f, indent=2)

print(f"✅ 测试代币信息已生成")
print(f"📋 代币详情:")
print(f"   - 名称: {test_token_info['name']}")
print(f"   - 符号: {test_token_info['symbol']}")
print(f"   - Mint 地址: {test_token_info['mint_address']}")
print(f"   - 小数位数: {test_token_info['decimals']}")
print(f"   - 铸造权限: {test_token_info['mint_authority']}")
print(f"   - 网络: {test_token_info['network']}")

print(f"\n🔗 在 Solana Explorer 查看:")
print(f"https://explorer.solana.com/address/{test_token_info['mint_address']}?cluster=devnet")

print(f"\n💡 测试代币信息已保存到 test_token_info.json")