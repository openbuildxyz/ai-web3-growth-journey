# API接口文档 - 代币经济与分润系统

## 📌 概述

本模块提供去中心化内容创作平台的代币经济和自动分润功能，包括智能合约和前端SDK。

---

## 🔗 合约地址（部署后更新）

### Polygon Mumbai测试网
```javascript
{
  "ContentToken": "待部署后更新",
  "ContentPlatform": "待部署后更新"
}
```

### Monad测试网
```javascript
{
  "ContentToken": "待部署后更新",
  "ContentPlatform": "待部署后更新"
}
```

---

## 🛠️ SDK集成指南

### 安装和导入

```javascript
// 将 sdk/ 文件夹复制到你的项目中
import ContentPlatformSDK from './sdk';
```

### 初始化

```javascript
const sdk = new ContentPlatformSDK();

// 连接钱包并初始化
const address = await sdk.initialize('polygon_mumbai');
console.log('已连接钱包:', address);
```

---

## 📡 API接口说明

### 1. 发布内容

**功能**: 将内容发布到平台，内容需先上传到IPFS

**方法**: `publishContent(ipfsHash)`

**参数**:
- `ipfsHash` (string): IPFS内容哈希，例如 "QmXxx..."

**返回**: 
- `contentId` (number): 内容ID

**示例**:
```javascript
const platform = sdk.getPlatformContract();

// 假设内容已上传到IPFS，获得哈希
const ipfsHash = "QmYourContentHash123456";

// 发布内容
const contentId = await platform.publishContent(ipfsHash);
console.log('内容已发布，ID:', contentId);
```

**注意事项**:
- IPFS哈希不能为空
- 每次调用会生成新的内容ID
- 需要支付Gas费用

---

### 2. 点赞内容

**功能**: 用户点赞内容，创作者自动获得代币奖励

**方法**: `likeContent(contentId)`

**参数**:
- `contentId` (number): 内容ID

**返回**: 
- `receipt` (Object): 交易回执

**奖励分配**:
- 创作者获得: 8 CPT（10 CPT × 80%）
- 平台收取: 2 CPT

**示例**:
```javascript
const platform = sdk.getPlatformContract();

// 点赞内容
const receipt = await platform.likeContent(1);
console.log('点赞成功，交易哈希:', receipt.hash);
```

**限制条件**:
- ❌ 不能点赞自己的内容
- ❌ 不能重复点赞同一内容
- ✅ 每个用户每个内容只能点赞一次

---

### 3. 分享内容

**功能**: 用户分享内容，创作者和分享者都获得奖励

**方法**: `shareContent(contentId)`

**参数**:
- `contentId` (number): 内容ID

**返回**: 
- `receipt` (Object): 交易回执

**奖励分配**:
- 创作者获得: 36 CPT（50 CPT × 80% × 90%）
- 分享者获得: 4 CPT（50 CPT × 80% × 10%）
- 平台收取: 10 CPT

**示例**:
```javascript
const platform = sdk.getPlatformContract();

// 分享内容
const receipt = await platform.shareContent(1);
console.log('分享成功');
```

**限制条件**:
- ❌ 不能分享自己的内容
- ❌ 不能重复分享同一内容
- ✅ 每个用户每个内容只能分享一次

---

### 4. 查询内容信息

**功能**: 获取内容的详细信息

**方法**: `getContent(contentId)`

**参数**:
- `contentId` (number): 内容ID

**返回**: 
```javascript
{
  creator: "0x...",           // 创作者地址
  ipfsHash: "QmXxx...",       // IPFS哈希
  timestamp: 1234567890,      // 发布时间戳
  likes: 10,                  // 点赞数
  shares: 5,                  // 分享数
  totalEarnings: "123.45"     // 总收益（CPT）
}
```

**示例**:
```javascript
const platform = sdk.getPlatformContract();

const content = await platform.getContent(1);
console.log('创作者:', content.creator);
console.log('点赞数:', content.likes);
console.log('总收益:', content.totalEarnings, 'CPT');
```

---

### 5. 查询用户内容列表

**功能**: 获取用户发布的所有内容ID

**方法**: `getUserContents(userAddress)`

**参数**:
- `userAddress` (string): 用户钱包地址

**返回**: 
- `contentIds` (number[]): 内容ID数组

**示例**:
```javascript
const platform = sdk.getPlatformContract();

const contentIds = await platform.getUserContents('0xUserAddress...');
console.log('用户发布的内容:', contentIds); // [1, 2, 3]

// 获取每个内容的详细信息
for (const id of contentIds) {
  const content = await platform.getContent(id);
  console.log(`内容${id}:`, content);
}
```

---

### 6. 查询代币余额

**功能**: 查询指定地址的CPT代币余额

**方法**: `balanceOf(address)`

**参数**:
- `address` (string): 钱包地址

**返回**: 
- `balance` (string): 代币余额（CPT）

**示例**:
```javascript
const token = sdk.getTokenContract();

const balance = await token.balanceOf('0xAddress...');
console.log('代币余额:', balance, 'CPT');
```

---

### 7. 转账代币

**功能**: 将CPT代币转账给其他地址

**方法**: `transfer(to, amount)`

**参数**:
- `to` (string): 接收地址
- `amount` (string): 转账数量（CPT）

**返回**: 
- `receipt` (Object): 交易回执

**示例**:
```javascript
const token = sdk.getTokenContract();

// 转账100个CPT
const receipt = await token.transfer('0xRecipient...', '100');
console.log('转账成功');
```

---

## 🎧 事件监听

### 监听内容发布

```javascript
const platform = sdk.getPlatformContract();

platform.onContentPublished((event) => {
  console.log('新内容发布:', {
    contentId: event.contentId,
    creator: event.creator,
    ipfsHash: event.ipfsHash,
    transactionHash: event.transactionHash
  });
  
  // 可以在这里更新UI
});
```

### 监听点赞事件

```javascript
platform.onContentLiked((event) => {
  console.log('内容被点赞:', {
    contentId: event.contentId,
    user: event.user,
    transactionHash: event.transactionHash
  });
});
```

### 监听分享事件

```javascript
platform.onContentShared((event) => {
  console.log('内容被分享:', {
    contentId: event.contentId,
    user: event.user,
    transactionHash: event.transactionHash
  });
});
```

### 清理监听器

```javascript
// 当组件卸载时，清理监听器
platform.removeAllListeners();
```

---

## 🔄 完整使用流程示例

### React组件示例

```javascript
import React, { useState, useEffect } from 'react';
import ContentPlatformSDK from './sdk';

function ContentPlatform() {
  const [sdk, setSdk] = useState(null);
  const [address, setAddress] = useState('');
  const [contents, setContents] = useState([]);

  // 1. 初始化SDK
  const connectWallet = async () => {
    try {
      const newSdk = new ContentPlatformSDK();
      const addr = await newSdk.initialize('polygon_mumbai');
      setSdk(newSdk);
      setAddress(addr);
      loadUserContents(newSdk, addr);
    } catch (error) {
      alert('连接失败: ' + error.message);
    }
  };

  // 2. 加载用户内容
  const loadUserContents = async (sdkInstance, userAddress) => {
    try {
      const platform = sdkInstance.getPlatformContract();
      const contentIds = await platform.getUserContents(userAddress);
      
      const contentList = await Promise.all(
        contentIds.map(id => platform.getContent(id))
      );
      
      setContents(contentList);
    } catch (error) {
      console.error('加载内容失败:', error);
    }
  };

  // 3. 发布内容
  const publishContent = async (ipfsHash) => {
    try {
      const platform = sdk.getPlatformContract();
      const contentId = await platform.publishContent(ipfsHash);
      alert('发布成功! ID: ' + contentId);
      loadUserContents(sdk, address);
    } catch (error) {
      alert('发布失败: ' + error.message);
    }
  };

  // 4. 点赞内容
  const likeContent = async (contentId) => {
    try {
      const platform = sdk.getPlatformContract();
      await platform.likeContent(contentId);
      alert('点赞成功!');
      loadUserContents(sdk, address);
    } catch (error) {
      alert('点赞失败: ' + error.message);
    }
  };

  return (
    <div>
      {!address ? (
        <button onClick={connectWallet}>连接钱包</button>
      ) : (
        <>
          <p>已连接: {address}</p>
          <button onClick={() => publishContent('QmHash...')}>
            发布内容
          </button>
          
          <div>
            {contents.map((content, index) => (
              <div key={index}>
                <p>IPFS: {content.ipfsHash}</p>
                <p>点赞: {content.likes} | 分享: {content.shares}</p>
                <p>收益: {content.totalEarnings} CPT</p>
                <button onClick={() => likeContent(index + 1)}>
                  点赞
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ContentPlatform;
```

---

## 🔒 安全注意事项

1. **私钥安全**
   - 永远不要在代码中硬编码私钥
   - 使用环境变量存储敏感信息
   - 不要将 `.env` 文件提交到Git

2. **输入验证**
   - 验证IPFS哈希格式
   - 验证内容ID是否存在
   - 检查用户余额是否足够

3. **错误处理**
   - 使用 try-catch 捕获所有异常
   - 向用户显示友好的错误信息
   - 记录错误日志便于调试

4. **Gas优化**
   - 批量操作时考虑Gas费用
   - 提示用户预计费用
   - 处理交易失败情况

---

## 🐛 常见问题

### Q1: 交易失败：gas required exceeds allowance
**A**: Gas不足，增加Gas Limit或检查账户余额

### Q2: 交易失败：Already liked
**A**: 用户已经点赞过该内容，每个内容只能点赞一次

### Q3: 交易失败：Cannot like own content
**A**: 不能点赞自己的内容

### Q4: SDK初始化失败
**A**: 
- 检查MetaMask是否已安装
- 确认网络配置正确
- 验证合约地址

### Q5: 查询内容返回空
**A**: 内容ID可能不存在，使用 `getContentCounter()` 查询总内容数

---

## 📞 技术支持

如有问题或需要协助，请联系：

- **负责人**: [你的名字]
- **邮箱**: [你的邮箱]
- **GitHub**: [你的GitHub]

或在项目仓库提交Issue。

---

## 📋 接口总结表

| 接口 | 方法 | 参数 | 返回值 | Gas消耗 |
|------|------|------|--------|---------|
| 发布内容 | `publishContent` | `ipfsHash` | `contentId` | 中 |
| 点赞内容 | `likeContent` | `contentId` | `receipt` | 低 |
| 分享内容 | `shareContent` | `contentId` | `receipt` | 中 |
| 查询内容 | `getContent` | `contentId` | `Content` | 免费 |
| 查询用户内容 | `getUserContents` | `address` | `contentIds[]` | 免费 |
| 查询余额 | `balanceOf` | `address` | `balance` | 免费 |
| 转账代币 | `transfer` | `to, amount` | `receipt` | 低 |

**Gas消耗说明**:
- 低: ~50,000 gas
- 中: ~100,000 gas
- 高: ~200,000+ gas
- 免费: 只读操作，不消耗gas

---

**最后更新**: 2026-02-08
**版本**: 1.0.0
