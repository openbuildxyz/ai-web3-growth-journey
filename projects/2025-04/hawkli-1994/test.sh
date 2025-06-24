#!/bin/bash

echo "=== MnemoVault 测试演示 ==="
echo ""
echo "注意：这个脚本将演示 MnemoVault 的基本功能"
echo "在实际使用中，请使用真实的助记词和强密码"
echo ""

# 测试程序是否能正常启动
echo "1. 检查程序是否正常编译..."
if [ -f "./mnemovault" ]; then
    echo "✅ MnemoVault 可执行文件存在"
    echo "文件大小: $(ls -lh mnemovault | awk '{print $5}')"
else
    echo "❌ 可执行文件不存在，请先运行: go build -o mnemovault main.go"
    exit 1
fi

echo ""
echo "2. 程序功能说明:"
echo "   - 🔐 使用 AES-256-GCM 算法加密助记词"
echo "   - 📊 将密文分割成 3 个安全分片"  
echo "   - 🛡️ 支持助记词格式验证（12-24个单词）"
echo "   - 💻 跨平台命令行工具"

echo ""
echo "3. 运行程序："
echo "   ./mnemovault"

echo ""
echo "4. 测试示例："
echo "   助记词: abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
echo "   密码: TestPassword123!"

echo ""
echo "5. 手动测试程序 (可选):"
echo "   你现在可以运行 ./mnemovault 来测试程序"
echo "   使用上面的示例数据或你自己的测试数据"

echo ""
echo "=== 测试脚本完成 ===" 