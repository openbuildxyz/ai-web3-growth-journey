// 价格走势图表管理（使用Chart.js）
let priceChart = null;
let currentSymbol = 'BTC';
let currentTimeframe = 6;

// 价格格式化函数
function formatPrice(price) {
    if (price >= 1000) {
        // 大于1000: 显示2位小数
        return price.toLocaleString('zh-CN', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    } else if (price >= 1) {
        // 1-1000: 显示2-4位小数
        return price.toLocaleString('zh-CN', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 4 
        });
    } else {
        // 小于1: 显示2-8位小数
        return price.toLocaleString('zh-CN', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 8 
        });
    }
}

// 初始化价格走势图
export function initPriceChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('图表容器不存在');
        return null;
    }
    
    // 如果已存在实例，先销毁
    if (priceChart) {
        priceChart.destroy();
    }
    
    const ctx = container.getContext('2d');
    
    // 创建Chart.js实例
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '价格 (USD)',
                data: [],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: 'rgb(59, 130, 246)',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#333',
                    borderWidth: 0,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            return '价格: $' + formatPrice(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#8c8c8c',
                        font: {
                            size: 11
                        },
                        maxTicksLimit: 12,
                        autoSkip: true
                    }
                },
                y: {
                    display: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#8c8c8c',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return '$' + formatPrice(value);
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
    
    console.log('✅ 价格走势图初始化成功');
    return priceChart;
}

// 加载价格走势图数据
export async function loadPriceChart(symbol = 'BTC', hours = 24) {
    try {
        console.log(`🔄 开始加载 ${symbol} 的价格图表，时间范围: ${hours}小时`);
        currentSymbol = symbol;
        currentTimeframe = hours;
        
        // 显示加载状态
        showChartLoading();
        
        // 导入API函数
        const { fetchKlineData } = await import('./api.js');
        
        // 请求历史数据
        const data = await fetchKlineData(symbol, hours);
        
        if (!data || data.length === 0) {
            console.warn('⚠️ 没有历史数据，显示空图表');
            hideChartLoading();
            showNoDataMessage();
            return;
        }
        
        // 渲染图表
        renderPriceChart(data, symbol, hours);
        hideChartLoading();
        
        console.log(`✅ 图表加载成功，显示 ${data.length} 个数据点`);
        
    } catch (error) {
        console.error('❌ 加载图表数据失败:', error);
        console.error('📍 错误详情:', {
            symbol,
            hours,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        hideChartLoading();
        
        // 显示错误信息，但不阻止页面正常运行
        showErrorMessage(`图表加载失败: ${error.message}`);
        
        // 尝试显示一个空的但可用的图表
        try {
            if (priceChart) {
                priceChart.data.labels = [];
                priceChart.data.datasets[0].data = [];
                priceChart.update();
                console.log('📊 显示空图表以避免页面崩溃');
            }
        } catch (chartError) {
            console.error('❌ 连空图表都无法显示:', chartError);
        }
    }
}

// 渲染价格走势图
function renderPriceChart(data, symbol, hours) {
    if (!priceChart) {
        console.error('图表实例不存在');
        return;
    }
    
    // 提取时间标签
    const labels = data.map(item => {
        const date = new Date(item.created_at);
        if (hours <= 1) {
            // 1小时：显示时:分
            return date.toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else if (hours <= 24) {
            // 24小时：显示时:分
            return date.toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else {
            // 更长时间：显示月/日 时:分
            return date.toLocaleString('zh-CN', { 
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    });
    
    // 提取价格数据
    const prices = data.map(item => item.price);
    
    // 计算价格范围
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    // 更新图表数据
    priceChart.data.labels = labels;
    priceChart.data.datasets[0].data = prices;
    priceChart.data.datasets[0].label = `${symbol} 价格 (USD)`;
    
    // 根据价格波动调整Y轴范围
    priceChart.options.scales.y.min = minPrice - priceRange * 0.1;
    priceChart.options.scales.y.max = maxPrice + priceRange * 0.1;
    
    // 根据时间范围调整X轴标签数量
    if (hours <= 1) {
        priceChart.options.scales.x.ticks.maxTicksLimit = 12; // 每5分钟
    } else if (hours <= 6) {
        priceChart.options.scales.x.ticks.maxTicksLimit = 12; // 每30分钟
    } else if (hours <= 24) {
        priceChart.options.scales.x.ticks.maxTicksLimit = 24; // 每小时
    } else {
        priceChart.options.scales.x.ticks.maxTicksLimit = 20;
    }
    
    // 更新图表
    priceChart.update('none'); // 'none'表示不使用动画，提高性能
    
    // 更新图表标题信息
    updateChartInfo(data, symbol);
}

// 更新图表信息显示
function updateChartInfo(data, symbol) {
    if (data.length === 0) return;
    
    const latestData = data[data.length - 1];
    const firstData = data[0];
    
    // 计算价格变化
    const priceChange = latestData.price - firstData.price;
    const priceChangePercent = (priceChange / firstData.price) * 100;
    
    // 更新当前价格
    const currentPriceEl = document.getElementById('currentPrice');
    if (currentPriceEl) {
        currentPriceEl.textContent = '$' + formatPrice(latestData.price);
    }
    
    // 更新价格变化
    const priceChangeEl = document.getElementById('priceChange');
    if (priceChangeEl) {
        const isPositive = priceChange >= 0;
        priceChangeEl.className = `text-sm px-2 py-1 rounded ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`;
        priceChangeEl.innerHTML = `
            <i class="fas fa-arrow-${isPositive ? 'up' : 'down'} mr-1"></i>
            ${isPositive ? '+' : ''}${priceChangePercent.toFixed(2)}%
        `;
    }
    
    // 更新币种名称
    const cryptoNameEl = document.getElementById('selectedCryptoName');
    if (cryptoNameEl) {
        cryptoNameEl.textContent = latestData.name;
    }
    
    const cryptoSymbolEl = document.getElementById('selectedCryptoSymbol');
    if (cryptoSymbolEl) {
        cryptoSymbolEl.textContent = symbol;
    }
}

// 显示加载状态
function showChartLoading() {
    const container = document.getElementById('klineChart');
    if (container && container.parentElement) {
        const loadingEl = document.createElement('div');
        loadingEl.id = 'chartLoading';
        loadingEl.className = 'absolute inset-0 flex items-center justify-center bg-white/80 z-10';
        loadingEl.innerHTML = `
            <div class="text-center">
                <div class="loading-spinner mb-2"></div>
                <div class="text-sm text-gray-500">加载中...</div>
            </div>
        `;
        container.parentElement.style.position = 'relative';
        container.parentElement.appendChild(loadingEl);
    }
}

// 隐藏加载状态
function hideChartLoading() {
    const loadingEl = document.getElementById('chartLoading');
    if (loadingEl) {
        loadingEl.remove();
    }
}

// 显示无数据消息
function showNoDataMessage() {
    const container = document.getElementById('klineChart');
    if (container && priceChart) {
        priceChart.data.labels = [];
        priceChart.data.datasets[0].data = [];
        priceChart.update();
    }
}

// 显示错误消息
function showErrorMessage(message) {
    console.error(message);
}

// 切换时间范围
export function changeTimeframe(hours) {
    loadPriceChart(currentSymbol, hours);
}

// 切换币种
export function changeCrypto(symbol) {
    loadPriceChart(symbol, currentTimeframe);
}

// 销毁图表
export function disposeChart() {
    if (priceChart) {
        priceChart.destroy();
        priceChart = null;
    }
}

// 获取图表实例
export function getChartInstance() {
    return priceChart;
}

// 响应式调整
window.addEventListener('resize', () => {
    if (priceChart) {
        priceChart.resize();
    }
});