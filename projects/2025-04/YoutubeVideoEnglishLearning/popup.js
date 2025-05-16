document.addEventListener('DOMContentLoaded', function() {
  const wordInput = document.getElementById('wordInput');
  const meaningInput = document.getElementById('meaningInput');
  const addWordButton = document.getElementById('addWord');
  const wordList = document.getElementById('wordList');
  const voiceSelect = document.getElementById('voiceSelect');
  const rateInput = document.getElementById('rateInput');

  // 翻译功能
  async function translateText(text) {
    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh`);
      const data = await response.json();
      if (data.responseStatus === 200) {
        return data.responseData.translatedText;
      }
      throw new Error('Translation failed');
    } catch (error) {
      console.error('Translation error:', error);
      return null;
    }
  }

  // 初始化语音合成
  let speechSynthesis = window.speechSynthesis;
  let voices = [];

  // 加载可用的语音
  function loadVoices() {
    voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';
    
    // 过滤出英语语音
    const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
    
    englishVoices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });

    // 保存选择的语音
    voiceSelect.addEventListener('change', function() {
      chrome.storage.local.set({ 
        selectedVoice: voiceSelect.value,
        speechRate: rateInput.value
      });
    });
  }

  // 当语音列表加载完成时更新选项
  speechSynthesis.onvoiceschanged = loadVoices;

  // 加载保存的语音设置
  chrome.storage.local.get(['selectedVoice', 'speechRate'], function(result) {
    if (result.selectedVoice) {
      voiceSelect.value = result.selectedVoice;
    }
    if (result.speechRate) {
      rateInput.value = result.speechRate;
    }
  });

  // 保存语速设置
  rateInput.addEventListener('change', function() {
    chrome.storage.local.set({ speechRate: rateInput.value });
  });

  // 播放单词语音
  function playWord(word) {
    // 停止当前正在播放的语音
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    
    // 设置选中的语音
    const selectedVoice = voices.find(voice => voice.name === voiceSelect.value);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // 设置语速
    utterance.rate = parseFloat(rateInput.value);

    // 播放语音
    speechSynthesis.speak(utterance);
  }

  // 删除单词
  function deleteWord(wordData) {
    chrome.storage.local.get(['words'], function(result) {
      const words = result.words || [];
      const newWords = words.filter(w => 
        !(w.word === wordData.word && 
          w.timestamp === wordData.timestamp && 
          w.videoUrl === wordData.videoUrl)
      );
      chrome.storage.local.set({ words: newWords }, function() {
        loadWords();
      });
    });
  }

  // 加载已保存的单词
  loadWords();

  // 添加新单词
  addWordButton.addEventListener('click', async function() {
    const word = wordInput.value.trim();
    const meaning = meaningInput.value.trim();
    
    if (!word) { // 只检查单词是否为空
      alert('请输入生词！');
      return;
    }

    // 获取当前标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // 获取当前视频时间戳
    chrome.tabs.sendMessage(tab.id, { action: "getTimestamp" }, async function(response) {
      if (response && response.timestamp) {
        const wordData = {
          word: word,
          meaning: meaning,
          timestamp: response.timestamp,
          videoId: response.videoId,
          videoUrl: tab.url,
          videoTitle: response.videoTitle,
          addedAt: new Date().toISOString()
        };

        // 保存到 Chrome 存储
        chrome.storage.local.get(['words'], function(result) {
          const words = result.words || [];
          words.push(wordData);
          chrome.storage.local.set({ words: words }, function() {
            wordInput.value = '';
            meaningInput.value = '';
            loadWords();
          });
        });
      }
    });
  });

  // 加载保存的单词列表
  function loadWords() {
    chrome.storage.local.get(['words'], function(result) {
      const words = result.words || [];
      wordList.innerHTML = '';

      // 按视频URL分组
      const groupedWords = {};
      words.forEach(word => {
        if (!groupedWords[word.videoUrl]) {
          groupedWords[word.videoUrl] = {
            title: word.videoTitle || '未知视频',
            words: []
          };
        }
        groupedWords[word.videoUrl].words.push(word);
      });

      // 遍历每个视频组
      Object.entries(groupedWords).forEach(([videoUrl, group]) => {
        // 创建视频组容器
        const videoGroup = document.createElement('div');
        videoGroup.className = 'video-group';

        // 创建视频标题
        const videoTitle = document.createElement('div');
        videoTitle.className = 'video-title';
        videoTitle.textContent = group.title;
        videoGroup.appendChild(videoTitle);

        // 按时间戳排序该视频的单词
        group.words.sort((a, b) => a.timestamp - b.timestamp);

        // 创建该视频的单词列表
        group.words.forEach(wordData => {
          const wordItem = document.createElement('div');
          wordItem.className = 'word-item';
          
          const wordInfo = document.createElement('div');
          wordInfo.className = 'word-info';
          
          const wordText = document.createElement('div');
          wordText.className = 'word-text';
          
          const wordContent = document.createElement('span');
          wordContent.textContent = `${wordData.word} - ${wordData.meaning}`;
          
          const wordActions = document.createElement('div');
          wordActions.className = 'word-actions';
          
          const playButton = document.createElement('button');
          playButton.className = 'play-button';
          playButton.innerHTML = '🔊';
          playButton.title = '播放单词发音';
          playButton.onclick = () => playWord(wordData.word);

          // 添加翻译按钮
          const translateButton = document.createElement('button');
          translateButton.className = 'translate-button';
          translateButton.innerHTML = '🌐';
          translateButton.title = '翻译单词';
          
          let isTranslating = false;
          translateButton.onclick = async () => {
            if (isTranslating) return;
            isTranslating = true;
            
            // 移除现有的翻译结果
            const existingTranslation = wordItem.querySelector('.translation-result');
            if (existingTranslation) {
              existingTranslation.remove();
            }

            // 添加加载提示
            const translationResult = document.createElement('div');
            translationResult.className = 'translation-result';
            translationResult.textContent = '正在翻译...';
            wordInfo.insertBefore(translationResult, wordText.nextSibling);

            try {
              const translation = await translateText(wordData.word);
              if (translation) {
                translationResult.textContent = `翻译: ${translation}`;
              } else {
                translationResult.textContent = '翻译失败，请稍后重试';
              }
            } catch (error) {
              translationResult.textContent = '翻译服务暂时不可用';
            } finally {
              isTranslating = false;
            }
          };
          
          const deleteButton = document.createElement('button');
          deleteButton.className = 'delete-button';
          deleteButton.innerHTML = '🗑️';
          deleteButton.title = '删除单词';
          
          const confirmDelete = document.createElement('div');
          confirmDelete.className = 'confirm-delete';
          confirmDelete.innerHTML = `
            <button class="yes">确定</button>
            <button class="no">取消</button>
          `;
          
          deleteButton.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.confirm-delete.show').forEach(el => {
              if (el !== confirmDelete) {
                el.classList.remove('show');
              }
            });
            confirmDelete.classList.toggle('show');
          };
          
          confirmDelete.querySelector('.yes').onclick = (e) => {
            e.stopPropagation();
            deleteWord(wordData);
          };
          
          confirmDelete.querySelector('.no').onclick = (e) => {
            e.stopPropagation();
            confirmDelete.classList.remove('show');
          };
          
          const timestamp = document.createElement('span');
          timestamp.className = 'timestamp';
          timestamp.textContent = formatTime(wordData.timestamp);
          timestamp.title = '点击跳转到视频位置';
          
          timestamp.addEventListener('click', async function() {
            const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentVideoId = new URL(currentTab.url).searchParams.get('v');
            const targetVideoId = new URL(wordData.videoUrl).searchParams.get('v');
            
            if (currentVideoId === targetVideoId) {
              // 如果是同一个视频，直接跳转时间戳
              chrome.tabs.sendMessage(currentTab.id, {
                action: "jumpToTimestamp",
                timestamp: wordData.timestamp
              });
            } else {
              // 如果是不同视频，更新当前页面的 URL
              chrome.tabs.update(currentTab.id, {
                url: `${wordData.videoUrl}&t=${Math.floor(wordData.timestamp)}s`
              });
            }
          });

          wordActions.appendChild(playButton);
          wordActions.appendChild(translateButton);
          wordActions.appendChild(deleteButton);
          wordText.appendChild(wordContent);
          wordText.appendChild(wordActions);
          wordInfo.appendChild(wordText);
          wordItem.appendChild(wordInfo);
          wordItem.appendChild(timestamp);
          wordItem.appendChild(confirmDelete);
          videoGroup.appendChild(wordItem);
        });

        wordList.appendChild(videoGroup);
      });
    });
  }

  // 点击页面任意位置关闭确认框
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.delete-button') && !e.target.closest('.confirm-delete')) {
      document.querySelectorAll('.confirm-delete.show').forEach(el => {
        el.classList.remove('show');
      });
    }
  });

  // 格式化时间戳
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
});