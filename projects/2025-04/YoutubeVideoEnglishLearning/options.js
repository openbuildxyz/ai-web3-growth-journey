document.addEventListener('DOMContentLoaded', async function() {
    const connectButton = document.getElementById('connectWallet');
    const walletInfo = document.getElementById('walletInfo');
    const walletAddress = document.getElementById('walletAddress');
    const statusDiv = document.getElementById('status');
  
    // 检查是否已经连接
    checkConnection();
  
    connectButton.addEventListener('click', async () => {
      try {
        // 检查是否安装了MetaMask
        if (typeof window.ethereum === 'undefined') {
          throw new Error('请先安装MetaMask钱包');
        }
  
        // 请求连接钱包
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        
        // 保存钱包地址
        chrome.storage.local.set({ walletAddress: account }, function() {
          showWalletInfo(account);
          showStatus('钱包连接成功！', 'success');
        });
  
        // 监听账户变化
        window.ethereum.on('accountsChanged', function (accounts) {
          if (accounts.length === 0) {
            // 用户断开了连接
            disconnectWallet();
          } else {
            // 更新新的钱包地址
            const newAccount = accounts[0];
            chrome.storage.local.set({ walletAddress: newAccount }, function() {
              showWalletInfo(newAccount);
            });
          }
        });
  
      } catch (error) {
        console.error('连接钱包失败:', error);
        showStatus(error.message || '连接钱包失败，请重试', 'error');
      }
    });
  
    function showWalletInfo(address) {
      walletInfo.style.display = 'block';
      walletAddress.textContent = address;
      connectButton.textContent = '已连接';
      connectButton.disabled = true;
    }
  
    function showStatus(message, type) {
      statusDiv.textContent = message;
      statusDiv.className = `status ${type}`;
      setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'status';
      }, 3000);
    }
  
    function disconnectWallet() {
      chrome.storage.local.remove('walletAddress', function() {
        walletInfo.style.display = 'none';
        walletAddress.textContent = '';
        connectButton.textContent = '连接 MetaMask';
        connectButton.disabled = false;
        showStatus('钱包已断开连接', 'error');
      });
    }
  
    function checkConnection() {
      chrome.storage.local.get(['walletAddress'], function(result) {
        if (result.walletAddress) {
          showWalletInfo(result.walletAddress);
        }
      });
    }
  });