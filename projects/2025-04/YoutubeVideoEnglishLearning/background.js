// 监听安装事件
chrome.runtime.onInstalled.addListener(function() {
    // 初始化存储
    chrome.storage.local.set({ words: [] });
  });