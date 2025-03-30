#!/bin/bash

# 显示当前网络信息
echo "🔍 检查当前运行的节点..."
curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"net_version","params":[],"id":67}' http://localhost:8545 || { echo "❌ 本地节点未运行，请先运行 'pnpm run node'"; exit 1; }

# 部署合约到本地运行的节点
echo "📄 部署合约到本地运行节点..."
pnpm run deploy:localhost

# 生成前端环境文件
echo "⚙️ 创建前端环境文件..."
echo "REACT_APP_TRI_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
REACT_APP_GAME_CONTRACT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" > frontend/.env

# 确保合约 ABI 文件存在
echo "📁 更新合约 ABI 文件..."
mkdir -p frontend/src/contracts/
cp -v artifacts/contracts/TrisolarisCoin.sol/TrisolarisCoin.json frontend/src/contracts/
cp -v artifacts/contracts/TrisolarisDraw.sol/TrisolarisDraw.json frontend/src/contracts/
cp -v artifacts/contracts/CardLibrary.sol/CardLibrary.json frontend/src/contracts/

echo "✅ 部署完成！请刷新前端页面"
echo ""
echo "🔑 测试账户信息:"
echo "地址: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo "私钥: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
