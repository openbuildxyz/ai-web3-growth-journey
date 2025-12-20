# 🌪️ 灾害新闻模拟API服务

专为区块链保险系统设计的Mock API服务，模拟真实的灾害新闻数据，支持Chainlink Functions集成。

## 📋 项目概述

这个API服务模拟了2025年1-12月期间中国、日本、美国三个地区的水灾、台风、地震等灾害事件，为保险合约提供自动化的灾害判断和理赔比例计算。

### 🎯 设计目标
- 为区块链保险系统提供可靠的灾害数据源
- 支持Chainlink Functions自动调用
- 提供智能的理赔比例计算逻辑
- 简单易用的RESTful API接口

## 🚀 快速开始

### 1. 环境要求
- Python 3.8+
- pip包管理器

### 2. 安装和启动

```bash
# 进入项目目录
cd mock-server

# 方式1: 使用启动脚本 (推荐)
chmod +x start.sh
./start.sh

# 方式2: 手动启动
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### 3. 访问服务
- **主页**: http://localhost:8001
- **API文档**: http://localhost:8001/docs
- **ReDoc文档**: http://localhost:8001/redoc

## 📊 数据概览

### 覆盖范围
- **时间**: 2025年1-12月
- **地区**: 中国、日本、美国
- **灾害类型**: 水灾(Flood)、台风(Typhoon)、地震(Earthquake)
- **事件总数**: 16个重大灾害事件

### 数据特点
- 基于真实历史灾害模式生成
- 包含严重程度评分(1-10)
- 提供经济损失和伤亡统计
- 支持智能理赔比例计算

## 🔗 API 端点详解

### 1. 获取所有灾害事件
```http
GET /api/disasters
```

**响应示例:**
```json
{
  "success": true,
  "count": 16,
  "data": [...],
  "metadata": {...}
}
```

### 2. 条件搜索灾害事件
```http
GET /api/disasters/search?country=China&disaster_type=Typhoon&year=2025&month=5
```

**参数说明:**
- `country`: 国家名称 (China, Japan, USA)
- `disaster_type`: 灾害类型 (Flood, Typhoon, Earthquake)
- `year`: 年份 (2025)
- `month`: 月份 (1-12)
- `min_severity`: 最小严重程度 (0-10)

### 3. Chainlink Functions专用端点 ⭐
```http
GET /api/disasters/chainlink?country=China&disaster_type=Typhoon&year=2025&month=5
```

**特殊功能:**
- 返回智能计算的理赔比例
- 提供灾害严重程度分析
- 专为智能合约优化的数据格式

**响应示例:**
```json
{
  "success": true,
  "query": {
    "country": "China",
    "disaster_type": "Typhoon",
    "year": 2025,
    "month": 5
  },
  "found_disasters": 1,
  "disasters": [...],
  "max_severity": 9.2,
  "recommended_claim_ratio": 100,
  "claim_explanation": "基于最高严重程度 9.2 计算的理赔比例"
}
```

### 4. 按国家查询
```http
GET /api/disasters/by-country/China
```

### 5. 统计信息
```http
GET /api/disasters/stats
```

## 🤖 Chainlink Functions 集成

### 理赔比例计算逻辑
```javascript
// 基于灾害严重程度的理赔比例
if (severity >= 9.0) return 100;  // 特大灾害100%赔付
if (severity >= 8.0) return 80;   // 重大灾害80%赔付  
if (severity >= 7.0) return 60;   // 较大灾害60%赔付
if (severity >= 6.0) return 40;   // 中等灾害40%赔付
if (severity >= 5.0) return 20;   // 较小灾害20%赔付
return 0;                         // 轻微灾害不赔付
```

### 使用Chainlink Functions脚本
参考 `chainlink-functions-example.js` 文件，包含完整的:
- 参数验证逻辑
- HTTP请求处理
- 错误处理机制
- 智能合约集成示例

## 📈 实际使用案例

### 案例1: 查询中国台风
```bash
curl "http://localhost:8001/api/disasters/chainlink?country=China&disaster_type=Typhoon&year=2025&month=5"
```
**结果**: 找到9.2级super typhoon，推荐理赔比例100%

### 案例2: 查询日本地震  
```bash
curl "http://localhost:8001/api/disasters/chainlink?country=Japan&disaster_type=Earthquake&year=2025&month=1"
```
**结果**: 找到8.1级地震，推荐理赔比例80%

### 案例3: 查询无灾害月份
```bash
curl "http://localhost:8001/api/disasters/chainlink?country=USA&disaster_type=Flood&year=2025&month=3"
```
**结果**: 无灾害事件，理赔比例0%

## 🔧 开发和扩展

### 添加新的灾害数据
1. 编辑 `data.json` 文件
2. 按照现有格式添加新的灾害事件
3. 重启服务即可生效

### 自定义理赔逻辑
在 `main.py` 的 `chainlink_disasters` 函数中修改理赔比例计算逻辑。

### 部署到生产环境
```bash
# 使用Docker
docker build -t disaster-api .
docker run -p 8000:8000 disaster-api

# 或使用云服务
# Heroku, Vercel, Railway等都支持FastAPI部署
```

## 🛡️ 安全考虑

- API目前无认证机制，适合测试环境
- 生产环境建议添加API密钥验证
- 支持CORS，前端可直接调用
- 包含健康检查端点用于监控

## 📞 技术支持

这个Mock API服务专门为你的区块链保险系统设计，完美配合:
- ✅ 保险合约的灾害声明机制
- ✅ Chainlink Functions自动化调用
- ✅ 智能理赔比例计算
- ✅ 前端应用数据展示

如有问题或需要定制，请随时联系！🚀 