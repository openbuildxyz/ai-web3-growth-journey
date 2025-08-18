#!/bin/bash

# 🔧 ABI提取脚本
echo "正在提取合约ABI..."

# 创建ABI目录
mkdir -p abi

# 检查jq是否安装
if ! command -v jq &> /dev/null; then
    echo "警告: jq未安装，无法自动提取ABI"
    echo "请手动从 out/ 目录获取ABI文件"
    exit 1
fi

# 提取InsuranceManager ABI
if [ -f "out/InsuranceManager.sol/InsuranceManager.json" ]; then
    jq '.abi' out/InsuranceManager.sol/InsuranceManager.json > abi/InsuranceManager.abi.json
    echo "✅ InsuranceManager ABI 已提取到 abi/InsuranceManager.abi.json"
else
    echo "❌ InsuranceManager.json 不存在，请先运行 forge build"
fi

# 提取MockUSDC ABI
if [ -f "out/MockUSDC.sol/MockUSDC.json" ]; then
    jq '.abi' out/MockUSDC.sol/MockUSDC.json > abi/MockUSDC.abi.json
    echo "✅ MockUSDC ABI 已提取到 abi/MockUSDC.abi.json"
else
    echo "❌ MockUSDC.json 不存在，请先运行 forge build"
fi

# 提取Timer ABI
if [ -f "out/timer.sol/Timer.json" ]; then
    jq '.abi' out/timer.sol/Timer.json > abi/Timer.abi.json
    echo "✅ Timer ABI 已提取到 abi/Timer.abi.json"
else
    echo "❌ Timer.json 不存在，请先运行 forge build"
fi

echo ""
echo "🎉 ABI提取完成！"
echo "文件位置:"
echo "  - abi/InsuranceManager.abi.json"
echo "  - abi/MockUSDC.abi.json" 
echo "  - abi/Timer.abi.json"
echo ""
echo "现在可以将这些ABI文件复制到前端项目中使用。" 