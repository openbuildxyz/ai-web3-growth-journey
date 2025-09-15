#!/bin/bash

echo "🌪️ 启动灾害新闻模拟API服务..."

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装Python3"
    exit 1
fi

# 检查是否有虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 创建Python虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "🔄 激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "📥 安装依赖..."
pip install -r requirements.txt

# 检查数据文件是否存在
if [ ! -f "data.json" ]; then
    echo "❌ 数据文件 data.json 不存在"
    exit 1
fi

echo "🚀 启动API服务..."
echo "📍 服务地址: http://localhost:8000"
echo "📚 API文档: http://localhost:8000/docs"
echo "🛑 按 Ctrl+C 停止服务"
echo ""

# 启动服务
python main.py 