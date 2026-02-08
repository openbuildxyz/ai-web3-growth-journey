from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field, field_validator, ValidationError
from pydantic.functional_validators import field_validator as validator_decorator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import pymysql
import os
from datetime import datetime, timedelta
from typing import Optional, List, Dict
import httpx
from contextlib import asynccontextmanager
import asyncio
import logging
from decimal import Decimal, InvalidOperation

# 数据库配置（从环境变量获取）
# 注意：数据库连接信息已保密，请通过环境变量配置
# 需要配置以下环境变量：
# - DB_HOST: 数据库主机地址
# - DB_PORT: 数据库端口
# - DB_USER: 数据库用户名
# - DB_PASSWORD: 数据库密码
# - DB_NAME: 数据库名称
DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
    'charset': 'utf8mb4'
}

# 全局变量：动态默认数据（从数据库最近记录更新）
DYNAMIC_DEFAULT_DATA = []
DEFAULT_DATA_LAST_UPDATE = None

# 全局变量：价格数据缓存
PRICE_CACHE = {
    'data': None,
    'timestamp': None,
    'source': None
}
# 缓存有效期（秒）
CACHE_DURATION = 10
# 数据库写入最小间隔（秒）
DB_WRITE_INTERVAL = 60
# 上次写入数据库的时间
LAST_DB_WRITE_TIME = None

# 支持的加密货币
SUPPORTED_CRYPTOS = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'SOL': 'Solana',
    'ADA': 'Cardano',
    'DOT': 'Polkadot',
    'AVAX': 'Avalanche',
    'LINK': 'Chainlink',
    'UNI': 'Uniswap',
    'ATOM': 'Cosmos'
}

# CryptoCompare API配置
CRYPTOCOMPARE_API_URL = 'https://min-api.cryptocompare.com/data'

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# 安全配置：数据范围限制
SECURITY_LIMITS = {
    'MAX_TOTAL_ASSETS': 10_000_000.0,  # 最大总资产：1000万（初始100万的10倍）
    'MIN_TOTAL_ASSETS': 0.0,  # 最小总资产：0
    'MAX_AVAILABLE_CASH': 10_000_000.0,  # 最大可用现金：1000万
    'MIN_AVAILABLE_CASH': 0.0,  # 最小可用现金：0
    'MAX_PROFIT_RATE': 900.0,  # 最大收益率：900%（10倍收益）
    'MIN_PROFIT_RATE': -100.0,  # 最小收益率：-100%（全亏）
    'MAX_QUANTITY': 100_000.0,  # 最大持仓数量：10万
    'MIN_QUANTITY': 0.0,  # 最小持仓数量：0
    'MAX_PRICE': 1_000_000.0,  # 最大价格：100万
    'MIN_PRICE': 0.0,  # 最小价格：0
    'MAX_PORTFOLIO_ITEMS': 20,  # 最大持仓币种数量：20个（系统只支持9个币种）
    'MAX_STRING_LENGTH': 200,  # 最大字符串长度
    'INITIAL_CAPITAL': 1_000_000.0,  # 初始资金：100万
    'MAX_ASSET_CHANGE_PER_SAVE': 500_000.0,  # 单次保存最大资产变化：50万
}

# 黑名单配置：因注入攻击被封禁的用户
# 出于安全考虑，实际黑名单应通过环境变量配置
BLACKLIST_USERS = {}

# 可通过环境变量 BLACKLIST_CONFIG 注入黑名单配置
# 格式示例: {"user001": {"reason": "注入攻击", "message": "违规操作，账户被限制"}}

def is_blacklisted(eng_name: str) -> tuple[bool, str]:
    """
    检查用户是否在黑名单中
    
    Args:
        eng_name: 用户英文名
        
    Returns:
        (is_blocked, message): 是否被封禁和提示消息
    """
    if eng_name in BLACKLIST_USERS:
        user_info = BLACKLIST_USERS[eng_name]
        logger.warning(f"[BLACKLIST] Blocked user attempted access: {eng_name}, reason: {user_info['reason']}")
        return True, user_info['message']
    return False, ""

# Pydantic数据验证模型
class PortfolioItem(BaseModel):
    """持仓明细数据模型"""
    crypto_symbol: str = Field(..., min_length=1, max_length=20, description="加密货币符号")
    crypto_name: str = Field(..., min_length=1, max_length=100, description="加密货币名称")
    quantity: float = Field(..., ge=SECURITY_LIMITS['MIN_QUANTITY'], le=SECURITY_LIMITS['MAX_QUANTITY'], description="持仓数量")
    avg_cost: float = Field(..., ge=SECURITY_LIMITS['MIN_PRICE'], le=SECURITY_LIMITS['MAX_PRICE'], description="平均成本")
    current_price: float = Field(..., ge=SECURITY_LIMITS['MIN_PRICE'], le=SECURITY_LIMITS['MAX_PRICE'], description="当前价格")
    market_value: float = Field(..., ge=0, le=SECURITY_LIMITS['MAX_TOTAL_ASSETS'], description="市值")
    profit_loss: float = Field(..., description="盈亏金额")
    profit_loss_rate: float = Field(..., ge=SECURITY_LIMITS['MIN_PROFIT_RATE'], le=SECURITY_LIMITS['MAX_PROFIT_RATE'], description="盈亏率")
    
    @field_validator('crypto_symbol')
    @classmethod
    def validate_crypto_symbol(cls, v):
        """验证加密货币符号"""
        v = v.strip().upper()
        if v not in SUPPORTED_CRYPTOS:
            raise ValueError(f'不支持的加密货币符号: {v}')
        return v
    
    @field_validator('quantity', 'avg_cost', 'current_price', 'market_value', 'profit_loss', 'profit_loss_rate')
    @classmethod
    def validate_numeric_values(cls, v, info):
        """验证数值的合法性"""
        field_name = info.field_name
        if not isinstance(v, (int, float)):
            raise ValueError(f'{field_name} 必须是数字类型')
        if v != v:  # 检查NaN
            raise ValueError(f'{field_name} 不能是NaN')
        if v == float('inf') or v == float('-inf'):
            raise ValueError(f'{field_name} 不能是无穷大')
        return round(float(v), 8)  # 保留8位小数
    
    @field_validator('market_value')
    @classmethod
    def validate_market_value(cls, v, info):
        """验证市值计算的合理性"""
        # 在 Pydantic V2 中，info.data 包含已验证的字段
        data = info.data
        if 'quantity' in data and 'current_price' in data:
            expected_value = data['quantity'] * data['current_price']
            # 允许1%的误差
            if abs(v - expected_value) > expected_value * 0.01:
                logger.warning(f"市值计算异常: 提交值={v}, 预期值={expected_value}")
        return v

class UserSaveData(BaseModel):
    """用户保存数据模型"""
    eng_name: str = Field(..., min_length=1, max_length=SECURITY_LIMITS['MAX_STRING_LENGTH'], description="英文名")
    chn_name: str = Field(default='', max_length=SECURITY_LIMITS['MAX_STRING_LENGTH'], description="中文名")
    dept_name: str = Field(default='', max_length=SECURITY_LIMITS['MAX_STRING_LENGTH'], description="部门名称")
    position_name: str = Field(default='', max_length=SECURITY_LIMITS['MAX_STRING_LENGTH'], description="职位名称")
    total_assets: float = Field(..., ge=SECURITY_LIMITS['MIN_TOTAL_ASSETS'], le=SECURITY_LIMITS['MAX_TOTAL_ASSETS'], description="总资产")
    available_cash: float = Field(..., ge=SECURITY_LIMITS['MIN_AVAILABLE_CASH'], le=SECURITY_LIMITS['MAX_AVAILABLE_CASH'], description="可用现金")
    today_profit: float = Field(default=0.0, description="今日收益")
    total_profit_rate: float = Field(..., ge=SECURITY_LIMITS['MIN_PROFIT_RATE'], le=SECURITY_LIMITS['MAX_PROFIT_RATE'], description="总收益率")
    portfolios: List[PortfolioItem] = Field(default=[], max_items=SECURITY_LIMITS['MAX_PORTFOLIO_ITEMS'], description="持仓列表")
    
    @field_validator('eng_name', 'chn_name', 'dept_name', 'position_name')
    @classmethod
    def validate_string_fields(cls, v, info):
        """验证字符串字段"""
        field_name = info.field_name
        if v is None:
            return ''
        v = str(v).strip()
        # 防止SQL注入：检查危险字符
        dangerous_chars = ["'", '"', ';', '--', '/*', '*/', 'DROP', 'DELETE', 'UPDATE', 'INSERT']
        v_upper = v.upper()
        for char in dangerous_chars:
            if char in v_upper:
                raise ValueError(f'{field_name} 包含非法字符: {char}')
        return v
    
    @field_validator('total_assets', 'available_cash', 'today_profit', 'total_profit_rate')
    @classmethod
    def validate_numeric_fields(cls, v, info):
        """验证数值字段"""
        field_name = info.field_name
        if not isinstance(v, (int, float)):
            raise ValueError(f'{field_name} 必须是数字类型')
        if v != v:  # 检查NaN
            raise ValueError(f'{field_name} 不能是NaN')
        if v == float('inf') or v == float('-inf'):
            raise ValueError(f'{field_name} 不能是无穷大')
        return round(float(v), 8)
    
    @field_validator('available_cash')
    @classmethod
    def validate_cash_not_exceed_assets(cls, v, info):
        """验证可用现金不能超过总资产"""
        data = info.data
        if 'total_assets' in data:
            if v > data['total_assets']:
                raise ValueError(f'可用现金({v})不能超过总资产({data["total_assets"]})')
        return v
    
    @field_validator('portfolios')
    @classmethod
    def validate_portfolios_value(cls, v, info):
        """验证持仓总市值的合理性"""
        if not v:
            return v
        
        total_market_value = sum(item.market_value for item in v)
        
        data = info.data
        if 'total_assets' in data and 'available_cash' in data:
            expected_portfolio_value = data['total_assets'] - data['available_cash']
            # 允许1%的误差
            if abs(total_market_value - expected_portfolio_value) > data['total_assets'] * 0.01:
                logger.warning(
                    f"持仓总市值异常: 提交值={total_market_value}, "
                    f"预期值={expected_portfolio_value}, "
                    f"总资产={data['total_assets']}, "
                    f"可用现金={data['available_cash']}"
                )
        
        return v

# 数据库连接管理
class DatabaseManager:
    def __init__(self):
        self.connection = None
    
    def connect(self):
        """建立数据库连接"""
        try:
            self.connection = pymysql.connect(**DB_CONFIG)
            print("[DB] Database connection successful")
        except Exception as e:
            print(f"[DB ERROR] Database connection failed: {e}")
            raise
    
    def close(self):
        """关闭数据库连接"""
        if self.connection:
            self.connection.close()
            print("[DB] Database connection closed")
    
    def execute_query(self, query: str, params: tuple = None):
        """执行查询"""
        try:
            # 确保连接存在
            if not self.connection or not self.connection.open:
                try:
                    self.connect()
                except Exception as conn_error:
                    print(f"[DB WARNING] Unable to connect to database, returning empty result: {conn_error}")
                    return []
            
            with self.connection.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute(query, params)
                self.connection.commit()
                return cursor.fetchall()
        except Exception as e:
            if self.connection:
                try:
                    self.connection.rollback()
                except:
                    pass
            print(f"[DB ERROR] Query execution failed: {e}")
            return []

db_manager = DatabaseManager()

# 初始化请求频率限制器
limiter = Limiter(key_func=get_remote_address)

def update_default_data_from_db():
    """从数据库读取最近的价格记录更新默认数据"""
    global DYNAMIC_DEFAULT_DATA, DEFAULT_DATA_LAST_UPDATE
    
    try:
        print("🔄 开始从数据库更新默认数据...")
        
        # 查询每个币种的最新价格记录
        query = """
            SELECT symbol, name, price, price_change_24h, volume_24h, market_cap, api_source
            FROM cryptocurrency_prices
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ORDER BY created_at DESC
        """
        
        results = db_manager.execute_query(query)
        
        if not results:
            print("⚠️ 数据库中没有最近的价格记录，保持现有默认数据")
            return
        
        # 按symbol分组取最新数据
        latest_data = {}
        for row in results:
            symbol = row['symbol']
            if symbol not in latest_data and symbol in SUPPORTED_CRYPTOS:
                latest_data[symbol] = row
        
        # 构建默认数据
        new_default_data = []
        for symbol, name in SUPPORTED_CRYPTOS.items():
            if symbol in latest_data:
                row = latest_data[symbol]
                new_default_data.append({
                    'symbol': row['symbol'],
                    'name': row['name'],
                    'price': float(row['price']),
                    'price_change_24h': float(row['price_change_24h']) if row['price_change_24h'] else 0,
                    'volume_24h': float(row['volume_24h']) if row['volume_24h'] else 0,
                    'market_cap': float(row['market_cap']) if row['market_cap'] else 0,
                    'api_source': 'database_default'
                })
        
        if new_default_data:
            DYNAMIC_DEFAULT_DATA = new_default_data
            DEFAULT_DATA_LAST_UPDATE = datetime.now()
            print(f"✅ 默认数据已更新，共 {len(new_default_data)} 个币种")
            print(f"📊 更新时间: {DEFAULT_DATA_LAST_UPDATE.strftime('%Y-%m-%d %H:%M:%S')}")
            # 打印前3个币种的价格作为示例
            for i, data in enumerate(new_default_data[:3]):
                print(f"   {data['symbol']}: ${data['price']:.2f}")
        else:
            print("⚠️ 未能从数据库构建有效的默认数据")
            
    except Exception as e:
        print(f"❌ 更新默认数据失败: {e}")

async def periodic_update_default_data():
    """定期更新默认数据的后台任务"""
    while True:
        try:
            await asyncio.sleep(3600)  # 每1小时执行一次
            print("⏰ 定时任务：更新默认数据")
            update_default_data_from_db()
        except Exception as e:
            print(f"❌ 定时更新默认数据失败: {e}")

def cleanup_old_price_data():
    """清理3天前的cryptocurrency_prices表数据"""
    try:
        print("🧹 开始清理旧的价格数据...")
        
        # 删除3天前的数据
        delete_query = """
            DELETE FROM cryptocurrency_prices
            WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 DAY)
        """
        
        # 执行删除操作
        if db_manager.connection and db_manager.connection.open:
            with db_manager.connection.cursor() as cursor:
                cursor.execute(delete_query)
                deleted_count = cursor.rowcount
                db_manager.connection.commit()
                
                if deleted_count > 0:
                    print(f"✅ 成功清理 {deleted_count} 条3天前的价格数据")
                else:
                    print("ℹ️ 没有需要清理的旧数据")
                
                # 查询剩余数据量
                count_query = "SELECT COUNT(*) as total FROM cryptocurrency_prices"
                cursor.execute(count_query)
                result = cursor.fetchone()
                remaining_count = result[0] if result else 0
                print(f"📊 当前数据库中剩余 {remaining_count} 条价格记录")
        else:
            print("⚠️ 数据库连接不可用，跳过清理任务")
            
    except Exception as e:
        print(f"❌ 清理旧数据失败: {e}")
        if db_manager.connection:
            try:
                db_manager.connection.rollback()
            except:
                pass

async def periodic_cleanup_old_data():
    """定期清理旧数据的后台任务"""
    while True:
        try:
            # 每24小时执行一次清理（在凌晨2点执行）
            await asyncio.sleep(86400)  # 24小时
            print("⏰ 定时任务：清理旧的价格数据")
            cleanup_old_price_data()
        except Exception as e:
            print(f"❌ 定时清理任务失败: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时尝试连接数据库（失败不阻止启动）
    try:
        db_manager.connect()
    except Exception as e:
        print(f"⚠️ 数据库连接失败，应用将以降级模式运行: {e}")
    
    # 初始化默认数据
    print("🚀 初始化默认数据...")
    update_default_data_from_db()
    
    # 启动定时更新任务
    print("⏰ 启动默认数据定时更新任务（每1小时）")
    update_task = asyncio.create_task(periodic_update_default_data())
    
    # 启动定时清理任务
    print("🧹 启动旧数据定时清理任务（每24小时）")
    cleanup_task = asyncio.create_task(periodic_cleanup_old_data())
    
    # 应用启动时立即执行一次清理
    print("🧹 应用启动时执行首次数据清理...")
    cleanup_old_price_data()
    
    yield
    
    # 关闭时取消定时任务
    update_task.cancel()
    cleanup_task.cancel()
    try:
        await update_task
    except asyncio.CancelledError:
        print("⏰ 定时更新任务已取消")
    try:
        await cleanup_task
    except asyncio.CancelledError:
        print("🧹 定时清理任务已取消")
    
    # 关闭时断开数据库
    try:
        db_manager.close()
    except Exception as e:
        print(f"⚠️ 关闭数据库连接时出错: {e}")

# 创建FastAPI应用
app = FastAPI(
    title="币神进化论 API",
    description="Don't Copy Trade. Let AI Copy You.",
    version="1.0.0",
    lifespan=lifespan
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 配置请求频率限制
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ==================== API路由 ====================

@app.get("/api/health")
async def health_check():
    """系统健康检查端点"""
    try:
        # 检查数据库连接
        db_status = "connected"
        db_error = None
        latest_data_time = None
        total_records = 0
        
        try:
            if db_manager.connection and db_manager.connection.open:
                # 查询最新数据时间和总记录数
                query = """
                SELECT COUNT(*) as total, MAX(created_at) as latest 
                FROM cryptocurrency_prices
                """
                result = db_manager.execute_query(query)
                if result and len(result) > 0:
                    total_records = result[0].get('total', 0)
                    latest_data_time = result[0].get('latest')
                    if latest_data_time:
                        latest_data_time = latest_data_time.isoformat()
            else:
                db_status = "disconnected"
        except Exception as e:
            db_status = "error"
            db_error = str(e)
        
        # 检查动态默认数据状态
        dynamic_data_status = "available" if DYNAMIC_DEFAULT_DATA else "empty"
        dynamic_data_count = len(DYNAMIC_DEFAULT_DATA)
        dynamic_data_update = DEFAULT_DATA_LAST_UPDATE.isoformat() if DEFAULT_DATA_LAST_UPDATE else None
        
        # 计算数据新鲜度（秒）
        data_freshness = None
        if latest_data_time:
            try:
                from datetime import datetime
                latest_time = datetime.fromisoformat(latest_data_time.replace('+08:00', ''))
                data_freshness = (datetime.now() - latest_time).total_seconds()
            except:
                pass
        
        # 构建健康状态
        health_status = {
            "status": "healthy" if db_status == "connected" else "degraded",
            "timestamp": datetime.now().isoformat(),
            "database": {
                "status": db_status,
                "error": db_error,
                "total_records": total_records,
                "latest_data_time": latest_data_time,
                "data_freshness_seconds": data_freshness
            },
            "api_source": {
                "provider": "CryptoCompare",
                "url": CRYPTOCOMPARE_API_URL,
                "supported_cryptos": len(SUPPORTED_CRYPTOS)
            },
            "dynamic_default_data": {
                "status": dynamic_data_status,
                "count": dynamic_data_count,
                "last_update": dynamic_data_update
            },
            "supported_cryptocurrencies": list(SUPPORTED_CRYPTOS.keys())
        }
        
        return health_status
        
    except Exception as e:
        return {
            "status": "error",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

@app.get("/api/crypto/prices")
@limiter.limit("120/minute")  # 每分钟最多120次价格查询（高频接口）
async def get_crypto_prices(request: Request):
    """获取实时加密货币价格并存储到数据库"""
    global PRICE_CACHE, LAST_DB_WRITE_TIME
    
    try:
        # 1. 检查内存缓存
        now = datetime.now()
        if PRICE_CACHE['data'] and PRICE_CACHE['timestamp']:
            cache_age = (now - PRICE_CACHE['timestamp']).total_seconds()
            if cache_age < CACHE_DURATION:
                print(f"[CACHE] Using cached price data (age: {cache_age:.2f}s)")
                return {
                    'success': True,
                    'data': PRICE_CACHE['data'],
                    'timestamp': PRICE_CACHE['timestamp'].isoformat(),
                    'source': 'memory_cache',
                    'data_count': len(PRICE_CACHE['data'])
                }
        
        print("[API] Starting to fetch price data...")
        print(f"[API] Database connection status: {'Connected' if db_manager.connection and db_manager.connection.open else 'Disconnected'}")
        
        # 构建API请求
        symbols = ','.join(SUPPORTED_CRYPTOS.keys())
        url = f"{CRYPTOCOMPARE_API_URL}/pricemultifull"
        params = {
            'fsyms': symbols,
            'tsyms': 'USD'
        }
        
        print(f"[API] Request URL: {url}")
        print(f"[API] Request params: {params}")
        
        # 请求CryptoCompare API
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            print(f"[API] Response status: {response.status_code}")
            response.raise_for_status()
            data = response.json()
        
        print(f"[API] Response data structure: {list(data.keys()) if data else 'Empty'}")
        
        # 解析数据
        result = []
        raw_data = data.get('RAW', {})
        print(f"[API] RAW data contains symbols: {list(raw_data.keys()) if raw_data else 'None'}")
        
        for symbol, name in SUPPORTED_CRYPTOS.items():
            if symbol in raw_data:
                symbol_data = raw_data[symbol]
                if 'USD' in symbol_data:
                    usd_data = symbol_data['USD']
                    
                    crypto_data = {
                        'symbol': symbol,
                        'name': name,
                        'price': usd_data.get('PRICE', 0),
                        'price_change_24h': usd_data.get('CHANGEPCT24HOUR', 0),
                        'volume_24h': usd_data.get('VOLUME24HOURTO', 0),
                        'market_cap': usd_data.get('MKTCAP', 0),
                        'api_source': 'CryptoCompare'
                    }
                    
                    result.append(crypto_data)
                    print(f"[API] {symbol}: ${crypto_data['price']} ({crypto_data['price_change_24h']:.2f}%)")
                else:
                    print(f"[API WARNING] {symbol} missing USD data")
            else:
                print(f"[API WARNING] {symbol} not in API response")
        
        if len(result) > 0:
            print(f"[API SUCCESS] Successfully fetched {len(result)} cryptocurrencies price data")
            
            # 更新内存缓存
            PRICE_CACHE['data'] = result
            PRICE_CACHE['timestamp'] = now
            PRICE_CACHE['source'] = 'api'
            
            # 检查是否需要写入数据库
            should_write_db = False
            if LAST_DB_WRITE_TIME is None:
                should_write_db = True
            else:
                time_since_last_write = (now - LAST_DB_WRITE_TIME).total_seconds()
                if time_since_last_write >= DB_WRITE_INTERVAL:
                    should_write_db = True
                else:
                    print(f"[DB] Skipping database write (last write: {time_since_last_write:.2f}s ago)")
            
            if should_write_db:
                print("[DB] Writing new price data to database...")
                try:
                    # 确保数据库连接
                    if not db_manager.connection or not db_manager.connection.open:
                        print("[DB] Reconnecting to database...")
                        db_manager.connect()
                    
                    # 批量写入或逐条写入
                    for crypto_data in result:
                        query = """
                        INSERT INTO cryptocurrency_prices 
                        (symbol, name, price, price_change_24h, volume_24h, market_cap, api_source)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        """
                        params = (
                            crypto_data['symbol'],
                            crypto_data['name'],
                            crypto_data['price'],
                            crypto_data['price_change_24h'],
                            crypto_data['volume_24h'],
                            crypto_data['market_cap'],
                            crypto_data['api_source']
                        )
                        db_manager.execute_query(query, params)
                    
                    LAST_DB_WRITE_TIME = now
                    print(f"[DB SUCCESS] Saved {len(result)} records to database")
                except Exception as db_error:
                    print(f"[DB WARNING] Database storage failed: {db_error}")
                    # 不中断流程，继续返回数据
            
            return {
                'success': True,
                'data': result,
                'timestamp': now.isoformat(),
                'source': 'api',
                'data_count': len(result)
            }
        else:
            print("[API WARNING] No data fetched from API, falling back to database")
            # 如果API返回空数据，直接进入降级流程
            raise Exception("API returned empty data")
    
    except httpx.HTTPStatusError as http_error:
        print(f"❌ HTTP错误: {http_error.response.status_code} - {http_error}")
        # 继续到降级方案
    except httpx.RequestError as req_error:
        print(f"❌ 请求错误: {req_error}")
        # 继续到降级方案
    except Exception as e:
        print(f"❌ 获取价格数据失败: {type(e).__name__}: {e}")
        # 继续到降级方案
    
    # 降级方案1: 尝试从数据库获取最新数据
    try:
        print("🔄 尝试从数据库获取最新数据...")
        
        # 确保数据库连接
        if not db_manager.connection or not db_manager.connection.open:
            print("[DB] Attempting to reconnect to database...")
            try:
                db_manager.connect()
                print("[DB] Database reconnection successful")
            except Exception as conn_error:
                print(f"[DB ERROR] Database reconnection failed: {conn_error}")
                raise
        
        query = """
        SELECT symbol, name, price, price_change_24h, volume_24h, market_cap, api_source, created_at
        FROM cryptocurrency_prices 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        ORDER BY created_at DESC
        """
        results = db_manager.execute_query(query)
        
        print(f"[DB] Query returned {len(results)} records")
        
        # 按symbol分组取最新数据
        latest_data = {}
        for row in results:
            symbol = row['symbol']
            if symbol not in latest_data:
                latest_data[symbol] = row
                print(f"[DB] Found cached data for {symbol}: ${row['price']} (updated: {row['created_at']})")
        
        result = []
        for symbol, name in SUPPORTED_CRYPTOS.items():
            if symbol in latest_data:
                row = latest_data[symbol]
                result.append({
                    'symbol': row['symbol'],
                    'name': row['name'],
                    'price': float(row['price']),
                    'price_change_24h': float(row['price_change_24h']) if row['price_change_24h'] else 0,
                    'volume_24h': float(row['volume_24h']) if row['volume_24h'] else 0,
                    'market_cap': float(row['market_cap']) if row['market_cap'] else 0,
                    'api_source': row['api_source']
                })
        
        if result:
            print(f"✅ 从数据库获取了 {len(result)} 个币种的缓存数据")
            return {
                'success': True,
                'data': result,
                'timestamp': datetime.now().isoformat(),
                'source': 'database_cache',
                'data_count': len(result)
            }
        else:
            print("⚠️ 数据库中没有找到最近1小时的数据")
    except Exception as db_fallback_error:
        print(f"❌ 数据库回退也失败: {db_fallback_error}")
        import traceback
        print(f"[DB ERROR] Traceback: {traceback.format_exc()}")
    
    # 降级方案2: 返回动态默认数据（从数据库最近记录更新）
    print("⚠️ 所有数据源都失败，返回动态默认数据")
    
    # 如果动态默认数据为空，使用静态备用数据
    if not DYNAMIC_DEFAULT_DATA:
        print("⚠️ 动态默认数据为空，使用静态备用数据")
        fallback_data = [
            {'symbol': 'BTC', 'name': 'Bitcoin', 'price': 92242.34, 'price_change_24h': 0.88, 'volume_24h': 85000000000, 'market_cap': 1800000000000, 'api_source': 'static_fallback'},
            {'symbol': 'ETH', 'name': 'Ethereum', 'price': 3035.28, 'price_change_24h': -1.41, 'volume_24h': 8200000000, 'market_cap': 365000000000, 'api_source': 'static_fallback'},
            {'symbol': 'SOL', 'name': 'Solana', 'price': 143.57, 'price_change_24h': 2.46, 'volume_24h': 2100000000, 'market_cap': 65400000000, 'api_source': 'static_fallback'},
            {'symbol': 'ADA', 'name': 'Cardano', 'price': 0.468, 'price_change_24h': 0.49, 'volume_24h': 1800000000, 'market_cap': 16500000000, 'api_source': 'static_fallback'},
            {'symbol': 'DOT', 'name': 'Polkadot', 'price': 2.748, 'price_change_24h': 1.72, 'volume_24h': 890000000, 'market_cap': 3800000000, 'api_source': 'static_fallback'},
            {'symbol': 'AVAX', 'name': 'Avalanche', 'price': 14.35, 'price_change_24h': -0.11, 'volume_24h': 1200000000, 'market_cap': 5600000000, 'api_source': 'static_fallback'},
            {'symbol': 'LINK', 'name': 'Chainlink', 'price': 18.92, 'price_change_24h': 3.21, 'volume_24h': 780000000, 'market_cap': 11200000000, 'api_source': 'static_fallback'},
            {'symbol': 'UNI', 'name': 'Uniswap', 'price': 12.67, 'price_change_24h': -0.89, 'volume_24h': 450000000, 'market_cap': 9800000000, 'api_source': 'static_fallback'},
            {'symbol': 'ATOM', 'name': 'Cosmos', 'price': 7.89, 'price_change_24h': 1.56, 'volume_24h': 560000000, 'market_cap': 3200000000, 'api_source': 'static_fallback'}
        ]
        default_data = fallback_data
        print(f"[FALLBACK] Using static fallback data with {len(fallback_data)} cryptocurrencies")
    else:
        print(f"✅ 使用动态默认数据（最后更新: {DEFAULT_DATA_LAST_UPDATE.strftime('%Y-%m-%d %H:%M:%S') if DEFAULT_DATA_LAST_UPDATE else '未知'}）")
        print(f"[FALLBACK] Using dynamic default data with {len(DYNAMIC_DEFAULT_DATA)} cryptocurrencies")
        default_data = DYNAMIC_DEFAULT_DATA
    
    return {
        'success': True,
        'data': default_data,
        'timestamp': datetime.now().isoformat(),
        'source': 'dynamic_default' if DYNAMIC_DEFAULT_DATA else 'static_fallback',
        'last_update': DEFAULT_DATA_LAST_UPDATE.isoformat() if DEFAULT_DATA_LAST_UPDATE else None,
        'data_count': len(default_data)
    }

@app.get("/api/crypto/history/{symbol}")
@limiter.limit("60/minute")  # 每分钟最多60次历史数据查询
async def get_crypto_history(request: Request, symbol: str, hours: Optional[int] = 24):
    """获取加密货币历史价格数据"""
    try:
        print(f"🔄 获取 {symbol} 的历史数据，时间范围: {hours}小时")
        
        # 验证货币符号
        symbol = symbol.upper()
        if symbol not in SUPPORTED_CRYPTOS:
            print(f"❌ 不支持的货币符号: {symbol}")
            raise HTTPException(status_code=404, detail=f"不支持的货币符号: {symbol}")
        
        # 验证时间范围
        if hours < 1 or hours > 168:
            print(f"❌ 无效的时间范围: {hours}")
            raise HTTPException(status_code=400, detail="时间范围必须在1-168小时之间")
        
        # 查询历史数据
        query = """
        SELECT symbol, name, price, price_change_24h, volume_24h, 
               market_cap, api_source, created_at
        FROM cryptocurrency_prices 
        WHERE symbol = %s 
          AND created_at >= DATE_SUB(NOW(), INTERVAL %s HOUR)
        ORDER BY created_at ASC
        """
        
        print(f"📊 执行查询: {query}")
        print(f"📊 查询参数: ({symbol}, {hours})")
        
        try:
            results = db_manager.execute_query(query, (symbol, hours))
            print(f"📊 查询结果数量: {len(results)}")
        except Exception as db_error:
            print(f"❌ 数据库查询失败: {db_error}")
            # 如果查询失败，返回空数据而不是500错误
            return {
                'success': True,
                'data': [],
                'symbol': symbol,
                'hours': hours,
                'count': 0,
                'message': '暂无历史数据',
                'error': str(db_error)
            }
        
        # 格式化返回数据
        data = []
        for i, row in enumerate(results):
            try:
                data.append({
                    'symbol': row['symbol'],
                    'name': row['name'],
                    'price': float(row['price']) if row['price'] else 0,
                    'price_change_24h': float(row['price_change_24h']) if row['price_change_24h'] else None,
                    'volume_24h': float(row['volume_24h']) if row['volume_24h'] else None,
                    'market_cap': float(row['market_cap']) if row['market_cap'] else None,
                    'api_source': row['api_source'],
                    'created_at': row['created_at'].isoformat()
                })
            except Exception as format_error:
                print(f"⚠️ 格式化第 {i} 行数据失败: {format_error}")
                continue
        
        print(f"✅ 成功格式化 {len(data)} 条历史记录")
        
        # 数据抽样：如果数据点过多，进行降采样以提高前端渲染性能
        MAX_DATA_POINTS = 2000
        if len(data) > MAX_DATA_POINTS:
            step = len(data) // MAX_DATA_POINTS + 1
            original_count = len(data)
            data = data[::step]
            print(f"📉 数据点过多 ({original_count})，已降采样为 {len(data)} 条 (step={step})")
        
        # 如果没有数据，尝试获取一些模拟数据
        if len(data) == 0:
            print("📊 没有找到历史数据，生成模拟数据...")
            # 生成一些模拟数据用于演示
            base_price = 45000 if symbol == 'BTC' else 2500
            for i in range(hours):
                import random
                price_change = random.uniform(-0.05, 0.05)  # -5% 到 +5% 的随机变化
                price = base_price * (1 + price_change * (i / hours))
                
                data.append({
                    'symbol': symbol,
                    'name': SUPPORTED_CRYPTOS[symbol],
                    'price': price,
                    'price_change_24h': price_change * 100,
                    'volume_24h': 85000000000 if symbol == 'BTC' else 8200000000,
                    'market_cap': 879200000000 if symbol == 'BTC' else 308500000000,
                    'api_source': 'mock_data',
                    'created_at': (datetime.now() - timedelta(hours=hours-i)).isoformat()
                })
            
            print(f"📊 生成了 {len(data)} 条模拟数据")
        
        return {
            'success': True,
            'data': data,
            'symbol': symbol,
            'hours': hours,
            'count': len(data),
            'source': 'database' if len(results) > 0 else 'mock_data'
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 获取历史数据失败: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"获取历史数据失败: {str(e)}")

@app.get("/api/crypto/recent")
async def get_recent_crypto_prices(hours: int = 1):
    """从数据库获取最近N小时内的最新价格数据（用于降级方案）"""
    try:
        print(f"🔄 从数据库获取最近 {hours} 小时的价格数据...")
        
        # 查询最近N小时内的数据，按symbol分组取最新记录
        query = """
        SELECT t1.symbol, t1.name, t1.price, t1.price_change_24h, 
               t1.volume_24h, t1.market_cap, t1.api_source, t1.created_at
        FROM cryptocurrency_prices t1
        INNER JOIN (
            SELECT symbol, MAX(created_at) as max_time
            FROM cryptocurrency_prices
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL %s HOUR)
            GROUP BY symbol
        ) t2 ON t1.symbol = t2.symbol AND t1.created_at = t2.max_time
        ORDER BY t1.symbol
        """
        
        results = db_manager.execute_query(query, (hours,))
        
        if not results:
            print(f"⚠️ 数据库中没有最近 {hours} 小时的数据")
            return {
                'success': True,
                'data': [],
                'hours': hours,
                'count': 0,
                'message': '暂无最近数据'
            }
        
        # 格式化返回数据
        data = []
        for row in results:
            data.append({
                'symbol': row['symbol'],
                'name': row['name'],
                'price': float(row['price']) if row['price'] else 0,
                'price_change_24h': float(row['price_change_24h']) if row['price_change_24h'] else 0,
                'volume_24h': float(row['volume_24h']) if row['volume_24h'] else 0,
                'market_cap': float(row['market_cap']) if row['market_cap'] else 0,
                'api_source': row['api_source'],
                'created_at': row['created_at'].isoformat()
            })
        
        print(f"✅ 从数据库获取了 {len(data)} 个币种的最新数据")
        
        return {
            'success': True,
            'data': data,
            'hours': hours,
            'count': len(data),
            'source': 'database_recent'
        }
        
    except Exception as e:
        print(f"❌ 从数据库获取最近数据失败: {type(e).__name__}: {e}")
        return {
            'success': False,
            'data': [],
            'hours': hours,
            'count': 0,
            'error': str(e)
        }

@app.get("/api/crypto/supported")
async def get_supported_cryptos():
    """获取支持的加密货币列表"""
    return {
        'success': True,
        'data': [
            {'symbol': symbol, 'name': name}
            for symbol, name in SUPPORTED_CRYPTOS.items()
        ]
    }

@app.get("/api/health")
async def health_check():
    """健康检查"""
    try:
        # 测试数据库连接
        db_manager.execute_query("SELECT 1")
        return {
            'status': 'healthy',
            'database': 'connected',
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'database': 'disconnected',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }

# ==================== 用户数据管理API ====================

@app.post("/api/user/sync")
async def sync_user_data(user_data: Dict):
    """同步或创建用户数据"""
    try:
        eng_name = user_data.get('eng_name')
        if not eng_name:
            raise HTTPException(status_code=400, detail="用户名不能为空")
        
        # 检查用户是否存在
        check_query = "SELECT id FROM users WHERE eng_name = %s"
        existing_user = db_manager.execute_query(check_query, (eng_name,))
        
        if existing_user:
            # 更新现有用户数据
            update_query = """
            UPDATE users SET 
                chn_name = %s,
                dept_name = %s,
                work_place_id = %s,
                position_name = %s,
                total_assets = %s,
                available_cash = %s,
                total_profit = %s,
                profit_rate = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE eng_name = %s
            """
            params = (
                user_data.get('chn_name'),
                user_data.get('dept_name'),
                user_data.get('work_place_id'),
                user_data.get('position_name'),
                user_data.get('total_assets', 1000000.00),
                user_data.get('available_cash', 1000000.00),
                user_data.get('total_profit', 0.00),
                user_data.get('profit_rate', 0.0000),
                eng_name
            )
            db_manager.execute_query(update_query, params)
            
            # 清除旧持仓数据
            delete_portfolio_query = "DELETE FROM user_portfolios WHERE user_eng_name = %s"
            db_manager.execute_query(delete_portfolio_query, (eng_name,))
        else:
            # 创建新用户
            insert_query = """
            INSERT INTO users (
                eng_name, chn_name, dept_name, work_place_id, position_name,
                total_assets, available_cash, total_profit, profit_rate
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            params = (
                eng_name,
                user_data.get('chn_name'),
                user_data.get('dept_name'),
                user_data.get('work_place_id'),
                user_data.get('position_name'),
                user_data.get('total_assets', 1000000.00),
                user_data.get('available_cash', 1000000.00),
                user_data.get('total_profit', 0.00),
                user_data.get('profit_rate', 0.0000)
            )
            db_manager.execute_query(insert_query, params)
        
        # 同步持仓数据
        portfolio = user_data.get('portfolio', [])
        for item in portfolio:
            portfolio_query = """
            INSERT INTO user_portfolios (
                user_eng_name, crypto_symbol, crypto_name, quantity, 
                avg_price, current_price, market_value, profit_loss, profit_rate
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                crypto_name = VALUES(crypto_name),
                quantity = VALUES(quantity),
                avg_price = VALUES(avg_price),
                current_price = VALUES(current_price),
                market_value = VALUES(market_value),
                profit_loss = VALUES(profit_loss),
                profit_rate = VALUES(profit_rate),
                updated_at = CURRENT_TIMESTAMP
            """
            portfolio_params = (
                eng_name,
                item.get('symbol'),
                item.get('name'),
                item.get('quantity', 0),
                item.get('avg_price', 0),
                item.get('current_price', 0),
                item.get('market_value', 0),
                item.get('profit_loss', 0),
                item.get('profit_rate', 0)
            )
            db_manager.execute_query(portfolio_query, portfolio_params)
        
        return {
            'success': True,
            'message': '用户数据同步成功',
            'eng_name': eng_name
        }
    
    except Exception as e:
        print(f"❌ 用户数据同步失败: {e}")
        raise HTTPException(status_code=500, detail=f"用户数据同步失败: {str(e)}")

@app.post("/api/user/trade")
async def record_user_trade(trade_data: Dict):
    """记录用户交易"""
    try:
        eng_name = trade_data.get('eng_name')
        if not eng_name:
            raise HTTPException(status_code=400, detail="用户名不能为空")
        
        # 插入交易记录
        trade_query = """
        INSERT INTO user_trades (
            user_eng_name, trade_type, crypto_symbol, crypto_name,
            quantity, price, total_amount, fee, mode
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            eng_name,
            trade_data.get('type'),  # 修正字段名
            trade_data.get('symbol'),
            trade_data.get('name'),
            trade_data.get('amount'),
            trade_data.get('price'),
            trade_data.get('cost') or trade_data.get('total_amount'),
            trade_data.get('fee', 0.00),
            trade_data.get('mode', 'practice')
        )
        db_manager.execute_query(trade_query, params)
        
        return {
            'success': True,
            'message': '交易记录保存成功'
        }
    
    except Exception as e:
        print(f"❌ 交易记录保存失败: {e}")
        raise HTTPException(status_code=500, detail=f"交易记录保存失败: {str(e)}")

@app.get("/api/user/data/{eng_name}")
async def get_user_data(eng_name: str):
    """获取用户完整数据"""
    try:
        # 获取用户基本信息
        user_query = "SELECT * FROM users WHERE eng_name = %s"
        users = db_manager.execute_query(user_query, (eng_name,))
        
        if not users:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        user = users[0]
        
        # 获取持仓数据
        portfolio_query = "SELECT * FROM user_portfolios WHERE user_eng_name = %s"
        portfolio = db_manager.execute_query(portfolio_query, (eng_name,))
        
        # 获取最近交易记录
        trades_query = """
        SELECT * FROM user_trades 
        WHERE user_eng_name = %s 
        ORDER BY created_at DESC 
        LIMIT 20
        """
        trades = db_manager.execute_query(trades_query, (eng_name,))
        
        return {
            'success': True,
            'data': {
                'user': user,
                'portfolio': portfolio,
                'trades': trades
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 获取用户数据失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取用户数据失败: {str(e)}")

@app.get("/api/leaderboard")
@limiter.limit("30/minute")  # 每分钟最多30次排行榜查询
async def get_leaderboard(request: Request):
    """获取用户排行榜"""
    try:
        query = """
        SELECT eng_name, chn_name, total_assets, total_profit, profit_rate, updated_at
        FROM users 
        WHERE total_assets > 0
        ORDER BY total_assets DESC, profit_rate DESC
        LIMIT 50
        """
        results = db_manager.execute_query(query)
        
        # 添加排名
        leaderboard = []
        for i, user in enumerate(results, 1):
            leaderboard.append({
                'rank': i,
                'eng_name': user['eng_name'],
                'chn_name': user['chn_name'] or user['eng_name'],
                'total_assets': float(user['total_assets']),
                'total_profit': float(user['total_profit']),
                'profit_rate': float(user['profit_rate']),
                'updated_at': user['updated_at'].isoformat()
            })
        
        return {
            'success': True,
            'data': leaderboard
        }
    
    except Exception as e:
        print(f"❌ 获取排行榜失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取排行榜失败: {str(e)}")

@app.post("/api/user/save")
@limiter.limit("30/minute")  # 每分钟最多30次保存请求
async def save_user_data(request: Request, user_data: Dict):
    """保存用户的完整数据（用户信息和持仓明细）"""
    try:
        logger.info("=" * 80)
        logger.info("[SAVE] Received save request")
        logger.info(f"[SAVE] Request time: {datetime.now().isoformat()}")
        logger.info(f"[SAVE] Client IP: {get_remote_address(request)}")
        
        # 第一步：使用Pydantic进行数据验证
        try:
            validated_data = UserSaveData(**user_data)
            logger.info(f"[SECURITY] Data validation passed for user: {validated_data.eng_name}")
        except ValidationError as ve:
            logger.error(f"[SECURITY] Data validation failed: {ve}")
            logger.error(f"[SECURITY] Invalid data: {user_data}")
            error_messages = '; '.join([f"{err['loc'][0]}: {err['msg']}" for err in ve.errors()])
            raise HTTPException(
                status_code=400, 
                detail=f"数据验证失败: {error_messages}"
            )
        except Exception as e:
            logger.error(f"[SECURITY] Unexpected validation error: {e}")
            raise HTTPException(status_code=400, detail=f"数据格式错误: {str(e)}")
        
        eng_name = validated_data.eng_name
        
        # 🔒 黑名单检查：拒绝黑名单用户的保存请求
        is_blocked, block_message = is_blacklisted(eng_name)
        if is_blocked:
            logger.warning(f"[BLACKLIST] Rejected save request from blacklisted user: {eng_name}")
            raise HTTPException(
                status_code=403,
                detail=block_message
            )
        
        # 记录验证后的数据
        logger.info(f"[SAVE] Validated save request, user: {eng_name}")
        logger.info(f"[DATA] Validated data - total_assets: {validated_data.total_assets}")
        logger.info(f"[DATA] Validated data - available_cash: {validated_data.available_cash}")
        logger.info(f"[DATA] Validated data - today_profit: {validated_data.today_profit}")
        logger.info(f"[DATA] Validated data - total_profit_rate: {validated_data.total_profit_rate}")
        logger.info(f"[DATA] Validated data - portfolios count: {len(validated_data.portfolios)}")
        
        # 确保数据库连接存在
        if not db_manager.connection or not db_manager.connection.open:
            try:
                db_manager.connect()
            except Exception as conn_error:
                logger.error(f"⚠️ 数据库连接失败: {conn_error}")
                raise HTTPException(
                    status_code=503, 
                    detail="数据库服务暂时不可用，请稍后再试"
                )
        
        # 🔒 业务逻辑验证：检查资产变化的合理性
        try:
            # 查询用户上次保存的数据
            check_query = """
                SELECT total_assets, available_cash, updated_at
                FROM users
                WHERE eng_name = %s
            """
            with db_manager.connection.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute(check_query, (eng_name,))
                last_save = cursor.fetchone()
            
            if last_save:
                last_total_assets = float(last_save['total_assets'])
                last_available_cash = float(last_save['available_cash'])
                last_updated = last_save['updated_at']
                
                # 计算资产变化
                asset_change = abs(validated_data.total_assets - last_total_assets)
                cash_change = abs(validated_data.available_cash - last_available_cash)
                
                logger.info(f"[SECURITY] Asset change check:")
                logger.info(f"  - Last total assets: ${last_total_assets}")
                logger.info(f"  - New total assets: ${validated_data.total_assets}")
                logger.info(f"  - Asset change: ${asset_change}")
                logger.info(f"  - Last updated: {last_updated}")
                
                # 检查1：单次保存资产变化不能超过50万（防止异常跳变）
                if asset_change > SECURITY_LIMITS['MAX_ASSET_CHANGE_PER_SAVE']:
                    logger.error(f"[SECURITY] Asset change too large: ${asset_change}")
                    raise HTTPException(
                        status_code=400,
                        detail=f"资产变化异常：单次保存资产变化不能超过${SECURITY_LIMITS['MAX_ASSET_CHANGE_PER_SAVE']:,.0f}，当前变化${asset_change:,.0f}"
                    )
                
                # 检查2：资产和现金的变化必须合理（现金变化不能超过资产变化）
                if cash_change > asset_change + 100:  # 允许100元误差
                    logger.error(f"[SECURITY] Cash change exceeds asset change")
                    raise HTTPException(
                        status_code=400,
                        detail=f"数据异常：现金变化(${cash_change:,.0f})超过资产变化(${asset_change:,.0f})"
                    )
                
                # 检查3：收益率必须与资产变化匹配
                expected_profit_rate = ((validated_data.total_assets - SECURITY_LIMITS['INITIAL_CAPITAL']) / SECURITY_LIMITS['INITIAL_CAPITAL']) * 100
                profit_rate_diff = abs(validated_data.total_profit_rate - expected_profit_rate)
                
                if profit_rate_diff > 1.0:  # 允许1%的误差
                    logger.warning(f"[SECURITY] Profit rate mismatch: expected {expected_profit_rate:.2f}%, got {validated_data.total_profit_rate:.2f}%")
                    # 自动修正收益率
                    validated_data.total_profit_rate = expected_profit_rate
                    logger.info(f"[SECURITY] Auto-corrected profit rate to {expected_profit_rate:.2f}%")
            else:
                # 首次保存，验证初始资产是否合理
                if validated_data.total_assets > SECURITY_LIMITS['INITIAL_CAPITAL'] * 2:
                    logger.error(f"[SECURITY] Initial assets too high: ${validated_data.total_assets}")
                    raise HTTPException(
                        status_code=400,
                        detail=f"初始资产异常：首次保存资产不能超过${SECURITY_LIMITS['INITIAL_CAPITAL'] * 2:,.0f}"
                    )
                logger.info(f"[SECURITY] First save for user {eng_name}, initial assets: ${validated_data.total_assets}")
        
        except HTTPException:
            raise
        except Exception as check_error:
            logger.error(f"[SECURITY] Asset validation error: {check_error}")
            # 验证失败时不阻止保存，但记录日志
            logger.warning(f"[SECURITY] Continuing save despite validation error")
        
        try:
            # 1. 保存或更新用户基本信息（使用验证后的数据）
            upsert_user_query = """
            INSERT INTO users (
                eng_name, chn_name, dept_name, position_name,
                total_assets, available_cash, total_profit, profit_rate, initialized
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                chn_name = VALUES(chn_name),
                dept_name = VALUES(dept_name),
                position_name = VALUES(position_name),
                total_assets = VALUES(total_assets),
                available_cash = VALUES(available_cash),
                total_profit = VALUES(total_profit),
                profit_rate = VALUES(profit_rate),
                initialized = VALUES(initialized),
                updated_at = CURRENT_TIMESTAMP
            """
            
            # 使用验证后的数据
            total_assets_value = validated_data.total_assets
            available_cash_value = validated_data.available_cash
            today_profit_value = validated_data.today_profit
            total_profit_rate_value = validated_data.total_profit_rate
            
            logger.info(f"[SAVE] Preparing to save - total_assets: {total_assets_value}")
            logger.info(f"[SAVE] Preparing to save - available_cash: {available_cash_value}")
            logger.info(f"[SAVE] Preparing to save - total_profit: {today_profit_value}")
            logger.info(f"[SAVE] Preparing to save - profit_rate: {total_profit_rate_value}")
            
            user_params = (
                validated_data.eng_name,
                validated_data.chn_name,
                validated_data.dept_name,
                validated_data.position_name,
                total_assets_value,
                available_cash_value,
                today_profit_value,
                total_profit_rate_value,
                True  # 标记为已初始化
            )
            
            with db_manager.connection.cursor() as cursor:
                cursor.execute(upsert_user_query, user_params)
                db_manager.connection.commit()
            
            logger.info(f"[SUCCESS] User {eng_name} basic info saved successfully")
            
            # 2. 删除旧持仓数据
            delete_portfolio_query = "DELETE FROM user_portfolios WHERE user_eng_name = %s"
            with db_manager.connection.cursor() as cursor:
                cursor.execute(delete_portfolio_query, (eng_name,))
                db_manager.connection.commit()
            
            logger.info(f"[SUCCESS] User {eng_name} old portfolio data cleared")
            
            # 3. 保存新的持仓明细（使用验证后的数据）
            portfolios = validated_data.portfolios
            if portfolios:
                insert_portfolio_query = """
                INSERT INTO user_portfolios (
                    user_eng_name, crypto_symbol, crypto_name, quantity, avg_price,
                    current_price, market_value, profit_loss, profit_rate
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                with db_manager.connection.cursor() as cursor:
                    for portfolio in portfolios:
                        portfolio_params = (
                            eng_name,
                            portfolio.crypto_symbol,
                            portfolio.crypto_name,
                            portfolio.quantity,
                            portfolio.avg_cost,
                            portfolio.current_price,
                            portfolio.market_value,
                            portfolio.profit_loss,
                            portfolio.profit_loss_rate
                        )
                        cursor.execute(insert_portfolio_query, portfolio_params)
                    
                    db_manager.connection.commit()
                
                logger.info(f"[SUCCESS] User {eng_name} portfolio data saved successfully, total {len(portfolios)} items")
            
            logger.info(f"[SUCCESS] User {eng_name} data save completed")
            logger.info("=" * 80)
            logger.info("[SUCCESS] Save successful response")
            logger.info(f"[SUCCESS] User: {eng_name}")
            logger.info(f"[SUCCESS] Total assets: {total_assets_value}")
            logger.info(f"[SUCCESS] Available cash: {available_cash_value}")
            logger.info(f"[SUCCESS] Today profit: {today_profit_value}")
            logger.info(f"[SUCCESS] Profit rate: {total_profit_rate_value}%")
            logger.info(f"[SUCCESS] Portfolio count: {len(portfolios)}")
            logger.info(f"[SUCCESS] Timestamp: {datetime.now().isoformat()}")
            logger.info("=" * 80)
            
            return {
                'success': True,
                'message': '数据保存成功',
                'timestamp': datetime.now().isoformat(),
                'saved_data': {
                    'eng_name': eng_name,
                    'total_assets': total_assets_value,
                    'available_cash': available_cash_value,
                    'today_profit': today_profit_value,
                    'total_profit_rate': total_profit_rate_value,
                    'portfolios_count': len(portfolios)
                }
            }
            
        except Exception as e:
            # 回滚事务
            if db_manager.connection:
                db_manager.connection.rollback()
            logger.error(f"[ERROR] Error during save process: {e}")
            raise e
            
    except HTTPException:
        # 重新抛出HTTP异常（包括验证错误）
        raise
    except Exception as e:
        logger.error(f"[ERROR] Failed to save user data: {e}")
        import traceback
        logger.error(f"[ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"保存用户数据失败: {str(e)}")

@app.get("/api/user/check/{eng_name}")
@limiter.limit("60/minute")  # 每分钟最多60次查询请求
async def check_user_data(request: Request, eng_name: str):
    """检查用户是否有保存的数据"""
    try:
        if not eng_name:
            raise HTTPException(status_code=400, detail="用户名不能为空")
        
        # 确保数据库连接存在
        if not db_manager.connection or not db_manager.connection.open:
            try:
                db_manager.connect()
            except Exception as conn_error:
                print(f"⚠️ 数据库连接失败: {conn_error}")
                raise HTTPException(
                    status_code=503, 
                    detail="数据库服务暂时不可用，请稍后再试"
                )
        
        try:
            # 查询用户基本信息是否存在
            user_query = """
            SELECT eng_name, updated_at
            FROM users
            WHERE eng_name = %s
            """
            
            with db_manager.connection.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute(user_query, (eng_name,))
                user_info = cursor.fetchone()
            
            if not user_info:
                print(f"📂 用户 {eng_name} 无保存数据")
                return {
                    'success': True,
                    'hasData': False,
                    'message': f'用户 {eng_name} 暂无保存数据',
                    'timestamp': datetime.now().isoformat()
                }
            
            # 检查数据是否过期（可选：比如超过7天认为数据过期）
            # 这里我们不检查过期，只要有数据就认为可以载入
            
            print(f"📂 用户 {eng_name} 有保存数据，最后更新: {user_info.get('updated_at')}")
            return {
                'success': True,
                'hasData': True,
                'message': f'用户 {eng_name} 有保存数据',
                'last_updated': user_info.get('updated_at').isoformat() if user_info.get('updated_at') else None,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ 检查用户数据时出错: {e}")
            raise e
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 检查用户数据失败: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"检查用户数据失败: {str(e)}")

@app.get("/api/user/load/{eng_name}")
@limiter.limit("60/minute")  # 每分钟最多60次加载请求
async def load_user_data(request: Request, eng_name: str):
    """载入用户的完整数据（用户信息和持仓明细）"""
    try:
        if not eng_name:
            raise HTTPException(status_code=400, detail="用户名不能为空")
        
        # 🔒 黑名单检查：返回初始值和封禁提示
        is_blocked, block_message = is_blacklisted(eng_name)
        if is_blocked:
            logger.warning(f"[BLACKLIST] Blocked user attempted to load data: {eng_name}")
            return {
                'success': True,
                'message': '数据载入成功',
                'is_blacklisted': True,
                'blacklist_message': block_message,
                'user_data': {
                    'eng_name': eng_name,
                    'chn_name': '',
                    'dept_name': '',
                    'position_name': '',
                    'total_assets': SECURITY_LIMITS['INITIAL_CAPITAL'],
                    'available_cash': SECURITY_LIMITS['INITIAL_CAPITAL'],
                    'today_profit': 0.0,
                    'total_profit_rate': 0.0,
                    'initialized': True,
                    'updated_at': datetime.now().isoformat()
                },
                'portfolios': []
            }
        
        # 确保数据库连接存在
        if not db_manager.connection or not db_manager.connection.open:
            try:
                db_manager.connect()
            except Exception as conn_error:
                print(f"⚠️ 数据库连接失败: {conn_error}")
                raise HTTPException(
                    status_code=503, 
                    detail="数据库服务暂时不可用，请稍后再试"
                )
        
        try:
            # 1. 查询用户基本信息
            user_query = """
            SELECT eng_name, chn_name, dept_name, position_name,
                   total_assets, available_cash, total_profit, profit_rate,
                   initialized, created_at, updated_at
            FROM users
            WHERE eng_name = %s
            """
            
            with db_manager.connection.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute(user_query, (eng_name,))
                user_info = cursor.fetchone()
            
            if not user_info:
                raise HTTPException(status_code=404, detail=f"未找到用户 {eng_name} 的数据")
            
            print(f"✅ 查询到用户 {eng_name} 的基本信息")
            
            # 2. 查询用户持仓明细
            portfolio_query = """
            SELECT crypto_symbol, crypto_name, quantity, avg_price,
                   current_price, market_value, profit_loss, profit_rate,
                   created_at
            FROM user_portfolios
            WHERE user_eng_name = %s
            ORDER BY market_value DESC
            """
            
            with db_manager.connection.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute(portfolio_query, (eng_name,))
                portfolios = cursor.fetchall()
            
            print(f"✅ 查询到用户 {eng_name} 的持仓数据，共 {len(portfolios)} 条")
            
            # 3. 构建返回数据
            result = {
                'success': True,
                'message': '数据载入成功',
                'user_data': {
                    'eng_name': user_info['eng_name'],
                    'chn_name': user_info.get('chn_name', ''),
                    'dept_name': user_info.get('dept_name', ''),
                    'position_name': user_info.get('position_name', ''),
                    'total_assets': float(user_info['total_assets']),
                    'available_cash': float(user_info['available_cash']),
                    'today_profit': float(user_info.get('total_profit', 0.0)),
                    'total_profit_rate': float(user_info.get('profit_rate', 0.0)),
                    'initialized': bool(user_info.get('initialized', False)),
                    'updated_at': user_info.get('updated_at').isoformat() if user_info.get('updated_at') else None
                },
                'portfolios': [
                    {
                        'crypto_symbol': p['crypto_symbol'],
                        'crypto_name': p['crypto_name'],
                        'quantity': float(p['quantity']),
                        'avg_cost': float(p['avg_price']),
                        'current_price': float(p['current_price']),
                        'market_value': float(p['market_value']),
                        'profit_loss': float(p['profit_loss']),
                        'profit_loss_rate': float(p['profit_rate'])
                    }
                    for p in portfolios
                ],
                'timestamp': datetime.now().isoformat()
            }
            
            print(f"✅ 用户 {eng_name} 数据载入完成")
            return result
            
        except HTTPException:
            raise
        except Exception as e:
            print(f"❌ 载入过程中出错: {e}")
            raise e
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 载入用户数据失败: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"载入用户数据失败: {str(e)}")

@app.get("/api/user/test-save")
async def test_save_data():
    """生成测试数据并保存（仅用于测试）"""
    try:
        # 生成测试用户数据
        test_user_data = {
            'eng_name': 'elvis',
            'chn_name': 'Elvis测试',
            'dept_name': '测试部门',
            'position_name': '测试工程师',
            'total_assets': 1056789.50,
            'available_cash': 456789.50,
            'today_profit': 56789.50,
            'total_profit_rate': 5.6789,
            'portfolios': [
                {
                    'crypto_symbol': 'BTC',
                    'crypto_name': 'Bitcoin',
                    'quantity': 2.5,
                    'avg_cost': 45000.00,
                    'current_price': 48000.00,
                    'market_value': 120000.00,
                    'profit_loss': 7500.00,
                    'profit_loss_rate': 6.6667
                },
                {
                    'crypto_symbol': 'ETH',
                    'crypto_name': 'Ethereum',
                    'quantity': 50.0,
                    'avg_cost': 2500.00,
                    'current_price': 2700.00,
                    'market_value': 135000.00,
                    'profit_loss': 10000.00,
                    'profit_loss_rate': 8.0000
                }
            ]
        }
        
        # 调用保存函数
        result = await save_user_data(test_user_data)
        return {
            'success': True,
            'message': '测试数据保存成功',
            'test_data': test_user_data,
            'save_result': result
        }
        
    except Exception as e:
        print(f"❌ 测试保存失败: {e}")
        raise HTTPException(status_code=500, detail=f"测试保存失败: {str(e)}")

@app.get("/api/user/verify-save/{eng_name}")
async def verify_save_data(eng_name: str):
    """验证用户数据是否已保存到数据库"""
    try:
        # 确保数据库连接存在
        if not db_manager.connection or not db_manager.connection.open:
            try:
                db_manager.connect()
            except Exception as conn_error:
                print(f"⚠️ 数据库连接失败: {conn_error}")
                raise HTTPException(
                    status_code=503, 
                    detail="数据库服务暂时不可用，请稍后再试"
                )
        
        # 查询用户基本信息
        user_query = "SELECT * FROM users WHERE eng_name = %s"
        with db_manager.connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(user_query, (eng_name,))
            user_data = cursor.fetchone()
        
        # 查询用户持仓信息
        portfolio_query = "SELECT * FROM user_portfolios WHERE user_eng_name = %s"
        with db_manager.connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(portfolio_query, (eng_name,))
            portfolio_data = cursor.fetchall()
        
        if not user_data:
            return {
                'success': False,
                'message': f'用户 {eng_name} 的数据未找到',
                'user_data': None,
                'portfolio_data': []
            }
        
        return {
            'success': True,
            'message': f'用户 {eng_name} 的数据已找到',
            'user_data': user_data,
            'portfolio_data': portfolio_data
        }
        
    except Exception as e:
        print(f"❌ 验证数据失败: {e}")
        raise HTTPException(status_code=500, detail=f"验证数据失败: {str(e)}")

@app.get("/api/leaderboard")
@limiter.limit("30/minute")  # 每分钟最多30次排行榜查询
async def get_leaderboard(request: Request):
    """获取排行榜数据（按总资产和收益率排序）"""
    try:
        # 确保数据库连接存在
        if not db_manager.connection or not db_manager.connection.open:
            try:
                db_manager.connect()
            except Exception as conn_error:
                print(f"⚠️ 数据库连接失败: {conn_error}")
                raise HTTPException(
                    status_code=503, 
                    detail="数据库服务暂时不可用，请稍后再试"
                )
        
        # 查询所有用户数据，按总资产降序排列
        leaderboard_query = """
        SELECT 
            eng_name, 
            chn_name, 
            total_assets, 
            profit_rate,
            total_profit,
            updated_at
        FROM users
        ORDER BY total_assets DESC, profit_rate DESC
        """
        
        with db_manager.connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(leaderboard_query)
            users = cursor.fetchall()
        
        # 构建排行榜数据
        leaderboard = []
        for index, user in enumerate(users, start=1):
            # 根据排名分配称号
            if index == 1:
                title = "币神进化论"
                emoji = "👑"
            elif index == 2:
                title = "币圈巨鲸"
                emoji = "🐋"
            elif index == 3:
                title = "王者交易员"
                emoji = "🤴"
            elif 4 <= index <= 10:
                title = "精英投资者"
                emoji = "💼"
            elif 11 <= index <= 20:
                title = "王牌交易员"
                emoji = "🎯"
            elif 21 <= index <= 30:
                title = "K线魔术师"
                emoji = "🎩"
            elif 31 <= index <= 50:
                title = "趋势观察家"
                emoji = "🔭"
            elif 51 <= index <= 100:
                title = "潜力韭菜"
                emoji = "🌱"
            else:
                title = "快乐韭菜"
                emoji = "🥬"
            
            leaderboard.append({
                'rank': index,
                'eng_name': user['eng_name'],
                'chn_name': user.get('chn_name', user['eng_name']),
                'total_assets': float(user['total_assets']),
                'profit_rate': float(user.get('profit_rate', 0.0)),
                'total_profit': float(user.get('total_profit', 0.0)),
                'title': title,
                'emoji': emoji,
                'updated_at': user.get('updated_at').isoformat() if user.get('updated_at') else None
            })
        
        print(f"✅ 成功获取排行榜数据，共 {len(leaderboard)} 位用户")
        
        return {
            'success': True,
            'data': leaderboard,
            'total': len(leaderboard),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ 获取排行榜数据失败: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"获取排行榜数据失败: {str(e)}")

# ==================== 交易API（安全加固版本）====================

class TradeRequest(BaseModel):
    """交易请求数据模型"""
    eng_name: str = Field(..., min_length=1, max_length=SECURITY_LIMITS['MAX_STRING_LENGTH'], description="用户英文名")
    trade_type: str = Field(..., description="交易类型：buy或sell")
    crypto_symbol: str = Field(..., min_length=1, max_length=20, description="加密货币符号")
    quantity: float = Field(..., gt=0, le=SECURITY_LIMITS['MAX_QUANTITY'], description="交易数量")
    
    @field_validator('eng_name')
    @classmethod
    def validate_eng_name(cls, v):
        """验证用户名"""
        v = str(v).strip()
        # 防止SQL注入
        dangerous_chars = ["'", '"', ';', '--', '/*', '*/', 'DROP', 'DELETE', 'UPDATE', 'INSERT']
        v_upper = v.upper()
        for char in dangerous_chars:
            if char in v_upper:
                raise ValueError(f'用户名包含非法字符: {char}')
        return v
    
    @field_validator('trade_type')
    @classmethod
    def validate_trade_type(cls, v):
        """验证交易类型"""
        v = v.lower().strip()
        if v not in ['buy', 'sell']:
            raise ValueError('交易类型必须是buy或sell')
        return v
    
    @field_validator('crypto_symbol')
    @classmethod
    def validate_crypto_symbol(cls, v):
        """验证加密货币符号"""
        v = v.strip().upper()
        if v not in SUPPORTED_CRYPTOS:
            raise ValueError(f'不支持的加密货币符号: {v}')
        return v
    
    @field_validator('quantity')
    @classmethod
    def validate_quantity(cls, v):
        """验证交易数量"""
        if not isinstance(v, (int, float)):
            raise ValueError('交易数量必须是数字类型')
        if v != v:  # 检查NaN
            raise ValueError('交易数量不能是NaN')
        if v == float('inf') or v == float('-inf'):
            raise ValueError('交易数量不能是无穷大')
        if v <= 0:
            raise ValueError('交易数量必须大于0')
        return round(float(v), 8)

@app.post("/api/trade/execute")
@limiter.limit("60/minute")  # 每分钟最多60次交易请求
async def execute_trade(request: Request, trade_request: TradeRequest):
    """
    执行交易（买入或卖出）
    所有资产计算和验证都在服务器端完成，客户端只能发送交易请求
    """
    try:
        logger.info("=" * 80)
        logger.info("[TRADE] Received trade request")
        logger.info(f"[TRADE] User: {trade_request.eng_name}")
        logger.info(f"[TRADE] Type: {trade_request.trade_type}")
        logger.info(f"[TRADE] Symbol: {trade_request.crypto_symbol}")
        logger.info(f"[TRADE] Quantity: {trade_request.quantity}")
        logger.info(f"[TRADE] Client IP: {get_remote_address(request)}")
        
        # 确保数据库连接
        if not db_manager.connection or not db_manager.connection.open:
            try:
                db_manager.connect()
            except Exception as conn_error:
                logger.error(f"[TRADE ERROR] Database connection failed: {conn_error}")
                raise HTTPException(status_code=503, detail="数据库服务暂时不可用")
        
        # 1. 获取当前加密货币价格
        crypto_symbol = trade_request.crypto_symbol
        crypto_name = SUPPORTED_CRYPTOS[crypto_symbol]
        
        # 从最新价格数据中获取当前价格
        price_query = """
            SELECT price FROM cryptocurrency_prices
            WHERE symbol = %s
            ORDER BY created_at DESC
            LIMIT 1
        """
        with db_manager.connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(price_query, (crypto_symbol,))
            price_result = cursor.fetchone()
        
        if not price_result:
            logger.error(f"[TRADE ERROR] Price not found for {crypto_symbol}")
            raise HTTPException(status_code=400, detail=f"无法获取{crypto_symbol}的当前价格")
        
        current_price = float(price_result['price'])
        logger.info(f"[TRADE] Current price for {crypto_symbol}: ${current_price}")
        
        # 2. 获取用户当前资产状态
        user_query = """
            SELECT total_assets, available_cash, initialized
            FROM users
            WHERE eng_name = %s
        """
        with db_manager.connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(user_query, (trade_request.eng_name,))
            user_data = cursor.fetchone()
        
        # 如果用户不存在，创建新用户（初始资金100万）
        if not user_data:
            logger.info(f"[TRADE] User {trade_request.eng_name} not found, creating new user")
            initial_assets = 1000000.0
            create_user_query = """
                INSERT INTO users (eng_name, total_assets, available_cash, initialized)
                VALUES (%s, %s, %s, %s)
            """
            with db_manager.connection.cursor() as cursor:
                cursor.execute(create_user_query, (trade_request.eng_name, initial_assets, initial_assets, True))
                db_manager.connection.commit()
            
            available_cash = initial_assets
            total_assets = initial_assets
        else:
            available_cash = float(user_data['available_cash'])
            total_assets = float(user_data['total_assets'])
        
        logger.info(f"[TRADE] User assets - Total: ${total_assets}, Cash: ${available_cash}")
        
        # 3. 获取用户当前持仓
        portfolio_query = """
            SELECT crypto_symbol, quantity, avg_price
            FROM user_portfolios
            WHERE user_eng_name = %s AND crypto_symbol = %s
        """
        with db_manager.connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(portfolio_query, (trade_request.eng_name, crypto_symbol))
            holding = cursor.fetchone()
        
        # 4. 执行交易逻辑（服务器端计算）
        if trade_request.trade_type == 'buy':
            # 买入逻辑
            trade_cost = trade_request.quantity * current_price
            
            # 验证资金是否足够
            if trade_cost > available_cash:
                logger.warning(f"[TRADE] Insufficient funds - Required: ${trade_cost}, Available: ${available_cash}")
                raise HTTPException(status_code=400, detail=f"资金不足，需要${trade_cost:.2f}，可用${available_cash:.2f}")
            
            # 扣除资金
            new_available_cash = available_cash - trade_cost
            
            # 更新或创建持仓
            if holding:
                # 计算新的平均成本
                old_quantity = float(holding['quantity'])
                old_avg_price = float(holding['avg_price'])
                new_quantity = old_quantity + trade_request.quantity
                new_avg_price = (old_quantity * old_avg_price + trade_request.quantity * current_price) / new_quantity
                
                update_portfolio_query = """
                    UPDATE user_portfolios
                    SET quantity = %s, avg_price = %s, current_price = %s,
                        market_value = %s, profit_loss = %s, profit_rate = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE user_eng_name = %s AND crypto_symbol = %s
                """
                market_value = new_quantity * current_price
                profit_loss = market_value - (new_quantity * new_avg_price)
                profit_rate = (profit_loss / (new_quantity * new_avg_price)) * 100
                
                with db_manager.connection.cursor() as cursor:
                    cursor.execute(update_portfolio_query, (
                        new_quantity, new_avg_price, current_price,
                        market_value, profit_loss, profit_rate,
                        trade_request.eng_name, crypto_symbol
                    ))
                
                logger.info(f"[TRADE] Updated holding - Quantity: {new_quantity}, Avg Price: ${new_avg_price}")
            else:
                # 创建新持仓
                insert_portfolio_query = """
                    INSERT INTO user_portfolios (
                        user_eng_name, crypto_symbol, crypto_name, quantity, avg_price,
                        current_price, market_value, profit_loss, profit_rate
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                market_value = trade_request.quantity * current_price
                
                with db_manager.connection.cursor() as cursor:
                    cursor.execute(insert_portfolio_query, (
                        trade_request.eng_name, crypto_symbol, crypto_name,
                        trade_request.quantity, current_price, current_price,
                        market_value, 0.0, 0.0
                    ))
                
                logger.info(f"[TRADE] Created new holding - Quantity: {trade_request.quantity}, Price: ${current_price}")
            
            # 更新用户资产
            new_total_assets = new_available_cash + (total_assets - available_cash) + trade_cost
            
        elif trade_request.trade_type == 'sell':
            # 卖出逻辑
            if not holding:
                logger.warning(f"[TRADE] No holding found for {crypto_symbol}")
                raise HTTPException(status_code=400, detail=f"您没有持有{crypto_symbol}")
            
            current_quantity = float(holding['quantity'])
            
            # 验证持仓数量是否足够
            if trade_request.quantity > current_quantity:
                logger.warning(f"[TRADE] Insufficient quantity - Required: {trade_request.quantity}, Available: {current_quantity}")
                raise HTTPException(status_code=400, detail=f"持仓不足，需要{trade_request.quantity}，可用{current_quantity}")
            
            # 计算卖出收入
            trade_revenue = trade_request.quantity * current_price
            
            # 增加资金
            new_available_cash = available_cash + trade_revenue
            
            # 更新或删除持仓
            new_quantity = current_quantity - trade_request.quantity
            
            if new_quantity < 0.0001:  # 持仓清空
                delete_portfolio_query = """
                    DELETE FROM user_portfolios
                    WHERE user_eng_name = %s AND crypto_symbol = %s
                """
                with db_manager.connection.cursor() as cursor:
                    cursor.execute(delete_portfolio_query, (trade_request.eng_name, crypto_symbol))
                
                logger.info(f"[TRADE] Holding cleared for {crypto_symbol}")
            else:
                # 更新持仓
                avg_price = float(holding['avg_price'])
                update_portfolio_query = """
                    UPDATE user_portfolios
                    SET quantity = %s, current_price = %s,
                        market_value = %s, profit_loss = %s, profit_rate = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE user_eng_name = %s AND crypto_symbol = %s
                """
                market_value = new_quantity * current_price
                profit_loss = market_value - (new_quantity * avg_price)
                profit_rate = (profit_loss / (new_quantity * avg_price)) * 100
                
                with db_manager.connection.cursor() as cursor:
                    cursor.execute(update_portfolio_query, (
                        new_quantity, current_price,
                        market_value, profit_loss, profit_rate,
                        trade_request.eng_name, crypto_symbol
                    ))
                
                logger.info(f"[TRADE] Updated holding - Remaining quantity: {new_quantity}")
            
            # 更新用户资产
            new_total_assets = new_available_cash + (total_assets - available_cash) - trade_revenue
        
        # 5. 更新用户总资产和可用资金
        total_profit = new_total_assets - 1000000.0
        profit_rate = (total_profit / 1000000.0) * 100
        
        update_user_query = """
            UPDATE users
            SET total_assets = %s, available_cash = %s,
                total_profit = %s, profit_rate = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE eng_name = %s
        """
        with db_manager.connection.cursor() as cursor:
            cursor.execute(update_user_query, (
                new_total_assets, new_available_cash,
                total_profit, profit_rate,
                trade_request.eng_name
            ))
        
        # 6. 记录交易历史
        trade_history_query = """
            INSERT INTO user_trades (
                user_eng_name, trade_type, crypto_symbol, crypto_name,
                quantity, price, total_amount, mode
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        total_amount = trade_request.quantity * current_price
        with db_manager.connection.cursor() as cursor:
            cursor.execute(trade_history_query, (
                trade_request.eng_name, trade_request.trade_type,
                crypto_symbol, crypto_name,
                trade_request.quantity, current_price, total_amount, 'practice'
            ))
        
        # 提交所有更改
        db_manager.connection.commit()
        
        logger.info("[TRADE SUCCESS] Trade executed successfully")
        logger.info(f"[TRADE] New total assets: ${new_total_assets}")
        logger.info(f"[TRADE] New available cash: ${new_available_cash}")
        logger.info("=" * 80)
        
        # 返回交易结果
        return {
            'success': True,
            'message': f"{'买入' if trade_request.trade_type == 'buy' else '卖出'}成功",
            'trade_data': {
                'type': trade_request.trade_type,
                'symbol': crypto_symbol,
                'quantity': trade_request.quantity,
                'price': current_price,
                'total_amount': total_amount
            },
            'user_assets': {
                'total_assets': new_total_assets,
                'available_cash': new_available_cash,
                'total_profit': total_profit,
                'profit_rate': profit_rate
            },
            'timestamp': datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except ValidationError as ve:
        logger.error(f"[TRADE ERROR] Validation failed: {ve}")
        error_messages = '; '.join([f"{err['loc'][0]}: {err['msg']}" for err in ve.errors()])
        raise HTTPException(status_code=400, detail=f"交易数据验证失败: {error_messages}")
    except Exception as e:
        logger.error(f"[TRADE ERROR] Trade execution failed: {e}")
        import traceback
        logger.error(f"[TRADE ERROR] Traceback: {traceback.format_exc()}")
        if db_manager.connection:
            db_manager.connection.rollback()
        raise HTTPException(status_code=500, detail=f"交易执行失败: {str(e)}")

@app.post("/api/generate-test-users")
@limiter.limit("5/hour")  # 每小时最多5次生成测试用户（防止滥用）
async def generate_test_users(request: Request):
    """生成50个测试用户数据用于排行榜测试"""
    try:
        import random
        
        # 确保数据库连接存在
        if not db_manager.connection or not db_manager.connection.open:
            try:
                db_manager.connect()
            except Exception as conn_error:
                print(f"⚠️ 数据库连接失败: {conn_error}")
                raise HTTPException(
                    status_code=503, 
                    detail="数据库服务暂时不可用，请稍后再试"
                )
        
        # 测试用户名列表
        test_users = [
            ("testuser01", "张小明"), ("testuser02", "李小红"), ("testuser03", "王大力"),
            ("testuser04", "刘小明"), ("testuser05", "陈交易"), ("testuser06", "杨韭菜"),
            ("testuser07", "赵巨鲸"), ("testuser08", "周资本"), ("testuser09", "吴魔术"),
            ("testuser10", "郑观察"), ("testuser11", "孙潜力"), ("testuser12", "马快乐"),
            ("testuser13", "朱币王"), ("testuser14", "胡链神"), ("testuser15", "林趋势"),
            ("testuser16", "何波段"), ("testuser17", "高抄底"), ("testuser18", "梁追涨"),
            ("testuser19", "郭止损"), ("testuser20", "唐套利"), ("testuser21", "韩量化"),
            ("testuser22", "曹价值"), ("testuser23", "许技术"), ("testuser24", "邓基本"),
            ("testuser25", "冯分析"), ("testuser26", "曾研究"), ("testuser27", "彭投资"),
            ("testuser28", "吕理财"), ("testuser29", "苏财富"), ("testuser30", "卢资产"),
            ("testuser31", "蒋收益"), ("testuser32", "蔡盈利"), ("testuser33", "贾赚钱"),
            ("testuser34", "丁亏损"), ("testuser35", "魏回本"), ("testuser36", "薛翻倍"),
            ("testuser37", "叶暴富"), ("testuser38", "阎稳健"), ("testuser39", "余激进"),
            ("testuser40", "潘保守"), ("testuser41", "杜冒险"), ("testuser42", "戴谨慎"),
            ("testuser43", "夏大胆"), ("testuser44", "钟小心"), ("testuser45", "汪勇敢"),
            ("testuser46", "田胆小"), ("testuser47", "任聪明"), ("testuser48", "姜机智"),
            ("testuser49", "范睿智"), ("testuser50", "方天才")
        ]
        
        # 生成测试数据
        insert_query = """
        INSERT INTO users (
            eng_name, chn_name, dept_name, position_name,
            total_assets, available_cash, total_profit, profit_rate
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            total_assets = VALUES(total_assets),
            available_cash = VALUES(available_cash),
            total_profit = VALUES(total_profit),
            profit_rate = VALUES(profit_rate)
        """
        
        generated_users = []
        
        with db_manager.connection.cursor() as cursor:
            for eng_name, chn_name in test_users:
                # 生成随机资产数据（800,000 到 1,500,000之间）
                total_assets = random.uniform(800000, 1500000)
                available_cash = total_assets * random.uniform(0.2, 0.8)  # 20%-80%的现金
                total_profit = total_assets - 1000000  # 初始资金100万
                profit_rate = (total_profit / 1000000) * 100
                
                cursor.execute(insert_query, (
                    eng_name,
                    chn_name,
                    "测试部门",
                    "测试工程师",
                    total_assets,
                    available_cash,
                    total_profit,
                    profit_rate
                ))
                
                generated_users.append({
                    'eng_name': eng_name,
                    'chn_name': chn_name,
                    'total_assets': total_assets,
                    'profit_rate': profit_rate
                })
            
            db_manager.connection.commit()
        
        print(f"✅ 成功生成 {len(generated_users)} 个测试用户")
        
        return {
            'success': True,
            'message': f'成功生成 {len(generated_users)} 个测试用户',
            'users': generated_users[:10]  # 只返回前10个作为示例
        }
        
    except Exception as e:
        print(f"❌ 生成测试用户失败: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"生成测试用户失败: {str(e)}")

# ==================== 弹幕相关接口 ====================

@app.post("/api/danmaku/send")
async def send_danmaku(request: Request):
    """发送弹幕"""
    try:
        data = await request.json()
        user_eng_name = data.get('user_eng_name', 'guest')
        user_chn_name = data.get('user_chn_name', '游客')
        user_title = data.get('user_title', None)  # 用户称号
        user_emoji = data.get('user_emoji', None)  # 用户emoji图标
        content = data.get('content', '').strip()
        
        print(f"📥 收到弹幕发送请求:")
        print(f"  - 用户英文名: {user_eng_name}")
        print(f"  - 用户中文名: {user_chn_name}")
        print(f"  - 用户称号: {user_title}")
        print(f"  - 用户Emoji: {user_emoji}")
        print(f"  - 弹幕内容: {content}")
        
        # 验证内容
        if not content:
            raise HTTPException(status_code=400, detail="弹幕内容不能为空")
        
        if len(content) > 200:
            raise HTTPException(status_code=400, detail="弹幕内容不能超过200字")
        
        # 确保数据库连接
        if not db_manager.connection or not db_manager.connection.open:
            try:
                db_manager.connect()
            except Exception as conn_error:
                print(f"⚠️ 数据库连接失败: {conn_error}")
                raise HTTPException(status_code=503, detail="数据库服务暂时不可用")
        
        # 插入弹幕（包含称号和emoji）
        cursor = db_manager.connection.cursor()
        insert_query = """
            INSERT INTO user_danmaku (user_eng_name, user_chn_name, user_title, user_emoji, content)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (user_eng_name, user_chn_name, user_title, user_emoji, content))
        db_manager.connection.commit()
        cursor.close()
        
        print(f"✅ 弹幕保存成功!")
        print(f"  - 显示格式: {user_title} {user_emoji} {user_chn_name}: {content}")
        
        return {
            'success': True,
            'message': '弹幕发送成功'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 发送弹幕失败: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"发送弹幕失败: {str(e)}")

@app.get("/api/danmaku/list")
async def get_danmaku_list(limit: int = 50):
    """获取弹幕列表"""
    try:
        print(f"📥 收到弹幕列表获取请求，限制: {limit} 条")
        
        # 确保数据库连接
        if not db_manager.connection or not db_manager.connection.open:
            try:
                db_manager.connect()
            except Exception as conn_error:
                print(f"⚠️ 数据库连接失败: {conn_error}")
                return {
                    'success': True,
                    'danmaku_list': []
                }
        
        # 查询最近的弹幕（包含称号和emoji）
        cursor = db_manager.connection.cursor()
        query = """
            SELECT user_eng_name, user_chn_name, user_title, user_emoji, content, created_at
            FROM user_danmaku
            ORDER BY created_at DESC
            LIMIT %s
        """
        cursor.execute(query, (limit,))
        results = cursor.fetchall()
        cursor.close()
        
        danmaku_list = []
        for row in results:
            danmaku_list.append({
                'user_eng_name': row[0],
                'user_chn_name': row[1],
                'user_title': row[2],  # 称号
                'user_emoji': row[3],  # emoji图标
                'content': row[4],
                'created_at': row[5].strftime('%Y-%m-%d %H:%M:%S') if row[5] else ''
            })
        
        print(f"✅ 成功获取 {len(danmaku_list)} 条弹幕")
        if len(danmaku_list) > 0:
            print(f"📊 最新弹幕示例:")
            for i, dm in enumerate(danmaku_list[:3]):
                print(f"  {i+1}. {dm['user_title']} {dm['user_emoji']} {dm['user_eng_name']}: {dm['content'][:20]}...")
        
        return {
            'success': True,
            'danmaku_list': danmaku_list
        }
        
    except Exception as e:
        print(f"❌ 获取弹幕列表失败: {e}")
        import traceback
        traceback.print_exc()
        return {
            'success': True,
            'danmaku_list': []
        }

# 挂载静态文件（必须在最后）
app.mount("/static", StaticFiles(directory="static", html=True), name="static")

@app.get("/")
async def root():
    """根路径重定向到静态页面"""
    return FileResponse("static/index.html")