# Web3 组件库

这个目录包含了用于企业官网上链功能的Web3组件。

## 组件概述

1. `Web3Provider.tsx` - 提供Web3连接状态和方法的上下文提供者
2. `WebsiteOnChain.tsx` - 处理网站上链操作的UI组件
3. `WebsiteRegistryABI.ts` - 智能合约ABI定义
4. `types.d.ts` - TypeScript类型定义

## 特点

- 不依赖于主项目安装Web3相关库
- 使用项目根目录下的ethers模块，可以在没有安装ethers库的情况下工作
- 支持MetaMask等钱包扩展

## 使用方法

### 安装依赖（可选）

如果需要真实的区块链交互，可以在项目根目录安装ethers.js：

```bash
cd web3-project
npm install ethers@5.7.2
```

### 在Next.js项目中使用

```tsx
// 导入组件
import { Web3Provider, WebsiteOnChain } from '../web3-project/front';

// 使用组件
function MyComponent() {
  return (
    <Web3Provider>
      <WebsiteOnChain
        websiteId="your-website-id"
        websiteName="Your Website Name"
        onClose={() => {}}
      />
    </Web3Provider>
  );
}
```

## 智能合约部署

在使用这些组件前，需要先部署智能合约并更新`WebsiteOnChain.tsx`中的合约地址：

1. 部署`../contracts/WebsiteRegistry.sol`合约
2. 获取部署后的合约地址
3. 更新`WebsiteOnChain.tsx`中的`CONTRACT_ADDRESS`常量

## 工作原理

1. 组件从项目根目录的ethers模块导入ethers对象
2. 当用户点击"连接钱包"按钮时，组件会尝试连接MetaMask
3. 如果连接成功，用户可以点击"确认上链"将网站信息写入区块链
4. 如果没有检测到钱包或连接失败，组件会使用模拟交易进行演示

## 注意事项

- 这些组件设计为可以在没有安装Web3相关库的情况下工作
- 在生产环境中，建议安装真实的ethers.js库
- 确保用户已安装MetaMask或其他兼容的以太坊钱包
- 智能合约地址需要在部署后更新
- 当前实现使用了本地的ethers模块，位于项目根目录的`ethers`文件夹中
