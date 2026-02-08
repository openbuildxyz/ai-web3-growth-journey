/**
 * Oracle-X Chrome Extension - Service Worker
 * 处理截图捕获和 Side Panel 通信
 */

// API 基础 URL（开发环境）
const API_BASE_URL = 'http://localhost:3000';

// 存储当前截图数据
let currentScreenshot = null;
let currentAnalysisData = null;

/**
 * 监听扩展图标点击事件
 */
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // 1. 打开 Side Panel
    await chrome.sidePanel.open({ tabId: tab.id });
    
    // 2. 延迟捕获截图（等待 Side Panel 打开）
    setTimeout(async () => {
      await captureAndAnalyze(tab);
    }, 300);
    
  } catch (error) {
    console.error('Failed to handle action click:', error);
  }
});

/**
 * 捕获截图并发送识别请求
 */
async function captureAndAnalyze(tab) {
  try {
    // 1. 截取当前可见页面
    const screenshot = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 90
    });
    
    currentScreenshot = screenshot;
    
    // 2. 通知 Side Panel 开始识别
    chrome.runtime.sendMessage({
      type: 'SCREENSHOT_CAPTURED',
      data: { 
        screenshot,
        tabUrl: tab.url,
        tabTitle: tab.title 
      }
    });
    
    // 3. 调用识别 API
    const recognizeResult = await callRecognizeAPI(screenshot);
    
    // 4. 发送识别结果到 Side Panel
    chrome.runtime.sendMessage({
      type: 'RECOGNIZE_COMPLETE',
      data: recognizeResult
    });
    
  } catch (error) {
    console.error('Capture and analyze error:', error);
    chrome.runtime.sendMessage({
      type: 'RECOGNIZE_ERROR',
      data: { error: error.message }
    });
  }
}

/**
 * 调用视觉识别 API
 */
async function callRecognizeAPI(screenshotBase64) {
  // 移除 data:image/png;base64, 前缀
  const base64Data = screenshotBase64.replace(/^data:image\/\w+;base64,/, '');
  
  const response = await fetch(`${API_BASE_URL}/api/recognize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ image: base64Data })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Recognition failed');
  }
  
  return await response.json();
}

/**
 * 调用分析 API（SSE 流式）
 */
async function callAnalyzeAPI(symbol, direction, marketData) {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      symbol,
      direction,
      marketData
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Analysis failed');
  }
  
  return response;
}

/**
 * 调用 Twitter 情绪分析 API
 */
async function callTwitterAPI(symbol) {
  const response = await fetch(`${API_BASE_URL}/api/twitter?symbol=${symbol}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Twitter sentiment analysis failed');
  }
  
  return await response.json();
}

/**
 * 监听来自 Side Panel 的消息
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SCREENSHOT') {
    // 返回当前截图
    sendResponse({ screenshot: currentScreenshot });
    return true;
  }
  
  if (message.type === 'START_ANALYSIS') {
    // 开始分析流程
    handleAnalysis(message.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 保持消息通道开放
  }
  
  if (message.type === 'FETCH_TWITTER_SENTIMENT') {
    // 获取 Twitter 情绪
    callTwitterAPI(message.data.symbol)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.type === 'RETRY_CAPTURE') {
    // 重新截图
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        await captureAndAnalyze(tabs[0]);
      }
    });
    return true;
  }
});

/**
 * 处理分析请求
 */
async function handleAnalysis(data) {
  const { symbol, direction, marketData } = data;
  
  try {
    const response = await callAnalyzeAPI(symbol, direction, marketData);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let fullText = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            fullText += parsed.content;
            // 流式发送到 Side Panel
            chrome.runtime.sendMessage({
              type: 'ANALYSIS_STREAM',
              data: { content: parsed.content, fullText }
            });
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
    
    // 分析完成
    chrome.runtime.sendMessage({
      type: 'ANALYSIS_COMPLETE',
      data: { fullText }
    });
    
    return { fullText };
    
  } catch (error) {
    chrome.runtime.sendMessage({
      type: 'ANALYSIS_ERROR',
      data: { error: error.message }
    });
    throw error;
  }
}

console.log('Oracle-X Service Worker initialized');
