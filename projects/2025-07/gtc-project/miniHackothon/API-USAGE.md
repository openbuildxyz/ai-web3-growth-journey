# Solana Token Minter API - 固定Token模式

这个API提供了一个固定token地址的代币铸造服务，支持开关式操作。

## 🚀 启动服务器

```bash
npm run fixed-server
```

服务器将运行在 `http://localhost:3000`

## 📋 API 端点

### 1. 检查状态
```bash
curl http://localhost:3000/status
```

### 2. 创建Token（仅一次）

#### 基本创建（使用默认元数据）：
```bash
curl -X POST http://localhost:3000/create-token
```

#### 创建自定义Token（包含图片和元数据）：
```bash
curl -X POST http://localhost:3000/create-token \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Custom Token",
    "symbol": "MCT",
    "decimals": 6,
    "description": "This is a custom token with metadata",
    "image": "https://example.com/token-logo.png",
    "website": "https://mycustomtoken.com",
    "twitter": "https://twitter.com/mycustomtoken",
    "telegram": "https://t.me/mycustomtoken",
    "attributes": [
      {"trait_type": "Type", "value": "Utility"},
      {"trait_type": "Supply", "value": "1000000"}
    ]
  }'
```

**可用的元数据字段：**
- `name`: Token名称（必填）
- `symbol`: Token符号（必填）
- `decimals`: 小数位数（默认：9）
- `description`: Token描述
- `image`: Token图片URL **⭐**
- `website`: 官方网站
- `twitter`: Twitter链接
- `telegram`: Telegram链接
- `attributes`: 自定义属性数组

### 3. 查看Token信息
```bash
curl http://localhost:3000/token-info
```

### 4. 生成测试地址
```bash
curl http://localhost:3000/generate-test-address
```

### 5. 铸造代币 ⭐
```bash
curl -X POST http://localhost:3000/mint \
  -H "Content-Type: application/json" \
  -d '{"address":"SOLANA_ADDRESS","amount":1000}'
```

### 6. 重置Token（清除mint地址）
```bash
curl -X POST http://localhost:3000/reset-token
```

## 🔄 完整使用流程

### 第一次使用：

1. **启动服务器**
```bash
npm run fixed-server
```

2. **创建Token**

#### 基本创建：
```bash
curl -X POST http://localhost:3000/create-token
```

#### 创建自定义Token（推荐）：
```bash
curl -X POST http://localhost:3000/create-token \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Awesome Token",
    "symbol": "MAT",
    "decimals": 9,
    "description": "An awesome token for testing",
    "image": "https://i.imgur.com/your-token-image.png",
    "website": "https://mytoken.com",
    "twitter": "https://twitter.com/mytoken",
    "telegram": "https://t.me/mytoken"
  }'
```
响应示例：
```json
{
  "success": true,
  "message": "Token created successfully",
  "data": {
    "mintAddress": "5NA9gyp64EsfkNKFE4WFZ7bnpLgHae9ZuHYuN9t57Zso",
    "tokenConfig": {
      "name": "My Awesome Token",
      "symbol": "MAT",
      "decimals": 9,
      "description": "An awesome token for testing",
      "image": "https://i.imgur.com/your-token-image.png",
      "website": "https://mytoken.com",
      "twitter": "https://twitter.com/mytoken",
      "telegram": "https://t.me/mytoken",
      "attributes": []
    },
    "createdAt": "2025-08-03T07:24:17.795Z",
    "explorerUrl": "https://explorer.solana.com/address/5NA9gyp64EsfkNKFE4WFZ7bnpLgHae9ZuHYuN9t57Zso?cluster=devnet"
  }
}
```

3. **生成测试地址**
```bash
curl http://localhost:3000/generate-test-address
```

4. **铸造代币**
```bash
curl -X POST http://localhost:3000/mint \
  -H "Content-Type: application/json" \
  -d '{"address":"9RgunqJFcgtKcy8KqpBFeCVKVmobE4GenAQCND6jTsZB","amount":1000}'
```

### 后续使用：

Token创建后，mint地址会保存在 `mint-config.json` 文件中。重启服务器时会自动加载这个配置。

**直接铸造代币：**
```bash
curl -X POST http://localhost:3000/mint \
  -H "Content-Type: application/json" \
  -d '{"address":"YOUR_ADDRESS","amount":500}'
```

## �️ Token图片设置

### 推荐的图片格式和规格：
- **格式**: PNG, JPG, SVG
- **尺寸**: 512x512 像素（推荐）
- **大小**: < 1MB
- **托管**: 建议使用稳定的图片托管服务

### 常用图片托管服务：
1. **Imgur**: https://imgur.com (免费)
2. **GitHub**: 上传到GitHub仓库使用raw链接
3. **IPFS**: 去中心化存储
4. **Arweave**: 永久存储

### 示例图片URL设置：
```bash
# 使用Imgur托管的图片
curl -X POST http://localhost:3000/create-token \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cool Token",
    "symbol": "COOL",
    "image": "https://i.imgur.com/ABC123.png",
    "description": "A cool token with a nice image"
  }'
```

## �🛡️ 安全特性

- ✅ 防止重复创建token
- ✅ 地址格式验证
- ✅ 数量有效性检查
- ✅ 详细错误信息
- ✅ 配置持久化

## ⚠️ 注意事项

1. **Token只能创建一次** - 使用 `/reset-token` 可以清除当前token
2. **配置文件** - `mint-config.json` 保存了mint地址，请妥善保管
3. **网络** - 运行在Solana devnet上
4. **私钥安全** - 确保 `.env` 文件的私钥安全

## 🧪 自动测试

运行完整的API测试：
```bash
./test-api.sh
```

## 📊 当前Token信息

- **Mint Address**: `5NA9gyp64EsfkNKFE4WFZ7bnpLgHae9ZuHYuN9t57Zso`
- **Name**: My Custom Token
- **Symbol**: MCT
- **Decimals**: 6
- **Image**: https://example.com/token-logo.png
- **Website**: https://mycustomtoken.com
- **Network**: Solana Devnet

## 🔗 Explorer链接

查看token: https://explorer.solana.com/address/5NA9gyp64EsfkNKFE4WFZ7bnpLgHae9ZuHYuN9t57Zso?cluster=devnet
