// UI组件渲染函数

/**
 * 加密用户名：保留前后一个字符，中间用***代替
 * @param {string} userName - 原始用户名
 * @returns {string} 加密后的用户名
 */
function maskUserName(userName) {
    if (!userName || userName.length <= 2) {
        return userName;
    }
    const firstChar = userName.charAt(0);
    const lastChar = userName.charAt(userName.length - 1);
    return `${firstChar}***${lastChar}`;
}

// 渲染加密货币列表项
export function renderCryptoItem(crypto, isSelected = false) {
    const changeClass = crypto.change >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
    const changeIcon = crypto.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
    
    return `
        <div class="crypto-item p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}" 
             data-crypto-id="${crypto.id}">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                    <span class="text-2xl">${crypto.icon}</span>
                    <div>
                        <div class="font-bold text-gray-900">${crypto.symbol}</div>
                        <div class="text-xs text-gray-500">${crypto.name}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-bold text-gray-900">$${crypto.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div class="text-xs ${changeClass} px-2 py-0.5 rounded">
                        <i class="fas ${changeIcon} mr-1"></i>${Math.abs(crypto.change).toFixed(2)}%
                    </div>
                </div>
            </div>
            <div class="flex items-center justify-between text-xs text-gray-500">
                <span>成交量: ${crypto.volume}</span>
                <span>市值: ${crypto.marketCap}</span>
            </div>
        </div>
    `;
}

// 渲染加密货币列表
export function renderCryptoList(cryptos, selectedId) {
    const container = document.getElementById('cryptoList');
    if (!container) return;
    
    container.innerHTML = cryptos.map(crypto => 
        renderCryptoItem(crypto, crypto.id === selectedId)
    ).join('');
}

// 渲染持仓列表项
export function renderPortfolioItem(holding, currentPrice) {
    const costBasis = holding.averagePrice * holding.amount;
    const currentValue = currentPrice * holding.amount;
    const profit = currentValue - costBasis;
    const profitPercent = (profit / costBasis) * 100;
    
    const profitClass = profit >= 0 ? 'text-green-600' : 'text-red-600';
    const profitIcon = profit >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
    
    return `
        <div class="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <span class="text-2xl">${holding.icon}</span>
                    <div>
                        <div class="font-bold text-gray-900">${holding.symbol}</div>
                        <div class="text-xs text-gray-500">${holding.name}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm text-gray-600">持仓数量</div>
                    <div class="font-bold text-gray-900">${holding.amount.toFixed(4)}</div>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <div class="text-gray-500">成本价</div>
                    <div class="font-semibold text-gray-900">$${holding.averagePrice.toFixed(2)}</div>
                </div>
                <div>
                    <div class="text-gray-500">当前价</div>
                    <div class="font-semibold text-gray-900">$${currentPrice.toFixed(2)}</div>
                </div>
                <div>
                    <div class="text-gray-500">持仓成本</div>
                    <div class="font-semibold text-gray-900">$${costBasis.toFixed(2)}</div>
                </div>
                <div>
                    <div class="text-gray-500">当前市值</div>
                    <div class="font-semibold text-gray-900">$${currentValue.toFixed(2)}</div>
                </div>
            </div>
            
            <div class="mt-3 pt-3 border-t border-gray-200">
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">盈亏</span>
                    <div class="text-right">
                        <div class="font-bold ${profitClass}">
                            <i class="fas ${profitIcon} mr-1"></i>$${Math.abs(profit).toFixed(2)}
                        </div>
                        <div class="text-xs ${profitClass}">${profitPercent >= 0 ? '+' : ''}${profitPercent.toFixed(2)}%</div>
                    </div>
                </div>
            </div>
            
            <div class="mt-4 pt-3 border-t border-gray-100">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <div class="w-2 h-2 rounded-full ${profit >= 0 ? 'bg-green-500' : 'bg-red-500'} animate-pulse"></div>
                        <span class="text-xs text-gray-500">持仓状态</span>
                    </div>
                    <button class="sell-button group px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-1.5"
                            data-crypto-id="${holding.cryptoId}"
                            data-symbol="${holding.symbol}"
                            data-amount="${holding.amount}"
                            data-current-price="${currentPrice}">
                        <i class="fas fa-arrow-trend-down text-xs opacity-80 group-hover:opacity-100 transition-opacity"></i>
                        <span>快速卖出</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 渲染持仓列表
export function renderPortfolioList(portfolio, cryptos) {
    const container = document.getElementById('portfolioList');
    if (!container) return;
    
    // 防御性检查：确保 portfolio 是有效的数组
    if (!portfolio || !Array.isArray(portfolio)) {
        console.warn('⚠️ renderPortfolioList: portfolio 参数无效，使用空数组');
        portfolio = [];
    }
    
    // 防御性检查：确保 cryptos 是有效的数组
    if (!cryptos || !Array.isArray(cryptos)) {
        console.error('❌ renderPortfolioList: cryptos 参数无效，无法渲染持仓列表');
        container.innerHTML = `
            <div class="text-center py-8 text-red-400">
                <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
                <div>价格数据加载中...</div>
                <div class="text-xs mt-2">请稍候片刻</div>
            </div>
        `;
        return;
    }
    
    if (portfolio.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <i class="fas fa-inbox text-4xl mb-2"></i>
                <div>暂无持仓</div>
            </div>
        `;
        return;
    }
    
    // 统计匹配失败的持仓
    let unmatchedCount = 0;
    const unmatchedIds = [];
    
    const portfolioHTML = portfolio.map(holding => {
        const crypto = cryptos.find(c => c.id === holding.cryptoId);
        if (!crypto) {
            unmatchedCount++;
            unmatchedIds.push(holding.cryptoId);
            console.error(`❌ 持仓渲染失败: 找不到币种 ${holding.cryptoId}`, {
                holding: holding,
                availableCryptos: cryptos.map(c => c.id)
            });
            // 返回一个错误提示项，而不是空字符串
            return `
                <div class="p-3 bg-red-50 border border-red-200 rounded-lg mb-2">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="font-semibold text-red-600">
                                <i class="fas fa-exclamation-circle mr-1"></i>
                                ${holding.cryptoId || '未知币种'}
                            </div>
                            <div class="text-xs text-red-500 mt-1">
                                价格数据加载失败，持仓数量: ${holding.amount}
                            </div>
                        </div>
                        <div class="text-xs text-red-400">
                            等待数据更新...
                        </div>
                    </div>
                </div>
            `;
        }
        return renderPortfolioItem(holding, crypto.price);
    }).join('');
    
    container.innerHTML = portfolioHTML;
    
    // 如果有匹配失败的持仓，输出警告
    if (unmatchedCount > 0) {
        console.warn(`⚠️ 持仓列表渲染完成，但有 ${unmatchedCount} 个持仓无法匹配价格数据:`, unmatchedIds);
        console.warn('📊 当前可用的币种列表:', cryptos.map(c => ({ id: c.id, symbol: c.symbol })));
    }
}

// 渲染AI Agent卡片
export function renderAgentCard(agent) {
    const profitClass = agent.profit >= 0 ? 'text-green-600' : 'text-red-600';
    const profitIcon = agent.profit >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
    
    const statusConfig = {
        'thinking': { icon: 'fa-brain', color: 'text-blue-500', bg: 'bg-blue-50', text: '思考中' },
        'trading': { icon: 'fa-exchange-alt', color: 'text-green-500', bg: 'bg-green-50', text: '交易中' },
        'waiting': { icon: 'fa-clock', color: 'text-gray-500', bg: 'bg-gray-50', text: '等待中' }
    };
    
    const status = statusConfig[agent.status] || statusConfig['waiting'];
    const isUltimate = agent.isUltimate || false;
    
    // Agent图标和颜色
    const agentIcon = agent.icon || '🤖';
    const agentColor = agent.color || 'from-blue-400 to-blue-600';
    
    return `
        <div class="agent-card p-4 rounded-lg border ${isUltimate ? 'border-yellow-400/50 shadow-lg shadow-purple-500/20' : 'border-gray-200'} bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all cursor-pointer group">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br ${agentColor} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-md">
                        ${agentIcon}
                    </div>
                    <div>
                        <div class="font-bold text-gray-900 flex items-center gap-2">
                            ${agent.name}
                            ${isUltimate ? '<span class="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-0.5 rounded-full">终极</span>' : ''}
                        </div>
                        <div class="text-xs text-gray-500">${agent.codeName || 'AI Agent'}</div>
                    </div>
                </div>
                <div class="${status.bg} ${status.color} px-2 py-1 rounded text-xs">
                    <i class="fas ${status.icon} mr-1"></i>${status.text}
                </div>
            </div>
            
            <div class="mb-3">
                <div class="text-xs text-gray-400 mb-1">策略</div>
                <div class="text-sm font-medium text-gray-700">${agent.strategy}</div>
            </div>
            
            <div class="grid grid-cols-2 gap-2 text-sm mb-3">
                <div class="bg-gray-50 p-2 rounded">
                    <div class="text-gray-400 text-xs">总资产</div>
                    <div class="font-semibold text-gray-900">$${agent.assets.toLocaleString('en-US', {minimumFractionDigits: 0})}</div>
                </div>
                <div class="bg-gray-50 p-2 rounded">
                    <div class="text-gray-400 text-xs">收益率</div>
                    <div class="font-semibold ${profitClass}">
                        <i class="fas ${profitIcon} mr-1"></i>${Math.abs(agent.profit / 10000).toFixed(2)}%
                    </div>
                </div>
            </div>
            
            ${agent.weakness ? `
                <div class="mb-2">
                    <div class="text-xs text-red-400 mb-1"><i class="fas fa-exclamation-triangle mr-1"></i>缺陷</div>
                    <div class="text-xs text-gray-600">${agent.weakness}</div>
                </div>
            ` : ''}
            
            ${agent.evolution ? `
                <div class="mb-2">
                    <div class="text-xs text-purple-500 mb-1"><i class="fas fa-dna mr-1"></i>进化方向</div>
                    <div class="text-xs text-gray-600">${agent.evolution}</div>
                </div>
            ` : ''}
            
            ${agent.evolutionName ? `
                <div class="mt-2 pt-2 border-t border-gray-100 text-center">
                    <span class="text-xs text-gray-400 italic">→ ${agent.evolutionName}</span>
                </div>
            ` : ''}
            
            ${agent.thought ? `
                <div class="text-xs text-gray-500 italic bg-blue-50 p-2 rounded mt-2">
                    <i class="fas fa-comment-dots mr-1 text-blue-400"></i>${agent.thought}
                </div>
            ` : ''}
        </div>
    `;
}

// 渲染AI Agent列表
export function renderAgentList(agents) {
    const container = document.getElementById('agentList');
    if (!container) return;
    
    container.innerHTML = agents.map(agent => renderAgentCard(agent)).join('');
}

// 渲染排行榜项
export function renderLeaderboardItem(player, rank, isCurrentUser = false) {
    const medalMap = {
        1: '🥇',
        2: '🥈',
        3: '🥉'
    };
    
    const medal = medalMap[rank] || `#${rank}`;
    const profitClass = player.profit >= 0 ? 'text-green-600' : 'text-red-600';
    const profitIcon = player.profit >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
    
    return `
        <div class="p-3 rounded-lg border ${isCurrentUser ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2 min-w-0 flex-1">
                    <span class="text-lg font-bold ${rank <= 3 ? 'text-xl' : 'text-gray-500'} flex-shrink-0">
                        ${medal}
                    </span>
                    <div class="flex items-center space-x-2 min-w-0 flex-1">
                        ${player.avatar ? `<img src="${player.avatar}" class="w-6 h-6 rounded-full flex-shrink-0" alt="${player.name}">` : '<i class="fas fa-user-circle text-lg text-gray-400 flex-shrink-0"></i>'}
                        <div class="min-w-0 flex-1">
                            <div class="font-medium text-gray-900 text-sm truncate">
                                ${player.name}
                            </div>
                            <div class="text-xs text-gray-500 truncate">
                                ${player.type === 'ai' ? '🤖 AI' : '👤 玩家'}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="text-right flex-shrink-0 ml-2">
                    <div class="font-semibold text-gray-900 text-sm">
                        $${player.assets.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                    </div>
                    <div class="text-xs ${profitClass}">
                        <i class="fas ${profitIcon} mr-1"></i>${Math.abs(player.profit).toFixed(1)}%
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 渲染排行榜
export function renderLeaderboard(players, currentUserId) {
    const container = document.getElementById('leaderboard');
    if (!container) return;
    
    // 按资产排序
    const sortedPlayers = [...players].sort((a, b) => b.assets - a.assets);
    
    container.innerHTML = sortedPlayers.map((player, index) => 
        renderLeaderboardItem(player, index + 1, player.id === currentUserId)
    ).join('');
}

// 显示消息提示
export function showMessage(message, type = 'info', duration = 3000) {
    const container = document.getElementById('messageContainer');
    if (!container) return;
    
    const iconMap = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    
    const colorMap = {
        'success': 'bg-green-500',
        'error': 'bg-red-500',
        'warning': 'bg-yellow-500',
        'info': 'bg-blue-500'
    };
    
    const messageId = `msg-${Date.now()}`;
    const messageEl = document.createElement('div');
    messageEl.id = messageId;
    // 添加message-item类名，以便移动端CSS可以应用特殊样式
    messageEl.className = `message-item ${colorMap[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-left`;
    messageEl.innerHTML = `
        <i class="fas ${iconMap[type]}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(messageEl);
    
    // 自动移除
    setTimeout(() => {
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateX(100%)';
        setTimeout(() => {
            messageEl.remove();
        }, 300);
    }, duration);
}

// 更新用户资产显示
export function updateUserAssets(totalAssets, todayProfitRate) {
    // 参数检查：如果没有传递参数，从全局状态获取
    if (totalAssets === undefined || todayProfitRate === undefined) {
        // 从全局状态获取数据
        if (window.appState && window.appState.currentUser) {
            totalAssets = window.appState.currentUser.totalAssets;
            const initialAssets = 1000000;
            todayProfitRate = ((totalAssets - initialAssets) / initialAssets) * 100;
        } else {
            // 如果全局状态也不存在，使用默认值
            totalAssets = 1000000;
            todayProfitRate = 0;
        }
    }
    
    // 最终防御性检查：确保参数不是 undefined 或 null
    if (totalAssets === undefined || totalAssets === null) {
        totalAssets = 1000000;
    }
    if (todayProfitRate === undefined || todayProfitRate === null) {
        todayProfitRate = 0;
    }
    
    const totalAssetsEl = document.getElementById('totalAssets');
    const todayProfitEl = document.getElementById('todayProfit');
    
    if (totalAssetsEl) {
        totalAssetsEl.textContent = `$${totalAssets.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
    
    if (todayProfitEl) {
        const profitClass = todayProfitRate >= 0 ? 'text-green-300' : 'text-red-300';
        todayProfitEl.textContent = `${todayProfitRate >= 0 ? '+' : ''}${todayProfitRate.toFixed(2)}%`;
        todayProfitEl.className = `text-xl font-bold ${profitClass}`;
    }
}

// 更新用户名显示（包括桌面端和移动端）
export function updateUserName(userName) {
    // 更新桌面端用户名显示
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl && userName && userName !== 'Guest') {
        avatarEl.innerHTML = `
            <i class="fas fa-user mr-2"></i>
            <span class="text-sm font-medium">${userName}</span>
        `;
    }
    
    // 更新移动端用户英文名显示
    const mobileUserNameEl = document.getElementById('mobileUserNameText');
    if (mobileUserNameEl && userName) {
        mobileUserNameEl.textContent = userName;
    }
}

// 更新交易面板
export function updateTradingPanel(availableCash, holdingAmount) {
    const availableCashEl = document.getElementById('availableCash');
    const holdingAmountEl = document.getElementById('holdingAmount');
    
    if (availableCashEl) {
        availableCashEl.textContent = `$${availableCash.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
    
    if (holdingAmountEl) {
        holdingAmountEl.textContent = holdingAmount.toFixed(4);
    }
}

// 更新当前价格显示
export function updateCurrentPrice(crypto) {
    const currentPriceEl = document.getElementById('currentPrice');
    const priceChangeEl = document.getElementById('priceChange');
    const selectedCryptoNameEl = document.getElementById('selectedCryptoName');
    const selectedCryptoSymbolEl = document.getElementById('selectedCryptoSymbol');
    
    if (currentPriceEl) {
        currentPriceEl.textContent = `$${crypto.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
    
    if (priceChangeEl) {
        const changeClass = crypto.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
        const changeIcon = crypto.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        priceChangeEl.className = `text-sm px-2 py-1 rounded ${changeClass}`;
        priceChangeEl.innerHTML = `<i class="fas ${changeIcon} mr-1"></i>${crypto.change >= 0 ? '+' : ''}${crypto.change.toFixed(2)}%`;
    }
    
    if (selectedCryptoNameEl) {
        selectedCryptoNameEl.textContent = crypto.name;
    }
    
    if (selectedCryptoSymbolEl) {
        selectedCryptoSymbolEl.textContent = crypto.symbol;
    }
}

// 计算并更新最大可买数量
export function updateMaxBuyAmount(availableCash, cryptoPrice) {
    const maxBuyAmountEl = document.getElementById('maxBuyAmount');
    
    if (!maxBuyAmountEl) return;
    
    if (!cryptoPrice || cryptoPrice <= 0) {
        maxBuyAmountEl.textContent = '0';
        maxBuyAmountEl.className = 'text-sm text-gray-500';
        return;
    }
    
    // 计算最大可买数量（保留8位小数）
    const maxAmount = availableCash / cryptoPrice;
    
    // 格式化显示
    if (maxAmount >= 1) {
        // 大于等于1：显示4位小数
        maxBuyAmountEl.textContent = maxAmount.toFixed(4);
    } else if (maxAmount >= 0.0001) {
        // 0.0001到1之间：显示6位小数
        maxBuyAmountEl.textContent = maxAmount.toFixed(6);
    } else {
        // 小于0.0001：显示8位小数
        maxBuyAmountEl.textContent = maxAmount.toFixed(8);
    }
    
    // 添加样式类
    maxBuyAmountEl.className = 'text-sm font-medium text-blue-600';
    
    // 显示对应的USD价值
    const maxBuyValueEl = document.getElementById('maxBuyValue');
    if (maxBuyValueEl) {
        maxBuyValueEl.textContent = `$${availableCash.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        maxBuyValueEl.className = 'text-xs text-gray-500';
    }
}

// 渲染排行榜前三名
export function renderTopThree(leaderboard) {
    const topThreeContainer = document.getElementById('topThree');
    if (!topThreeContainer || !leaderboard || leaderboard.length === 0) return;
    
    console.log('🏆 渲染前三名，数据:', leaderboard.slice(0, 3));
    
    // 获取前三名（如果不足三名则显示实际数量）
    const topThree = leaderboard.slice(0, 3);
    
    // 分离第一名和其他名次
    const firstPlace = topThree.find(user => user.rank === 1);
    const otherPlaces = topThree.filter(user => user.rank !== 1);
    
    // 新的布局：第一名独占一行，二三名并排显示在下方（如果有的话）
    topThreeContainer.innerHTML = `
        <div class="space-y-4">
            <!-- 第一名单独显示在顶部 -->
            ${firstPlace ? renderFirstPlace(firstPlace) : ''}
            
            <!-- 第二三名并排显示 -->
            ${otherPlaces.length > 0 ? `
                <div class="grid grid-cols-${otherPlaces.length === 1 ? '1' : '2'} gap-4">
                    ${otherPlaces.map(user => renderOtherTopPlace(user)).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// 渲染第一名（单独的样式）
function renderFirstPlace(user) {
    console.log(`🏆 渲染第一名 ${user.rank}:`, { 
        title: user.title, 
        emoji: user.emoji, 
        eng_name: user.eng_name,
        chn_name: user.chn_name,
        profit_rate: user.profit_rate 
    });
    
    const profitClass = user.profit_rate >= 0 ? 'text-green-600' : 'text-red-600';
    
    // 使用后端返回的title和emoji，如果没有则使用默认值
    const title = user.title || '币神进化论';
    const emoji = user.emoji || '👑';
    
    return `
        <div class="relative transition-all duration-300 hover:transform hover:scale-105">
            <div class="bg-white/90 backdrop-blur-sm rounded-xl bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 border-2 border-yellow-400 shadow-yellow-200/50 p-6 text-center transition-all hover:shadow-2xl shadow-xl shadow-yellow-300/30">
                <!-- 排名徽章 -->
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white/50">
                        1
                    </div>
                </div>
                
                <!-- 称号和emoji -->
                <div class="mt-6 mb-4">
                    <div class="text-5xl mb-3 drop-shadow-sm">${emoji}</div>
                    <div class="font-bold text-yellow-800 text-xl">${title}</div>
                </div>
                
                <!-- 用户信息 - 移动端紧凑布局 -->
                <div class="mb-4">
                    <!-- 移动端：用户名单独一行，加密显示 -->
                    <div class="font-semibold text-gray-800 text-base mb-2">${maskUserName(user.eng_name)}</div>
                </div>

                <!-- 资产信息 - 移动端紧凑布局 -->
                <div class="space-y-2">
                    <div class="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                        <div class="text-xs text-gray-600">总资产</div>
                        <div class="font-bold text-gray-900 text-lg">$${user.total_assets.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </div>
                    <div class="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                        <div class="text-xs text-gray-600">收益率</div>
                        <div class="font-bold ${profitClass} text-lg">${user.profit_rate >= 0 ? '+' : ''}${user.profit_rate.toFixed(2)}%</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 渲染其他前两名（第二名和第三名）
function renderOtherTopPlace(user) {
    console.log(`🏆 渲染用户 ${user.rank}:`, { 
        title: user.title, 
        emoji: user.emoji, 
        eng_name: user.eng_name,
        chn_name: user.chn_name,
        profit_rate: user.profit_rate 
    });
    
    const isSecond = user.rank === 2;
    const isThird = user.rank === 3;
    const profitClass = user.profit_rate >= 0 ? 'text-green-600' : 'text-red-600';
    
    // 根据排名设置独特的配色和边框效果
    let bgClass, medalBg, shadowClass;
    
    if (isSecond) {
        // 第二名：淡银色底色 + 银边效果
        bgClass = 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 border-2 border-gray-400 shadow-gray-200/50';
        medalBg = 'from-gray-300 to-gray-500';
        shadowClass = 'shadow-lg shadow-gray-300/25';
    } else if (isThird) {
        // 第三名：淡铜色底色 + 铜边效果
        bgClass = 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 border-2 border-orange-400 shadow-orange-200/50';
        medalBg = 'from-orange-400 to-amber-600';
        shadowClass = 'shadow-lg shadow-orange-300/25';
    } else {
        // 其他名次（不应该出现，但保留作为后备）
        bgClass = 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300';
        medalBg = 'from-gray-400 to-gray-500';
        shadowClass = 'shadow-md';
    }
    
    // 根据排名设置对应的称号和emoji
    let title, emoji;
    
    // 使用后端返回的title和emoji，如果没有则根据排名生成指定称号
    if (user.title && user.emoji) {
        title = user.title;
        emoji = user.emoji;
    } else {
        if (isSecond) {
            title = '币圈巨鲸';
            emoji = '🐋';
        } else if (isThird) {
            title = '币圈三太子';
            emoji = '🤴';
        } else {
            title = '未知称号';
            emoji = '❓';
        }
    }
    
    return `
        <div class="relative transition-all duration-300 hover:transform hover:scale-105">
            <div class="bg-white/90 backdrop-blur-sm rounded-xl ${bgClass} p-4 text-center transition-all hover:shadow-2xl ${shadowClass}">
                <!-- 排名徽章 -->
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div class="bg-gradient-to-r ${medalBg} text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white/50">
                        ${user.rank}
                    </div>
                </div>
                
                <!-- 称号和emoji -->
                <div class="mt-4 mb-3">
                    <div class="text-3xl mb-2 drop-shadow-sm">${emoji}</div>
                    <div class="font-bold ${isSecond ? 'text-gray-800' : 'text-orange-800'} text-xl">${title}</div>
                </div>
                
                <!-- 用户信息 - 移动端紧凑布局 -->
                <div class="mb-3">
                    <!-- 移动端：用户名单独一行，加密显示 -->
                    <div class="font-semibold text-gray-800 text-base mb-2">${maskUserName(user.eng_name)}</div>
                </div>

                <!-- 资产信息 - 移动端紧凑布局 -->
                <div class="space-y-2">
                    <div class="bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-white/50">
                        <div class="text-xs text-gray-600">总资产</div>
                        <div class="font-bold text-gray-900 text-lg">$${user.total_assets.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </div>
                    <div class="bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-white/50">
                        <div class="text-xs text-gray-600">收益率</div>
                        <div class="font-bold ${profitClass} text-lg">${user.profit_rate >= 0 ? '+' : ''}${user.profit_rate.toFixed(2)}%</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 渲染排行榜其他排名
export function renderOtherRanks(leaderboard) {
    const otherRanksContainer = document.getElementById('otherRanks');
    if (!otherRanksContainer || !leaderboard || leaderboard.length <= 3) {
        if (otherRanksContainer) {
            otherRanksContainer.innerHTML = '<div class="text-center text-gray-500 py-4">暂无更多排名</div>';
        }
        return;
    }
    
    console.log('🏆 渲染其他排名，数据量:', leaderboard.length - 3);
    
    // 获取第4名及以后的排名
    const otherRanks = leaderboard.slice(3);
    
    // 根据排名设置背景渐变色，从最后10名往上依次变得更高级
    function getBackgroundGradient(rank) {
        if (rank >= 41 && rank <= 50) {
            // 41-50名：淡雅的绿色调（最基础）
            return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200';
        } else if (rank >= 31 && rank <= 40) {
            // 31-40名：清新的蓝色调
            return 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200';
        } else if (rank >= 21 && rank <= 30) {
            // 21-30名：优雅的紫色调
            return 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200';
        } else if (rank >= 11 && rank <= 20) {
            // 11-20名：温暖的橙色调
            return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200';
        } else if (rank >= 4 && rank <= 10) {
            // 4-10名：高级的粉紫色调（最高级）
            return 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200';
        } else {
            // 其他排名：默认白色
            return 'bg-white border-gray-200';
        }
    }
    
    // 根据排名设置排名徽章的渐变色
    function getRankBadgeGradient(rank) {
        if (rank >= 41 && rank <= 50) {
            return 'from-green-400 to-emerald-500';
        } else if (rank >= 31 && rank <= 40) {
            return 'from-blue-400 to-cyan-500';
        } else if (rank >= 21 && rank <= 30) {
            return 'from-purple-400 to-indigo-500';
        } else if (rank >= 11 && rank <= 20) {
            return 'from-orange-400 to-amber-500';
        } else if (rank >= 4 && rank <= 10) {
            return 'from-pink-400 to-rose-500';
        } else {
            return 'from-gray-400 to-gray-500';
        }
    }

    otherRanksContainer.innerHTML = otherRanks.map(user => {
        console.log(`🏆 渲染其他用户 ${user.rank}:`, { 
            title: user.title, 
            emoji: user.emoji, 
            eng_name: user.eng_name,
            chn_name: user.chn_name 
        });
        
        const profitClass = user.profit_rate >= 0 ? 'text-green-600' : 'text-red-600';
        const backgroundClass = getBackgroundGradient(user.rank);
        const rankBadgeClass = getRankBadgeGradient(user.rank);
        
        // 根据排名设置对应的称号和emoji
        let title, emoji;
        
        // 使用后端返回的title和emoji，如果没有则根据排名生成指定称号
        if (user.title && user.emoji) {
            title = user.title;
            emoji = user.emoji;
        } else {
            // 根据用户指定的规则设置称号
            if (user.rank >= 4 && user.rank <= 10) {
                title = '南山资本家';
                emoji = '💼';
            } else if (user.rank >= 11 && user.rank <= 20) {
                title = '王牌交易员';
                emoji = '🎯';
            } else if (user.rank >= 21 && user.rank <= 30) {
                title = 'K线魔术师';
                emoji = '🎩';
            } else if (user.rank >= 31 && user.rank <= 40) {
                title = '趋势观察家';
                emoji = '🔭';
            } else if (user.rank >= 41 && user.rank <= 50) {
                title = '潜力韭菜';
                emoji = '🌱';
            } else {
                title = '新手玩家';
                emoji = '🌱';
            }
        }
        
        // 使用后端返回的emoji，如果没有则使用默认值
        const finalEmoji = user.emoji || emoji;
        
        return `
            <div class="rounded-lg p-4 hover:shadow-md transition-all border ${backgroundClass}">
                <div class="flex items-center justify-between">
                    <!-- 左侧：排名和用户信息 -->
                    <div class="flex items-center space-x-4">
                        <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br ${rankBadgeClass} text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                            ${user.rank}
                        </div>
                        
                        <div class="flex items-center space-x-3">
                            <div>
                                <!-- 移动端优化：用户名和称号紧凑一行显示，用户名加密 -->
                                <div class="flex items-center gap-2">
                                    <div class="font-semibold text-gray-900">${maskUserName(user.eng_name)}</div>
                                    <div class="px-2 py-0.5 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-full flex items-center gap-1">
                                        <span class="text-xs font-semibold text-gray-700">${title}</span>
                                        <span class="text-xs">${finalEmoji}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 右侧：资产和收益率 - 移动端优化：总资产和收益率紧凑显示 -->
                    <div class="text-right">
                        <div class="font-bold text-gray-900">$${user.total_assets.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <div class="text-sm ${profitClass} font-semibold">${user.profit_rate >= 0 ? '+' : ''}${user.profit_rate.toFixed(2)}%</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 渲染完整排行榜
export function renderLeaderboardModal(leaderboard) {
    const loadingEl = document.getElementById('leaderboardLoading');
    const contentEl = document.getElementById('leaderboardContent');
    const emptyEl = document.getElementById('leaderboardEmpty');
    const updateTimeEl = document.getElementById('leaderboardUpdateTime');
    
    // 隐藏加载状态
    if (loadingEl) loadingEl.classList.add('hidden');
    
    // 检查是否有数据
    if (!leaderboard || leaderboard.length === 0) {
        if (emptyEl) emptyEl.classList.remove('hidden');
        if (contentEl) contentEl.classList.add('hidden');
        return;
    }
    
    // 显示内容
    if (emptyEl) emptyEl.classList.add('hidden');
    if (contentEl) contentEl.classList.remove('hidden');
    
    // 渲染前三名和其他排名
    renderTopThree(leaderboard);
    renderOtherRanks(leaderboard);
    
    // 更新时间
    if (updateTimeEl) {
        const now = new Date();
        updateTimeEl.textContent = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}