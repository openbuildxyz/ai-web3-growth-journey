from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from typing import List, Optional
import json
import uvicorn
from datetime import datetime

app = FastAPI(
    title="灾害新闻模拟API",
    description="为区块链保险系统提供灾害新闻数据的Mock API服务",
    version="1.0.0"
)

# 添加CORS中间件以支持前端调用
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 加载灾害数据
def load_disaster_data():
    try:
        with open('data.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="数据文件未找到")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="数据文件格式错误")

@app.get("/")
async def root():
    """API根路径，返回欢迎页面"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>灾害新闻模拟API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
            .endpoint { background: #ecf0f1; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #3498db; }
            .method { color: #27ae60; font-weight: bold; }
            .url { color: #8e44ad; font-family: monospace; }
            .example { background: #fff3cd; padding: 10px; border-radius: 5px; margin-top: 10px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat { text-align: center; padding: 10px; background: #3498db; color: white; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🌪️ 灾害新闻模拟API</h1>
            <p>专为区块链保险系统设计的灾害新闻数据API服务</p>
            
            <div class="stats">
                <div class="stat">
                    <h3>16</h3>
                    <p>灾害事件</p>
                </div>
                <div class="stat">
                    <h3>3</h3>
                    <p>国家地区</p>
                </div>
                <div class="stat">
                    <h3>3</h3>
                    <p>灾害类型</p>
                </div>
                <div class="stat">
                    <h3>2025</h3>
                    <p>覆盖年份</p>
                </div>
            </div>

            <h2>📋 API 端点</h2>
            
            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/disasters</span>
                <p>获取所有灾害事件列表</p>
                <div class="example">示例: <a href="/api/disasters" target="_blank">/api/disasters</a></div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/disasters/search</span>
                <p>根据条件搜索灾害事件</p>
                <p><strong>参数:</strong> country, disaster_type, year, month, min_severity</p>
                <div class="example">示例: <a href="/api/disasters/search?country=China&disaster_type=Typhoon" target="_blank">/api/disasters/search?country=China&disaster_type=Typhoon</a></div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/disasters/chainlink</span>
                <p>专为Chainlink Functions设计的端点</p>
                <p><strong>参数:</strong> country, disaster_type, year, month</p>
                <div class="example">示例: <a href="/api/disasters/chainlink?country=China&disaster_type=Typhoon&year=2025&month=5" target="_blank">/api/disasters/chainlink?country=China&disaster_type=Typhoon&year=2025&month=5</a></div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/disasters/by-country/{country}</span>
                <p>按国家获取灾害事件</p>
                <div class="example">示例: <a href="/api/disasters/by-country/China" target="_blank">/api/disasters/by-country/China</a></div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span> <span class="url">/api/disasters/stats</span>
                <p>获取灾害统计信息</p>
                <div class="example">示例: <a href="/api/disasters/stats" target="_blank">/api/disasters/stats</a></div>
            </div>

            <h2>📊 支持的参数</h2>
            <ul>
                <li><strong>国家:</strong> China, Japan, USA</li>
                <li><strong>灾害类型:</strong> Flood, Typhoon, Earthquake</li>
                <li><strong>年份:</strong> 2025</li>
                <li><strong>月份:</strong> 1-12</li>
            </ul>

            <p style="margin-top: 30px; text-align: center; color: #7f8c8d;">
                🔗 <a href="/docs" target="_blank">查看完整API文档</a> | 
                <a href="/redoc" target="_blank">ReDoc文档</a>
            </p>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content, status_code=200)

@app.get("/api/disasters")
async def get_all_disasters():
    """获取所有灾害事件"""
    data = load_disaster_data()
    return {
        "success": True,
        "count": len(data["disasters"]),
        "data": data["disasters"],
        "metadata": data["metadata"]
    }

@app.get("/api/disasters/search")
async def search_disasters(
    country: Optional[str] = Query(None, description="国家名称 (China, Japan, USA)"),
    disaster_type: Optional[str] = Query(None, description="灾害类型 (Flood, Typhoon, Earthquake)"),
    year: Optional[int] = Query(None, description="年份 (2025)"),
    month: Optional[int] = Query(None, description="月份 (1-12)"),
    min_severity: Optional[float] = Query(None, description="最小严重程度 (0-10)")
):
    """根据条件搜索灾害事件"""
    data = load_disaster_data()
    disasters = data["disasters"]
    
    # 应用过滤条件
    if country:
        disasters = [d for d in disasters if d["country"].lower() == country.lower()]
    
    if disaster_type:
        disasters = [d for d in disasters if d["disasterType"].lower() == disaster_type.lower()]
    
    if year:
        disasters = [d for d in disasters if d["year"] == year]
    
    if month:
        disasters = [d for d in disasters if d["month"] == month]
    
    if min_severity:
        disasters = [d for d in disasters if d["severity"] >= min_severity]
    
    return {
        "success": True,
        "count": len(disasters),
        "filters": {
            "country": country,
            "disaster_type": disaster_type,
            "year": year,
            "month": month,
            "min_severity": min_severity
        },
        "data": disasters
    }

@app.get("/api/disasters/chainlink")
async def chainlink_disasters(
    country: str = Query(..., description="国家名称"),
    disaster_type: str = Query(..., description="灾害类型"),
    year: int = Query(..., description="年份"),
    month: int = Query(..., description="月份")
):
    """专为Chainlink Functions设计的端点，返回理赔比例建议"""
    data = load_disaster_data()
    disasters = data["disasters"]
    
    # 精确匹配条件
    matching_disasters = [
        d for d in disasters
        if (d["country"].lower() == country.lower() and
            d["disasterType"].lower() == disaster_type.lower() and
            d["year"] == year and
            d["month"] == month)
    ]
    
    # 计算理赔比例
    claim_ratio = 0
    if matching_disasters:
        max_severity = max(d["severity"] for d in matching_disasters)
        
        # 理赔比例计算逻辑
        if max_severity >= 9.0:
            claim_ratio = 100  # 特大灾害100%赔付
        elif max_severity >= 8.0:
            claim_ratio = 80   # 重大灾害80%赔付
        elif max_severity >= 7.0:
            claim_ratio = 60   # 较大灾害60%赔付
        elif max_severity >= 6.0:
            claim_ratio = 40   # 中等灾害40%赔付
        elif max_severity >= 5.0:
            claim_ratio = 20   # 较小灾害20%赔付
        else:
            claim_ratio = 0    # 轻微灾害不赔付
    
    return {
        "success": True,
        "query": {
            "country": country,
            "disaster_type": disaster_type,
            "year": year,
            "month": month
        },
        "found_disasters": len(matching_disasters),
        "disasters": matching_disasters,
        "max_severity": max(d["severity"] for d in matching_disasters) if matching_disasters else 0,
        "recommended_claim_ratio": claim_ratio,
        "claim_explanation": f"基于最高严重程度 {max(d['severity'] for d in matching_disasters) if matching_disasters else 0} 计算的理赔比例"
    }

@app.get("/api/disasters/by-country/{country}")
async def get_disasters_by_country(country: str):
    """按国家获取灾害事件"""
    data = load_disaster_data()
    disasters = [d for d in data["disasters"] if d["country"].lower() == country.lower()]
    
    if not disasters:
        raise HTTPException(status_code=404, detail=f"未找到国家 {country} 的灾害数据")
    
    return {
        "success": True,
        "country": country,
        "count": len(disasters),
        "data": disasters
    }

@app.get("/api/disasters/stats")
async def get_disaster_stats():
    """获取灾害统计信息"""
    data = load_disaster_data()
    disasters = data["disasters"]
    
    # 按国家统计
    country_stats = {}
    for disaster in disasters:
        country = disaster["country"]
        if country not in country_stats:
            country_stats[country] = {"count": 0, "total_casualties": 0, "total_loss": 0}
        country_stats[country]["count"] += 1
        country_stats[country]["total_casualties"] += disaster["casualties"]
        country_stats[country]["total_loss"] += disaster["economicLoss"]
    
    # 按灾害类型统计
    type_stats = {}
    for disaster in disasters:
        disaster_type = disaster["disasterType"]
        if disaster_type not in type_stats:
            type_stats[disaster_type] = {"count": 0, "avg_severity": 0, "total_severity": 0}
        type_stats[disaster_type]["count"] += 1
        type_stats[disaster_type]["total_severity"] += disaster["severity"]
    
    # 计算平均严重程度
    for disaster_type in type_stats:
        type_stats[disaster_type]["avg_severity"] = round(
            type_stats[disaster_type]["total_severity"] / type_stats[disaster_type]["count"], 2
        )
        del type_stats[disaster_type]["total_severity"]
    
    # 按月份统计
    month_stats = {}
    for disaster in disasters:
        month = disaster["month"]
        if month not in month_stats:
            month_stats[month] = 0
        month_stats[month] += 1
    
    return {
        "success": True,
        "total_disasters": len(disasters),
        "by_country": country_stats,
        "by_type": type_stats,
        "by_month": month_stats,
        "severity_range": {
            "min": min(d["severity"] for d in disasters),
            "max": max(d["severity"] for d in disasters),
            "avg": round(sum(d["severity"] for d in disasters) / len(disasters), 2)
        },
        "total_casualties": sum(d["casualties"] for d in disasters),
        "total_economic_loss": sum(d["economicLoss"] for d in disasters)
    }

@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "灾害新闻模拟API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001) 