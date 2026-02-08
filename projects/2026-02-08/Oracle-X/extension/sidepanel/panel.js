/**
 * Oracle-X Side Panel - 交互逻辑
 */

// 状态管理
const state = {
  screenshot: null,
  recognizeResult: null,
  selectedIntent: null,
  analysisText: '',
  status: 'idle' // idle | recognizing | recognized | analyzing | complete | error
};

// DOM 元素
const elements = {
  retryBtn: document.getElementById('retryBtn'),
  recognizeCard: document.getElementById('recognizeCard'),
  recognizeContent: document.getElementById('recognizeContent'),
  intentSection: document.getElementById('intentSection'),
  longBtn: document.getElementById('longBtn'),
  shortBtn: document.getElementById('shortBtn'),
  analyzeOnlyBtn: document.getElementById('analyzeOnlyBtn'),
  scoreSection: document.getElementById('scoreSection'),
  scoreArc: document.getElementById('scoreArc'),
  scoreValue: document.getElementById('scoreValue'),
  scoreSummary: document.getElementById('scoreSummary'),
  analysisSection: document.getElementById('analysisSection'),
  analysisContent: document.getElementById('analysisContent'),
  conclusionSection: document.getElementById('conclusionSection'),
  conclusionBadge: document.getElementById('conclusionBadge'),
  // Twitter 元素
  twitterSection: document.getElementById('twitterSection'),
  twitterContent: document.getElementById('twitterContent')
};

/**
 * 初始化
 */
function init() {
  // 绑定事件
  elements.retryBtn.addEventListener('click', handleRetry);
  elements.longBtn.addEventListener('click', () => handleIntentSelect('LONG'));
  elements.shortBtn.addEventListener('click', () => handleIntentSelect('SHORT'));
  elements.analyzeOnlyBtn.addEventListener('click', () => handleIntentSelect('ANALYZE'));
  
  // 监听来自 Service Worker 的消息
  chrome.runtime.onMessage.addListener(handleMessage);
  
  // 请求当前截图（如果已存在）
  chrome.runtime.sendMessage({ type: 'GET_SCREENSHOT' }, (response) => {
    if (response && response.screenshot) {
      state.screenshot = response.screenshot;
    }
  });
}

/**
 * 处理来自 Service Worker 的消息
 */
function handleMessage(message) {
  switch (message.type) {
    case 'SCREENSHOT_CAPTURED':
      state.screenshot = message.data.screenshot;
      state.status = 'recognizing';
      renderRecognizing();
      break;
      
    case 'RECOGNIZE_COMPLETE':
      state.recognizeResult = message.data;
      state.status = 'recognized';
      renderRecognizeResult();
      break;
      
    case 'RECOGNIZE_ERROR':
      state.status = 'error';
      renderRecognizeError(message.data.error);
      break;
      
    case 'ANALYSIS_STREAM':
      state.analysisText = message.data.fullText;
      renderAnalysisStream();
      break;
      
    case 'ANALYSIS_COMPLETE':
      state.analysisText = message.data.fullText;
      state.status = 'complete';
      renderAnalysisComplete();
      break;
      
    case 'ANALYSIS_ERROR':
      state.status = 'error';
      renderAnalysisError(message.data.error);
      break;
  }
}

/**
 * 渲染识别中状态
 */
function renderRecognizing() {
  elements.recognizeContent.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <span>正在识别交易页面...</span>
    </div>
  `;
  elements.intentSection.classList.add('hidden');
  elements.scoreSection.classList.add('hidden');
  elements.analysisSection.classList.add('hidden');
  elements.conclusionSection.classList.add('hidden');
}

/**
 * 渲染识别结果
 */
function renderRecognizeResult() {
  const result = state.recognizeResult;
  
  if (!result || (!result.platform && !result.pair)) {
    elements.recognizeContent.innerHTML = `
      <div class="error-state">
        <span>⚠️</span>
        <span>无法识别交易页面，请确保页面显示完整</span>
      </div>
    `;
    return;
  }
  
  const platformIcon = getPlatformIcon(result.platform);
  const tradeTypeLabel = getTradeTypeLabel(result.trade_type);
  
  elements.recognizeContent.innerHTML = `
    <div class="recognize-result">
      <div class="platform-badge">
        ${platformIcon}
        <span>${result.platform || '未知平台'}</span>
      </div>
      <div class="pair-display">${result.pair || '未知交易对'}</div>
      ${tradeTypeLabel ? `<div class="trade-type">${tradeTypeLabel}</div>` : ''}
    </div>
  `;
  
  // 显示意图选择
  elements.intentSection.classList.remove('hidden');
}

/**
 * 渲染识别错误
 */
function renderRecognizeError(error) {
  elements.recognizeContent.innerHTML = `
    <div class="error-state">
      <span>❌</span>
      <span>识别失败: ${error}</span>
    </div>
  `;
}

/**
 * 处理意图选择
 */
async function handleIntentSelect(intent) {
  state.selectedIntent = intent;
  state.status = 'analyzing';
  state.analysisText = '';
  
  // 隐藏意图按钮，显示分析区域
  elements.intentSection.classList.add('hidden');
  elements.scoreSection.classList.remove('hidden');
  elements.analysisSection.classList.remove('hidden');
  
  // 重置分析内容
  elements.analysisContent.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <span>AI 正在分析...</span>
    </div>
  `;
  
  // 构建分析请求
  const result = state.recognizeResult;
  const symbol = (result?.pair || 'BTCUSDT').replace('/', '');
  const direction = intent === 'LONG' ? 'LONG' : intent === 'SHORT' ? 'SHORT' : 'LONG';
  
  // 发送分析请求到 Service Worker
  chrome.runtime.sendMessage({
    type: 'START_ANALYSIS',
    data: {
      symbol,
      direction,
      marketData: {
        price: '0', // 将由后端获取实际数据
        change24h: '0',
        volume: '0',
        high24h: '0',
        low24h: '0',
        fearGreedIndex: null,
        fearGreedLabel: null,
        klines: null
      }
    }
  });

  // 获取 Twitter 情绪
  fetchAndRenderTwitterSentiment(symbol);
}

/**
 * 渲染流式分析内容
 */
function renderAnalysisStream() {
  elements.analysisContent.innerHTML = state.analysisText + '<span class="cursor-blink">▊</span>';
  elements.analysisContent.scrollTop = elements.analysisContent.scrollHeight;
  
  // 更新分数
  updateScoreFromText(state.analysisText);
}

/**
 * 渲染分析完成
 */
function renderAnalysisComplete() {
  elements.analysisContent.innerHTML = state.analysisText;
  
  // 更新最终分数
  updateScoreFromText(state.analysisText);
  
  // 显示结论
  renderConclusion();
}

/**
 * 渲染分析错误
 */
function renderAnalysisError(error) {
  elements.analysisContent.innerHTML = `
    <div class="error-state">
      <span>❌</span>
      <span>分析失败: ${error}</span>
    </div>
  `;
}

/**
 * 从文本中提取分数并更新仪表盘
 */
function updateScoreFromText(text) {
  // 尝试从文本中提取评分
  let score = 50; // 默认分数
  let summary = '分析中...';
  
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('🟢') || lowerText.includes('建议执行')) {
    score = 75;
    summary = '当前市场环境有利';
  } else if (lowerText.includes('🔴') || lowerText.includes('高风险')) {
    score = 25;
    summary = '当前市场风险较高';
  } else if (lowerText.includes('🟡') || lowerText.includes('观望')) {
    score = 50;
    summary = '建议谨慎观望';
  }
  
  // 更新仪表盘
  const arcLength = (score / 100) * 126; // 126 是半圆弧长
  elements.scoreArc.style.strokeDasharray = `${arcLength} 126`;
  elements.scoreValue.textContent = score;
  elements.scoreSummary.textContent = summary;
  
  // 更新分数颜色
  if (score >= 60) {
    elements.scoreValue.style.color = '#22c55e';
  } else if (score <= 40) {
    elements.scoreValue.style.color = '#ef4444';
  } else {
    elements.scoreValue.style.color = '#eab308';
  }
}

/**
 * 渲染结论徽章
 */
function renderConclusion() {
  const text = state.analysisText.toLowerCase();
  let riskLevel = 'medium';
  let title = '🟡 建议观望';
  let desc = '市场信号混合，建议谨慎评估后再行动';
  
  if (text.includes('🟢') || text.includes('建议执行')) {
    riskLevel = 'low';
    title = '🟢 条件有利';
    desc = '技术指标和市场情绪支持当前交易方向';
  } else if (text.includes('🔴') || text.includes('高风险')) {
    riskLevel = 'high';
    title = '🔴 高风险警告';
    desc = '当前市场条件不利，建议暂缓操作';
  }
  
  elements.conclusionBadge.className = `conclusion-badge ${riskLevel}`;
  elements.conclusionBadge.querySelector('.conclusion-title').textContent = title;
  elements.conclusionBadge.querySelector('.conclusion-desc').textContent = desc;
  elements.conclusionSection.classList.remove('hidden');
}

/**
 * 处理重试
 */
function handleRetry() {
  state.status = 'idle';
  state.recognizeResult = null;
  state.analysisText = '';
  
  chrome.runtime.sendMessage({ type: 'RETRY_CAPTURE' });
  renderRecognizing();
}

/**
 * 获取平台图标
 */
function getPlatformIcon(platform) {
  const icons = {
    'Binance': '🟡',
    'OKX': '⚪',
    'Bybit': '🟠',
    'Coinbase': '🔵',
    'Uniswap': '🦄',
    'default': '📊'
  };
  return icons[platform] || icons.default;
}

/**
 * 获取交易类型标签
 */
function getTradeTypeLabel(type) {
  const labels = {
    'spot': '现货交易',
    'perpetual': '永续合约',
    'futures': '交割合约'
  };
  return labels[type] || '';
}

/**
 * 获取并渲染 Twitter 情绪
 */
async function fetchAndRenderTwitterSentiment(symbol) {
  elements.twitterSection.classList.remove('hidden');
  elements.twitterContent.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <span>正在分析推文...</span>
    </div>
  `;

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'FETCH_TWITTER_SENTIMENT',
      data: { symbol }
    });

    if (response.success) {
      renderTwitterSentiment(response.data);
    } else {
      renderTwitterError(response.error);
    }
  } catch (error) {
    renderTwitterError(error.message);
  }
}

/**
 * 渲染 Twitter 情绪面板
 */
function renderTwitterSentiment(data) {
  const { totalCount, positive, negative, neutral, overallSentiment, confidencePercent, tweets } = data;
  
  const positivePercent = totalCount > 0 ? Math.round((positive / totalCount) * 100) : 0;
  const negativePercent = totalCount > 0 ? Math.round((negative / totalCount) * 100) : 0;
  const neutralPercent = totalCount > 0 ? Math.round((neutral / totalCount) * 100) : 0;
  
  const sentimentColor = overallSentiment === 'BULLISH' ? 'var(--accent-green)' : 
                         overallSentiment === 'BEARISH' ? 'var(--accent-red)' : '#9e9e9e';
  
  const emoji = overallSentiment === 'BULLISH' ? '🟢' : overallSentiment === 'BEARISH' ? '🔴' : '⚪';

  elements.twitterContent.innerHTML = `
    <div class="twitter-dashboard">
      <div class="sentiment-overall" style="border-left: 3px solid ${sentimentColor}">
        <span>${emoji} ${overallSentiment}</span>
        <span style="color: ${sentimentColor}">${confidencePercent}%</span>
      </div>
      
      <div class="sentiment-bar">
        <div class="bar-segment bg-green" style="width: ${positivePercent}%"></div>
        <div class="bar-segment bg-gray" style="width: ${neutralPercent}%"></div>
        <div class="bar-segment bg-red" style="width: ${negativePercent}%"></div>
      </div>
      
      <div class="tweets-list">
        ${tweets.slice(0, 5).map(tweet => `
          <div class="tweet-card ${tweet.sentiment.toLowerCase()}">
            <div class="tweet-header">
              <span class="tweet-author">@${tweet.authorHandle || tweet.author}</span>
              <span class="tweet-time">${tweet.timeAgo || new Date(tweet.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="tweet-text">${tweet.text}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * 渲染 Twitter 错误
 */
function renderTwitterError(error) {
  elements.twitterContent.innerHTML = `
    <div class="error-state">
      <span>❌</span>
      <span>获取推文失败: ${error}</span>
    </div>
  `;
}

// 初始化
init();
