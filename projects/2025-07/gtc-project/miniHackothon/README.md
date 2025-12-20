# Solana Token Minter

这是一个在Solana devnet上创建和铸造代币的项目。

## 功能特性

1. 创建自定义代币 (支持修改常量配置)
2. 向任意地址铸造指定数量的代币
3. 生成测试地址用于测试
4. 完整的错误处理和日志记录

## 技术栈

- TypeScript
- @solana/web3.js
- @solana/spl-token
- Node.js

## 安装和设置

1. 安装依赖:
```bash
npm install
```

2. 确保 `.env` 文件包含你的私钥:
```
PUBLIC_KEY=你的公钥
PRIVATE_KEY=你的私钥数组(逗号分隔)
```

3. 确保你的地址有足够的 devnet SOL:
```bash
solana airdrop 2 你的地址 --url devnet
```

## 使用方法

### 运行完整演示
```bash
npm run dev
```

### 运行测试
```bash
npm run test
```

### 编译和运行
```bash
npm run build
npm start
```

## 代码结构

- `src/token-minter.ts` - 主要的代币铸造类
- `src/index.ts` - 演示程序
- `src/test.ts` - 测试程序

## 配置

在 `src/token-minter.ts` 中的 `TOKEN_CONFIG` 常量可以修改代币参数:

```typescript
export const TOKEN_CONFIG = {
  name: 'TEST_TOKEN',
  symbol: 'TEST',
  decimals: 9,
  description: 'Test token for minting',
};
```

## API

### TokenMinter 类

- `createToken()` - 创建新的代币mint
- `mintTokens(address, amount)` - 向指定地址铸造代币
- `generateTestAddress()` - 生成测试地址
- `getBalance(address?)` - 获取SOL余额

## 示例

```typescript
import { TokenMinter } from './token-minter';

const minter = new TokenMinter();

// 创建代币
const mintAddress = await minter.createToken();

// 生成测试地址
const testAddr = TokenMinter.generateTestAddress();

// 铸造代币
await minter.mintTokens(testAddr.publicKey, 1000);
```
