#!/bin/bash

echo "=== MnemoVault 恢复功能测试 ==="
echo ""
echo "本脚本将演示如何使用 MnemoVault 的恢复功能"
echo ""

# 检查程序是否存在
if [ ! -f "./mnemovault" ]; then
    echo "❌ 可执行文件不存在，请先运行: go build -o mnemovault main.go"
    exit 1
fi

echo "📋 测试步骤说明:"
echo "1. 首先运行加密模式生成分片"
echo "2. 然后使用恢复模式验证分片可以正确恢复"
echo ""

echo "💡 测试用例:"
echo "助记词: abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
echo "密码: TestPassword123!"
echo ""

echo "🔐 第一步: 生成加密分片"
echo "请运行: ./mnemovault"
echo "选择选项 1 (加密助记词)"
echo "输入上述测试助记词和密码"
echo ""

echo "🔓 第二步: 测试恢复功能"
echo "请再次运行: ./mnemovault"
echo "选择选项 2 (恢复助记词)"
echo "输入刚才生成的3个分片和相同的密码"
echo ""

echo "✅ 验证标准:"
echo "- 恢复的助记词应该与原始助记词完全一致"
echo "- 程序应该验证恢复的助记词格式正确"
echo "- 错误的分片或密码应该被正确处理"
echo ""

echo "📝 错误测试场景:"
echo "1. 输入错误的分片"
echo "2. 输入错误的密码" 
echo "3. 输入不完整的分片"
echo "4. 输入格式错误的分片"
echo ""

echo "🚀 开始测试:"
echo "运行 ./mnemovault 开始完整测试"
echo ""

# 可选：自动启动程序
read -p "是否立即启动 MnemoVault 进行测试? (y/n): " response
if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
    echo ""
    echo "🎯 启动 MnemoVault..."
    ./mnemovault
else
    echo ""
    echo "💡 手动启动命令: ./mnemovault"
fi

echo ""
echo "=== 测试脚本完成 ==="
