# 🛡️ 链上保险系统 - 前端

这是一个基于Next.js的去中心化保险系统前端应用，支持用户购买保险、捐赠和查看保险信息。

## ✨ 功能特性

- 🦊 **MetaMask钱包连接** - 支持以太坊钱包连接
- 💰 **保险购买** - 用户可以用USDC购买保险份额
- 💝 **保险捐赠** - 支持向保险池捐赠资金
- 📊 **实时数据** - 显示保险池状态、理赔信息等
- 🎨 **响应式设计** - 支持桌面端和移动端
- 🔄 **自动刷新** - 交易完成后自动更新数据

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置合约地址

编辑 `src/lib/web3.ts` 文件，设置正确的合约地址：

```typescript
export const CONTRACTS = {
  INSURANCE_MANAGER: '0x你的InsuranceManager合约地址',
  MOCK_USDC: '0x你的MockUSDC合约地址',
};
```

### 3. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页
├── components/            # React组件
│   ├── InsuranceCard.tsx  # 保险卡片组件
│   └── WalletConnect.tsx  # 钱包连接组件
├── lib/                   # 工具库
│   └── web3.ts           # Web3配置和工具函数
├── types/                 # TypeScript类型定义
│   ├── ethereum.d.ts     # 以太坊类型定义
│   └── insurance.ts      # 保险相关类型
└── abi/                   # 智能合约ABI文件
    ├── InsuranceManager.abi.json
    ├── MockUSDC.abi.json
    └── Timer.abi.json
```

## 🔧 配置说明

### 合约地址配置

在部署合约后，需要在 `src/lib/web3.ts` 中配置合约地址：

1. 复制部署后的 `InsuranceManager` 合约地址
2. 复制部署后的 `MockUSDC` 合约地址（测试环境）
3. 更新 `CONTRACTS` 对象中的地址

### 网络配置

默认连接以太坊主网，如需切换到测试网：

1. 在MetaMask中切换到相应的测试网络
2. 确保合约已部署到对应网络
3. 更新合约地址配置

## 🎯 使用流程

### 1. 连接钱包
- 点击"连接MetaMask"按钮
- 在MetaMask中确认连接
- 确保账户中有足够的ETH用于Gas费用

### 2. 获取测试USDC（测试环境）
- 如果使用MockUSDC，可能需要先获取一些测试代币
- 联系合约部署者或使用水龙头功能

### 3. 购买保险
- 选择想要购买的保险类型
- 输入购买金额（USDC）
- 点击"购买"按钮
- 在MetaMask中确认交易

### 4. 捐赠支持
- 选择想要支持的保险
- 输入捐赠金额
- 点击"捐赠"按钮
- 在MetaMask中确认交易

## 🛠️ 开发指南

### 添加新功能

1. **新增保险类型显示**
   - 在 `src/types/insurance.ts` 中添加新的灾害类型映射
   - 更新 `InsuranceCard` 组件以支持新类型

2. **添加用户保险查看功能**
   - 创建新的页面组件
   - 调用合约的 `getUserShares` 等函数
   - 显示用户持有的保险信息

3. **理赔功能**
   - 添加理赔按钮和逻辑
   - 调用合约的 `claim` 函数
   - 显示理赔状态和金额

### 调试技巧

1. **检查控制台错误**
   - 打开浏览器开发者工具
   - 查看Console中的错误信息

2. **验证合约调用**
   - 确保合约地址正确
   - 检查ABI文件是否最新
   - 验证账户权限和余额

3. **网络问题**
   - 确认MetaMask连接的网络
   - 检查RPC节点是否正常

## 📦 构建和部署

### 构建生产版本

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start
```

### 部署到Vercel

1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 配置环境变量（如需要）
4. 部署应用

## 🚨 注意事项

1. **安全提醒**
   - 不要在前端代码中存储私钥
   - 验证所有用户输入
   - 使用HTTPS连接

2. **Gas费用**
   - 每次交易都需要支付Gas费
   - 建议在交易前提醒用户

3. **网络延迟**
   - 区块链交易需要时间确认
   - 添加适当的加载状态提示

4. **错误处理**
   - 妥善处理网络错误
   - 提供友好的错误提示信息

## 🔗 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [Ethers.js 文档](https://docs.ethers.org/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [MetaMask 开发者文档](https://docs.metamask.io/)

## 📝 License

MIT License - 详见 LICENSE 文件
