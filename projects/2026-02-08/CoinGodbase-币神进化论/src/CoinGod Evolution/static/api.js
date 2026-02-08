// API配置
export const API_CONFIG = {
    CRYPTOCOMPARE: {
        baseURL: 'https://min-api.cryptocompare.com/data/pricemultifull',
        symbols: ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'AVAX', 'LINK', 'UNI', 'ATOM'],
        timeout: 10000,
        enabled: true
    },
    BACKEND: {
        baseURL: '/api',
        enabled: true
    }
};

// 演示模式专用的加密货币数据（仅BTC和ETH）
export const tutorialCryptos = [
    { 
        id: 'bitcoin', 
        symbol: 'BTC', 
        name: 'Bitcoin', 
        price: 92242.34, 
        change: 0.88, 
        volume: '85B', 
        marketCap: '1.8T',
        icon: '₿',
        high24h: 93156.78,
        low24h: 90567.23,
        supply: '19.5M',
        sparkline: [90500, 91200, 90800, 91500, 92200, 91800, 92242.34]
    },
    { 
        id: 'ethereum', 
        symbol: 'ETH', 
        name: 'Ethereum', 
        price: 3035.28, 
        change: -1.41, 
        volume: '8.2B', 
        marketCap: '365B',
        icon: 'Ξ',
        high24h: 3089.45,
        low24h: 2987.12,
        supply: '120.2M',
        sparkline: [2980, 3020, 2990, 3050, 3070, 3035.28]
    }
];

// 实战模式专用的加密货币数据（完整的币种列表）
export const practiceCryptos = [
    { 
        id: 'bitcoin', 
        symbol: 'BTC', 
        name: 'Bitcoin', 
        price: 92242.34, 
        change: 0.88, 
        volume: '85B', 
        marketCap: '1.8T',
        icon: '₿',
        high24h: 93156.78,
        low24h: 90567.23,
        supply: '19.5M',
        sparkline: [90500, 91200, 90800, 91500, 92200, 91800, 92242.34]
    },
    { 
        id: 'ethereum', 
        symbol: 'ETH', 
        name: 'Ethereum', 
        price: 3035.28, 
        change: -1.41, 
        volume: '8.2B', 
        marketCap: '365B',
        icon: 'Ξ',
        high24h: 3089.45,
        low24h: 2987.12,
        supply: '120.2M',
        sparkline: [2980, 3020, 2990, 3050, 3070, 3035.28]
    },
    { 
        id: 'solana', 
        symbol: 'SOL', 
        name: 'Solana', 
        price: 143.57, 
        change: 2.46, 
        volume: '2.1B', 
        marketCap: '65.4B',
        icon: '◎',
        high24h: 147.89,
        low24h: 139.23,
        supply: '440.3M',
        sparkline: [139, 141, 143, 142, 145, 143.57]
    },
    { 
        id: 'cardano', 
        symbol: 'ADA', 
        name: 'Cardano', 
        price: 0.468, 
        change: 0.49, 
        volume: '1.8B', 
        marketCap: '16.5B',
        icon: '₳',
        high24h: 0.475,
        low24h: 0.462,
        supply: '35.5B',
        sparkline: [0.462, 0.465, 0.468, 0.471, 0.469, 0.468]
    },
    { 
        id: 'polkadot', 
        symbol: 'DOT', 
        name: 'Polkadot', 
        price: 2.748, 
        change: 1.72, 
        volume: '890M', 
        marketCap: '3.8B',
        icon: '●',
        high24h: 2.789,
        low24h: 2.698,
        supply: '1.26B',
        sparkline: [2.70, 2.72, 2.74, 2.73, 2.75, 2.748]
    },
    { 
        id: 'avalanche', 
        symbol: 'AVAX', 
        name: 'Avalanche', 
        price: 14.35, 
        change: -0.11, 
        volume: '1.2B', 
        marketCap: '5.6B',
        icon: '▲',
        high24h: 14.56,
        low24h: 14.12,
        supply: '375M',
        sparkline: [14.12, 14.23, 14.34, 14.28, 14.35]
    },
    { 
        id: 'chainlink', 
        symbol: 'LINK', 
        name: 'Chainlink', 
        price: 18.92, 
        change: 3.21, 
        volume: '780M', 
        marketCap: '11.2B',
        icon: '⬢',
        high24h: 19.45,
        low24h: 18.23,
        supply: '567M',
        sparkline: [18.23, 18.45, 18.67, 18.89, 18.92]
    },
    { 
        id: 'uniswap', 
        symbol: 'UNI', 
        name: 'Uniswap', 
        price: 12.67, 
        change: -0.89, 
        volume: '450M', 
        marketCap: '9.8B',
        icon: '🦄',
        high24h: 12.89,
        low24h: 12.34,
        supply: '753M',
        sparkline: [12.34, 12.45, 12.56, 12.67]
    },
    { 
        id: 'cosmos', 
        symbol: 'ATOM', 
        name: 'Cosmos', 
        price: 7.89, 
        change: 1.56, 
        volume: '560M', 
        marketCap: '3.2B',
        icon: '⚛',
        high24h: 7.98,
        low24h: 7.76,
        supply: '392M',
        sparkline: [7.76, 7.78, 7.82, 7.85, 7.89]
    }
];

// 获取用户信息（已移除登录环节，直接使用Guest用户）
export async function fetchUserInfo() {
    // 不再调用登录API，直接返回Guest用户
    return {
        success: true,
        engName: 'Guest'
    };
}

// 从后端API获取实时价格数据
export async function fetchCryptoCompareData() {
    try {
        console.log('🔄 开始获取价格数据...');
        
        const response = await fetch('/api/crypto/prices');
        console.log('📡 API响应状态:', response.status);
        
        if (!response.ok) {
            console.error(`❌ HTTP错误: ${response.status} ${response.statusText}`);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📊 API响应数据:', result);
        console.log('📊 数据来源:', result.source || 'unknown');
        console.log('📊 数据数量:', result.data_count || result.data?.length || 0);
        
        if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
            const formattedData = result.data.map(item => ({
                id: item.symbol.toLowerCase(),
                symbol: item.symbol,
                name: item.name,
                price: item.price,
                change: item.price_change_24h,
                volume: formatVolume(item.volume_24h),
                marketCap: formatVolume(item.market_cap),
                icon: getCryptoIcon(item.symbol)
            }));
            
            console.log(`✅ 成功获取 ${formattedData.length} 个币种的价格数据`);
            console.log('💰 数据来源:', result.source);
            console.log('💰 价格数据示例:', formattedData.slice(0, 2));
            
            // 根据数据来源显示不同的提示
            if (result.source === 'database_cache') {
                console.log('⚠️ 使用数据库缓存数据');
            } else if (result.source === 'dynamic_default') {
                console.log('⚠️ 使用动态默认数据');
            } else if (result.source === 'static_fallback') {
                console.log('⚠️ 使用静态备用数据');
            } else if (result.source === 'api') {
                console.log('✅ 使用实时API数据');
            }
            
            return formattedData;
        } else {
            console.warn('⚠️ API响应格式异常或数据为空:', result);
            console.warn('⚠️ success:', result.success);
            console.warn('⚠️ data存在:', !!result.data);
            console.warn('⚠️ data是数组:', Array.isArray(result.data));
            console.warn('⚠️ data长度:', result.data?.length);
            return null;
        }
        
    } catch (error) {
        console.error('❌ 获取价格数据失败:', error);
        console.error('📍 错误详情:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        // 网络失败时使用本地备用数据
        console.log('⚠️ 网络请求失败，使用本地备用数据');
        const fallbackData = [
            {
                id: 'btc',
                symbol: 'BTC',
                name: 'Bitcoin',
                price: 92242.34,
                change: 0.88,
                volume: '85.0B',
                marketCap: '1.8T',
                icon: '₿'
            },
            {
                id: 'eth',
                symbol: 'ETH',
                name: 'Ethereum',
                price: 3035.28,
                change: -1.41,
                volume: '8.2B',
                marketCap: '365B',
                icon: 'Ξ'
            },
            {
                id: 'sol',
                symbol: 'SOL',
                name: 'Solana',
                price: 143.57,
                change: 2.46,
                volume: '2.1B',
                marketCap: '65.4B',
                icon: '◎'
            },
            {
                id: 'ada',
                symbol: 'ADA',
                name: 'Cardano',
                price: 0.468,
                change: 0.49,
                volume: '1.8B',
                marketCap: '16.5B',
                icon: '₳'
            },
            {
                id: 'dot',
                symbol: 'DOT',
                name: 'Polkadot',
                price: 2.748,
                change: 1.72,
                volume: '890M',
                marketCap: '3.8B',
                icon: '●'
            },
            {
                id: 'avax',
                symbol: 'AVAX',
                name: 'Avalanche',
                price: 14.35,
                change: -0.11,
                volume: '1.2B',
                marketCap: '5.6B',
                icon: '🔺'
            },
            {
                id: 'link',
                symbol: 'LINK',
                name: 'Chainlink',
                price: 18.92,
                change: 3.21,
                volume: '780M',
                marketCap: '11.2B',
                icon: '🔗'
            },
            {
                id: 'uni',
                symbol: 'UNI',
                name: 'Uniswap',
                price: 12.67,
                change: -0.89,
                volume: '450M',
                marketCap: '9.8B',
                icon: '🦄'
            },
            {
                id: 'atom',
                symbol: 'ATOM',
                name: 'Cosmos',
                price: 7.89,
                change: 1.56,
                volume: '560M',
                marketCap: '3.2B',
                icon: '⚛️'
            }
        ];
        
        console.log(`✅ 返回本地备用数据，共 ${fallbackData.length} 个币种`);
        return fallbackData;
    }
}

// 从后端API获取历史K线数据
export async function fetchKlineData(symbol, hours = 24) {
    try {
        console.log(`🔄 开始获取 ${symbol} 的K线数据，时间范围: ${hours}小时`);
        
        const response = await fetch(`/api/crypto/history/${symbol}?hours=${hours}`);
        console.log(`📡 K线API响应状态: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📊 K线API响应数据:', result);
        
        if (result.success && result.data) {
            console.log(`✅ 成功获取 ${result.data.length} 条K线数据`);
            
            // 如果数据量太少，打印详细信息
            if (result.data.length < 5) {
                console.log('📈 K线数据详情:', result.data);
            } else {
                console.log('📈 K线数据示例:', result.data.slice(0, 2));
            }
            
            return result.data;
        } else {
            console.warn('⚠️ K线API响应格式异常:', result);
            return [];
        }
        
    } catch (error) {
        console.error('❌ 获取K线数据失败:', error);
        console.error('📍 错误详情:', {
            symbol,
            hours,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        // API失败时返回空数组
        console.log('⚠️ K线数据源异常，返回空数组');
        return [];
    }
}

// 格式化交易量
function formatVolume(volume) {
    if (volume >= 1e12) {
        return (volume / 1e12).toFixed(2) + 'T';
    } else if (volume >= 1e9) {
        return (volume / 1e9).toFixed(2) + 'B';
    } else if (volume >= 1e6) {
        return (volume / 1e6).toFixed(2) + 'M';
    } else if (volume >= 1e3) {
        return (volume / 1e3).toFixed(2) + 'K';
    }
    return volume.toFixed(2);
}

// 获取加密货币图标
function getCryptoIcon(symbol) {
    const icons = {
        'BTC': '₿',
        'ETH': 'Ξ',
        'SOL': '◎',
        'ADA': '₳',
        'DOT': '●',
        'AVAX': '▲',
        'LINK': '⬢',
        'UNI': '🦄',
        'ATOM': '⚛'
    };
    return icons[symbol] || '●';
}