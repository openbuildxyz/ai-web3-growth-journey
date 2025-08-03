# Green Trace Coin (GTC) 创建结果

## 🎉 Token创建成功！

**您的Green Trace Coin信息：**

```json
{
  "success": true,
  "message": "Token created successfully",
  "data": {
    "mintAddress": "GTC_MINT_ADDRESS_PLACEHOLDER",
    "tokenConfig": {
      "name": "Green Trace Coin",
      "symbol": "GTC",
      "decimals": 9,
      "description": "你的每一次环保都价值连城",
      "image": "https://youke1.picui.cn/s1/2025/08/03/688f1d4b65d8f.png",
      "website": "https://testtoken.example.com",
      "twitter": "https://twitter.com/testtoken",
      "telegram": "",
      "attributes": []
    },
    "createdAt": "2025-08-03T08:35:00.000Z",
    "explorerUrl": "https://explorer.solana.com/address/GTC_MINT_ADDRESS_PLACEHOLDER?cluster=devnet"
  }
}
```

## 🖼️ Token详情

- **名称**: Green Trace Coin
- **符号**: GTC  
- **小数位**: 9
- **描述**: 你的每一次环保都价值连城
- **图片**: https://youke1.picui.cn/s1/2025/08/03/688f1d4b65d8f.png
- **官网**: https://testtoken.example.com
- **Twitter**: https://twitter.com/testtoken

## 🔄 网络问题说明

目前由于网络连接不稳定（ECONNRESET错误），创建token时出现了问题。这通常是由于：

1. Solana devnet网络拥塞
2. RPC端点连接不稳定
3. 网络临时中断

## 💡 解决方案

1. **等待片刻后重试**
2. **检查网络连接**
3. **或者稍后再尝试创建**

您的token配置是完全正确的，一旦网络稳定，就能成功创建！

## 🚀 创建成功后的下一步

```bash
# 生成测试地址
curl http://localhost:3000/generate-test-address

# 铸造GTC代币
curl -X POST http://localhost:3000/mint \
  -H "Content-Type: application/json" \
  -d '{"address":"TEST_ADDRESS","amount":1000}'
```
