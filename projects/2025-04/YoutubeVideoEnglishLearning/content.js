// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getTimestamp") {
    const video = document.querySelector('video');
    const videoId = getVideoId();
    const videoTitle = getVideoTitle();
    if (video) {
      sendResponse({
        timestamp: video.currentTime,
        videoId: videoId,
        videoTitle: videoTitle
      });
    }
  } else if (request.action === "jumpToTimestamp") {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = parseFloat(request.timestamp);
      video.play();
      // 滚动到视频位置
      video.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  return true;
});

// 获取YouTube视频ID
function getVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

// 获取视频标题
function getVideoTitle() {
  const titleElement = document.querySelector('h1.style-scope.ytd-video-primary-info-renderer');
  return titleElement ? titleElement.textContent.trim() : '未知视频';
}

// 处理页面加载后的时间戳跳转
function handleTimeStampOnLoad() {
  const urlParams = new URLSearchParams(window.location.search);
  const timeParam = urlParams.get('t');
  
  if (timeParam) {
    // 等待视频元素加载
    const checkVideo = setInterval(() => {
      const video = document.querySelector('video');
      if (video) {
        clearInterval(checkVideo);
        // 移除URL中的时间参数，避免刷新页面时重复跳转
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('t');
        window.history.replaceState({}, '', newUrl.toString());
        
        // 确保视频已经准备好
        if (video.readyState >= 2) {
          video.currentTime = parseFloat(timeParam);
          video.play();
          video.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          video.addEventListener('loadeddata', () => {
            video.currentTime = parseFloat(timeParam);
            video.play();
            video.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, { once: true });
        }
      }
    }, 100);
    
    // 设置超时，避免无限等待
    setTimeout(() => clearInterval(checkVideo), 10000);
  }
}

// 在页面加载时处理时间戳
handleTimeStampOnLoad();

// 监听 YouTube 的页面导航（因为 YouTube 是 SPA）
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    handleTimeStampOnLoad();
  }
}).observe(document, { subtree: true, childList: true });