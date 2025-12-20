#!/bin/bash

# SheDid 项目上传脚本
echo "🚀 开始上传 SheDid 项目到 GitHub..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 添加所有文件
echo "📁 添加项目文件..."
git add .

# 提交更改
echo "💾 提交更改..."
git commit -m "✨ Add SheDid - 重塑被遗忘的女性历史

🌟 功能特性:
- 去中心化女性历史故事平台
- AI 智能内容检查
- Aragon DAO 治理集成
- RainbowKit 钱包连接
- 紫粉渐变主题设计

🛠️ 技术栈:
- React 18 + Vite
- Tailwind CSS
- wagmi + RainbowKit
- Aragon SDK

✨ 让被遗忘的女性历史重新焕发光彩!"

# 推送到远程仓库
echo "🌐 推送到 GitHub..."
git push origin shedid-project

echo "✅ SheDid 项目上传完成!"
echo "🔗 访问: https://github.com/AllenWang-Yang/ai-web3-growth-journey/tree/shedid-project"
echo "📝 记得创建 Pull Request 来合并到主分支!"