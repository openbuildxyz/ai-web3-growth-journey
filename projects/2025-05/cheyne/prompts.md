# AI助手交互记录

本文档记录了在开发"企业官网上链"项目过程中与AI助手的关键交互提示词，展示了AI如何帮助完成项目的各个阶段。

## 项目初始化阶段

### 提示词1：项目需求分析

```
帮我对于当前Nextjs项目，进行智能合约集成（智能合约代码都放在文件夹web3-project/contracts中）

在Gallery.tex展开的操作栏，集成一个"官网上链"的按钮，点击后，将在智能合约中把对应的网站url加入智能合约。
前端若需要加入智能合约相关代码，考虑使用一个新的组件，再引入Gallery.tex。
智能合约考虑使用 wagmi 这个库，最终需要让接入区块链的url真正被部署（能部署即可，怎么简单稳定、怎么来）
```

这个提示词帮助我们明确了项目的核心需求：
1. 在Next.js项目中集成智能合约功能
2. 在Gallery组件中添加"官网上链"按钮
3. 使用wagmi库进行区块链交互
4. 确保网站URL能够真正上链

### 提示词2：组件结构设计

```
注意，前端代码，组件请放在文件夹web3-project/front中，需要时再引入到app/components/Gallery.tsx。

需要进行实现，帮我在对应位置（尽可能不在当前Nextjs项目本身安装wagmi 库，而是放在文件夹web3-project/。

最后确保实现url上链
```

这个提示词帮助我们确定了代码组织结构：
1. 将Web3相关组件放在独立的web3-project/front目录
2. 避免在主项目中安装wagmi库
3. 确保实现URL上链功能

### 提示词3：真实区块链交互

```
需要真实的区块链交互，考虑安装ethers.js。尽可能在文件夹web3-project中安装集成。
```

这个提示词帮助我们确定了区块链交互的技术选择：
1. 使用ethers.js库进行真实的区块链交互
2. 将依赖安装在web3-project目录中

## 智能合约开发阶段

### 提示词4：智能合约设计

AI助手根据需求，设计并实现了WebsiteRegistry.sol智能合约，包含以下功能：
- 网站注册功能
- 网站更新功能
- 所有权验证
- 查询功能

智能合约代码示例（由AI生成）：
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract WebsiteRegistry {
    struct Website {
        string id;
        string name;
        string url;
        address owner;
        uint256 timestamp;
    }

    mapping(string => Website) public websites;
    string[] public websiteIds;
    mapping(address => string[]) public userWebsites;

    event WebsiteRegistered(string id, string name, string url, address owner, uint256 timestamp);

    function registerWebsite(string memory _id, string memory _name, string memory _url) public {
        // 实现网站注册逻辑
    }

    function updateWebsite(string memory _id, string memory _name, string memory _url) public {
        // 实现网站更新逻辑
    }

    // 其他查询方法...
}
```

## 前端集成阶段

### 提示词5：Web3组件开发

AI助手帮助开发了以下关键组件：
- Web3Provider.tsx - 提供Web3连接状态和方法
- WebsiteOnChain.tsx - 处理网站上链操作
- WebsiteRegistryABI.ts - 智能合约ABI定义

### 提示词6：容错处理

```
非常好，现在需要进一步优化项目，确保当没有上传web3-project文件夹时（没有安装相关库），也能避免报错。若没有相关文件夹的代码，可以不用展示"官网上链"这个功能。从而保证项目的其它功能稳定。
```

这个提示词帮助我们实现了系统的健壮性：
1. 当web3-project目录不存在时，自动隐藏"官网上链"按钮
2. 使用try-catch处理导入错误
3. 提供友好的降级UI

AI助手生成的关键代码（容错处理）：
```tsx
// 动态导入Web3组件
let Web3Components = null;
try {
  Web3Components = require('../../web3-project/front');
  console.log('Web3组件加载成功，官网上链功能已启用');
} catch (error) {
  console.log('Web3组件不可用，官网上链功能将使用备用UI');
  Web3Components = null;
}

// 在UI中条件渲染
{isWeb3Available && (
  <button onClick={handleOnChain}>官网上链</button>
)}
```

## 文档编写阶段

### 提示词7：文档生成

```
现在请帮我在下列文件写一些文档：

web3-project/README.md：项目介绍、团队信息、技术实现
web3-project/demo.md：包含Demo链接和截图(https://corp.camera-eat-first.tech/， 截图先留空白)
web3-project/prompts.md ：记录与AI助手的关键提示词交互
提交要求
• 代码必须包含详细注释，特别说明AI生成部分
• 记录与AI的关键交互提示词，展示AI如何帮助完成项目
◎ 必须提交完整的README.md说明
```

这个提示词帮助我们生成了项目文档：
1. README.md - 项目介绍、团队信息、技术实现
2. demo.md - 演示信息和截图
3. prompts.md - 本文档，记录AI交互

## AI贡献总结

在本项目中，AI助手提供了以下关键帮助：

1. **智能合约开发**：设计并实现了WebsiteRegistry.sol智能合约
2. **前端组件开发**：创建了Web3Provider、WebsiteOnChain等组件
3. **系统集成**：实现了前端与智能合约的交互
4. **容错处理**：添加了健壮性设计，确保系统在各种情况下都能正常工作
5. **文档生成**：创建了项目文档，包括README、演示文档等

通过与AI助手的交互，我们能够快速实现一个功能完整、健壮性良好的区块链应用，将企业官网URL永久记录在区块链上，提供真实性和不可篡改性保障。