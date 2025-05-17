# 企业官网上链项目演示

## 在线演示

您可以通过以下链接访问我们的在线演示：

[企业官网上链演示](https://corp.camera-eat-first.tech/)

## 功能演示

### 1. 主界面

在主界面中，您可以看到已创建的企业网站列表。每个网站卡片右上角都有一个操作菜单，其中包含"官网上链"选项。

![主界面截图]()

### 2. 点击"官网上链"按钮

当您点击"官网上链"按钮时，系统会弹出一个模态框，显示网站信息并提供连接钱包的选项。

![上链模态框截图]()

### 3. 连接钱包

点击"连接钱包"按钮，系统会尝试连接MetaMask或其他兼容的以太坊钱包。

![连接钱包截图]()

### 4. 确认上链

连接钱包后，点击"确认上链"按钮，系统会将网站信息写入区块链。

![确认上链截图]()

### 5. 上链成功

交易确认后，系统会显示成功信息和交易哈希。

![上链成功截图]()

## 技术演示

### 智能合约交互

以下是与智能合约交互的关键代码片段：

```typescript
// 创建Web3提供者
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// 创建合约实例
const contract = new ethers.Contract(CONTRACT_ADDRESS, WebsiteRegistryABI, signer);

// 调用合约方法
const tx = await contract.registerWebsite(websiteId, websiteName, websiteUrl);

// 等待交易确认
await tx.wait();
```

### 容错处理

当`web3-project`目录不存在时，系统会自动隐藏"官网上链"按钮或显示友好的提示：

```tsx
// 动态导入Web3组件
let Web3Components = null;
try {
  Web3Components = require('../../web3-project/front');
} catch (error) {
  console.log('Web3组件不可用，官网上链功能将被禁用');
  Web3Components = null;
}

// 在UI中条件渲染
{isWeb3Available && (
  <button onClick={handleOnChain}>
    官网上链
  </button>
)}
```

## 演示视频

我们还准备了一个详细的演示视频，展示了整个上链过程：

[观看演示视频](https://example.com/demo-video) (链接待更新)

## 试用说明

要试用我们的演示，您需要：

1. 安装MetaMask或其他兼容的以太坊钱包
2. 切换到Sepolia测试网
3. 获取一些测试网ETH（可以从水龙头获取）
4. 访问我们的演示网站
5. 创建一个网站或使用现有网站
6. 点击"官网上链"按钮并按照提示操作

## 反馈

我们非常重视您的反馈。如果您在使用过程中遇到任何问题或有任何建议，请通过以下方式联系我们：

- 电子邮件：contact@example.com
- GitHub Issues：[提交问题](https://github.com/example/website-onchain/issues)