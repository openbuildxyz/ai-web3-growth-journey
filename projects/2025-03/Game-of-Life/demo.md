# 项目演示

## 视频演示
[视频链接]

## 功能截图

### 1. 游戏界面

![游戏界面截图]

* 经典生命游戏界面
* 支持点击编辑细胞状态
* 随机生成和下一代演化功能

### 2. Web3功能

![Web3功能截图]

* 使用私钥直接连接到Monad测试网
* NFT铸造功能
* 游戏状态加载功能

## 演示地址

* 前端地址：`http://localhost:8000`
* 合约地址：`0x680c88f57717010661710C5849a47A13694F83A0` (Monad Testnet)

## 本地运行说明

1. 环境要求
   * Node.js v16+
   * Python3（用于本地服务器）

2. 安装步骤

   ```bash
   git clone [仓库地址]
   cd projects/2025-03/cascade
   npm install
   ```

3. 运行命令

   ```bash
   # 启动本地服务器
   cd frontend
   python3 -m http.server 8000
   ```

4. 合约部署（可选）

   ```bash
   # 配置.env
   cp .env.example .env
   # 编辑.env添加私钥

   # 部署合约
   npx hardhat run scripts/deploy.js --network monad
   ```
