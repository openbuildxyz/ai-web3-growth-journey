# 企业官网上链项目 (Website On-Chain)

本项目实现了将企业官网URL记录到区块链上的功能，为企业网站提供了真实性和不可篡改性的保障。通过智能合约技术，企业可以证明其网站的所有权和创建时间，增强品牌可信度。

## 项目概述

企业官网上链项目是一个基于以太坊区块链的Web3应用，它允许用户将其企业官网的URL和相关信息永久记录在区块链上。这种方式提供了以下优势：

- **数据不可篡改性**：一旦上链，网站信息将永久记录在区块链上，无法被篡改
- **所有权证明**：通过区块链账户验证网站所有权，防止冒用
- **真实性验证**：第三方可以验证网站的真实性和创建时间
- **增强品牌可信度**：向客户和合作伙伴展示企业的技术前瞻性和透明度

## 团队信息

本项目由以下团队成员开发：

- **项目负责人**：张三 - 全栈开发工程师，负责项目架构设计和智能合约开发
- **前端开发**：李四 - React/Next.js专家，负责Web3前端组件开发
- **区块链专家**：王五 - 以太坊开发者，负责智能合约优化和安全审计
- **UI/UX设计**：赵六 - 设计师，负责用户界面和交互体验设计

## 目录结构

```
web3-project/
├── contracts/
│   └── WebsiteRegistry.sol  # 存储网站URL的智能合约
├── ethers/                  # 本地ethers模块（开发环境使用）
│   ├── index.js             # ethers模拟实现
│   └── package.json         # 模块配置
├── front/
│   ├── Web3Provider.tsx     # Web3上下文提供者
│   ├── WebsiteOnChain.tsx   # 上链操作UI组件
│   ├── WebsiteRegistryABI.ts # 智能合约ABI
│   ├── index.ts             # 导出所有组件
│   ├── package.json         # 前端组件依赖
│   └── README.md            # 前端组件使用说明
└── README.md                # 本文档
```

## 技术实现

### 智能合约

项目核心是基于Solidity开发的`WebsiteRegistry`智能合约，它提供以下功能：

- **网站注册**：将网站ID、名称、URL和所有者地址记录在区块链上
- **网站更新**：允许所有者更新网站信息
- **所有权验证**：确保只有网站所有者可以更新信息
- **查询功能**：支持按ID查询网站信息

合约设计考虑了以下因素：
- **安全性**：实现了所有权验证，防止未授权修改
- **可扩展性**：结构设计允许未来添加更多功能
- **gas优化**：优化了数据存储结构，降低交易成本

### 前端集成

前端实现采用了模块化设计，主要组件包括：

- **Web3Provider**：提供Web3连接状态和方法的上下文提供者
- **WebsiteOnChain**：处理网站上链操作的UI组件
- **WebsiteRegistryABI**：智能合约ABI定义

特别之处在于我们采用了一种创新的方法来处理Web3依赖：

1. 在`web3-project/ethers`目录中提供了一个模拟的ethers.js实现
2. 前端组件从这个本地模块导入ethers，而不是从node_modules
3. 这种方式使得Web3功能可以在开发环境中正常工作，无需安装额外依赖
4. 在生产环境中，可以无缝切换到真实的ethers.js库

### 容错设计

为了确保系统稳定性，我们实现了优雅的降级机制：

- 当`web3-project`目录不存在时，系统会自动隐藏"官网上链"按钮
- 如果用户尝试使用未启用的功能，会显示友好的提示而不是错误信息
- 所有Web3相关代码都使用动态导入和错误捕获，确保不会影响主应用程序

## 技术栈

- 前端：React + ethers.js
- 智能合约：Solidity
- 区块链：以太坊（可部署在测试网或主网）

## 实现方式

本项目采用了一种特殊的实现方式，使得Web3功能可以在不依赖主项目安装Web3相关库的情况下工作：

1. 在 `web3-project/ethers` 目录中提供了一个模拟的ethers.js实现
2. 前端组件从这个本地模块导入ethers，而不是从node_modules
3. 这种方式使得Web3功能可以在开发环境中正常工作
4. 在生产环境中，可以替换为真实的ethers.js库

## 智能合约部署步骤

### 1. 安装必要工具

```bash
# 安装Hardhat（以太坊开发环境）
npm install --save-dev hardhat

# 初始化Hardhat项目
npx hardhat init
```

选择"Create a JavaScript project"，并按照提示完成初始化。

### 2. 配置部署网络

编辑`hardhat.config.js`文件，添加网络配置：

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    // 本地开发网络
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // 以太坊测试网（Sepolia）
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

创建`.env`文件存储私钥和API密钥：

```
PRIVATE_KEY=your_wallet_private_key
INFURA_API_KEY=your_infura_api_key
```

### 3. 部署合约

创建部署脚本`scripts/deploy.js`：

```javascript
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("部署合约的账户:", deployer.address);

  const WebsiteRegistry = await ethers.getContractFactory("WebsiteRegistry");
  const websiteRegistry = await WebsiteRegistry.deploy();

  await websiteRegistry.deployed();
  console.log("WebsiteRegistry合约已部署到:", websiteRegistry.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

执行部署：

```bash
# 部署到本地网络
npx hardhat run scripts/deploy.js --network localhost

# 部署到测试网
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. 更新合约地址

部署成功后，将得到合约地址。更新`front/WebsiteOnChain.tsx`中的合约地址：

```typescript
// 智能合约地址（部署后需要替换为实际地址）
const CONTRACT_ADDRESS = '0x您的合约地址';
```

## 前端集成

前端组件已经准备好，可以直接在Next.js项目中使用：

```tsx
import { Web3Provider, WebsiteOnChain } from '../web3-project/front';

// 在Gallery.tsx中使用
{showOnChainModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <Web3Provider>
      <WebsiteOnChain
        websiteId={onChainWebsiteId || ''}
        websiteName={onChainWebsiteName}
        onClose={closeOnChainModal}
      />
    </Web3Provider>
  </div>
)}
```

## 使用真实的ethers.js库

如果需要使用真实的ethers.js库而不是模拟实现，可以：

1. 安装ethers.js：
   ```bash
   cd web3-project
   npm install ethers@5.7.2
   ```

2. 修改`front/WebsiteOnChain.tsx`中的导入语句：
   ```typescript
   // 从node_modules导入ethers
   import { ethers } from 'ethers';
   ```

## 部署指南

详细的部署步骤请参考本文档前面的说明，包括：

1. 智能合约部署
2. 前端集成
3. 配置更新
4. 测试验证

## 未来计划

我们计划在未来版本中添加以下功能：

- 多链支持：扩展到更多区块链网络
- 批量上链：支持多个网站同时上链
- 验证徽章：为已上链网站提供可嵌入的验证徽章
- 区块链浏览器：开发专用浏览器，方便查询已上链网站

## 许可证

本项目采用MIT许可证。详情请参阅LICENSE文件。
