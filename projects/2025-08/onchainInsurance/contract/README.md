# 链上保险系统

一个基于以太坊的去中心化保险系统，支持灾害保险的购买、理赔和管理。

## 系统概述

该系统采用了简化的设计，不使用ERC20代币，而是在主合约中记录用户的保险份额。这样设计的优势：

- **更低的Gas费用** - 无需部署和管理多个ERC20合约
- **更简单的管理** - 所有保险数据集中在一个合约中
- **更好的可扩展性** - 可以轻松添加新的保险类型
- **统一的资金池** - 所有USDC集中管理，提高资金利用效率

## 核心合约

### InsuranceManager.sol
主保险管理合约，负责：
- 创建新的保险类型（国家+灾害类型+月份+年份）
- 处理用户购买保险和捐赠
- 管理灾害声明和理赔比例
- 处理用户理赔请求
- 管理公司利润

### MockUSDC.sol
测试用的USDC代币合约，在生产环境中应替换为真实的USDC合约。

### Timer.sol
时间工具合约，用于获取当前年份和月份。

## 主要功能

### 1. 创建保险 
```solidity
function createInsurance(string memory country, string memory disasterType, uint month, uint year)
```
只有合约所有者可以创建新的保险类型。每个保险由以下参数唯一标识：
- 国家（如："China"）
- 灾害类型（如："Typhoon"）
- 月份（1-12）
- 年份（≥1970）

### 2. 购买保险
```solidity
function buyInsurance(bytes32 insuranceId, uint usdcAmount)
```
用户可以用USDC购买保险份额：
- 用户支付的USDC会转入合约
- 根据汇率计算对应的保险份额
- 只能为未来月份的保险购买

### 3. 捐赠
```solidity
function donate(bytes32 insuranceId, uint amount)
```
用户可以向保险池捐赠USDC，但不会获得保险份额。

### 4. 声明灾害
```solidity
function declareDisaster(bytes32 insuranceId, uint claimRatio)
```
只有合约所有者可以声明灾害：
- 只能为当前或过去的月份声明灾害
- 设置理赔比例（0-100%）
- 一旦声明，用户就可以申请理赔

### 5. 申请理赔
```solidity
function claim(bytes32 insuranceId)
```
用户可以申请理赔：
- 必须拥有该保险的份额
- 保险月份必须已经开始或过去
- 必须已经声明了灾害
- 每个用户每个保险只能理赔一次

## 理赔计算公式

```
用户理赔金额 = (用户份额 / 总份额) * 总资金池 * 理赔比例
```

例如：
- 总资金池：3500 USDC
- 总份额：3000份
- 理赔比例：70%
- 用户份额：1000份

用户理赔金额 = (1000/3000) * 3500 * 70% = 816.67 USDC

## 使用示例

```solidity
// 1. 部署合约
InsuranceManager manager = new InsuranceManager(usdcAddress);

// 2. 创建保险
manager.createInsurance("China", "Typhoon", 7, 2025);
bytes32 insuranceId = manager.getInsuranceId("China", "Typhoon", 7, 2025);

// 3. 用户购买保险
usdc.approve(address(manager), 1000 * 1e6);
manager.buyInsurance(insuranceId, 1000 * 1e6); // 购买1000 USDC的保险

// 4. 声明灾害（只有owner可以）
manager.declareDisaster(insuranceId, 80); // 80%的理赔比例

// 5. 用户申请理赔
manager.claim(insuranceId);
```

## 部署和测试

### 安装依赖
```bash
forge install
```

### 运行测试
```bash
forge test -vv
```

### 部署合约
```bash
forge script script/Deploy.s.sol --rpc-url <YOUR_RPC_URL> --private-key <YOUR_PRIVATE_KEY>
```

## 安全考虑

1. **权限管理** - 只有合约所有者可以创建保险和声明灾害
2. **防重入攻击** - 使用checks-effects-interactions模式
3. **时间依赖** - 基于区块时间戳，在生产环境中应考虑使用预言机
4. **溢出保护** - 使用Solidity 0.8.20的内置溢出检查

## 待改进功能

1. **多级权限管理** - 支持多个管理员角色
2. **预言机集成** - 自动获取灾害信息
3. **分级理赔** - 支持部分理赔和多次理赔
4. **风险评估** - 动态调整保险价格
5. **跨链支持** - 支持多条区块链

## License

MIT License
