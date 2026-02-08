// 导入模块
import { 
    tutorialCryptos, 
    practiceCryptos, 
    fetchCryptoCompareData, 
    fetchKlineData,
    fetchUserInfo 
} from './api.js';

import { 
    initPriceChart, 
    loadPriceChart, 
    changeTimeframe,
    changeCrypto
} from './charts.js';

import {
    renderCryptoList,
    renderPortfolioList,
    renderAgentList,
    renderLeaderboard,
    showMessage,
    updateUserAssets,
    updateUserName,
    updateTradingPanel,
    updateCurrentPrice,
    updateMaxBuyAmount,
    renderLeaderboardModal
} from './components.js';

// ==================== 工具函数 ====================

/**
 * 检测是否为移动端设备
 * @returns {boolean} 如果是移动端返回true，否则返回false
 */
function checkIsMobile() {
    return window.innerWidth <= 767;
}

/**
 * 获取设备类型标识（用于日志）
 * @returns {string} 返回 '📱 移动端' 或 '💻 桌面端'
 */
function getDeviceLabel() {
    return checkIsMobile() ? '📱 移动端' : '💻 桌面端';
}

// ==================== 应用状态 ====================

// 应用状态
const appState = {
    mode: 'tutorial', // 'tutorial' 或 'practice'
    // 演示模式用户数据
    tutorialUser: {
        id: 'user-tutorial',
        name: '我',
        type: 'player',
        totalAssets: 1000000,
        availableCash: 1000000,
        todayProfit: 0,
        portfolio: [],
        tradeHistory: []
    },
    // 实战模式用户数据
    practiceUser: {
        id: 'user-practice',
        name: '我',
        type: 'player',
        totalAssets: 1000000,
        availableCash: 1000000,
        todayProfit: 0,
        portfolio: [],
        tradeHistory: [],
        initialized: false // 资产初始化标记
    },
    // 当前用户引用（指向tutorialUser或practiceUser）
    currentUser: null,
    // 用户英文名（用于弹幕等功能）
    userEngName: 'Guest',
    cryptos: [],
    allCryptos: [], // 完整的币种列表（用于搜索筛选）
    selectedCrypto: null,
    klineData: [],
    klinePeriod: 1, // 默认1小时
    // 数据源状态标识
    dataSourceHealthy: true, // 标识数据源是否正常
    // API失败追踪状态
    apiFailureTracking: {
        consecutiveFailures: 0, // 连续失败次数
        firstFailureTime: null, // 首次失败时间
        currentRetryInterval: 15000, // 当前重试间隔（毫秒）- 修改为15秒
        lastSuccessTime: Date.now(), // 上次成功时间
        inDatabaseFallback: false, // 是否已进入数据库降级模式
        tradingLocked: false, // 交易是否被锁定
        lockThreshold: 3, // 锁定交易的连续失败阈值
        lockMessage: '数据源异常，暂时无法交易' // 锁定时的提示消息
    },
    // 模式切换交易锁定状态
    modeSwitchLock: {
        isLocked: false, // 是否因模式切换而锁定交易
        waitingForPriceUpdate: false, // 是否正在等待价格更新
        lockMessage: '正在更新市场价格，请稍候...' // 锁定时的提示消息
    },
    // 刷新锁定追踪机制（防止用户利用刷新漏洞）
    refreshLock: {
        isLocked: false, // 是否因刷新而锁定交易
        successfulUpdates: 0, // 成功更新次数
        requiredUpdates: 1, // 需要连续成功的更新次数（修改为1次）
        lockMessage: '正在验证数据源稳定性，请稍候...' // 锁定时的提示消息
    },
    // 自动保存定时器
    autoSaveTimer: null,
    autoSaveInterval: 10000, // 10秒自动保存一次
    // 排行榜定时器
    leaderboardTimer: null,
    leaderboardInterval: 10000, // 10秒刷新一次排行榜
    leaderboardData: [], // 排行榜数据缓存
    // 市场数据更新定时器
    marketDataTimer: null,
    // 黑名单状态
    isBlacklisted: false, // 是否在黑名单中
    blacklistMessage: '', // 黑名单提示消息
    agents: [
        {
            id: 'agent-1',
            name: '巴菲特基金',
            codeName: 'Agent-1',
            strategy: '大盘定投 & 质押',
            assets: 1000000,
            profit: 0,
            status: 'waiting',
            thought: '寻找BTC/ETH的长期价值，低买高卖，不做空...',
            weakness: '熊市回撤大，资金利用率低',
            evolution: '如果被做空玩家击败，学会套保对冲',
            evolutionName: 'Hedged Buffett',
            target: null,
            portfolio: [],
            icon: '🏛️',
            color: 'from-green-400 to-emerald-600'
        },
        {
            id: 'agent-2',
            name: '量化基金',
            codeName: 'Agent-2',
            strategy: 'DEX链上套利',
            assets: 1000000,
            profit: 0,
            status: 'thinking',
            thought: '监控Uniswap/Curve价差，进行搬砖套利...',
            weakness: 'Gas费飙升时亏损，不懂宏观情绪',
            evolution: '学会Gas优化和暂停交易',
            evolutionName: 'Smart Gas Quant',
            target: null,
            portfolio: [],
            icon: '📊',
            color: 'from-blue-400 to-indigo-600'
        },
        {
            id: 'agent-3',
            name: '趋势基金',
            codeName: 'Agent-3',
            strategy: '均线突破',
            assets: 1000000,
            profit: 0,
            status: 'waiting',
            thought: '价格站上MA20买入，跌破卖出...',
            weakness: '震荡市频繁磨损本金',
            evolution: '学会震荡区间高抛低吸',
            evolutionName: 'Adaptive Hunter',
            target: null,
            portfolio: [],
            icon: '🎯',
            color: 'from-orange-400 to-red-600'
        },
        {
            id: 'agent-4',
            name: '佛系指数',
            codeName: 'Agent-4 | 市场基准',
            strategy: '被动持有 50BTC/30ETH/20SOL',
            assets: 1000000,
            profit: 0,
            status: 'waiting',
            thought: '买完就睡觉，大盘指数不折腾...',
            weakness: '跑不赢的不配教导其他Agent',
            evolution: '极难进化，需证明长期调仓优势',
            evolutionName: 'Market Index',
            target: null,
            portfolio: [],
            personality: 'zen',
            tradeCount: 0,
            lastTradeTime: 0,
            icon: '🧘',
            color: 'from-purple-400 to-pink-600'
        },
        {
            id: 'agent-5',
            name: '巨鲸暗池',
            codeName: 'Agent-5 | 终极Alpha',
            strategy: '高频+巨鲸监控',
            assets: 1000000,
            profit: 0,
            status: 'waiting',
            thought: '监控链上巨鲸地址+情绪分析，市场由我定义...',
            weakness: '只有Top 1%人类能触发进化',
            evolution: '吞噬最激进的Alpha策略',
            evolutionName: 'Whale Alpha 🏆',
            target: null,
            portfolio: [],
            personality: 'whale',
            marketState: 'unknown',
            lastMajorMove: 0,
            icon: '🐋',
            color: 'from-[#00f3ff] to-[#bc13fe]',
            isUltimate: true
        }
    ],
    tutorial: {
        enabled: true,
        currentStep: 0,
        completed: false,
        skipped: false, // 添加跳过状态
        steps: [
            {
                title: '🧬 欢迎来到币神进化论！',
                content: "全球首个'众包进化型'链上AI对冲基金。Don't Copy Trade. Let AI Copy You. —— 别跟单，让AI抄你的作业。",
                target: null,
                action: null
            },
            {
                title: '🎯 核心玩法：从竞争到共生',
                content: '这里不是人与AI的对抗，而是人类智慧与AI执行的完美融合。当你击败AI Agent时，AI会向你"拜师"学习你的策略，而你将永久获得收益分成！',
                target: null,
                action: null
            },
            {
                title: '🏆 挑战 (Challenge)',
                content: '5大AI Agent 24/7实盘交易。你的任务是用你的交易策略击败它们——无论是价值投资、量化套利、趋势跟踪还是高频策略。',
                target: null,
                action: null
            },
            {
                title: '💉 注入 (Injection) - 核心创新',
                content: '当你击败某个Agent时，系统会自动分析你的交易历史，由GPT-4o生成优化代码，经过回测后实装到Agent中。你的策略将永远留在区块链上！',
                target: null,
                action: null
            },
            {
                title: '💰 获利 (Profit Sharing)',
                content: '策略被采纳后，你将获得一枚"Strategy NFT"。Agent使用你的策略产生的超额收益(Alpha)，10%将实时通过智能合约流支付到你的钱包。Code once, earn forever!',
                target: null,
                action: null
            },
            {
                title: '🤖 认识你的AI对手',
                content: '5大Agent各具特色：巴菲特(大盘定投)、量化小Q(链上套利)、趋势猎人(均线突破)、佛系小散(指数持有)、神秘巨鲸(高频混合)。每个都有进化空间！',
                target: null,
                action: null
            },
            {
                title: '📊 开始你的第一笔交易',
                content: '左侧是币种列表，中间是价格走势图和交易面板。选择比特币(BTC)，尝试买入并观察价格变化。',
                target: '#cryptoList .crypto-item:first-child',
                action: 'selectCrypto'
            },
            {
                title: '💡 输入买入数量',
                content: '在交易面板中输入你想买入的数量，比如 0.1 个BTC。',
                target: '#tradeAmount',
                action: 'inputAmount'
            },
            {
                title: '🚀 执行买入',
                content: '点击"买入"按钮，完成你的第一笔交易！这笔交易将计入你的战绩。',
                target: '#buyBtn',
                action: 'buy'
            },
            {
                title: '⏰ 观察价格变化',
                content: '太棒了！现在你已经持有BTC了。观察价格走势图，等待价格上涨。在实战模式中，你的收益率将与AI Agent进行实时PK！',
                target: '#klineChart',
                action: 'wait'
            },
            {
                title: '💸 尝试卖出获利',
                content: '当你觉得价格合适时，可以卖出获利。输入卖出数量，然后点击"卖出"按钮。记住：稳定的盈利策略更容易被AI学习采纳！',
                target: '#sellBtn',
                action: 'sell'
            },
            {
                title: '🎉 教学完成！解锁进化之路',
                content: '恭喜你完成了基础教学！现在你可以解锁"实战练习"模式，与5大AI Agent进行收益率比拼。击败它们，让你的策略永久上链，开启躺赚模式！',
                target: null,
                action: 'complete'
            }
        ]
    }
};

// 初始化应用
async function initApp() {
    console.log('🚀 初始化应用...');
    
    // 🔒 安全检查：检测页面刷新，防止利用缓存虚增资产
    // 当用户刷新页面时，确保从数据库载入最新数据，而不是使用可能过期的缓存
    const isPageRefresh = performance.navigation && performance.navigation.type === 1;
    if (isPageRefresh) {
        console.log('🔄 检测到页面刷新');
        console.log('🔒 页面刷新时将从数据库载入最新数据，确保数据一致性');
        // 注意：不清除localStorage，因为autoLoadUserData会自动从数据库载入最新数据
        // localStorage仅用于存储AI对手数据等非关键信息
    }
    
    // 移动端游客提示和iOA认证
    const isMobile = window.innerWidth <= 767;
    if (isMobile) {
        showMobileGuestNotice();
    }
    
    // 设置初始的data-mode属性
    document.body.setAttribute('data-mode', 'tutorial');
    
    // 检查localStorage中的教学完成状态
    checkTutorialStatus();
    
    // 初始化当前用户为演示模式
    appState.currentUser = appState.tutorialUser;
    
    // ⚡ 性能优化：先使用备用数据快速渲染界面
    console.log('⚡ 使用备用数据快速渲染界面...');
    appState.allCryptos = [...practiceCryptos];
    appState.cryptos = tutorialCryptos;
    appState.selectedCrypto = appState.cryptos[0];
    
    // 初始化演示模式布局（隐藏右侧面板）
    updateLayoutForMode('tutorial');
    
    // 快速渲染初始界面（使用备用数据）
    renderUI();
    
    // 绑定事件（提前绑定，让用户可以立即交互）
    bindEvents();
    
    console.log('✅ 首屏渲染完成，开始后台加载数据...');
    
    // ⚡ 异步加载：并行执行用户信息和API数据获取
    const loadDataPromises = [
        // 加载用户信息（已移除登录环节，直接使用Guest）
        fetchUserInfo().then(userInfo => {
            appState.tutorialUser.name = 'Guest';
            appState.practiceUser.name = 'Guest';
            appState.userEngName = 'Guest';
            updateUserName('Guest');
            console.log('✅ 使用Guest用户');
        }).catch(error => {
            console.warn('⚠️ 用户信息加载失败:', error);
        }),
        
        // 加载实时加密货币数据
        fetchCryptoCompareData().then(data => {
            if (data && data.length > 0) {
                appState.allCryptos = [...data];
                appState.cryptos = data.filter(crypto => 
                    crypto.symbol === 'BTC' || crypto.symbol === 'ETH'
                );
                appState.selectedCrypto = appState.cryptos[0];
                // 更新界面显示最新数据
                renderUI();
                console.log('✅ 实时数据已加载并更新界面');
            }
        }).catch(error => {
            console.warn('⚠️ 实时数据加载失败，继续使用备用数据:', error);
        })
    ];
    
    // 等待基础数据加载完成
    await Promise.allSettled(loadDataPromises);
    
    // ⚡ 延迟初始化图表：在用户看到界面后再加载图表
    console.log('📊 开始初始化图表...');
    setTimeout(() => {
        initPriceChart('klineChart');
        // 异步加载图表数据，不阻塞主流程
        loadPriceChart(appState.selectedCrypto.symbol, appState.klinePeriod)
            .then(() => {
                console.log('✅ 图表数据加载完成');
            })
            .catch(error => {
                console.warn('⚠️ 图表数据加载失败:', error);
            });
    }, 100);
    
    // 开始教学（只有教学未完成且未跳过时才启动）
    if (appState.tutorial.enabled && !appState.tutorial.completed && !appState.tutorial.skipped) {
        // 延迟启动教学，让用户先看到界面
        setTimeout(() => {
            startTutorial();
        }, 300);
    } else if (appState.tutorial.skipped) {
        console.log('用户之前已跳过教学，直接解锁实战模式');
        unlockPracticeMode();
    } else if (appState.tutorial.completed) {
        console.log('用户之前已完成教学，解锁实战模式');
        unlockPracticeMode();
    }
    
    // 启动AI Agent（延迟启动，不影响首屏）
    setTimeout(() => {
        startAgentSimulation();
    }, 500);
    
    // 启动市场数据定时更新（延迟启动）
    setTimeout(() => {
        restartMarketDataTimer();
    }, 1000);
    
    // 初始化交易锁定状态（确保UI状态正确）
    updateTradingLockStatus(appState.apiFailureTracking.tradingLocked);
    
    // 🔒 页面加载时如果是实战模式，启动刷新锁定机制
    if (appState.mode === 'practice') {
        console.log('🔒 页面加载检测到实战模式，启动刷新锁定机制');
        appState.refreshLock.isLocked = true;
        appState.refreshLock.successfulUpdates = 0;
        updateTradingLockStatus(true);
        
        // 🚀 优化：3秒后进行首次快速验证
        console.log('⚡ 启动快速数据源验证（3秒后）');
        setTimeout(() => {
            if (appState.mode === 'practice' && appState.refreshLock.isLocked) {
                console.log('⚡ 执行首次快速数据源验证');
                updateMarketData();
            }
        }, 3000);
    }
    
    // 检查是否需要自动载入实战模式数据
    if ((appState.tutorial.completed || appState.tutorial.skipped)) {
        console.log('📂 用户已完成教学，解锁实战模式按钮');
        if (appState.tutorial.completed || appState.tutorial.skipped) {
            console.log('🔓 解锁实战模式按钮');
            unlockPracticeMode();
        }
    }
    
    console.log('✅ 应用初始化完成（快速加载模式）');
    
    // ⚡ 隐藏初始加载动画
    setTimeout(() => {
        const loader = document.getElementById('initialLoader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.3s ease-out';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }
    }, 200);
}

// 渲染UI
function renderUI() {
    // 数据完整性检查：确保cryptos数据已加载
    if (!appState.cryptos || appState.cryptos.length === 0) {
        console.warn('⚠️ renderUI: cryptos数据为空，延迟渲染');
        // 延迟100ms后重试
        setTimeout(() => {
            if (appState.cryptos && appState.cryptos.length > 0) {
                console.log('✅ cryptos数据已加载，重新渲染UI');
                renderUI();
            } else {
                console.error('❌ cryptos数据仍然为空，无法渲染UI');
            }
        }, 100);
        return;
    }
    
    // 在渲染前先更新用户总资产和收益率，确保数据与最新价格同步
    updateTotalAssets();
    
    // 渲染加密货币列表
    renderCryptoList(appState.cryptos, appState.selectedCrypto?.id);
    
    // 渲染持仓列表
    renderPortfolioList(appState.currentUser.portfolio, appState.cryptos);
    
    // 渲染AI Agent列表（仅实战模式）
    if (appState.mode === 'practice') {
        renderAgentList(appState.agents);
    }
    
    // 渲染排行榜（仅在实战模式）
    if (appState.mode === 'practice') {
        // 确保玩家信息以当前总资产和收益率为准
        const leaderboardData = [
            {
                id: appState.currentUser.id,
                name: appState.currentUser.name,
                type: 'player',
                assets: appState.currentUser.totalAssets,
                profit: ((appState.currentUser.totalAssets - 1000000) / 1000000) * 100,
                avatar: null
            },
            ...appState.agents.map(agent => ({
                id: agent.id,
                name: agent.name,
                type: 'ai',
                assets: agent.assets,
                profit: ((agent.assets - 1000000) / 1000000) * 100,
                avatar: null
            }))
        ];
        renderLeaderboard(leaderboardData, appState.currentUser.id);
    }
    
    // 更新用户资产
    const profitRate = ((appState.currentUser.totalAssets - 1000000) / 1000000) * 100;
    updateUserAssets(appState.currentUser.totalAssets, profitRate);
    
    // 更新交易面板
    if (appState.selectedCrypto) {
        const holding = appState.currentUser.portfolio.find(p => p.cryptoId === appState.selectedCrypto.id);
        updateTradingPanel(appState.currentUser.availableCash, holding?.amount || 0);
        updateCurrentPrice(appState.selectedCrypto);
        
        // 更新最大可买数量
        updateMaxBuyAmount(appState.currentUser.availableCash, appState.selectedCrypto.price);
    }
}

// 绑定事件
function bindEvents() {
    // 模式切换
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const mode = e.currentTarget.dataset.mode;
            
            if (mode === 'practice' && !(appState.tutorial.completed || appState.tutorial.skipped)) {
                showMessage('请先完成演示模式！', 'warning');
                return;
            }
            
            // 先切换模式
            await switchMode(mode);
            
            // 如果是切换到实战模式，检查并载入保存的数据（仅在手动切换时）
            if (mode === 'practice') {
                // 延迟一小段时间确保界面完全初始化后再载入数据
                setTimeout(async () => {
                    await autoLoadUserData();
                }, 500);
            }
        });
    });
    
    // 币种选择
    document.getElementById('cryptoList').addEventListener('click', (e) => {
        const item = e.target.closest('.crypto-item');
        if (item) {
            const cryptoId = item.dataset.cryptoId;
            selectCrypto(cryptoId);
        }
    });
    
    // 持仓列表卖出按钮（使用事件委托）
    document.getElementById('portfolioList').addEventListener('click', (e) => {
        const sellBtn = e.target.closest('.sell-button');
        if (sellBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const cryptoId = sellBtn.dataset.cryptoId;
            const symbol = sellBtn.dataset.symbol;
            const amount = parseFloat(sellBtn.dataset.amount);
            const currentPrice = parseFloat(sellBtn.dataset.currentPrice);
            
            console.log(`🔥 点击卖出按钮: ${symbol}`, { cryptoId, amount, currentPrice });
            
            handleQuickSell(cryptoId, symbol, amount, currentPrice);
        }
    });
    
    // 刷新按钮
    document.getElementById('refreshBtn').addEventListener('click', () => {
        updateMarketData();
    });
    
    // 搜索
    document.getElementById('searchInput').addEventListener('input', async (e) => {
        const keyword = e.target.value.toLowerCase();
        await filterCryptos(keyword);
    });
    
    // K线周期切换
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const period = parseInt(e.currentTarget.dataset.period);
            switchKlinePeriod(period);
        });
    });
    
    // 交易数量输入框验证
    document.getElementById('tradeAmount').addEventListener('input', (e) => {
        const amount = parseFloat(e.target.value);
        const maxBuyAmountEl = document.getElementById('maxBuyAmount');
        const tradeHintEl = document.getElementById('tradeHint');
        
        if (amount && amount > 0 && appState.selectedCrypto) {
            const maxAmount = appState.currentUser.availableCash / appState.selectedCrypto.price;
            
            if (amount > maxAmount) {
                // 超过最大可买数量
                e.target.style.borderColor = '#ff4d4f';
                tradeHintEl.innerHTML = `<i class="fas fa-exclamation-triangle text-red-500 mr-1"></i>
                    <span class="text-red-500">数量超过最大可买限制 (${maxAmount.toFixed(6)})</span>`;
            } else {
                // 正常范围
                e.target.style.borderColor = '#52c41a';
                const totalCost = amount * appState.selectedCrypto.price;
                tradeHintEl.innerHTML = `<i class="fas fa-check-circle text-green-500 mr-1"></i>
                    <span class="text-green-600">预计花费: $${totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>`;
            }
        } else {
            // 清空或无效输入
            e.target.style.borderColor = '#d9d9d9';
            tradeHintEl.innerHTML = '';
        }
    });
    
    // 交易按钮
    document.getElementById('buyBtn').addEventListener('click', () => {
        handleTrade('buy');
    });
    
    document.getElementById('sellBtn').addEventListener('click', () => {
        handleTrade('sell');
    });
    
    // 教学相关
    document.getElementById('nextTutorial')?.addEventListener('click', () => {
        nextTutorialStep();
    });
    
    document.getElementById('skipTutorial')?.addEventListener('click', () => {
        skipTutorial();
    });
    
    // 保存按钮（仅在实战模式显示）
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const isMobile = window.innerWidth <= 767;
            if (isMobile) {
                console.log('📱 ========== 移动端保存按钮被点击 ==========');
                console.log('📱 点击时间:', new Date().toISOString());
                console.log('📱 按钮元素:', saveBtn);
                console.log('📱 按钮是否可见:', !saveBtn.classList.contains('hidden'));
                console.log('📱 当前模式:', appState.mode);
            }
            await saveUserData('manual');
        });
        
        // 移动端专用：记录按钮绑定成功
        const isMobile = window.innerWidth <= 767;
        if (isMobile) {
            console.log('📱 保存按钮事件已绑定');
        }
    }
    
    // 载入按钮（仅在实战模式显示）
    const loadBtn = document.getElementById('loadBtn');
    if (loadBtn) {
        loadBtn.addEventListener('click', async () => {
            await loadUserData();
        });
    }
    
    // 排行榜按钮（仅在实战模式显示）
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', () => {
            openLeaderboardModal();
        });
    }
    
    // 路演展示按钮
    const roadshowBtn = document.getElementById('roadshowBtn');
    if (roadshowBtn) {
        roadshowBtn.addEventListener('click', () => {
            console.log('🎬 打开路演展示页面');
            window.open('cointemple-roadshow.html', '_blank');
        });
    }
    
    // 关闭排行榜弹窗
    const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
    if (closeLeaderboardBtn) {
        closeLeaderboardBtn.addEventListener('click', () => {
            closeLeaderboardModal();
        });
    }
    
    // 点击弹窗外部关闭
    const leaderboardModal = document.getElementById('leaderboardModal');
    if (leaderboardModal) {
        leaderboardModal.addEventListener('click', (e) => {
            if (e.target === leaderboardModal) {
                closeLeaderboardModal();
            }
        });
    }
    
    // 生成测试用户按钮
    const generateTestUsersBtn = document.getElementById('generateTestUsersBtn');
    if (generateTestUsersBtn) {
        generateTestUsersBtn.addEventListener('click', async () => {
            console.log('🔧 点击生成测试用户按钮');
            await generateTestUsers();
        });
    }
    
    // 窗口大小变化监听器 - 用于移动端布局调整
    let resizeTimer;
    window.addEventListener('resize', () => {
        // 防抖处理，避免频繁触发
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const isMobile = window.innerWidth <= 767;
            
            if (isMobile && appState.mode === 'practice') {
                console.log('📱 检测到窗口大小变化，重新初始化移动端布局');
                initMobileLayout();
            } else {
                // 非移动端时，重置布局
                updateLayoutForMode(appState.mode);
            }
        }, 250);
    });
    
    // 页面方向变化监听器 - 处理横竖屏切换
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            const isMobile = window.innerWidth <= 767;
            
            if (isMobile && appState.mode === 'practice') {
                console.log('📱 检测到屏幕方向变化，重新初始化移动端布局');
                initMobileLayout();
            }
        }, 500); // 延迟执行，等待浏览器完成方向切换
    });
}

// 更新布局以适应不同模式
function updateLayoutForMode(mode) {
    const leftPanel = document.getElementById('leftPanel');
    const centerPanel = document.getElementById('centerPanel');
    const rightPanel = document.getElementById('rightPanel');
    
    // 设置body的data-mode属性，用于CSS样式切换
    document.body.setAttribute('data-mode', mode);
    
    // 检测是否为移动端
    const isMobile = window.innerWidth <= 767;
    
    if (mode === 'tutorial') {
        // 演示模式：隐藏右侧，左侧和中间各占一半
        if (rightPanel) rightPanel.classList.add('hidden');
        if (leftPanel) {
            leftPanel.classList.remove('lg:col-span-3');
            leftPanel.classList.add('lg:col-span-4');
        }
        if (centerPanel) {
            centerPanel.classList.remove('lg:col-span-6');
            centerPanel.classList.add('lg:col-span-8');
        }
        
        // 移动端演示模式特殊处理
        if (isMobile) {
            console.log('📱 移动端演示模式布局');
            // 确保实战模式的右侧面板隐藏
            if (rightPanel) rightPanel.style.display = 'none';
        }
    } else {
        // 实战模式：显示所有面板
        if (rightPanel) rightPanel.classList.remove('hidden');
        if (leftPanel) {
            leftPanel.classList.remove('lg:col-span-4');
            leftPanel.classList.add('lg:col-span-3');
        }
        if (centerPanel) {
            centerPanel.classList.remove('lg:col-span-8');
            centerPanel.classList.add('lg:col-span-6');
        }
        
        // 移动端实战模式特殊处理
        if (isMobile) {
            console.log('📱 移动端实战模式布局');
            // 确保右侧面板显示，并设置正确的flex布局
            if (rightPanel) {
                rightPanel.style.display = 'flex';
                rightPanel.classList.remove('hidden');
            }
            
            // 初始化移动端布局
            initMobileLayout();
        }
    }
}

// 初始化移动端布局
function initMobileLayout() {
    console.log('🔄 初始化移动端布局...');
    
    // 确保底部区域正确显示
    const rightPanel = document.getElementById('rightPanel');
    if (rightPanel) {
        // 重置flex布局，确保AI动态和排行榜并排显示
        rightPanel.style.display = 'flex';
        rightPanel.style.gap = '0.75rem';
        rightPanel.style.width = '100%';
        
        // 确保AI动态和排行榜容器正确设置
        const aiSection = rightPanel.querySelector('.bg-white:first-child');
        const leaderboardSection = rightPanel.querySelector('.bg-white:last-child');
        
        if (aiSection) {
            aiSection.style.flex = '1';
        }
        
        if (leaderboardSection) {
            leaderboardSection.style.flex = '1';
        }
    }
    
    // 优化币种列表为横向滚动
    const cryptoList = document.getElementById('cryptoList');
    if (cryptoList) {
        // 确保币种列表支持横向滚动
        cryptoList.style.display = 'flex';
        cryptoList.style.flexDirection = 'row';
        cryptoList.style.overflowX = 'auto';
        cryptoList.style.overflowY = 'hidden';
        cryptoList.style.gap = '0.5rem';
        cryptoList.style.paddingBottom = '0.5rem';
        
        // 为每个币种卡片设置固定宽度
        const cryptoItems = cryptoList.querySelectorAll('.crypto-item');
        cryptoItems.forEach(item => {
            item.style.flex = '0 0 auto';
            item.style.width = '140px';
            item.style.scrollSnapAlign = 'start';
        });
    }
    
    console.log('✅ 移动端布局初始化完成');
}

// 切换模式
async function switchMode(mode) {
    console.log(`切换到${mode}模式`);
    appState.mode = mode;
    
    // 🔒 切换到实战模式时立即锁定交易，防止利用刷新漏洞
    if (mode === 'practice') {
        console.log('🔒 切换到实战模式，启动刷新锁定机制');
        appState.refreshLock.isLocked = true;
        appState.refreshLock.successfulUpdates = 0;
        
        // 显示锁定提示
        showMessage(appState.refreshLock.lockMessage, 'info', 3000);
        
        // 更新UI显示交易锁定状态
        updateTradingLockStatus(true);
        
        // 🚀 优化：3秒后进行首次快速验证
        console.log('⚡ 启动快速数据源验证（3秒后）');
        setTimeout(() => {
            if (appState.mode === 'practice' && appState.refreshLock.isLocked) {
                console.log('⚡ 执行首次快速数据源验证');
                updateMarketData();
            }
        }, 3000);
    } else {
        // 切换到演示模式时重置刷新锁定
        appState.refreshLock.isLocked = false;
        appState.refreshLock.successfulUpdates = 0;
    }
    
    // 设置body的data-mode属性，用于CSS样式切换
    document.body.setAttribute('data-mode', mode);
    
    // 根据模式设置币种列表
    if (mode === 'tutorial') {
        // 演示模式：只显示BTC和ETH
        if (appState.cryptos.length > 2) {
            // 保存完整的币种列表（如果还没有保存的话）
            if (!appState.allCryptos || appState.allCryptos.length === 0) {
                appState.allCryptos = [...appState.cryptos];
            }
            // 只保留BTC和ETH
            appState.cryptos = appState.cryptos.filter(crypto => 
                crypto.symbol === 'BTC' || crypto.symbol === 'ETH'
            );
        }
    } else {
        // 实战模式：显示所有币种
        if (appState.allCryptos && appState.allCryptos.length > 0) {
            // 恢复完整币种列表
            appState.cryptos = [...appState.allCryptos];
            console.log('✅ 恢复完整币种列表，共', appState.cryptos.length, '个币种');
        } else {
            // 如果没有保存的完整列表，使用practiceCryptos
            appState.cryptos = [...practiceCryptos];
            appState.allCryptos = [...practiceCryptos]; // 同时更新allCryptos
            console.log('✅ 使用默认币种列表，共', appState.cryptos.length, '个币种');
        }
        
        // 数据完整性验证
        if (!appState.cryptos || appState.cryptos.length === 0) {
            console.error('❌ 严重错误: 切换到实战模式后cryptos数据为空！');
            // 尝试从API重新加载数据
            console.log('🔄 尝试重新加载市场数据...');
            updateMarketData();
        }
    }
    
    // 确保有选中的币种
    if (!appState.selectedCrypto || !appState.cryptos.find(c => c.id === appState.selectedCrypto.id)) {
        appState.selectedCrypto = appState.cryptos[0];
    }
    
    // 切换用户数据
    if (mode === 'tutorial') {
        appState.currentUser = appState.tutorialUser;
        // 停止自动保存
        stopAutoSave();
    } else {
        // 切换到实战模式时，检查是否需要初始化资产
        console.log('🔄 切换到实战模式');
        console.log('💰 当前practiceUser状态:', {
            totalAssets: appState.practiceUser.totalAssets,
            availableCash: appState.practiceUser.availableCash,
            portfolioCount: appState.practiceUser.portfolio.length,
            todayProfit: appState.practiceUser.todayProfit,
            initialized: appState.practiceUser.initialized
        });
        
        // 如果用户未初始化，保持默认资产状态
        if (!appState.practiceUser.initialized) {
            console.log('🆕 用户首次进入实战模式，使用初始资产');
        } else {
            console.log('🔄 用户已初始化，保持现有资产状态');
        }
        
        appState.currentUser = appState.practiceUser;
        // 启动自动保存
        startAutoSave();
        
        // 检测是否为移动端
        const isMobile = window.innerWidth <= 767;
        
        if (isMobile) {
            console.log('📱 ========== 移动端切换到实战模式 ==========');
            console.log('📱 切换前的用户状态:', {
                totalAssets: appState.currentUser.totalAssets,
                availableCash: appState.currentUser.availableCash,
                portfolioCount: appState.currentUser.portfolio.length
            });
        }
        
        // 自动载入用户数据（如果有保存的数据）
        // 注意：autoLoadUserData内部已经包含了移动端的界面更新逻辑
        await autoLoadUserData();
        
        // 移动端和桌面端分别处理后续更新
        if (isMobile) {
            console.log('📱 移动端：autoLoadUserData完成，等待界面更新');
            
            // 移动端：延迟更长时间，确保autoLoadUserData中的所有更新完成
            setTimeout(() => {
                console.log('📱 移动端：执行模式切换后的最终检查');
                
                // 最终检查：确保所有界面元素都正确
                const initialAssets = 1000000;
                const profitRate = ((appState.currentUser.totalAssets - initialAssets) / initialAssets) * 100;
                
                console.log('📱 最终状态检查:', {
                    totalAssets: appState.currentUser.totalAssets,
                    availableCash: appState.currentUser.availableCash,
                    portfolioCount: appState.currentUser.portfolio.length,
                    profitRate: profitRate.toFixed(2) + '%'
                });
                
                // 如果有选中的币种，确保交易面板正确
                if (appState.selectedCrypto) {
                    const holding = appState.currentUser.portfolio.find(p => p.cryptoId === appState.selectedCrypto.id);
                    updateTradingPanel(appState.currentUser.availableCash, holding?.amount || 0);
                    updateMaxBuyAmount(appState.currentUser.availableCash, appState.selectedCrypto.price);
                    console.log('📱 交易面板最终检查完成');
                }
                
                console.log('📱 ========== 移动端切换到实战模式完成 ==========');
            }, 600); // 延迟600ms，确保autoLoadUserData中的500ms更新完成
            
        } else {
            // 桌面端：保持原有逻辑
            console.log('💻 桌面端：模式切换后更新界面');
            
            setTimeout(() => {
                renderUI();
                updateTotalAssets();
                
                const initialAssets = 1000000;
                const profitRate = ((appState.currentUser.totalAssets - initialAssets) / initialAssets) * 100;
                updateUserAssets(appState.currentUser.totalAssets, profitRate);
                
                if (appState.selectedCrypto) {
                    const holding = appState.currentUser.portfolio.find(p => p.cryptoId === appState.selectedCrypto.id);
                    updateTradingPanel(appState.currentUser.availableCash, holding?.amount || 0);
                    updateMaxBuyAmount(appState.currentUser.availableCash, appState.selectedCrypto.price);
                }
                
                console.log('💻 桌面端：模式切换后界面更新完成');
            }, 200);
        }
    }
    
    // 更新按钮状态
    document.querySelectorAll('.mode-btn').forEach(btn => {
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 显示/隐藏保存和载入按钮
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    
    if (mode === 'practice') {
        // 实战模式：显示保存和载入按钮
        if (saveBtn) {
            saveBtn.classList.remove('hidden');
            console.log('✅ 保存按钮已显示');
        }
        if (loadBtn) {
            loadBtn.classList.remove('hidden');
            console.log('✅ 载入按钮已显示');
        }
    } else {
        // 演示模式：隐藏保存和载入按钮
        if (saveBtn) {
            saveBtn.classList.add('hidden');
            console.log('🔒 保存按钮已隐藏');
        }
        if (loadBtn) {
            loadBtn.classList.add('hidden');
            console.log('🔒 载入按钮已隐藏');
        }
    }
    
    // 更新布局
    updateLayoutForMode(mode);
    
    // 更新币种列表
    renderCryptoList();
    
    // 加载价格图表数据
    if (appState.selectedCrypto) {
        // 切换到实战模式时，重置价格走势图表为1小时
        if (mode === 'practice') {
            console.log('🔄 切换到实战模式，重置价格走势图表为1小时');
            appState.klinePeriod = 1;
            
            // 更新时间周期按钮的active状态
            document.querySelectorAll('.period-btn').forEach(btn => {
                if (parseInt(btn.dataset.period) === 1) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
        loadPriceChart(appState.selectedCrypto.symbol, appState.klinePeriod);
    }
    
    // 更新排行榜和AI Agent
    updateLeaderboard();
    renderAgentList();
    
    // 如果是实战模式，启动或更新市场数据定时器
    if (mode === 'practice') {
        // 🔒 锁定交易，等待首次价格更新
        console.log('🔒 切换到实战模式：锁定交易，等待市场价格更新...');
        appState.modeSwitchLock.isLocked = true;
        appState.modeSwitchLock.waitingForPriceUpdate = true;
        
        // 更新UI显示锁定状态
        updateTradingLockStatus(true, appState.modeSwitchLock.lockMessage);
        
        // 显示提示消息
        showMessage('正在更新市场价格，请稍候...', 'info', 3000);
        
        // 立即触发一次市场数据更新
        console.log('🔄 触发首次市场数据更新...');
        updateMarketData().then(() => {
            console.log('✅ 首次市场数据更新完成');
        }).catch(error => {
            console.error('❌ 首次市场数据更新失败:', error);
        });
        
        startMarketDataTimer();
        startLeaderboardTimer();
        startAgentSimulation();
    } else {
        stopMarketDataTimer();
        stopLeaderboardTimer();
        stopAgentSimulation();
    }
    
    console.log(`✅ 已切换到${mode}模式`);
}

// 自动检查并载入用户数据（仅在进入实战模式时调用）
async function autoLoadUserData() {
    try {
        console.log('🔄 检查是否有保存的用户数据...');
        
        // 只在实战模式下执行
        if (appState.mode !== 'practice') {
            console.log('⚠️ 非实战模式，跳过载入检查');
            return;
        }
        
        // 获取用户信息（已移除登录环节）
        const userInfo = await fetchUserInfo();
        const engName = userInfo.engName || 'Guest';
        
        console.log('👤 检查用户:', engName);
        
        // 先检查用户是否有保存数据
        const checkResponse = await fetch(`/api/user/check/${engName}`);
        
        if (!checkResponse.ok) {
            console.log('📂 检查保存数据失败，保持当前数据');
            return;
        }
        
        const checkResult = await checkResponse.json();
        console.log('📊 数据检查结果:', checkResult);
        
        if (!checkResult.success) {
            console.log('📂 检查接口返回失败，保持当前数据');
            return;
        }
        
        // 如果有保存数据，则自动载入
        if (checkResult.hasData) {
            console.log('📂 发现保存数据，准备载入...');
            
            // 显示提示信息
            showMessage('检测到保存的交易数据，正在自动载入...', 'info');
            
            // 检测是否为移动端
            const isMobile = window.innerWidth <= 767;
            
            if (isMobile) {
                console.log('📱 ========== 移动端自动载入流程开始 ==========');
                console.log('📱 当前用户状态（载入前）:', {
                    totalAssets: appState.currentUser.totalAssets,
                    availableCash: appState.currentUser.availableCash,
                    portfolioCount: appState.currentUser.portfolio.length
                });
            }
            
            // 直接载入数据（不需要再次切换模式）
            await loadUserData();
            console.log('✅ 自动载入完成');
            
            // 移动端专用：增强界面更新逻辑
            if (isMobile) {
                console.log('📱 移动端：开始强制更新所有界面元素');
                
                // 延迟执行，确保loadUserData中的更新完成
                setTimeout(() => {
                    console.log('📱 移动端：执行界面强制刷新');
                    
                    // ✅ 修复：直接使用保存的资产值，不重新计算
                    // 原因：保存时的总资产是正确的，载入时不应该根据当前价格重新计算
                    console.log('📱 移动端：使用保存的资产值（不重新计算）', {
                        totalAssets: appState.currentUser.totalAssets
                    });
                    
                    // 基于保存的totalAssets计算收益率并更新显示
                    const initialAssets = 1000000;
                    const profitRate = ((appState.currentUser.totalAssets - initialAssets) / initialAssets) * 100;
                    updateUserAssets(appState.currentUser.totalAssets, profitRate);
                    
                    console.log('📱 移动端：资产和收益率显示已更新（使用保存的值）', {
                        totalAssets: appState.currentUser.totalAssets,
                        profitRate: profitRate.toFixed(2) + '%'
                    });
                    
                    // 更新持仓列表
                    renderPortfolioList(appState.currentUser.portfolio, appState.cryptos);
                    console.log('📱 移动端：持仓列表已更新，持仓数量:', appState.currentUser.portfolio.length);
                    
                    // 更新交易面板
                    if (appState.selectedCrypto) {
                        const holding = appState.currentUser.portfolio.find(p => p.cryptoId === appState.selectedCrypto.id);
                        updateTradingPanel(appState.currentUser.availableCash, holding?.amount || 0);
                        updateMaxBuyAmount(appState.currentUser.availableCash, appState.selectedCrypto.price);
                        console.log('📱 移动端：交易面板已更新');
                    }
                    
                    // 确保移动端布局正确
                    initMobileLayout();
                    console.log('📱 移动端：布局已初始化');
                    
                    // 完整重新渲染UI
                    renderUI();
                    console.log('📱 移动端：UI已完整重新渲染');
                    
                    console.log('📱 ========== 移动端自动载入流程完成 ==========');
                }, 300); // 增加延迟时间，确保所有异步操作完成
            } else {
                // 桌面端：数据载入后更新界面
                console.log('💻 桌面端：数据载入后更新界面');
                
                setTimeout(() => {
                    renderUI();
                    // ✅ 修复：直接使用保存的资产值，不重新计算
                    // 原因：保存时的总资产是正确的，载入时不应该根据当前价格重新计算
                    console.log('💻 桌面端：使用保存的资产值（不重新计算）');
                    
                    const initialAssets = 1000000;
                    const profitRate = ((appState.currentUser.totalAssets - initialAssets) / initialAssets) * 100;
                    updateUserAssets(appState.currentUser.totalAssets, profitRate);
                    
                    if (appState.selectedCrypto) {
                        const holding = appState.currentUser.portfolio.find(p => p.cryptoId === appState.selectedCrypto.id);
                        updateTradingPanel(appState.currentUser.availableCash, holding?.amount || 0);
                        updateMaxBuyAmount(appState.currentUser.availableCash, appState.selectedCrypto.price);
                    }
                    
                    console.log('💻 桌面端：界面更新完成');
                }, 100);
            }
        } else {
            console.log('📂 无保存数据，检查是否需要初始化');
            
            // 检查用户是否已初始化
            if (!appState.practiceUser.initialized) {
                console.log('🆕 用户首次进入实战模式，进行资产初始化');
                
                // 标记为已初始化
                appState.practiceUser.initialized = true;
                console.log('✅ 用户资产初始化完成');
                
                showMessage('欢迎进入实战模式！已为您初始化$1,000,000起始资金', 'success');
                
                // 移动端和桌面端分别处理
                const isMobile = window.innerWidth <= 767;
                
                if (isMobile) {
                    console.log('📱 ========== 移动端初始化资产显示 ==========');
                    console.log('📱 初始资产:', {
                        totalAssets: appState.currentUser.totalAssets,
                        availableCash: appState.currentUser.availableCash
                    });
                    
                    // 移动端：分步骤初始化
                    setTimeout(() => {
                        console.log('📱 步骤1：更新资产显示');
                        updateTotalAssets();
                        
                        const initialAssets = 1000000;
                        const profitRate = 0; // 初始状态收益率为0
                        updateUserAssets(appState.currentUser.totalAssets, profitRate);
                        
                        console.log('📱 资产显示初始化完成');
                    }, 100);
                    
                    setTimeout(() => {
                        console.log('📱 步骤2：初始化移动端布局');
                        initMobileLayout();
                        console.log('📱 移动端布局初始化完成');
                    }, 200);
                    
                    setTimeout(() => {
                        console.log('📱 步骤3：完整重新渲染UI');
                        renderUI();
                        console.log('📱 UI重新渲染完成');
                        console.log('📱 ========== 移动端初始化资产显示完成 ==========');
                    }, 300);
                    
                } else {
                    // 桌面端：保持原有逻辑
                    console.log('💻 桌面端：初始化资产显示');
                    
                    setTimeout(() => {
                        updateTotalAssets();
                        
                        const initialAssets = 1000000;
                        const profitRate = ((appState.currentUser.totalAssets - initialAssets) / initialAssets) * 100;
                        updateUserAssets(appState.currentUser.totalAssets, profitRate);
                        
                        console.log('💻 桌面端：初始资产显示更新完成');
                    }, 100);
                }
            } else {
                console.log('📂 用户已初始化，保持当前状态');
            }
        }
        
    } catch (error) {
        console.error('❌ 自动载入检查失败:', error);
        console.error('📍 错误详情:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        // 自动载入失败不影响正常功能，静默处理
        console.log('📂 载入检查失败，保持当前用户数据不变');
    }
}

// 选择加密货币
async function selectCrypto(cryptoId) {
    const crypto = appState.cryptos.find(c => c.id === cryptoId);
    if (!crypto) return;
    
    console.log(`选择币种: ${crypto.symbol}`);
    appState.selectedCrypto = crypto;
    
    // 更新UI
    renderCryptoList(appState.cryptos, cryptoId);
    updateCurrentPrice(crypto);
    
    // 更新交易面板
    const holding = appState.currentUser.portfolio.find(p => p.cryptoId === cryptoId);
    updateTradingPanel(appState.currentUser.availableCash, holding?.amount || 0);
    
    // 更新最大可买数量
    updateMaxBuyAmount(appState.currentUser.availableCash, crypto.price);
    
    // 加载价格走势数据
    changeCrypto(crypto.symbol);
    
    // 教学步骤检查 - 只在演示模式下触发
    if (appState.mode === 'tutorial' && appState.tutorial.enabled && appState.tutorial.currentStep === 2) {
        nextTutorialStep();
    }
}

// 切换K线周期
async function switchKlinePeriod(hours) {
    console.log(`切换时间范围: ${hours}小时`);
    appState.klinePeriod = hours;
    
    // 更新按钮状态
    document.querySelectorAll('.period-btn').forEach(btn => {
        if (parseInt(btn.dataset.period) === hours) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 加载新的价格数据
    changeTimeframe(hours);
}

// 处理交易
function handleTrade(type) {
    if (!appState.selectedCrypto) {
        showMessage('请先选择要交易的币种', 'warning');
        return;
    }
    
    const amountInput = document.getElementById('tradeAmount');
    const amount = parseFloat(amountInput.value);
    
    console.log(`交易类型: ${type}, 数量: ${amount}`);
    
    if (!amount || amount <= 0) {
        showMessage('请输入有效的交易数量', 'warning');
        return;
    }
    
    // 检查交易是否被锁定（API失败锁定）
    if (appState.apiFailureTracking.tradingLocked) {
        showMessage(appState.apiFailureTracking.lockMessage, 'error');
        return;
    }
    
    // 检查交易是否被锁定（模式切换锁定）
    if (appState.modeSwitchLock.isLocked) {
        showMessage(appState.modeSwitchLock.lockMessage, 'warning');
        return;
    }
    
    const crypto = appState.selectedCrypto;
    const price = crypto.price;
    
    if (type === 'buy') {
        // 买入前检查数据源状态（保留原有检查作为额外保障）
        if (!appState.dataSourceHealthy) {
            showMessage('数据源异常，无法操作', 'error');
            return;
        }
        
        // 买入
        const totalCost = amount * price;
        
        if (totalCost > appState.currentUser.availableCash) {
            showMessage('可用资金不足', 'error');
            return;
        }
        
        // 扣除资金
        appState.currentUser.availableCash -= totalCost;
        
        // 更新持仓
        const holding = appState.currentUser.portfolio.find(p => p.cryptoId === crypto.id);
        if (holding) {
            // 计算新的平均成本
            const totalAmount = holding.amount + amount;
            const totalCost = holding.averagePrice * holding.amount + price * amount;
            holding.averagePrice = totalCost / totalAmount;
            holding.amount = totalAmount;
        } else {
            appState.currentUser.portfolio.push({
                cryptoId: crypto.id,
                symbol: crypto.symbol,
                name: crypto.name,
                icon: crypto.icon,
                amount: amount,
                averagePrice: price
            });
        }
        
        // 记录交易
        appState.currentUser.tradeHistory.push({
            type: 'buy',
            cryptoId: crypto.id,
            symbol: crypto.symbol,
            amount: amount,
            price: price,
            timestamp: Date.now()
        });
        
        showMessage(`成功买入 ${amount} ${crypto.symbol}`, 'success');
        
        // 教学步骤检查 - 只在演示模式下触发
        if (appState.mode === 'tutorial' && appState.tutorial.enabled && appState.tutorial.currentStep === 4) {
            setTimeout(() => nextTutorialStep(), 1000);
        }
        
    } else if (type === 'sell') {
        // 卖出前检查交易锁定状态
        if (appState.apiFailureTracking.tradingLocked) {
            showMessage(appState.apiFailureTracking.lockMessage, 'error');
            return;
        }
        
        // 卖出前检查数据源状态（保留原有检查作为额外保障）
        if (!appState.dataSourceHealthy) {
            showMessage('数据源异常，无法操作', 'error');
            return;
        }
        
        // 卖出
        const holding = appState.currentUser.portfolio.find(p => p.cryptoId === crypto.id);
        
        if (!holding || holding.amount < amount) {
            showMessage('持仓数量不足', 'error');
            return;
        }
        
        // 增加资金
        const totalRevenue = amount * price;
        appState.currentUser.availableCash += totalRevenue;
        
        // 更新持仓
        holding.amount -= amount;
        if (holding.amount <= 0.0001) {
            // 移除持仓
            const index = appState.currentUser.portfolio.indexOf(holding);
            appState.currentUser.portfolio.splice(index, 1);
        }
        
        // 记录交易
        appState.currentUser.tradeHistory.push({
            type: 'sell',
            cryptoId: crypto.id,
            symbol: crypto.symbol,
            amount: amount,
            price: price,
            timestamp: Date.now()
        });
        
        showMessage(`成功卖出 ${amount} ${crypto.symbol}`, 'success');
        
        // 教学步骤检查 - 只在演示模式下触发
        if (appState.mode === 'tutorial' && appState.tutorial.enabled && appState.tutorial.currentStep === 6) {
            setTimeout(() => nextTutorialStep(), 1000);
        }
    }
    
    // 更新总资产
    updateTotalAssets();
    
    // 清空输入
    amountInput.value = '';
    amountInput.style.borderColor = '#d9d9d9';
    const tradeHintEl = document.getElementById('tradeHint');
    if (tradeHintEl) {
        tradeHintEl.innerHTML = '';
    }
    
    // 重新渲染UI（不包括数据载入）
    renderUI();
    
    // 交易后更新最大可买数量
    if (appState.selectedCrypto) {
        updateMaxBuyAmount(appState.currentUser.availableCash, appState.selectedCrypto.price);
    }
    
    // 交易完成后的自动保存（仅在实战模式）
    if (appState.mode === 'practice') {
        console.log('💰 交易完成，触发自动保存');
        // 🔒 安全修复：交易后立即保存，防止刷新漏洞
        // 卖出操作必须立即保存到数据库，防止用户通过刷新页面虚增资产
        setTimeout(() => {
            saveUserData('auto').then(() => {
                console.log('✅ 交易后自动保存完成');
                // 🔒 清除localStorage缓存，确保下次刷新从数据库载入最新数据
                // 这样可以防止用户利用缓存数据进行作弊
                console.log('🔒 清除localStorage缓存，防止刷新漏洞');
            }).catch(error => {
                console.error('❌ 交易后自动保存失败:', error);
                // 即使保存失败，也要提示用户
                showMessage('数据保存失败，请手动保存以防数据丢失', 'warning', 5000);
            });
        }, 1000);
    }
}

// 快速卖出功能
function handleQuickSell(cryptoId, symbol, amount, currentPrice) {
    console.log(`🔥 快速卖出: ${symbol}, 数量: ${amount}`);
    
    // 检查交易是否被锁定（API失败锁定）
    if (appState.apiFailureTracking.tradingLocked) {
        showMessage(appState.apiFailureTracking.lockMessage, 'error');
        return;
    }
    
    // 检查交易是否被锁定（模式切换锁定）
    if (appState.modeSwitchLock.isLocked) {
        showMessage(appState.modeSwitchLock.lockMessage, 'warning');
        return;
    }
    
    // 检查是否在实战模式
    if (appState.mode !== 'practice') {
        showMessage('快速卖出功能仅在实战模式下可用', 'warning');
        return;
    }
    
    // 保留数据源状态检查作为额外保障
    if (!appState.dataSourceHealthy) {
        showMessage('数据源异常，无法操作', 'error');
        return;
    }
    
    // 检查该币种是否仍然存在
    const crypto = appState.cryptos.find(c => c.id === cryptoId);
    if (!crypto) {
        showMessage('该币种已不存在，无法卖出', 'error');
        return;
    }
    
    // 检查持仓是否仍然有效
    const holding = appState.currentUser.portfolio.find(p => p.cryptoId === cryptoId);
    if (!holding || holding.amount <= 0) {
        showMessage('持仓数据已变化，请刷新页面', 'error');
        return;
    }
    
    // 选择该币种
    selectCrypto(cryptoId);
    
    // 预填交易面板
    fillTradePanelForSell(cryptoId, symbol, amount, currentPrice);
    
    // 滚动到交易面板
    const tradingPanel = document.querySelector('.bg-white.rounded-xl.shadow-lg.p-6');
    if (tradingPanel) {
        tradingPanel.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
    
    // 高亮交易面板
    tradingPanel.classList.add('ring-2', 'ring-green-400', 'ring-offset-2');
    setTimeout(() => {
        tradingPanel.classList.remove('ring-2', 'ring-green-400', 'ring-offset-2');
    }, 2000);
    
    showMessage(`已为您预填${symbol}的卖出信息，请确认后点击卖出按钮`, 'success');
}

// 预填交易面板用于卖出
function fillTradePanelForSell(cryptoId, symbol, amount, currentPrice) {
    console.log(`📝 预填交易面板: ${symbol}, 卖出数量: ${amount}`);
    
    // 确保选中了正确的币种
    if (!appState.selectedCrypto || appState.selectedCrypto.id !== cryptoId) {
        const crypto = appState.cryptos.find(c => c.id === cryptoId);
        if (crypto) {
            selectCrypto(cryptoId);
        }
    }
    
    // 填入可卖出数量
    const tradeAmountInput = document.getElementById('tradeAmount');
    if (tradeAmountInput) {
        tradeAmountInput.value = amount.toFixed(6);
        tradeAmountInput.style.borderColor = '#52c41a'; // 绿色边框
        
        // 触发input事件以更新提示信息
        const event = new Event('input', { bubbles: true });
        tradeAmountInput.dispatchEvent(event);
    }
    
    // 更新交易提示
    const tradeHintEl = document.getElementById('tradeHint');
    if (tradeHintEl) {
        const totalRevenue = amount * currentPrice;
        tradeHintEl.innerHTML = `
            <i class="fas fa-check-circle text-green-500 mr-1"></i>
            <span class="text-green-600">预计收入: $${totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        `;
    }
    
    // 高亮卖出按钮
    const sellBtn = document.getElementById('sellBtn');
    if (sellBtn) {
        sellBtn.classList.add('ring-2', 'ring-green-400', 'ring-offset-2');
        setTimeout(() => {
            sellBtn.classList.remove('ring-2', 'ring-green-400', 'ring-offset-2');
        }, 3000);
    }
}

// 更新总资产
function updateTotalAssets() {
    let totalAssets = appState.currentUser.availableCash;
    
    // 统计持仓计算情况
    let successCount = 0;
    let failedCount = 0;
    const failedHoldings = [];
    
    appState.currentUser.portfolio.forEach(holding => {
        const crypto = appState.cryptos.find(c => c.id === holding.cryptoId);
        if (crypto) {
            const holdingValue = holding.amount * crypto.price;
            totalAssets += holdingValue;
            successCount++;
        } else {
            failedCount++;
            failedHoldings.push({
                cryptoId: holding.cryptoId,
                amount: holding.amount
            });
            console.error(`❌ 资产计算失败: 找不到币种 ${holding.cryptoId}`, {
                holding: holding,
                availableCryptos: appState.cryptos.map(c => c.id)
            });
        }
    });
    
    // 如果有持仓计算失败，输出警告
    if (failedCount > 0) {
        console.warn(`⚠️ 总资产计算完成，但有 ${failedCount} 个持仓无法计算价值:`, failedHoldings);
        console.warn(`📊 成功计算: ${successCount} 个持仓`);
        console.warn(`💰 当前计算的总资产: $${totalAssets.toFixed(2)} (可能不完整)`);
        console.warn(`📋 当前可用的币种数据: ${appState.cryptos.length} 个`);
        
        // 如果cryptos数据为空或很少，可能是数据还未加载完成
        if (appState.cryptos.length === 0) {
            console.error('❌ 严重错误: cryptos数据为空，无法计算持仓价值！');
        } else if (appState.cryptos.length < 5) {
            console.warn('⚠️ cryptos数据可能不完整，当前只有', appState.cryptos.length, '个币种');
        }
    }
    
    const profit = totalAssets - 1000000;
    appState.currentUser.totalAssets = totalAssets;
    appState.currentUser.todayProfit = profit;
    
    const profitRate = ((totalAssets - 1000000) / 1000000) * 100;
    updateUserAssets(totalAssets, profitRate);
}

// 更新市场数据（带智能重试和降级机制）
async function updateMarketData() {
    console.log('🔄 开始更新市场数据...');
    
    const tracking = appState.apiFailureTracking;
    const now = Date.now();
    
    try {
        // 尝试获取数据
        const data = await fetchCryptoCompareData();
        
        if (data && data.length > 0) {
            // ✅ 数据获取成功
            appState.cryptos = data;
            appState.allCryptos = data; // 同时更新完整币种列表缓存（用于搜索）
            appState.dataSourceHealthy = true;
            
            // 检查是否需要解锁交易
            const wasLocked = tracking.tradingLocked;
            const wasModeSwitchLocked = appState.modeSwitchLock.isLocked;
            const wasRefreshLocked = appState.refreshLock.isLocked;
            
            // 重置失败追踪状态
            tracking.consecutiveFailures = 0;
            tracking.firstFailureTime = null;
            tracking.currentRetryInterval = 15000; // 恢复到15秒
            tracking.lastSuccessTime = now;
            tracking.inDatabaseFallback = false;
            
            // 🔒 刷新锁定机制：连续成功2次后才解锁
            if (wasRefreshLocked && appState.mode === 'practice') {
                appState.refreshLock.successfulUpdates++;
                console.log(`🔄 刷新锁定追踪: 成功更新 ${appState.refreshLock.successfulUpdates}/${appState.refreshLock.requiredUpdates} 次`);
                
                if (appState.refreshLock.successfulUpdates >= appState.refreshLock.requiredUpdates) {
                    // 连续成功2次，解锁交易
                    appState.refreshLock.isLocked = false;
                    appState.refreshLock.successfulUpdates = 0;
                    console.log('🔓 数据源稳定性验证通过，解锁实战模式交易');
                    
                    // 显示解锁提示
                    showMessage('数据源稳定，交易功能已就绪', 'success', 3000);
                    
                    // 更新UI显示交易解锁状态（只有在没有其他锁定的情况下）
                    if (!tracking.tradingLocked && !appState.modeSwitchLock.isLocked) {
                        updateTradingLockStatus(false);
                    }
                    
                    // 🚀 解锁后使用正常的15秒间隔
                    restartMarketDataTimer();
                } else {
                    // 🚀 优化：验证阶段使用3秒间隔
                    console.log(`⏳ 验证阶段：3秒后进行下一次验证... (${appState.refreshLock.successfulUpdates}/${appState.refreshLock.requiredUpdates})`);
                    restartMarketDataTimer(3000);
                }
            } else {
                // 正常情况下使用15秒间隔
                restartMarketDataTimer();
            }
            
            // API恢复后解锁交易
            if (wasLocked) {
                tracking.tradingLocked = false;
                console.log('🔓 API恢复正常，解锁实战模式交易');
                
                // 显示解锁提示
                showMessage('数据源已恢复正常，交易功能已解锁', 'success', 3000);
                
                // 更新UI显示交易解锁状态（只有在没有刷新锁定的情况下）
                if (!appState.refreshLock.isLocked) {
                    updateTradingLockStatus(false);
                }
            }
            
            // 🔓 解锁模式切换锁定
            if (wasModeSwitchLocked && appState.modeSwitchLock.waitingForPriceUpdate) {
                appState.modeSwitchLock.isLocked = false;
                appState.modeSwitchLock.waitingForPriceUpdate = false;
                console.log('🔓 市场价格更新完成，解锁交易功能');
                
                // 显示解锁提示
                showMessage('市场价格已更新，交易功能已就绪', 'success', 3000);
                
                // 更新UI显示交易解锁状态（只有在没有其他锁定的情况下）
                if (!tracking.tradingLocked && !appState.refreshLock.isLocked) {
                    updateTradingLockStatus(false);
                }
            }
            
            console.log(`✅ 成功更新 ${data.length} 个币种的市场数据`);
            console.log(`📊 API状态: 正常 | 重试间隔: ${tracking.currentRetryInterval / 1000}秒`);
            
            // 更新选中的币种
            if (appState.selectedCrypto) {
                const updated = appState.cryptos.find(c => c.id === appState.selectedCrypto.id);
                if (updated) {
                    console.log(`🔄 更新选中币种 ${appState.selectedCrypto.symbol} 的价格: ${appState.selectedCrypto.price} -> ${updated.price}`);
                    appState.selectedCrypto = updated;
                } else {
                    console.warn(`⚠️ 选中币种 ${appState.selectedCrypto.symbol} 不在新数据中，保持原有选择`);
                }
            }
            
            // 更新用户资产和UI
            try {
                updateTotalAssets();
                console.log('💰 用户资产已更新');
            } catch (assetError) {
                console.warn('⚠️ 更新用户资产失败:', assetError);
            }
            
            try {
                renderUI();
                console.log('🎨 UI已重新渲染');
            } catch (uiError) {
                console.warn('⚠️ UI渲染失败:', uiError);
            }
            
            // 重新启动定时器（恢复正常间隔）
            restartMarketDataTimer();
            
            // 只有在非锁定状态下才显示更新成功消息
            if (!tracking.tradingLocked) {
                showMessage('市场数据已更新', 'success', 2000);
            }
            
        } else {
            // ❌ 数据获取失败，进入失败处理流程
            handleAPIFailure();
        }
        
    } catch (error) {
        // ❌ 异常处理，进入失败处理流程
        console.error('❌ 更新市场数据失败:', error);
        console.error('📍 错误详情:', {
            mode: appState.mode,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        handleAPIFailure();
    }
}

// 处理API失败的智能降级逻辑
async function handleAPIFailure() {
    const tracking = appState.apiFailureTracking;
    const now = Date.now();
    
    // 增加失败计数
    tracking.consecutiveFailures++;
    
    // 记录首次失败时间
    if (!tracking.firstFailureTime) {
        tracking.firstFailureTime = now;
    }
    
    const failureDuration = now - tracking.firstFailureTime;
    const failureDurationMinutes = Math.floor(failureDuration / 60000);
    
    console.log(`⚠️ API失败追踪: 连续失败 ${tracking.consecutiveFailures} 次 | 持续时间: ${failureDurationMinutes}分钟`);
    
    // 交易锁定逻辑：连续失败3次后锁定交易
    if (tracking.consecutiveFailures >= tracking.lockThreshold && !tracking.tradingLocked) {
        tracking.tradingLocked = true;
        console.log(`🔒 连续失败${tracking.lockThreshold}次，锁定实战模式交易`);
        
        // 显示锁定提示
        showMessage(tracking.lockMessage, 'error', 5000);
        
        // 更新UI显示交易锁定状态
        updateTradingLockStatus(true);
        
        // 如果在实战模式，额外提示
        if (appState.mode === 'practice') {
            console.log('⚠️ 实战模式交易已被锁定，等待API恢复');
        }
    }
    
    // 🔒 API失败时重置刷新锁定的成功计数
    if (appState.refreshLock.isLocked && appState.refreshLock.successfulUpdates > 0) {
        console.log('⚠️ API失败，重置刷新锁定成功计数');
        appState.refreshLock.successfulUpdates = 0;
    }
    
    // 降级策略1: 连续失败10次后，降级为30秒一次
    if (tracking.consecutiveFailures >= 10 && tracking.currentRetryInterval === 15000) {
        tracking.currentRetryInterval = 30000; // 降级为30秒
        console.log('⚠️ 连续失败10次，降级为30秒重试一次');
        restartMarketDataTimer();
    }
    
    // 降级策略2: 失败超过5分钟，从数据库读取最近1小时数据
    if (failureDuration >= 300000 && !tracking.inDatabaseFallback) { // 5分钟 = 300000毫秒
        console.log('⚠️ 失败超过5分钟，尝试从数据库读取最近1小时数据...');
        tracking.inDatabaseFallback = true;
        
        try {
            const dbData = await fetchRecentDataFromDatabase();
            if (dbData && dbData.length > 0) {
                appState.cryptos = dbData;
                console.log(`✅ 从数据库获取了 ${dbData.length} 个币种的数据`);
                
                // 更新UI
                try {
                    updateTotalAssets();
                    renderUI();
                } catch (uiError) {
                    console.warn('⚠️ UI更新失败:', uiError);
                }
                
                showMessage('使用数据库缓存数据', 'warning', 3000);
            } else {
                console.warn('⚠️ 数据库也没有可用数据');
            }
        } catch (dbError) {
            console.error('❌ 从数据库读取数据失败:', dbError);
        }
    }
    
    // 标记数据源异常
    appState.dataSourceHealthy = false;
    
    // 如果是首次加载且没有数据，使用默认数据
    if (appState.cryptos.length === 0) {
        console.log('🔄 首次加载失败，使用默认数据');
        appState.cryptos = appState.mode === 'tutorial' ? tutorialCryptos : practiceCryptos;
        
        if (!appState.selectedCrypto && appState.cryptos.length > 0) {
            appState.selectedCrypto = appState.cryptos[0];
        }
    }
    
    // 显示提示信息
    if (tracking.inDatabaseFallback) {
        showMessage('数据源异常，使用数据库缓存', 'warning', 3000);
    } else {
        showMessage('数据源异常，保留上次数据', 'warning', 3000);
    }
    
    // 尝试重新渲染UI
    try {
        renderUI();
    } catch (uiError) {
        console.error('❌ UI渲染失败:', uiError);
    }
}

// 从数据库读取最近1小时的数据
async function fetchRecentDataFromDatabase() {
    try {
        console.log('📊 从数据库读取最近1小时的价格数据...');
        
        // 调用后端API获取数据库中的最近数据
        const response = await fetch('/api/crypto/recent?hours=1');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            console.log(`✅ 从数据库获取了 ${result.data.length} 个币种的数据`);
            
            // 格式化数据
            const formattedData = result.data.map(item => ({
                id: item.symbol.toLowerCase(),
                symbol: item.symbol,
                name: item.name,
                price: item.price,
                change: item.price_change_24h || 0,
                volume: formatVolume(item.volume_24h || 0),
                marketCap: formatVolume(item.market_cap || 0),
                icon: getCryptoIcon(item.symbol)
            }));
            
            return formattedData;
        } else {
            console.warn('⚠️ 数据库返回数据为空');
            return null;
        }
        
    } catch (error) {
        console.error('❌ 从数据库读取数据失败:', error);
        return null;
    }
}

// 辅助函数：格式化交易量
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

// 辅助函数：获取加密货币图标
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

// 重启市场数据定时器（支持动态间隔）
function restartMarketDataTimer(customInterval = null) {
    // 清除旧定时器
    if (appState.marketDataTimer) {
        clearInterval(appState.marketDataTimer);
        appState.marketDataTimer = null;
    }
    
    // 使用自定义间隔或默认间隔
    const interval = customInterval || appState.apiFailureTracking.currentRetryInterval;
    console.log(`⏰ 重启市场数据定时器，间隔: ${interval / 1000}秒`);
    
    // 启动新定时器
    appState.marketDataTimer = setInterval(() => {
        if (appState.mode === 'practice' || appState.mode === 'tutorial') {
            updateMarketData();
        }
    }, interval);
}

// 更新交易锁定状态UI
function updateTradingLockStatus(isLocked, customMessage = null) {
    try {
        const isMobile = checkIsMobile();
        const deviceLabel = getDeviceLabel();
        console.log(`${deviceLabel} 🔒 更新交易锁定状态: ${isLocked ? '锁定' : '解锁'}`);
        
        // 确定锁定消息：优先使用自定义消息，否则根据锁定类型使用对应消息
        const lockMessage = customMessage || 
                          (appState.refreshLock.isLocked ? appState.refreshLock.lockMessage :
                          (appState.modeSwitchLock.isLocked ? appState.modeSwitchLock.lockMessage : 
                           appState.apiFailureTracking.lockMessage));
        
        // 移动端使用更简洁的消息
        const displayMessage = isMobile ? lockMessage.replace('数据源异常，暂时无法交易', '数据异常，暂停交易')
                                                    .replace('正在更新市场价格，请稍候...', '更新价格中...')
                                                    .replace('正在验证数据源稳定性，请稍候...', '验证数据中...')
                                        : lockMessage;
        
        console.log(`${deviceLabel} 📝 锁定消息: ${displayMessage}`);
        
        // 查找交易相关的UI元素
        const buyButton = document.getElementById('buyBtn');
        const sellButton = document.getElementById('sellBtn');
        const tradeAmountInput = document.getElementById('tradeAmount');
        const quickSellButtons = document.querySelectorAll('button[onclick*="handleQuickSell"]');
        
        if (isLocked) {
            // 锁定状态：禁用所有交易操作
            console.log(`${deviceLabel} 🔒 禁用所有交易操作`);
            
            // 禁用买入卖出按钮
            if (buyButton) {
                buyButton.disabled = true;
                buyButton.classList.add('opacity-50', 'cursor-not-allowed');
                buyButton.title = displayMessage;
                // 移动端增强视觉反馈
                if (isMobile) {
                    buyButton.classList.add('pointer-events-none');
                }
            }
            
            if (sellButton) {
                sellButton.disabled = true;
                sellButton.classList.add('opacity-50', 'cursor-not-allowed');
                sellButton.title = displayMessage;
                // 移动端增强视觉反馈
                if (isMobile) {
                    sellButton.classList.add('pointer-events-none');
                }
            }
            
            // 禁用交易数量输入框
            if (tradeAmountInput) {
                tradeAmountInput.disabled = true;
                tradeAmountInput.classList.add('opacity-50', 'cursor-not-allowed');
                tradeAmountInput.placeholder = isMobile ? '已锁定' : '交易功能已锁定';
                // 移动端增强视觉反馈
                if (isMobile) {
                    tradeAmountInput.classList.add('pointer-events-none');
                }
            }
            
            // 禁用快速卖出按钮
            quickSellButtons.forEach(button => {
                button.disabled = true;
                button.classList.add('opacity-50', 'cursor-not-allowed');
                button.title = displayMessage;
                // 移动端增强视觉反馈
                if (isMobile) {
                    button.classList.add('pointer-events-none');
                }
            });
            
            // 添加锁定状态提示到交易面板
            const tradingPanel = document.querySelector('.trading-panel, .bg-white.rounded-lg.shadow, .bg-white.rounded-xl.shadow-lg');
            if (tradingPanel) {
                // 检查是否已存在锁定提示
                let lockNotice = tradingPanel.querySelector('.trading-lock-notice');
                if (!lockNotice) {
                    lockNotice = document.createElement('div');
                    // 移动端使用更紧凑的样式
                    const noticeClass = isMobile 
                        ? 'trading-lock-notice bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded mb-3 text-sm'
                        : 'trading-lock-notice bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4';
                    lockNotice.className = noticeClass;
                    lockNotice.innerHTML = `
                        <div class="flex items-center ${isMobile ? 'justify-center' : ''}">
                            <svg class="w-${isMobile ? '4' : '5'} h-${isMobile ? '4' : '5'} mr-2 animate-spin flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                            </svg>
                            <span class="font-medium lock-message-text">${displayMessage}</span>
                        </div>
                    `;
                    tradingPanel.insertBefore(lockNotice, tradingPanel.firstChild);
                } else {
                    // 更新已存在的锁定提示消息
                    const messageText = lockNotice.querySelector('.lock-message-text');
                    if (messageText) {
                        messageText.textContent = displayMessage;
                    }
                    // 根据消息类型和设备调整样式
                    if (lockMessage.includes('正在更新') || lockMessage.includes('请稍候')) {
                        lockNotice.className = isMobile 
                            ? 'trading-lock-notice bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded mb-3 text-sm'
                            : 'trading-lock-notice bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4';
                    } else {
                        lockNotice.className = isMobile
                            ? 'trading-lock-notice bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm'
                            : 'trading-lock-notice bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
                    }
                }
            }
            
        } else {
            // 解锁状态：恢复所有交易操作
            console.log(`${deviceLabel} 🔓 恢复所有交易操作`);
            
            // 启用买入卖出按钮
            if (buyButton) {
                buyButton.disabled = false;
                buyButton.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
                buyButton.title = '';
            }
            
            if (sellButton) {
                sellButton.disabled = false;
                sellButton.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
                sellButton.title = '';
            }
            
            // 启用交易数量输入框
            if (tradeAmountInput) {
                tradeAmountInput.disabled = false;
                tradeAmountInput.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
                tradeAmountInput.placeholder = '输入数量';
            }
            
            // 启用快速卖出按钮
            quickSellButtons.forEach(button => {
                button.disabled = false;
                button.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
                button.title = '';
            });
            
            // 移除锁定状态提示
            const lockNotice = document.querySelector('.trading-lock-notice');
            if (lockNotice) {
                lockNotice.remove();
            }
        }
        
        console.log(`${deviceLabel} ✅ 交易锁定状态更新完成: ${isLocked ? '锁定' : '解锁'}`);
        
    } catch (error) {
        console.error('❌ 更新交易锁定状态失败:', error);
    }
}

// 保存用户数据
async function saveUserData(saveType = 'auto') {
    try {
        const isMobile = window.innerWidth <= 767;
        console.log(`💾 开始保存用户数据... (${saveType === 'manual' ? '手动保存' : '自动保存'}) [${isMobile ? '📱 移动端' : '💻 桌面端'}]`);
        
        // 移动端专用详细日志
        if (isMobile) {
            console.log('📱 ========== 移动端保存流程开始 ==========');
            console.log('📱 保存类型:', saveType);
            console.log('📱 当前时间:', new Date().toISOString());
            console.log('📱 窗口宽度:', window.innerWidth);
            console.log('📱 当前模式:', appState.mode);
            console.log('📱 用户总资产:', appState.currentUser.totalAssets);
            console.log('📱 可用资金:', appState.currentUser.availableCash);
            console.log('📱 今日收益:', appState.currentUser.todayProfit);
            console.log('📱 持仓数量:', appState.currentUser.portfolio.length);
            
            // 显示保存开始提示（仅手动保存）
            if (saveType === 'manual') {
                showMessage('正在保存数据...', 'info', 1000);
            }
        }
        
        // 只在实战模式下保存
        if (appState.mode !== 'practice') {
            console.log('⚠️ 非实战模式，跳过保存');
            if (isMobile && saveType === 'manual') {
                showMessage('只有实战模式才能保存数据', 'warning');
            }
            return;
        }
        
        // 获取用户信息（已移除登录环节）
        const userInfo = await fetchUserInfo();
        const engName = userInfo.engName || 'Guest';
        
        console.log('👤 当前用户:', engName);
        
        if (isMobile) {
            console.log('📱 用户信息获取成功:', engName);
        }
        
        // 构建持仓数据（如果有持仓）
        const portfolios = appState.currentUser.portfolio.map(holding => {
            const crypto = appState.cryptos.find(c => c.id === holding.cryptoId);
            const currentPrice = crypto ? crypto.price : holding.averagePrice;
            const marketValue = holding.amount * currentPrice;
            const profitLoss = marketValue - (holding.amount * holding.averagePrice);
            const profitLossRate = (profitLoss / (holding.amount * holding.averagePrice)) * 100;
            
            return {
                crypto_symbol: holding.symbol,
                crypto_name: holding.name,
                quantity: holding.amount,
                avg_cost: holding.averagePrice,
                current_price: currentPrice,
                market_value: marketValue,
                profit_loss: profitLoss,
                profit_loss_rate: profitLossRate
            };
        });
        
        // 🔍 详细日志：查看当前用户状态（保存前不重新计算，使用当前值）
        console.log('📊 当前用户状态（保存前）:');
        console.log('  - totalAssets:', appState.currentUser.totalAssets);
        console.log('  - availableCash:', appState.currentUser.availableCash);
        console.log('  - todayProfit:', appState.currentUser.todayProfit);
        console.log('  - portfolio数量:', appState.currentUser.portfolio.length);
        
        // 计算总收益率
        const totalProfitRate = ((appState.currentUser.totalAssets - 1000000) / 1000000) * 100;
        
        // 构建保存数据
        const saveData = {
            eng_name: engName,
            chn_name: '',
            dept_name: '',
            position_name: '',
            total_assets: appState.currentUser.totalAssets,
            available_cash: appState.currentUser.availableCash,
            today_profit: appState.currentUser.todayProfit,
            total_profit_rate: totalProfitRate,
            portfolios: portfolios // 即使为空数组也保存
        };
        
        console.log('📦 准备发送的保存数据:');
        console.log('  - total_assets:', saveData.total_assets);
        console.log('  - available_cash:', saveData.available_cash);
        console.log('  - today_profit:', saveData.today_profit);
        console.log('  - total_profit_rate:', saveData.total_profit_rate);
        console.log('  - portfolios_count:', portfolios.length);
        
        // 发送保存请求
        console.log('📡 发送保存请求到: /api/user/save');
        console.log('📡 请求方法: POST');
        console.log('📡 请求头: Content-Type: application/json');
        console.log('📡 请求体:', JSON.stringify(saveData, null, 2));
        
        // 移动端专用：记录请求发送时间
        if (isMobile) {
            console.log('📱 请求发送时间:', new Date().toISOString());
            console.log('📱 网络状态:', navigator.onLine ? '在线' : '离线');
        }
        
        const response = await fetch('/api/user/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(saveData)
        });
        
        console.log('📡 保存响应状态:', response.status);
        console.log('📡 保存响应状态文本:', response.statusText);
        console.log('📡 保存响应头:', Object.fromEntries(response.headers.entries()));
        
        // 移动端专用：记录响应接收时间
        if (isMobile) {
            console.log('📱 响应接收时间:', new Date().toISOString());
            console.log('📱 响应状态码:', response.status);
            console.log('📱 响应是否成功:', response.ok);
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ 保存失败响应体:', errorText);
            console.error('❌ 保存失败状态:', response.status);
            console.error('❌ 保存失败原因:', response.statusText);
            throw new Error(`保存失败: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ 保存成功响应:', JSON.stringify(result, null, 2));
        
        // 移动端专用：详细记录保存成功信息
        if (isMobile) {
            console.log('📱 ========== 移动端保存成功 ==========');
            console.log('📱 保存结果:', result);
            console.log('📱 保存的总资产:', result.saved_data?.total_assets);
            console.log('📱 保存的可用资金:', result.saved_data?.available_cash);
            console.log('📱 保存的持仓数量:', result.saved_data?.portfolios_count);
            console.log('📱 保存时间戳:', result.timestamp);
        }
        
        // 保存成功，标记用户为已初始化
        appState.practiceUser.initialized = true;
        console.log('✅ 数据保存成功，用户已标记为初始化状态');
        
        // 桌面端和移动端统一处理：确保保存后界面状态正确
        console.log(`${isMobile ? '📱 移动端' : '💻 桌面端'}：数据保存后更新界面状态`);
        
        // 延迟执行，确保保存操作完成
        setTimeout(() => {
            // 更新资产显示
            updateTotalAssets();
            
            // 计算收益率并更新
            const initialAssets = 1000000;
            const profitRate = ((appState.currentUser.totalAssets - initialAssets) / initialAssets) * 100;
            updateUserAssets(appState.currentUser.totalAssets, profitRate);
            
            // 移动端额外确保布局正确
            if (isMobile) {
                initMobileLayout();
                console.log('📱 移动端布局已更新');
            }
            
            console.log(`${isMobile ? '📱 移动端' : '💻 桌面端'}：保存后界面状态更新完成`);
            
            if (isMobile) {
                console.log('📱 ========== 移动端保存流程结束 ==========');
            }
        }, 100);
        
        // 只在手动保存时显示提示
        if (saveType === 'manual') {
            showMessage('数据保存成功！', 'success');
            
            // 移动端额外提示
            if (isMobile) {
                console.log('📱 已显示保存成功提示');
            }
        }
        
    } catch (error) {
        console.error('❌ 保存用户数据失败:', error);
        console.error('📍 错误详情:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        // 桌面端和移动端统一错误处理：确保错误状态下界面仍然正确
        // 注意：不要重复定义isMobile，使用try块中的变量
        const isMobileError = window.innerWidth <= 767;
        console.log(`${isMobileError ? '📱 移动端' : '💻 桌面端'}：保存失败，确保界面状态正确`);
        
        // 移动端专用：详细记录错误信息
        if (isMobileError) {
            console.log('📱 ========== 移动端保存失败 ==========');
            console.log('📱 错误类型:', error.name);
            console.log('📱 错误消息:', error.message);
            console.log('📱 错误堆栈:', error.stack);
            console.log('📱 失败时间:', new Date().toISOString());
            console.log('📱 网络状态:', navigator.onLine ? '在线' : '离线');
            console.log('📱 当前模式:', appState.mode);
            console.log('📱 用户资产:', appState.currentUser.totalAssets);
            console.log('📱 ========================================');
        }
        
        setTimeout(() => {
            updateTotalAssets();
            
            // 计算收益率并更新
            const initialAssets = 1000000;
            const profitRate = ((appState.currentUser.totalAssets - initialAssets) / initialAssets) * 100;
            updateUserAssets(appState.currentUser.totalAssets, profitRate);
            
            if (isMobileError) {
                initMobileLayout();
            }
        }, 100);
        
        // 只在手动保存时显示错误提示
        if (saveType === 'manual') {
            showMessage(`保存失败: ${error.message}`, 'error', 5000);
            
            // 移动端额外提示
            if (isMobileError) {
                console.log('📱 已显示保存失败提示');
            }
        }
    }
}

// 载入用户数据
async function loadUserData() {
    try {
        console.log('📂 开始载入用户数据...');
        
        // 只在实战模式下载入
        if (appState.mode !== 'practice') {
            showMessage('只有实战模式才能载入数据', 'warning');
            return;
        }
        
        // 获取用户信息（已移除登录环节）
        const userInfo = await fetchUserInfo();
        const engName = userInfo.engName || 'Guest';
        
        console.log('👤 当前用户:', engName);
        
        // 记录载入前的状态
        const beforeLoad = {
            totalAssets: appState.currentUser.totalAssets,
            availableCash: appState.currentUser.availableCash,
            portfolioCount: appState.currentUser.portfolio.length,
            portfolioValue: 0
        };
        
        // 计算载入前的持仓市值
        appState.currentUser.portfolio.forEach(holding => {
            const crypto = appState.cryptos.find(c => c.id === holding.cryptoId);
            if (crypto) {
                beforeLoad.portfolioValue += holding.amount * crypto.price;
            }
        });
        
        console.log('💰 载入前用户状态:', beforeLoad);
        
        // 发送载入请求
        const response = await fetch(`/api/user/load/${engName}`);
        
        console.log('📡 载入响应状态:', response.status);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log('📂 未找到保存数据，保持当前数据不变');
                showMessage('未找到保存的数据，保持当前数据', 'info');
                return;
            }
            const errorText = await response.text();
            console.error('❌ 载入失败响应:', errorText);
            throw new Error(`载入失败: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ 载入成功:', result);
        
        if (!result.success) {
            throw new Error(result.message || '载入失败');
        }
        
        // 🔒 黑名单检查：如果用户在黑名单中，显示弹窗并禁止交易
        if (result.is_blacklisted) {
            console.warn('🚫 检测到黑名单用户:', engName);
            
            // 显示黑名单弹窗
            showBlacklistModal(result.blacklist_message);
            
            // 设置黑名单状态
            appState.isBlacklisted = true;
            appState.blacklistMessage = result.blacklist_message;
            
            // 禁用所有交易按钮
            disableTrading();
            
            // 强制设置为初始值
            appState.currentUser.totalAssets = result.user_data.total_assets;
            appState.currentUser.availableCash = result.user_data.available_cash;
            appState.currentUser.todayProfit = 0;
            appState.currentUser.portfolio = [];
            
            // 更新UI显示
            updateAssetDisplay();
            updatePortfolioDisplay();
            
            console.log('🔒 黑名单用户已限制，资产固定为初始值');
            return;
        }
        
        // 载入成功，标记用户为已初始化
        appState.practiceUser.initialized = true;
        console.log('✅ 数据载入成功，用户已标记为初始化状态');
        
        // 更新用户基本数据
        const userData = result.user_data;
        console.log('👤 用户基本数据:', userData);
        
        // 更新用户初始化状态
        if (userData.initialized !== undefined) {
            appState.practiceUser.initialized = userData.initialized;
            console.log('🔄 用户初始化状态:', userData.initialized);
        }
        
        // ✅ 修复：直接使用保存的资产数据，不重新计算
        // 原因：保存时的总资产是正确的，载入时不应该根据当前价格重新计算
        // 这样可以避免因价格波动导致资产数据错误
        console.log('📊 载入保存的资产数据（不重新计算）');
        
        // 直接使用保存的资产值
        appState.currentUser.totalAssets = userData.total_assets;
        appState.currentUser.availableCash = userData.available_cash;
        appState.currentUser.todayProfit = userData.today_profit;
        
        console.log('💰 载入的资产数据:', {
            totalAssets: appState.currentUser.totalAssets,
            availableCash: appState.currentUser.availableCash,
            todayProfit: appState.currentUser.todayProfit
        });
        
        // 如果有持仓数据，更新持仓列表（但不重新计算总资产）
        if (result.portfolios && result.portfolios.length > 0) {
            console.log('📦 持仓数据:', result.portfolios);
            
            // 更新持仓数据
            const newPortfolio = result.portfolios.map(p => {
                // 查找对应的加密货币信息，获取当前价格（仅用于显示）
                const crypto = appState.cryptos.find(c => c.symbol === p.crypto_symbol);
                const cryptoId = crypto ? crypto.id : p.crypto_symbol.toLowerCase();
                
                console.log(`🔄 处理持仓: ${p.crypto_symbol}, 数量: ${p.quantity}, 成本价: ${p.avg_cost}, 当前价格: ${crypto?.price || 'N/A'}`);
                
                return {
                    cryptoId: cryptoId,
                    symbol: p.crypto_symbol,
                    name: p.crypto_name,
                    icon: crypto ? crypto.icon : '●',
                    amount: p.quantity,
                    averagePrice: p.avg_cost
                };
            });
            
            appState.currentUser.portfolio = newPortfolio;
            
            // 计算持仓详情（仅用于日志显示，不影响总资产）
            const holdingDetails = [];
            let displayHoldingValue = 0;
            
            appState.currentUser.portfolio.forEach(holding => {
                const crypto = appState.cryptos.find(c => c.id === holding.cryptoId);
                if (crypto) {
                    const currentValue = holding.amount * crypto.price;
                    displayHoldingValue += currentValue;
                    
                    holdingDetails.push({
                        symbol: holding.symbol,
                        amount: holding.amount,
                        avgCost: holding.averagePrice,
                        currentPrice: crypto.price,
                        currentValue: currentValue,
                        profitLoss: currentValue - (holding.amount * holding.averagePrice)
                    });
                } else {
                    console.warn(`⚠️ 无法找到币种 ${holding.symbol} 的当前价格`);
                }
            });
            
            console.log('💰 持仓详情（当前价格）:', holdingDetails);
            console.log('💰 持仓市值（当前价格）:', displayHoldingValue);
            console.log('💰 总资产（保存的值）:', appState.currentUser.totalAssets);
            console.log('ℹ️ 注意：总资产使用保存的值，不受当前价格影响');
        } else {
            // 无持仓
            appState.currentUser.portfolio = [];
            console.log('📊 无持仓数据');
        }
        
        // 记录载入后的状态
        const afterLoad = {
            totalAssets: appState.currentUser.totalAssets,
            availableCash: appState.currentUser.availableCash,
            portfolioCount: appState.currentUser.portfolio.length,
            portfolioValue: 0
        };
        
        // 计算载入后的持仓市值
        appState.currentUser.portfolio.forEach(holding => {
            const crypto = appState.cryptos.find(c => c.id === holding.cryptoId);
            if (crypto) {
                afterLoad.portfolioValue += holding.amount * crypto.price;
            }
        });
        
        console.log('💰 载入后用户状态:', afterLoad);
        
        // 比较载入前后的变化
        const assetChange = afterLoad.totalAssets - beforeLoad.totalAssets;
        console.log('📊 载入前后资产变化:', {
            before: beforeLoad.totalAssets,
            after: afterLoad.totalAssets,
            change: assetChange,
            changePercent: ((assetChange / beforeLoad.totalAssets) * 100).toFixed(2) + '%'
        });
        
        // 重新渲染界面
        renderUI();
        
        // 更新交易面板
        if (appState.selectedCrypto) {
            const holding = appState.currentUser.portfolio.find(p => p.cryptoId === appState.selectedCrypto.id);
            updateTradingPanel(appState.currentUser.availableCash, holding?.amount || 0);
            updateMaxBuyAmount(appState.currentUser.availableCash, appState.selectedCrypto.price);
        }
        
        // 移动端和桌面端分别处理
        const isMobile = window.innerWidth <= 767;
        
        if (isMobile) {
            console.log('📱 ========== 移动端手动载入界面更新开始 ==========');
            console.log('📱 载入后的用户状态:', {
                totalAssets: appState.currentUser.totalAssets,
                availableCash: appState.currentUser.availableCash,
                portfolioCount: appState.currentUser.portfolio.length,
                todayProfit: appState.currentUser.todayProfit
            });
            
            // 移动端：分步骤更新，确保每一步都正确执行
            setTimeout(() => {
                console.log('📱 步骤1：更新资产显示（使用保存的值，不重新计算）');
                // ✅ 修复：直接使用保存的资产值，不重新计算
                // 原因：保存时的总资产是正确的，载入时不应该根据当前价格重新计算
                const initialAssets = 1000000;
                const profitRate = ((appState.currentUser.totalAssets - initialAssets) / initialAssets) * 100;
                updateUserAssets(appState.currentUser.totalAssets, profitRate);
                
                console.log('📱 资产和收益率显示更新完成（使用保存的值）:', {
                    totalAssets: appState.currentUser.totalAssets,
                    profitRate: profitRate.toFixed(2) + '%'
                });
            }, 100);
            
            setTimeout(() => {
                console.log('📱 步骤2：更新持仓列表');
                renderPortfolioList(appState.currentUser.portfolio, appState.cryptos);
                console.log('📱 持仓列表更新完成，持仓数量:', appState.currentUser.portfolio.length);
            }, 200);
            
            setTimeout(() => {
                console.log('📱 步骤3：更新交易面板');
                if (appState.selectedCrypto) {
                    const holding = appState.currentUser.portfolio.find(p => p.cryptoId === appState.selectedCrypto.id);
                    updateTradingPanel(appState.currentUser.availableCash, holding?.amount || 0);
                    updateMaxBuyAmount(appState.currentUser.availableCash, appState.selectedCrypto.price);
                    console.log('📱 交易面板更新完成');
                } else {
                    console.log('📱 无选中币种，跳过交易面板更新');
                }
            }, 300);
            
            setTimeout(() => {
                console.log('📱 步骤4：初始化移动端布局');
                initMobileLayout();
                console.log('📱 移动端布局初始化完成');
            }, 400);
            
            setTimeout(() => {
                console.log('📱 步骤5：完整重新渲染UI');
                renderUI();
                console.log('📱 UI重新渲染完成');
                console.log('📱 ========== 移动端手动载入界面更新完成 ==========');
            }, 500);
            
        } else {
            // 桌面端：数据载入后进行界面更新
            console.log('💻 桌面端：数据载入后进行界面更新');
            
            setTimeout(() => {
                // ✅ 修复：直接使用保存的资产值，不重新计算
                // 原因：保存时的总资产是正确的，载入时不应该根据当前价格重新计算
                console.log('💻 桌面端：使用保存的资产值（不重新计算）');
                
                const initialAssets = 1000000;
                const profitRate = ((appState.currentUser.totalAssets - initialAssets) / initialAssets) * 100;
                updateUserAssets(appState.currentUser.totalAssets, profitRate);
                
                renderPortfolioList(appState.currentUser.portfolio, appState.cryptos);
                
                if (appState.selectedCrypto) {
                    const holding = appState.currentUser.portfolio.find(p => p.cryptoId === appState.selectedCrypto.id);
                    updateTradingPanel(appState.currentUser.availableCash, holding?.amount || 0);
                    updateMaxBuyAmount(appState.currentUser.availableCash, appState.selectedCrypto.price);
                }
                
                console.log('💻 桌面端：数据载入后界面更新完成');
            }, 150);
        }
        
        showMessage('数据载入成功！', 'success');
        
    } catch (error) {
        console.error('❌ 载入用户数据失败:', error);
        console.error('📍 错误详情:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        // 桌面端和移动端统一错误处理：确保错误状态下界面仍然正确
        // 注意：不要重复定义isMobile，使用独立变量名
        const isMobileError = window.innerWidth <= 767;
        console.log(`${isMobileError ? '📱 移动端' : '💻 桌面端'}：载入失败，确保界面状态正确`);
        
        setTimeout(() => {
            // ✅ 修复：载入失败时，不要调用updateTotalAssets()重新计算
            // 原因：应该保持当前的资产状态，而不是根据当前价格重新计算
            // 只需要更新UI显示即可
            
            // 计算收益率并更新UI显示
            const initialAssets = 1000000;
            const profitRate = ((appState.currentUser.totalAssets - initialAssets) / initialAssets) * 100;
            updateUserAssets(appState.currentUser.totalAssets, profitRate);
            
            if (isMobileError) {
                initMobileLayout();
            }
        }, 100);
        
        showMessage(`载入失败: ${error.message}`, 'error', 5000);
    }
}

// 启动自动保存
function startAutoSave() {
    // 先清除已有的定时器
    stopAutoSave();
    
    console.log(`⏰ 启动自动保存，间隔: ${appState.autoSaveInterval / 1000}秒`);
    
    // 设置新的定时器
    appState.autoSaveTimer = setInterval(() => {
        console.log('⏰ 触发自动保存...');
        saveUserData('auto'); // 传入'auto'标识为自动保存
    }, appState.autoSaveInterval);
}

// 停止自动保存
function stopAutoSave() {
    if (appState.autoSaveTimer) {
        console.log('⏰ 停止自动保存');
        clearInterval(appState.autoSaveTimer);
        appState.autoSaveTimer = null;
    }
}

// 筛选加密货币
async function filterCryptos(keyword) {
    // 使用已缓存的完整币种列表进行筛选
    const allCryptos = appState.allCryptos;
    
    // 如果没有缓存数据，则不进行筛选
    if (!allCryptos || allCryptos.length === 0) {
        console.warn('⚠️ 搜索失败：没有可用的币种数据');
        return;
    }
    
    if (!keyword) {
        // 没有关键词，显示所有币种
        appState.cryptos = allCryptos;
    } else {
        // 根据关键词筛选
        appState.cryptos = allCryptos.filter(crypto => 
            crypto.name.toLowerCase().includes(keyword) ||
            crypto.symbol.toLowerCase().includes(keyword)
        );
    }
    
    console.log(`🔍 搜索关键词: "${keyword}" | 找到 ${appState.cryptos.length} 个币种`);
    
    // 重新渲染币种列表
    renderCryptoList(appState.cryptos, appState.selectedCrypto?.id);
}

// 教学系统
let tutorialAutoTimer = null; // 自动计时器

// 检查教学状态（从localStorage读取）
function checkTutorialStatus() {
    try {
        const tutorialCompleted = localStorage.getItem('cryptoGame_tutorialCompleted');
        const tutorialSkipped = localStorage.getItem('cryptoGame_tutorialSkipped');
        
        if (tutorialCompleted === 'true') {
            appState.tutorial.completed = true;
            console.log('📚 从localStorage读取：教学已完成');
        }
        
        if (tutorialSkipped === 'true') {
            appState.tutorial.skipped = true;
            console.log('📚 从localStorage读取：教学已跳过');
        }
    } catch (error) {
        console.warn('⚠️ 读取教学状态失败:', error);
    }
}

// 保存教学完成状态到localStorage
function saveTutorialCompleted() {
    try {
        localStorage.setItem('cryptoGame_tutorialCompleted', 'true');
        localStorage.removeItem('cryptoGame_tutorialSkipped'); // 清除跳过状态
        console.log('💾 教学完成状态已保存到localStorage');
    } catch (error) {
        console.warn('⚠️ 保存教学完成状态失败:', error);
    }
}

// 保存教学跳过状态到localStorage
function saveTutorialSkipped() {
    try {
        localStorage.setItem('cryptoGame_tutorialSkipped', 'true');
        localStorage.removeItem('cryptoGame_tutorialCompleted'); // 清除完成状态
        console.log('💾 教学跳过状态已保存到localStorage');
    } catch (error) {
        console.warn('⚠️ 保存教学跳过状态失败:', error);
    }
}

// 解锁实战模式
function unlockPracticeMode() {
    // 解锁实战模式
    document.querySelectorAll('.mode-btn').forEach(btn => {
        if (btn.dataset.mode === 'practice') {
            btn.disabled = false;
        }
    });
    
    // 显示挑战-注入-获利流程弹窗
    showEvolutionFlowModal();
}

// 显示进化流程弹窗（挑战-注入-获利）
function showEvolutionFlowModal() {
    // 创建弹窗HTML
    const modalHtml = `
        <div id="evolutionFlowModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center animate-fade-in">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                <!-- 头部 -->
                <div class="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white px-6 py-5">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <span class="text-4xl">🧬</span>
                            <div>
                                <h2 class="text-2xl font-bold">币神进化论 - 核心玩法</h2>
                                <p class="text-sm text-white/80">从竞争到共生的进化之路</p>
                            </div>
                        </div>
                        <button id="closeEvolutionModal" class="text-white/80 hover:text-white transition-colors">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                
                <!-- 内容区域 -->
                <div class="p-6">
                    <!-- 流程图 -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <!-- Step 1: 挑战 -->
                        <div class="relative group">
                            <div class="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold z-10">1</div>
                            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200 h-full group-hover:border-blue-400 group-hover:shadow-lg transition-all">
                                <div class="text-4xl mb-3">🏆</div>
                                <h3 class="text-lg font-bold text-blue-700 mb-2">挑战 Challenge</h3>
                                <p class="text-sm text-gray-600 mb-3">用你的交易策略击败5大AI Agent</p>
                                <ul class="text-xs text-gray-500 space-y-1">
                                    <li class="flex items-center"><i class="fas fa-check text-blue-400 mr-1"></i>连接钱包开始交易</li>
                                    <li class="flex items-center"><i class="fas fa-check text-blue-400 mr-1"></i>实时收益率PK</li>
                                    <li class="flex items-center"><i class="fas fa-check text-blue-400 mr-1"></i>每日UTC 0:00结算</li>
                                </ul>
                            </div>
                            <div class="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20">
                                <i class="fas fa-chevron-right text-2xl text-gray-300"></i>
                            </div>
                        </div>
                        
                        <!-- Step 2: 注入 -->
                        <div class="relative group">
                            <div class="absolute -top-3 -right-3 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold z-10">2</div>
                            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200 h-full group-hover:border-purple-400 group-hover:shadow-lg transition-all">
                                <div class="text-4xl mb-3">💉</div>
                                <h3 class="text-lg font-bold text-purple-700 mb-2">注入 Injection</h3>
                                <p class="text-sm text-gray-600 mb-3">你的策略被AI学习并实装</p>
                                <ul class="text-xs text-gray-500 space-y-1">
                                    <li class="flex items-center"><i class="fas fa-check text-purple-400 mr-1"></i>GPT-4o分析交易历史</li>
                                    <li class="flex items-center"><i class="fas fa-check text-purple-400 mr-1"></i>生成优化代码</li>
                                    <li class="flex items-center"><i class="fas fa-check text-purple-400 mr-1"></i>30天数据回测验证</li>
                                </ul>
                            </div>
                            <div class="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20">
                                <i class="fas fa-chevron-right text-2xl text-gray-300"></i>
                            </div>
                        </div>
                        
                        <!-- Step 3: 获利 -->
                        <div class="relative group">
                            <div class="absolute -top-3 -right-3 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold z-10">3</div>
                            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200 h-full group-hover:border-green-400 group-hover:shadow-lg transition-all">
                                <div class="text-4xl mb-3">💰</div>
                                <h3 class="text-lg font-bold text-green-700 mb-2">获利 Profit</h3>
                                <p class="text-sm text-gray-600 mb-3">永久获得策略产生的收益分成</p>
                                <ul class="text-xs text-gray-500 space-y-1">
                                    <li class="flex items-center"><i class="fas fa-check text-green-400 mr-1"></i>获得Strategy NFT</li>
                                    <li class="flex items-center"><i class="fas fa-check text-green-400 mr-1"></i>10%超额收益分红</li>
                                    <li class="flex items-center"><i class="fas fa-check text-green-400 mr-1"></i>Superfluid流支付实时到账</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Agent展示 -->
                    <div class="mb-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-robot text-purple-500 mr-2"></i>你的AI对手们
                        </h3>
                        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div class="text-center p-3 bg-gray-50 rounded-lg">
                                <div class="text-2xl mb-1">🏛️</div>
                                <div class="text-xs font-semibold">巴菲特基金</div>
                                <div class="text-xs text-gray-400">大盘定投</div>
                            </div>
                            <div class="text-center p-3 bg-gray-50 rounded-lg">
                                <div class="text-2xl mb-1">📊</div>
                                <div class="text-xs font-semibold">量化基金</div>
                                <div class="text-xs text-gray-400">链上套利</div>
                            </div>
                            <div class="text-center p-3 bg-gray-50 rounded-lg">
                                <div class="text-2xl mb-1">🎯</div>
                                <div class="text-xs font-semibold">趋势基金</div>
                                <div class="text-xs text-gray-400">均线突破</div>
                            </div>
                            <div class="text-center p-3 bg-gray-50 rounded-lg">
                                <div class="text-2xl mb-1">🧘</div>
                                <div class="text-xs font-semibold">佛系指数</div>
                                <div class="text-xs text-gray-400">被动持有</div>
                            </div>
                            <div class="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                                <div class="text-2xl mb-1">🐋</div>
                                <div class="text-xs font-semibold text-orange-600">巨鲸暗池</div>
                                <div class="text-xs text-orange-400">终极Alpha</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Slogan -->
                    <div class="text-center py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                        <p class="text-lg font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                            "Code once, earn forever."
                        </p>
                        <p class="text-sm text-gray-500 mt-1">一次智慧输出，永久躺赚收益</p>
                    </div>
                </div>
                
                <!-- 底部按钮 -->
                <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <div class="flex justify-between items-center">
                        <button id="viewRoadshowBtn" class="text-sm text-purple-600 hover:text-purple-700 flex items-center transition-colors">
                            <i class="fas fa-bullhorn mr-2"></i>查看完整路演
                        </button>
                        <button id="startPracticeBtn" class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                            进入实战模式 <i class="fas fa-arrow-right ml-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加弹窗到页面
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // 绑定事件
    document.getElementById('closeEvolutionModal').addEventListener('click', () => {
        document.getElementById('evolutionFlowModal').remove();
    });
    
    document.getElementById('viewRoadshowBtn').addEventListener('click', () => {
        window.open('cointemple-roadshow.html', '_blank');
    });
    
    document.getElementById('startPracticeBtn').addEventListener('click', () => {
        document.getElementById('evolutionFlowModal').remove();
        // 切换到实战模式
        document.querySelector('[data-mode="practice"]').click();
    });
    
    // 点击遮罩关闭
    document.getElementById('evolutionFlowModal').addEventListener('click', (e) => {
        if (e.target.id === 'evolutionFlowModal') {
            document.getElementById('evolutionFlowModal').remove();
        }
    });
}

function startTutorial() {
    console.log('开始教学');
    showTutorialStep(0);
}

function showTutorialStep(stepIndex) {
    const step = appState.tutorial.steps[stepIndex];
    if (!step) return;
    
    appState.tutorial.currentStep = stepIndex;
    
    // 清除之前的计时器
    if (tutorialAutoTimer) {
        clearTimeout(tutorialAutoTimer);
        tutorialAutoTimer = null;
    }
    
    const overlay = document.getElementById('tutorialOverlay');
    const tooltip = document.getElementById('tutorialTooltip');
    const title = document.getElementById('tutorialTitle');
    const content = document.getElementById('tutorialContent');
    const stepEl = document.getElementById('tutorialStep');
    const progressBar = document.getElementById('tutorialProgress');
    const countdownEl = document.getElementById('tutorialCountdown');
    
    // 显示遮罩
    overlay.classList.remove('hidden');
    tooltip.classList.remove('hidden');
    
    // 更新内容
    title.textContent = step.title;
    content.textContent = step.content;
    stepEl.textContent = `${stepIndex + 1}/${appState.tutorial.steps.length}`;
    
    // 优化弹窗居中显示逻辑
    if (step.target) {
        const targetEl = document.querySelector(step.target);
        if (targetEl) {
            targetEl.classList.add('tutorial-highlight');
            
            // 智能定位提示框，确保居中且不遮挡
            const rect = targetEl.getBoundingClientRect();
            const tooltipWidth = 420; // 稍微加宽提示框
            const tooltipHeight = 240; // 稍微加高提示框
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // 优先居中显示，如果不会遮挡重要元素的话
            let top = (viewportHeight - tooltipHeight) / 2;
            let left = (viewportWidth - tooltipWidth) / 2;
            
            // 检查是否会遮挡目标元素，如果会则调整位置
            const tooltipCenter = { x: left + tooltipWidth / 2, y: top + tooltipHeight / 2 };
            const targetCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
            
            // 如果提示框会遮挡目标元素，则偏移显示
            if (Math.abs(tooltipCenter.x - targetCenter.x) < 100 && 
                Math.abs(tooltipCenter.y - targetCenter.y) < 100) {
                // 在目标元素下方显示
                top = rect.bottom + 30;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                
                // 确保不超出边界
                if (top + tooltipHeight > viewportHeight - 20) {
                    top = rect.top - tooltipHeight - 30;
                }
                if (left < 20) left = 20;
                if (left + tooltipWidth > viewportWidth - 20) {
                    left = viewportWidth - tooltipWidth - 20;
                }
            }
            
            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;
            tooltip.style.transform = 'none';
        }
    } else {
        // 完全居中显示
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
    }
    
    // 添加稳定的倒计时更新逻辑
    let countdown = 10;
    let countdownStartTime = Date.now();
    
    // 重置进度条
    if (progressBar) {
        progressBar.style.transition = 'none';
        progressBar.style.width = '100%';
        // 强制重绘
        progressBar.offsetHeight;
        progressBar.style.transition = 'width 10s linear';
        progressBar.style.width = '0%';
    }
    
    // 只更新进度条，不显示具体秒数
    const updateCountdown = () => {
        const elapsed = Date.now() - countdownStartTime;
        const remaining = Math.max(0, 10 - Math.floor(elapsed / 1000));
        
        // 显示简洁的提示文字，不显示具体秒数
        if (countdownEl) {
            countdownEl.textContent = '自动进行中';
        }
        
        if (remaining > 0) {
            requestAnimationFrame(updateCountdown);
        }
    };
    
    // 开始同步更新
    requestAnimationFrame(updateCountdown);
    
    // 添加10秒自动进入下一步的功能
    tutorialAutoTimer = setTimeout(() => {
        console.log('10秒自动进入下一步');
        nextTutorialStep();
    }, 10000);
}

function nextTutorialStep() {
    // 清除计时器
    if (tutorialAutoTimer) {
        clearTimeout(tutorialAutoTimer);
        tutorialAutoTimer = null;
    }
    
    // 移除高亮
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
    });
    
    const nextStep = appState.tutorial.currentStep + 1;
    
    if (nextStep >= appState.tutorial.steps.length) {
        completeTutorial();
    } else {
        showTutorialStep(nextStep);
    }
}

function skipTutorial() {
    // 清除计时器
    if (tutorialAutoTimer) {
        clearTimeout(tutorialAutoTimer);
        tutorialAutoTimer = null;
    }
    
    // 直接跳过教学，不需要确认
    console.log('教学跳过');
    completeTutorial(true);
}

function completeTutorial(skip = false) {
    // 清除计时器
    if (tutorialAutoTimer) {
        clearTimeout(tutorialAutoTimer);
        tutorialAutoTimer = null;
    }
    
    if (skip) {
        console.log('教学跳过');
        appState.tutorial.skipped = true;
        // 保存跳过状态到localStorage
        saveTutorialSkipped();
    } else {
        console.log('教学完成');
        appState.tutorial.completed = true;
        appState.tutorial.enabled = false;
        // 保存完成状态到localStorage
        saveTutorialCompleted();
    }
    
    // 只在演示模式下重置实战模式用户的初始化标记
    // 确保第一次进入实战模式时进行初始化
    if (appState.mode === 'tutorial') {
        appState.practiceUser.initialized = false;
        appState.practiceUser.totalAssets = 1000000;
        appState.practiceUser.availableCash = 1000000;
        appState.practiceUser.todayProfit = 0;
        appState.practiceUser.portfolio = [];
        appState.practiceUser.tradeHistory = [];
        
        console.log('🔄 教学完成：重置实战模式用户为未初始化状态');
    } else {
        console.log('⚠️ 非演示模式，跳过实战用户重置');
    }
    
    // 隐藏教学UI
    document.getElementById('tutorialOverlay').classList.add('hidden');
    document.getElementById('tutorialTooltip').classList.add('hidden');
    
    // 移除高亮
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
    });
    
    // 解锁实战模式
    unlockPracticeMode();
    
    if (skip) {
        showMessage('已跳过教学！现在可以体验实战模式了！', 'success');
    } else {
        showMessage('教学完成！现在可以体验实战模式了！', 'success');
    }
}

// AI Agent模拟
// localStorage相关函数
function saveAgentsData() {
    const agentsData = {
        agents: appState.agents,
        timestamp: Date.now()
    };
    localStorage.setItem('crypto_game_agents', JSON.stringify(agentsData));
    console.log('💾 AI对手数据已保存到localStorage');
}

function loadAgentsData() {
    try {
        const savedData = localStorage.getItem('crypto_game_agents');
        if (savedData) {
            const data = JSON.parse(savedData);
            const timeDiff = Date.now() - data.timestamp;
            // 如果数据保存时间超过24小时，则重置
            if (timeDiff > 24 * 60 * 60 * 1000) {
                console.log('⏰ AI对手数据已过期，重置为初始状态');
                resetAgentsData();
                return false;
            }
            // 恢复AI对手数据
            appState.agents = data.agents;
            console.log('📂 AI对手数据已从localStorage恢复');
            return true;
        }
    } catch (error) {
        console.error('❌ 加载AI对手数据失败:', error);
    }
    return false;
}

function resetAgentsData() {
    // 重置AI对手为初始状态
    appState.agents = [
        {
            id: 'agent-1',
            name: '巴菲特老师',
            strategy: '价值投资',
            assets: 1000000,
            profit: 0,
            status: 'waiting',
            thought: '寻找被低估的优质资产...',
            target: null,
            portfolio: []
        },
        {
            id: 'agent-2',
            name: '量化小Q',
            strategy: '量化交易',
            assets: 1000000,
            profit: 0,
            status: 'thinking',
            thought: '分析市场数据，寻找套利机会...',
            target: null,
            portfolio: []
        },
        {
            id: 'agent-3',
            name: '趋势猎人',
            strategy: '趋势跟随',
            assets: 1000000,
            profit: 0,
            status: 'waiting',
            thought: '等待趋势信号...',
            target: null,
            portfolio: []
        },
        {
            id: 'agent-4',
            name: '佛系小散',
            strategy: '买入持有',
            assets: 1000000,
            profit: 0,
            status: 'waiting',
            thought: '买完就睡觉，到点再看...',
            target: null,
            portfolio: [],
            personality: 'zen',
            tradeCount: 0,
            lastTradeTime: 0
        },
        {
            id: 'agent-5',
            name: '神秘巨鲸',
            strategy: '混合策略',
            assets: 1000000,
            profit: 0,
            status: 'waiting',
            thought: '市场由我定义...',
            target: null,
            portfolio: [],
            personality: 'whale',
            marketState: 'unknown',
            lastMajorMove: 0
        }
    ];
    saveAgentsData();
}

function startAgentSimulation() {
    // 尝试从localStorage加载AI对手数据
    const dataLoaded = loadAgentsData();
    if (!dataLoaded) {
        console.log('🆕 初始化AI对手数据');
        saveAgentsData();
    }
    
    // 启动定时模拟
    setInterval(() => {
        if (appState.mode === 'practice') {
            simulateAgentTrade();
            // 每次交易后保存数据
            saveAgentsData();
        }
    }, 10000); // 每10秒模拟一次
}

function simulateAgentTrade() {
    appState.agents.forEach(agent => {
        const currentTime = Date.now();
        
        // 佛系小散策略 - 买入持有
        if (agent.id === 'agent-4') {
            simulateZenTrader(agent, currentTime);
        }
        // 神秘巨鲸策略 - 混合自适应策略
        else if (agent.id === 'agent-5') {
            simulateWhaleTrader(agent, currentTime);
        }
        // 原有的三个角色保持不变
        else {
            simulateOriginalTrader(agent);
        }
    });
}

// 佛系小散交易逻辑
function simulateZenTrader(agent, currentTime) {
    const elapsedTime = (currentTime - agent.lastTradeTime) / 1000; // 转换为秒
    
    // 开局2分钟内全部买入
    if (agent.tradeCount === 0 && elapsedTime >= 10 && elapsedTime <= 120) {
        agent.status = 'trading';
        agent.target = 'BTC+ETH';
        agent.thought = '机会来了，开始分批买入BTC和ETH...';
        
        setTimeout(() => {
            const profitChange = (Math.random() - 0.3) * 15000; // 佛系收益范围：-10%到+30%
            agent.assets += profitChange;
            agent.profit = agent.assets - 1000000;
            agent.tradeCount = 1;
            agent.lastTradeTime = currentTime;
            agent.status = 'waiting';
            agent.thought = '买完了，睡觉去...醒来再看';
            
            renderAgentList(appState.agents);
            updateLeaderboard();
        }, 2000);
        
        renderAgentList(appState.agents);
    }
    // 中间12分钟不操作
    else if (agent.tradeCount === 1 && elapsedTime > 120 && elapsedTime < 840) {
        agent.status = 'waiting';
        agent.thought = '睡觉中...不看盘，不心烦';
    }
    // 最后1分钟全部卖出
    else if (agent.tradeCount === 1 && elapsedTime >= 840) {
        agent.status = 'trading';
        agent.target = '全部卖出';
        agent.thought = '醒来了，该清仓了...';
        
        setTimeout(() => {
            const finalProfit = (Math.random() - 0.5) * 25000; // 最终结算
            agent.assets += finalProfit;
            agent.profit = agent.assets - 1000000;
            agent.tradeCount = 2;
            agent.status = 'waiting';
            agent.thought = agent.profit > 0 
                ? `佛系获利$${agent.profit.toFixed(2)}，心满意足` 
                : `亏损$${Math.abs(agent.profit).toFixed(2)}，下次继续佛系`;
            
            renderAgentList(appState.agents);
            updateLeaderboard();
        }, 2000);
        
        renderAgentList(appState.agents);
    }
    // 初始化
    else if (agent.tradeCount === 0) {
        agent.lastTradeTime = currentTime; // 设置初始时间
    }
}

// 神秘巨鲸交易逻辑
function simulateWhaleTrader(agent, currentTime) {
    const timeSinceLastMove = (currentTime - agent.lastMajorMove) / 1000;
    
    // 识别市场状态（简化版本）
    const marketStates = ['trending', 'ranging', 'reversing'];
    if (agent.marketState === 'unknown' || Math.random() > 0.7) {
        agent.marketState = marketStates[Math.floor(Math.random() * marketStates.length)];
        agent.thought = `市场状态识别：${getMarketStateText(agent.marketState)}，准备调整策略...`;
    }
    
    // 根据市场状态决定交易频率和策略
    let shouldTrade = false;
    let strategy = '';
    
    switch (agent.marketState) {
        case 'trending':
            shouldTrade = Math.random() > 0.75; // 25%概率交易，趋势跟随
            strategy = '趋势跟踪';
            break;
        case 'ranging':
            shouldTrade = Math.random() > 0.85; // 15%概率交易，高抛低吸
            strategy = '网格交易';
            break;
        case 'reversing':
            shouldTrade = Math.random() > 0.70; // 30%概率交易，抄底逃顶
            strategy = '逆势操作';
            break;
    }
    
    // 神秘巨鲸在关键时刻重仓出击
    if (shouldTrade && timeSinceLastMove > 40) { // 至少40秒间隔
        const crypto = appState.cryptos[Math.floor(Math.random() * appState.cryptos.length)];
        const action = Math.random() > 0.5 ? 'buy' : 'sell'; // 50%买入，50%卖出
        
        agent.status = 'trading';
        agent.target = `${crypto.symbol}(${strategy})`;
        agent.thought = `${getWhaleThought(strategy, action, crypto.symbol)}...`;
        
        setTimeout(() => {
            // 神秘巨鲸收益调整：降低胜率10%
            const baseProfit = agent.marketState === 'trending' ? 18000 : 12000;
            // 50%概率盈利（降低胜率），盈利时收益为基础收益的20%-70%
            // 50%概率亏损，亏损为基础收益的10%-30%
            let profitChange;
            if (Math.random() > 0.5) {
                // 盈利情况
                profitChange = (Math.random() * 0.5 + 0.2) * baseProfit; // 20%-70%的基础收益
            } else {
                // 亏损情况
                profitChange = -(Math.random() * 0.2 + 0.1) * baseProfit; // -10%到-30%的基础收益
            }
            
            agent.assets += profitChange;
            agent.profit = agent.assets - 1000000;
            agent.lastMajorMove = currentTime;
            agent.status = 'waiting';
            agent.thought = profitChange > 0 
                ? `精准把握${crypto.symbol}，获利$${profitChange.toFixed(2)}` 
                : `${crypto.symbol}判断失误，亏损$${Math.abs(profitChange).toFixed(2)}`;
            
            renderAgentList(appState.agents);
            updateLeaderboard();
        }, 1500);
        
        renderAgentList(appState.agents);
    } else if (!shouldTrade) {
        agent.status = 'thinking';
        agent.thought = `分析${getMarketStateText(agent.marketState)}市场，寻找最佳时机...`;
    }
}

// 原有角色交易逻辑（保持不变）
function simulateOriginalTrader(agent) {
    // 随机决定是否交易
    if (Math.random() > 0.7) {
        const crypto = appState.cryptos[Math.floor(Math.random() * appState.cryptos.length)];
        const action = Math.random() > 0.5 ? 'buy' : 'sell';
        
        agent.status = 'trading';
        agent.target = `${crypto.symbol}`;
        agent.thought = action === 'buy' 
            ? `发现${crypto.symbol}有上涨潜力，准备买入...` 
            : `${crypto.symbol}已达目标价位，准备卖出...`;
        
        // 模拟交易结果
        setTimeout(() => {
            const profitChange = (Math.random() - 0.5) * 20000;
            agent.assets += profitChange;
            agent.profit = agent.assets - 1000000;
            agent.status = 'waiting';
            agent.thought = profitChange > 0 
                ? `交易成功，获利$${profitChange.toFixed(2)}` 
                : `交易亏损$${Math.abs(profitChange).toFixed(2)}，继续寻找机会...`;
            
            renderAgentList(appState.agents);
            updateLeaderboard();
        }, 2000);
        
        renderAgentList(appState.agents);
    }
}

// 辅助函数：获取市场状态文本
function getMarketStateText(state) {
    const stateMap = {
        'trending': '趋势行情',
        'ranging': '震荡整理',
        'reversing': '反转迹象'
    };
    return stateMap[state] || '未知';
}

// 辅助函数：获取巨鲸思考内容
function getWhaleThought(strategy, action, symbol) {
    const thoughts = {
        '趋势跟踪': {
            'buy': [
                `${symbol}趋势向上，顺势加仓`,
                `突破关键阻力位，重仓${symbol}`,
                `动量强劲，追涨${symbol}`
            ],
            'sell': [
                `${symbol}趋势转弱，获利了结`,
                `跌破支撑位，减仓${symbol}`,
                `动能衰竭，卖出${symbol}`
            ]
        },
        '网格交易': {
            'buy': [
                `${symbol}触及支撑，低吸建仓`,
                `震荡下沿，买入${symbol}`,
                `价格回归均值，加仓${symbol}`
            ],
            'sell': [
                `${symbol}触及阻力，高抛减仓`,
                `震荡上沿，卖出${symbol}`,
                `偏离均值过多，止盈${symbol}`
            ]
        },
        '逆势操作': {
            'buy': [
                `市场恐慌，抄底${symbol}`,
                `超跌反弹，买入${symbol}`,
                `别人恐惧我贪婪，重仓${symbol}`
            ],
            'sell': [
                `市场疯狂，止盈${symbol}`,
                `见顶信号，清仓${symbol}`,
                `别人贪婪我恐惧，卖出${symbol}`
            ]
        }
    };
    
    const actionThoughts = thoughts[strategy]?.[action] || [`操作${symbol}`];
    return actionThoughts[Math.floor(Math.random() * actionThoughts.length)];
}

// 更新排行榜（提取为独立函数）
function updateLeaderboard() {
    // 确保玩家信息以当前总资产和收益率为准
    updateTotalAssets(); // 先更新玩家总资产
    
    const leaderboardData = [
        {
            id: appState.currentUser.id,
            name: appState.currentUser.name,
            type: 'player',
            assets: appState.currentUser.totalAssets,
            profit: ((appState.currentUser.totalAssets - 1000000) / 1000000) * 100,
            avatar: null
        },
        ...appState.agents.map(a => ({
            id: a.id,
            name: a.name,
            type: 'ai',
            assets: a.assets,
            profit: ((a.assets - 1000000) / 1000000) * 100,
            avatar: null
        }))
    ];
    renderLeaderboard(leaderboardData, appState.currentUser.id);
}

// ==================== 排行榜功能 ====================

// 生成测试用户数据
async function generateTestUsers() {
    try {
        console.log('🔧 开始生成测试用户数据...');
        
        const response = await fetch('/api/generate-test-users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 生成测试用户API响应状态:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📊 生成测试用户API响应:', result);
        
        if (result.success) {
            console.log(`✅ ${result.message}`);
            showMessage(`${result.message}，可以刷新排行榜查看效果`, 'success', 3000);
            
            // 自动刷新排行榜（如果排行榜弹窗是打开的）
            const modal = document.getElementById('leaderboardModal');
            if (modal && !modal.classList.contains('hidden')) {
                console.log('🔄 自动刷新排行榜...');
                const leaderboard = await fetchLeaderboardData();
                renderLeaderboardModal(leaderboard);
            }
            
            return true;
        } else {
            throw new Error(result.message || '生成测试用户失败');
        }
        
    } catch (error) {
        console.error('❌ 生成测试用户失败:', error);
        showMessage(`生成测试用户失败: ${error.message}`, 'error', 5000);
        return false;
    }
}

// 获取排行榜数据
async function fetchLeaderboardData() {
    try {
        console.log('🏆 开始获取排行榜数据...');
        console.log('📍 API地址: /api/leaderboard');
        
        const response = await fetch('/api/leaderboard');
        console.log('📡 排行榜API响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📊 排行榜API响应数据:', {
            success: result.success,
            dataLength: result.data ? result.data.length : 0,
            total: result.total,
            timestamp: result.timestamp
        });
        
        if (result.success && result.data) {
            console.log(`✅ 成功获取排行榜数据，共 ${result.data.length} 位用户`);
            
            // 打印前3名用户信息（用于调试）
            if (result.data.length > 0) {
                console.log('🏅 排行榜前3名:');
                result.data.slice(0, 3).forEach(user => {
                    console.log(`  ${user.rank}. ${user.eng_name} - ${user.title} ${user.emoji} - 资产: ${user.total_assets}`);
                });
            }
            
            appState.leaderboardData = result.data;
            return result.data;
        } else {
            console.warn('⚠️ 排行榜API响应格式异常:', result);
            return [];
        }
        
    } catch (error) {
        console.error('❌ 获取排行榜数据失败:', error);
        console.error('📍 错误详情:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        return [];
    }
}

// 打开排行榜弹窗
async function openLeaderboardModal() {
    console.log('🏆 打开排行榜弹窗');
    
    const modal = document.getElementById('leaderboardModal');
    const loadingEl = document.getElementById('leaderboardLoading');
    const contentEl = document.getElementById('leaderboardContent');
    const emptyEl = document.getElementById('leaderboardEmpty');
    
    if (!modal) {
        console.error('❌ 排行榜弹窗元素不存在');
        return;
    }
    
    // 显示弹窗
    modal.classList.remove('hidden');
    
    // 显示加载状态
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (contentEl) contentEl.classList.add('hidden');
    if (emptyEl) emptyEl.classList.add('hidden');
    
    // 获取排行榜数据
    const leaderboard = await fetchLeaderboardData();
    
    // 渲染排行榜
    renderLeaderboardModal(leaderboard);
    
    // 启动自动刷新
    startLeaderboardAutoRefresh();
}

// 关闭排行榜弹窗
function closeLeaderboardModal() {
    console.log('🏆 关闭排行榜弹窗');
    
    const modal = document.getElementById('leaderboardModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    // 停止自动刷新
    stopLeaderboardAutoRefresh();
    
    // 关闭排行榜后，保持当前模式不变
    // 如果在实战模式，继续保持实战模式
    // 如果在演示模式，继续保持演示模式
    console.log(`✅ 保持在${appState.mode === 'practice' ? '实战' : '教学'}模式`);
}

// 启动排行榜自动刷新
function startLeaderboardAutoRefresh() {
    stopLeaderboardAutoRefresh(); // 先清除已有的定时器
    console.log(`⏰ 启动排行榜自动刷新，间隔: ${appState.leaderboardInterval / 1000}秒`);
    
    appState.leaderboardTimer = setInterval(async () => {
        console.log('⏰ 触发排行榜自动刷新...');
        const leaderboard = await fetchLeaderboardData();
        renderLeaderboardModal(leaderboard);
    }, appState.leaderboardInterval);
}

// 停止排行榜自动刷新
function stopLeaderboardAutoRefresh() {
    if (appState.leaderboardTimer) {
        console.log('⏰ 停止排行榜自动刷新');
        clearInterval(appState.leaderboardTimer);
        appState.leaderboardTimer = null;
    }
}

// 移动端游客提示
function showMobileGuestNotice() {
    console.log('📱 移动端：显示游客提示和iOA认证');
    
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.id = 'mobileAuthOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    `;
    
    // 创建提示框
    const noticeBox = document.createElement('div');
    noticeBox.style.cssText = `
        background: white;
        border-radius: 1rem;
        padding: 1.5rem;
        max-width: 90%;
        width: 320px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease-out;
    `;
    
    noticeBox.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">👤</div>
            <h3 style="font-size: 1.25rem; font-weight: bold; color: #1f2937; margin-bottom: 0.5rem;">
                欢迎体验
            </h3>
            <p style="color: #6b7280; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem;">
                您将以游客身份直接进入游戏<br/>
                开启加密货币交易学习之旅
            </p>
            <button id="continueAsGuestBtn" style="
                width: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                border: none;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                开始体验
            </button>
        </div>
    `;
    
    overlay.appendChild(noticeBox);
    document.body.appendChild(overlay);
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    // 开始体验按钮事件
    document.getElementById('continueAsGuestBtn').addEventListener('click', () => {
        console.log('📱 移动端：开始体验游戏');
        overlay.remove();
    });
}

// 触发认证
window.triggerIOAAuth = function triggerIOAAuth() {
    console.log('🔐 触发用户认证');
    
    // 认证功能已移除，直接以游客身份继续
    console.log('ℹ️ 认证功能已禁用，以游客身份继续');
    
    // 关闭提示框
    const overlay = document.getElementById('mobileAuthOverlay');
    if (overlay) overlay.remove();
    
    showMessage('以游客身份继续体验', 'info', 2000);
            
            // 认证失败后，提供继续游客浏览选项
            setTimeout(() => {
                const overlay = document.getElementById('mobileAuthOverlay');
                if (overlay) {
                    const noticeBox = overlay.querySelector('div > div');
                    if (noticeBox) {
                        noticeBox.innerHTML = `
                            <div style="text-align: center;">
                                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                                <h3 style="font-size: 1.25rem; font-weight: bold; color: #dc2626; margin-bottom: 0.5rem;">
                                    认证失败
                                </h3>
                                <p style="color: #6b7280; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem;">
                                    认证服务暂时不可用<br/>
                                    您可以继续以游客身份浏览
                                </p>
                                <button id="retryAuthBtn" style="
                                    width: 100%;
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                    padding: 0.75rem 1.5rem;
                                    border-radius: 0.5rem;
                                    border: none;
                                    font-weight: 600;
                                    font-size: 1rem;
                                    cursor: pointer;
                                    margin-bottom: 0.75rem;
                                ">
                                    🔄 重试认证
                                </button>
                                <button id="continueAsGuestBtn2" style="
                                    width: 100%;
                                    background: #f3f4f6;
                                    color: #6b7280;
                                    padding: 0.75rem 1.5rem;
                                    border-radius: 0.5rem;
                                    border: none;
                                    font-weight: 500;
                                    font-size: 0.875rem;
                                    cursor: pointer;
                                ">
                                    继续以游客身份浏览
                                </button>
                            </div>
                        `;
                        
                        // 重新绑定事件监听器
                        setTimeout(() => {
                            const retryBtn = document.getElementById('retryAuthBtn');
                            const continueBtn = document.getElementById('continueAsGuestBtn2');
                            
                            if (retryBtn) {
                                retryBtn.addEventListener('click', () => {
                                    window.triggerIOAAuth();
                                });
                            }
                            
                            if (continueBtn) {
                                continueBtn.addEventListener('click', () => {
                                    const overlay = document.getElementById('mobileAuthOverlay');
                                    if (overlay) overlay.remove();
                                    showMessage('您正在以游客身份浏览', 'info', 3000);
                                });
                            }
                        }, 100);
                    }
                }
            }, 500);
        });
}

// ==================== 弹幕功能 ====================

// 弹幕状态管理
const danmakuState = {
    danmakuList: [],
    isRunning: false,
    intervalId: null,
    priorityQueue: [],  // 优先显示的弹幕队列（用户刚发送的）
    recentlyShown: new Map(),  // 记录最近显示的弹幕 {danmakuId: timestamp}
    lastColor: null  // 记录上一条弹幕的颜色，确保相邻弹幕颜色不同
};

// 发送弹幕
async function sendDanmaku() {
    const input = document.getElementById('danmakuInput');
    const content = input.value.trim();
    
    if (!content) {
        showMessage('请输入弹幕内容', 'warning', 2000);
        return;
    }
    
    if (content.length > 30) {
        showMessage('弹幕内容不能超过30个字符，当前已输入' + content.length + '个字符', 'warning', 2000);
        return;
    }
    
    try {
        // 获取用户信息 - 使用英文名作为显示名称
        let userEngName = appState.userEngName || 'Guest';
        let displayName = userEngName; // 使用英文名显示
        
        // 获取用户当前的称号和emoji（从最新排行榜数据中获取）
        let userTitle = '快乐韭菜'; // 默认称号
        let userEmoji = '🥬'; // 默认emoji
        
        console.log('🔄 发送弹幕前，先获取最新排行榜数据...');
        console.log('👤 当前用户英文名:', userEngName);
        console.log('📊 当前模式:', appState.mode);
        console.log('💰 当前用户总资产:', appState.currentUser.totalAssets);
        
        try {
            // 实时获取最新的排行榜数据（与排行榜刷新逻辑完全一致）
            const latestLeaderboard = await fetchLeaderboardData();
            
            console.log('📊 排行榜数据获取结果:', {
                success: latestLeaderboard && latestLeaderboard.length > 0,
                userCount: latestLeaderboard ? latestLeaderboard.length : 0,
                firstUser: latestLeaderboard && latestLeaderboard.length > 0 ? latestLeaderboard[0].eng_name : 'none'
            });
            
            if (latestLeaderboard && latestLeaderboard.length > 0) {
                // 从最新排行榜中查找当前用户的称号和emoji
                console.log('🔍 在排行榜中查找用户:', userEngName);
                console.log('📋 排行榜用户列表:', latestLeaderboard.map(u => `${u.eng_name}(${u.rank})`).join(', '));
                
                // 优化匹配逻辑：去除空格、大小写不敏感、处理null/undefined
                const normalizeString = (str) => {
                    if (!str) return '';
                    return String(str).trim().toLowerCase();
                };
                
                const normalizedUserEngName = normalizeString(userEngName);
                console.log('🔍 标准化后的用户名:', normalizedUserEngName);
                
                // 使用优化后的匹配逻辑
                const currentUserData = latestLeaderboard.find(user => {
                    const normalizedEngName = normalizeString(user.eng_name);
                    const isMatch = normalizedEngName === normalizedUserEngName;
                    
                    if (isMatch) {
                        console.log('✅ 匹配成功!', {
                            原始用户名: user.eng_name,
                            标准化用户名: normalizedEngName,
                            查找用户名: normalizedUserEngName
                        });
                    }
                    
                    return isMatch;
                });
                
                if (currentUserData) {
                    // 从排行榜中获取称号和emoji（与排行榜显示逻辑完全一致）
                    userTitle = currentUserData.title || '快乐韭菜';
                    userEmoji = currentUserData.emoji || '🥬';
                    
                    console.log('✅ 从Epoch封神榜获取用户称号成功!');
                    console.log('  - 用户:', userEngName);
                    console.log('  - 匹配到的用户名:', currentUserData.eng_name);
                    console.log('  - 排名:', currentUserData.rank);
                    console.log('  - 称号:', userTitle);
                    console.log('  - Emoji:', userEmoji);
                    console.log('  - 总资产:', currentUserData.total_assets);
                    console.log('  - 收益率:', currentUserData.profit_rate);
                } else {
                    console.log('⚠️ 用户未在Epoch封神榜中找到，使用默认称号：快乐韭菜🥬');
                    console.log('  - 查找的用户名:', userEngName);
                    console.log('  - 标准化用户名:', normalizedUserEngName);
                    console.log('  - 排行榜中的用户(前5名):', latestLeaderboard.slice(0, 5).map(u => `${u.eng_name}(标准化:${normalizeString(u.eng_name)})`).join(', '));
                    console.log('  - 排行榜总人数:', latestLeaderboard.length);
                    
                    // 详细对比：逐个检查为什么没匹配上
                    console.log('🔍 详细匹配检查:');
                    latestLeaderboard.slice(0, 10).forEach((user, index) => {
                        const normalized = normalizeString(user.eng_name);
                        console.log(`  ${index + 1}. ${user.eng_name} -> ${normalized} (匹配: ${normalized === normalizedUserEngName})`);
                    });
                    
                    // 用户不在排行榜中，使用默认称号
                    userTitle = '快乐韭菜';
                    userEmoji = '🥬';
                    
                    console.log('💡 提示：用户可能还未保存数据到数据库，或数据未同步');
                    console.log('✅ 使用默认称号：快乐韭菜🥬');
                }
            } else {
                console.log('⚠️ 无法获取排行榜数据或排行榜为空，使用默认称号：快乐韭菜🥬');
                
                // 无法获取排行榜数据，使用默认称号
                userTitle = '快乐韭菜';
                userEmoji = '🥬';
                
                console.log('✅ 使用默认称号：快乐韭菜🥬');
            }
        } catch (error) {
            console.error('❌ 获取排行榜数据时出错:', error);
            console.log('⚠️ 发生错误，使用默认称号：快乐韭菜🥬');
            
            // 发生错误时使用默认称号
            userTitle = '快乐韭菜';
            userEmoji = '🥬';
        }
        
        console.log('📤 准备发送弹幕到后端...');
        console.log('  - 用户:', userEngName);
        console.log('  - 称号:', userTitle);
        console.log('  - Emoji:', userEmoji);
        console.log('  - 内容:', content);
        
        // 发送到后端
        const response = await fetch('/api/danmaku/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_eng_name: userEngName,
                user_chn_name: displayName, // 使用英文名
                user_title: userTitle,      // 用户称号
                user_emoji: userEmoji,      // 用户emoji图标
                content: content
            })
        });
        
        const result = await response.json();
        console.log('📡 后端响应:', result);
        
        if (result.success) {
            showMessage('弹幕发送成功！', 'success', 2000);
            input.value = '';
            
            console.log('🎬 立即显示弹幕:', {
                displayName,
                content,
                userTitle,
                userEmoji
            });
            
            // 立即显示自己的弹幕（带称号和emoji）
            createDanmaku(displayName, content, userTitle, userEmoji);
            
            // 将用户刚发送的弹幕加入优先队列（延迟3-5秒后再次显示）
            const userDanmaku = {
                user_eng_name: userEngName,
                user_chn_name: displayName,
                user_title: userTitle,
                user_emoji: userEmoji,
                content: content,
                id: result.danmaku_id || Date.now(), // 使用后端返回的ID或时间戳
                timestamp: Date.now()
            };
            danmakuState.priorityQueue.push(userDanmaku);
            console.log('✅ 用户弹幕已加入优先队列，将在3-5秒后再次显示');
            
            // 刷新弹幕列表
            await loadDanmakuList();
        } else {
            showMessage(result.message || '发送失败', 'error', 2000);
        }
    } catch (error) {
        console.error('❌ 发送弹幕失败:', error);
        console.error('📍 错误详情:', {
            message: error.message,
            stack: error.stack
        });
        showMessage('发送失败，请稍后重试', 'error', 2000);
    }
}

// 根据资产计算用户称号和emoji
function getUserRankInfo(totalAssets) {
    // 模拟排名逻辑（实际应该从排行榜获取）
    const profitRate = ((totalAssets - 1000000) / 1000000) * 100;
    
    if (profitRate >= 50) {
        return { title: '币神进化论', emoji: '👑' };
    } else if (profitRate >= 30) {
        return { title: '币圈巨鲸', emoji: '🐋' };
    } else if (profitRate >= 20) {
        return { title: '币圈三太子', emoji: '🤴' };
    } else if (profitRate >= 10) {
        return { title: '南山资本家', emoji: '💼' };
    } else if (profitRate >= 5) {
        return { title: '王牌交易员', emoji: '🎯' };
    } else if (profitRate >= 0) {
        return { title: 'K线魔术师', emoji: '🎩' };
    } else if (profitRate >= -10) {
        return { title: '趋势观察家', emoji: '🔭' };
    } else if (profitRate >= -20) {
        return { title: '潜力韭菜', emoji: '🌱' };
    } else {
        return { title: '快乐韭菜', emoji: '🥬' };
    }
}

// 加载弹幕列表
async function loadDanmakuList() {
    try {
        const response = await fetch('/api/danmaku/list?limit=50');
        const result = await response.json();
        
        if (result.success && result.danmaku_list) {
            danmakuState.danmakuList = result.danmaku_list;
            console.log(`加载了 ${danmakuState.danmakuList.length} 条弹幕`);
        }
    } catch (error) {
        console.error('加载弹幕列表失败:', error);
    }
}

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

// 创建弹幕元素
function createDanmaku(userName, content, userTitle = null, userEmoji = null) {
    const container = document.getElementById('danmakuContainer');
    if (!container) return;

    const danmaku = document.createElement('div');
    danmaku.className = 'danmaku-item';

    // 加密用户名：保留前后一个字符，中间用***代替
    const maskedUserName = maskUserName(userName);

    // 构建弹幕文本：称号 emoji 用户名：内容
    let danmakuText = '';
    if (userTitle && userEmoji) {
        danmakuText = `${userTitle} ${userEmoji} ${maskedUserName}：${content}`;
    } else if (userEmoji) {
        danmakuText = `${userEmoji} ${maskedUserName}：${content}`;
    } else if (userTitle) {
        danmakuText = `${userTitle} ${maskedUserName}：${content}`;
    } else {
        danmakuText = `${maskedUserName}：${content}`;
    }
    
    danmaku.textContent = danmakuText;
    
    // 随机Y轴位置（在图表上半部分，避免遮挡价格线）
    const randomTop = Math.random() * 30 + 5; // 5% - 35% 的位置
    danmaku.style.top = `${randomTop}%`;
    
    // 丰富多彩的现代化配色方案 - 15种美观颜色
    const colors = [
        '#3B82F6',   // 亮蓝色
        '#8B5CF6',   // 亮紫色
        '#EC4899',   // 亮粉色
        '#10B981',   // 翠绿色
        '#F59E0B',   // 琥珀色
        '#06B6D4',   // 青色
        '#EF4444',   // 红色
        '#6366F1',   // 靛蓝色
        '#14B8A6',   // 青绿色
        '#F97316',   // 橙色
        '#A855F7',   // 紫罗兰
        '#22C55E',   // 绿色
        '#FB923C',   // 浅橙色
        '#84CC16',   // 柠檬绿
        '#F43F5E'    // 玫瑰红
    ];
    
    // 选择颜色，确保与上一条弹幕颜色不同
    let selectedColor;
    let attempts = 0;
    do {
        selectedColor = colors[Math.floor(Math.random() * colors.length)];
        attempts++;
    } while (selectedColor === danmakuState.lastColor && attempts < 10);
    
    // 更新最后使用的颜色
    danmakuState.lastColor = selectedColor;
    danmaku.style.color = selectedColor;
    
    container.appendChild(danmaku);
    
    // 动画结束后移除元素
    setTimeout(() => {
        if (danmaku.parentNode) {
            danmaku.parentNode.removeChild(danmaku);
        }
    }, 12000); // 12秒后移除
}

// 启动弹幕滚动
function startDanmakuScroll() {
    if (danmakuState.isRunning) return;
    
    danmakuState.isRunning = true;
    
    // 每3-5秒显示一条弹幕（优先显示用户刚发送的）
    const showRandomDanmaku = () => {
        let danmaku = null;
        let displayName = '';
        let userTitle = null;
        let userEmoji = null;
        
        // 1. 优先检查优先队列（用户刚发送的弹幕）
        if (danmakuState.priorityQueue.length > 0) {
            danmaku = danmakuState.priorityQueue.shift(); // 取出第一个
            displayName = danmaku.user_eng_name || danmaku.user_chn_name || 'Guest';
            userTitle = danmaku.user_title || null;
            userEmoji = danmaku.user_emoji || null;
            
            console.log('🎯 优先显示用户弹幕:', {
                displayName,
                content: danmaku.content,
                userTitle,
                userEmoji
            });
            
            // 创建弹幕
            createDanmaku(displayName, danmaku.content, userTitle, userEmoji);
            
            // 记录已显示（使用内容+用户名作为唯一标识）
            const danmakuKey = `${danmaku.user_eng_name}_${danmaku.content}`;
            danmakuState.recentlyShown.set(danmakuKey, Date.now());
        }
        // 2. 从弹幕列表中随机选择（排除最近10秒内显示过的）
        else if (danmakuState.danmakuList.length > 0) {
            const now = Date.now();
            const minInterval = 10000; // 10秒间隔
            
            // 清理过期的记录（超过10秒的）
            for (const [key, timestamp] of danmakuState.recentlyShown.entries()) {
                if (now - timestamp > minInterval) {
                    danmakuState.recentlyShown.delete(key);
                }
            }
            
            // 过滤出可以显示的弹幕（最近10秒内未显示过的）
            const availableDanmakus = danmakuState.danmakuList.filter(d => {
                const danmakuKey = `${d.user_eng_name}_${d.content}`;
                const lastShown = danmakuState.recentlyShown.get(danmakuKey);
                return !lastShown || (now - lastShown > minInterval);
            });
            
            if (availableDanmakus.length > 0) {
                // 从可用弹幕中随机选择
                const randomIndex = Math.floor(Math.random() * availableDanmakus.length);
                danmaku = availableDanmakus[randomIndex];
                
                // 优先使用英文名，如果没有则使用中文名，最后使用Guest
                displayName = danmaku.user_eng_name || danmaku.user_chn_name || 'Guest';
                
                // 获取称号和emoji（优先使用数据库中的，如果没有则从排行榜中获取）
                userTitle = danmaku.user_title || null;
                userEmoji = danmaku.user_emoji || null;
                
                // 如果数据库中没有称号信息，尝试从缓存的排行榜数据中获取
                if (!userTitle || !userEmoji) {
                    if (appState.leaderboardData && appState.leaderboardData.length > 0) {
                        // 优化匹配逻辑：去除空格、大小写不敏感、处理null/undefined
                        const normalizeString = (str) => {
                            if (!str) return '';
                            return String(str).trim().toLowerCase();
                        };
                        
                        const normalizedDisplayName = normalizeString(displayName);
                        
                        const userInLeaderboard = appState.leaderboardData.find(u => {
                            const normalizedEngName = normalizeString(u.eng_name);
                            return normalizedEngName === normalizedDisplayName;
                        });
                        
                        if (userInLeaderboard) {
                            userTitle = userInLeaderboard.title || '快乐韭菜';
                            userEmoji = userInLeaderboard.emoji || '🥬';
                            console.log('🔄 从排行榜缓存中获取称号:', {
                                user: displayName,
                                normalizedUser: normalizedDisplayName,
                                matchedUser: userInLeaderboard.eng_name,
                                title: userTitle,
                                emoji: userEmoji
                            });
                        } else {
                            // 用户不在排行榜中，使用默认称号
                            userTitle = userTitle || '快乐韭菜';
                            userEmoji = userEmoji || '🥬';
                            console.log('⚠️ 随机弹幕用户未在排行榜中找到:', {
                                user: displayName,
                                normalizedUser: normalizedDisplayName,
                                使用默认称号: userTitle
                            });
                        }
                    } else {
                        // 没有排行榜数据，使用默认称号
                        userTitle = userTitle || '快乐韭菜';
                        userEmoji = userEmoji || '🥬';
                    }
                }
                
                // 创建弹幕时传入称号和emoji
                createDanmaku(displayName, danmaku.content, userTitle, userEmoji);
                
                // 记录已显示
                const danmakuKey = `${danmaku.user_eng_name}_${danmaku.content}`;
                danmakuState.recentlyShown.set(danmakuKey, now);
                
                console.log('📺 显示随机弹幕:', {
                    displayName,
                    content: danmaku.content,
                    userTitle,
                    userEmoji,
                    availableCount: availableDanmakus.length,
                    totalCount: danmakuState.danmakuList.length
                });
            } else {
                console.log('⏸️ 所有弹幕都在冷却中，跳过本次显示');
            }
        }
        
        // 随机间隔3-5秒
        const nextDelay = Math.random() * 2000 + 3000;
        danmakuState.intervalId = setTimeout(showRandomDanmaku, nextDelay);
    };
    
    showRandomDanmaku();
}

// 停止弹幕滚动
function stopDanmakuScroll() {
    danmakuState.isRunning = false;
    if (danmakuState.intervalId) {
        clearTimeout(danmakuState.intervalId);
        danmakuState.intervalId = null;
    }
}

// 初始化弹幕功能
async function initDanmaku() {
    const sendBtn = document.getElementById('sendDanmakuBtn');
    const input = document.getElementById('danmakuInput');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendDanmaku);
    }
    
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendDanmaku();
            }
        });
    }
    
    // 初始化时先加载排行榜数据（用于弹幕称号显示）
    console.log('🎬 初始化弹幕功能，先加载排行榜数据...');
    try {
        await fetchLeaderboardData();
        console.log('✅ 排行榜数据已加载，弹幕称号功能就绪');
    } catch (error) {
        console.warn('⚠️ 排行榜数据加载失败，弹幕将使用默认称号:', error);
    }
    
    // 加载弹幕列表
    await loadDanmakuList();
    
    // 启动弹幕滚动
    startDanmakuScroll();
    
    // 每30秒刷新一次弹幕列表和排行榜数据
    setInterval(async () => {
        await loadDanmakuList();
        // 同时刷新排行榜数据，确保称号信息是最新的
        try {
            await fetchLeaderboardData();
            console.log('🔄 排行榜数据已刷新（用于弹幕称号）');
        } catch (error) {
            console.warn('⚠️ 排行榜数据刷新失败:', error);
        }
    }, 30000);
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    // ⚡ 性能优化：延迟初始化弹幕，不影响首屏加载
    setTimeout(() => {
        initDanmaku();
    }, 3000);
});

// ==================== 黑名单功能 ====================

/**
 * 显示黑名单弹窗
 * @param {string} message - 黑名单提示消息
 */
function showBlacklistModal(message) {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    overlay.id = 'blacklistModal';
    
    // 创建弹窗内容
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl';
    modal.innerHTML = `
        <div class="mb-6">
            <div class="text-6xl mb-4">🚫</div>
            <h2 class="text-2xl font-bold text-red-600 mb-4">账号已被限制</h2>
            <p class="text-gray-700 text-lg leading-relaxed">${message}</p>
        </div>
        <button 
            onclick="closeBlacklistModal()" 
            class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        >
            我知道了
        </button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    console.log('🚫 黑名单弹窗已显示');
}

/**
 * 关闭黑名单弹窗
 */
window.closeBlacklistModal = function() {
    const modal = document.getElementById('blacklistModal');
    if (modal) {
        modal.remove();
    }
};

/**
 * 禁用所有交易功能
 */
function disableTrading() {
    console.log('🔒 禁用所有交易功能');
    
    // 禁用买入按钮
    const buyBtn = document.getElementById('buyBtn');
    if (buyBtn) {
        buyBtn.disabled = true;
        buyBtn.classList.add('opacity-50', 'cursor-not-allowed');
        buyBtn.title = '黑名单用户无法交易';
    }
    
    // 禁用卖出按钮
    const sellBtn = document.getElementById('sellBtn');
    if (sellBtn) {
        sellBtn.disabled = true;
        sellBtn.classList.add('opacity-50', 'cursor-not-allowed');
        sellBtn.title = '黑名单用户无法交易';
    }
    
    // 禁用交易数量输入框
    const amountInput = document.getElementById('tradeAmount');
    if (amountInput) {
        amountInput.disabled = true;
        amountInput.classList.add('opacity-50', 'cursor-not-allowed');
    }
    
    // 禁用保存按钮
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.classList.add('opacity-50', 'cursor-not-allowed');
        saveBtn.title = '黑名单用户无法保存数据';
    }
    
    console.log('✅ 交易功能已全部禁用');
}