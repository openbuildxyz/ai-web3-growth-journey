# 🛡️ 链上保险系统 - 完整设置指南

## 🎯 系统概览

已成功部署链上保险系统，包含：
- ✅ 智能合约部署在 Anvil 本地网络
- ✅ 5个示例保险已创建并有模拟数据
- ✅ 前端界面可以连接和交互
- ✅ 测试账户已分发USDC用于测试

## 📋 已部署的合约信息

### 合约地址
- **InsuranceManager**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **MockUSDC**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Network**: Anvil Local (Chain ID: 31337)
- **RPC URL**: `http://localhost:8545`

### 已创建的保险
1. **🇨🇳 中国台风保险 2025-09** - 池资金: 6,000 USDC
2. **🇯🇵 日本地震保险 2025-10** - 池资金: 3,500 USDC  
3. **🇮🇳 印度洪水保险 2025-11** - 池资金: 2,800 USDC
4. **🇵🇭 菲律宾台风保险 2025-12** - 池资金: 1,800 USDC
5. **🇺🇸 美国飓风保险 2025-09** - 池资金: 10,000 USDC

## 🚀 快速开始

### 1. 确保服务运行

检查两个服务是否正在运行：

```bash
# 检查 Anvil 节点
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545

# 检查前端服务
curl http://localhost:3000
```

如果没有运行，重新启动：

```bash
# 启动 Anvil (在一个终端)
cd contract && anvil

# 启动前端 (在另一个终端)
cd frontend && pnpm dev
```

### 2. 配置 MetaMask

#### 添加 Anvil 网络
1. 打开 MetaMask
2. 点击网络下拉菜单
3. 选择"添加网络"
4. 手动添加网络：
   - **网络名称**: Anvil Local
   - **RPC URL**: `http://localhost:8545`
   - **链ID**: `31337`
   - **货币符号**: `ETH`

#### 导入测试账户
选择以下任一账户导入 MetaMask：

```
Account #0: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Account #1: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Account #2: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

这些账户都已预充值 10,000 USDC 和足够的 ETH。

### 3. 访问前端

打开浏览器访问: http://localhost:3000

## 🎮 功能测试

### 连接钱包
1. 点击"连接 MetaMask"按钮
2. 确认连接
3. 确保已切换到 Anvil 网络

### 查看保险
连接后可以看到5个保险卡片，显示：
- 国家+灾害类型+日期
- 总保险池金额
- 继承资金（如有）
- 购买和捐赠按钮

### 购买保险
1. 选择任一保险
2. 输入购买金额（默认100 USDC）
3. 点击"购买"按钮
4. MetaMask会先请求USDC授权
5. 确认授权后再确认购买交易
6. 等待交易确认

### 捐赠支持
1. 选择要支持的保险
2. 输入捐赠金额（默认50 USDC）
3. 点击"捐赠"按钮
4. 确认交易

## 🔧 管理员功能

使用部署账户（第一个账户）可以执行管理员操作：

### 创建新保险
```solidity
// 使用 cast 命令行工具
cast send 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 \
  "createInsurance(string,string,uint256,uint256)" \
  "Australia" "Wildfire" 1 2026 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545
```

### 声明灾害
```solidity
# 先获取保险ID
cast call 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 \
  "getInsuranceId(string,string,uint256,uint256)" \
  "China" "Typhoon" 9 2025 \
  --rpc-url http://localhost:8545

# 声明灾害（80%理赔比例）
cast send 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 \
  "declareDisaster(bytes32,uint256)" \
  0x[保险ID] 80 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545
```

## 📊 合约交互示例

### 查询保险信息
```bash
# 获取中国台风保险信息
cast call 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 \
  "insuranceInfos(bytes32)" \
  0xd5a5c8cb890b3d6e48d590774704cf35fd4ccbbad5e0f37c9d5f54b3e2903e26 \
  --rpc-url http://localhost:8545
```

### 查询用户份额
```bash
# 查询用户在某个保险中的份额
cast call 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 \
  "getUserShares(address,bytes32)" \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  0xd5a5c8cb890b3d6e48d590774704cf35fd4ccbbad5e0f37c9d5f54b3e2903e26 \
  --rpc-url http://localhost:8545
```

### 查询USDC余额
```bash
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "balanceOf(address)" \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --rpc-url http://localhost:8545
```

## 🚨 故障排除

### 常见问题

1. **MetaMask 连接失败**
   - 确保 Anvil 在运行
   - 检查 MetaMask 网络配置
   - 尝试重新导入账户

2. **交易失败**
   - 检查账户 ETH 余额（用于 Gas）
   - 确认 USDC 余额充足
   - 检查合约地址是否正确

3. **前端无法加载保险数据**
   - 确认合约地址配置正确
   - 检查 Anvil 节点状态
   - 查看浏览器控制台错误

### 重启系统

如果遇到问题，可以重新部署：

```bash
# 1. 停止现有服务
pkill anvil
# 停止前端服务 (Ctrl+C)

# 2. 重新启动 Anvil
cd contract && anvil

# 3. 重新部署合约
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

# 4. 分发 USDC
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
forge script script/MintUSDC.s.sol --rpc-url http://localhost:8545 --broadcast

# 5. 启动前端
cd ../frontend && pnpm dev
```

## 🎯 测试场景

### 基础测试流程
1. ✅ 连接 MetaMask 钱包
2. ✅ 查看5个已创建的保险
3. ✅ 购买保险（选择中国台风，购买100 USDC）
4. ✅ 查看购买后的保险池变化
5. ✅ 进行捐赠（向日本地震保险捐赠50 USDC）
6. ✅ 尝试不同账户的交互

### 高级测试
1. 管理员声明灾害
2. 用户申请理赔
3. 资金继承机制测试
4. 多用户同时交互

## 📈 系统特色

- **💰 真实资金池**: 显示实际的USDC资金状况
- **🔄 实时更新**: 交易后自动刷新数据
- **🎨 美观界面**: 现代化卡片设计
- **🛡️ 安全可靠**: 完整的错误处理
- **📱 响应式**: 支持移动端访问

## 🎉 部署成功！

系统已完全部署并可以使用：
- 前端地址: http://localhost:3000
- 已有测试数据和账户
- 可以立即开始测试购买和捐赠功能

享受测试这个去中心化保险系统！🚀 