import ContentPlatformSDK from './sdk';

/**
 * SDK使用示例
 */

// 1. 初始化SDK
const sdk = new ContentPlatformSDK();

async function example() {
  try {
    // ========== 连接钱包 ==========
    console.log('1. 连接钱包...');
    const address = await sdk.initialize('polygon_mumbai');
    console.log('✓ 已连接:', address);

    // 获取账户余额
    const provider = sdk.getProvider();
    const balance = await provider.getBalance();
    console.log('账户余额:', balance, 'ETH\n');

    // ========== 代币操作 ==========
    console.log('2. 代币操作...');
    const token = sdk.getTokenContract();

    // 查询代币余额
    const tokenBalance = await token.balanceOf(address);
    console.log('CPT余额:', tokenBalance);

    // 转账代币（示例）
    // await token.transfer('0x...', '100');
    // console.log('✓ 转账成功\n');

    // ========== 发布内容 ==========
    console.log('3. 发布内容...');
    const platform = sdk.getPlatformContract();

    // 假设已上传到IPFS
    const ipfsHash = 'QmExampleHash123456789';
    const contentId = await platform.publishContent(ipfsHash);
    console.log('✓ 内容已发布, ID:', contentId, '\n');

    // ========== 查询内容 ==========
    console.log('4. 查询内容信息...');
    const content = await platform.getContent(contentId);
    console.log('创作者:', content.creator);
    console.log('IPFS哈希:', content.ipfsHash);
    console.log('点赞数:', content.likes);
    console.log('分享数:', content.shares);
    console.log('总收益:', content.totalEarnings, 'CPT\n');

    // ========== 点赞内容 ==========
    console.log('5. 点赞内容...');
    // 注意：需要切换到其他账户才能点赞
    // await platform.likeContent(contentId);
    // console.log('✓ 点赞成功\n');

    // ========== 分享内容 ==========
    console.log('6. 分享内容...');
    // await platform.shareContent(contentId);
    // console.log('✓ 分享成功\n');

    // ========== 查询用户内容 ==========
    console.log('7. 查询用户发布的所有内容...');
    const userContents = await platform.getUserContents(address);
    console.log('用户内容ID列表:', userContents, '\n');

    // ========== 查询分润配置 ==========
    console.log('8. 查询分润配置...');
    const config = await platform.getRevenueConfig();
    console.log('点赞奖励:', config.likeReward, 'CPT');
    console.log('分享奖励:', config.shareReward, 'CPT');
    console.log('创作者分成:', config.creatorShare, '%');
    console.log('平台手续费:', config.platformFee, '%\n');

    // ========== 监听事件 ==========
    console.log('9. 监听事件...');

    platform.onContentPublished((event) => {
      console.log('📢 新内容发布:', event);
    });

    platform.onContentLiked((event) => {
      console.log('👍 内容被点赞:', event);
    });

    platform.onContentShared((event) => {
      console.log('🔄 内容被分享:', event);
    });

    console.log('✓ 事件监听已启动\n');

    // ========== 账户变化监听 ==========
    provider.onAccountsChanged((accounts) => {
      console.log('🔄 账户已切换:', accounts[0]);
    });

    provider.onChainChanged((chainId) => {
      console.log('🔄 网络已切换:', chainId);
      window.location.reload(); // 网络切换后重新加载页面
    });

  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

// React组件示例
function ContentPlatformApp() {
  const [sdk, setSdk] = React.useState(null);
  const [address, setAddress] = React.useState('');
  const [contents, setContents] = React.useState([]);

  // 连接钱包
  const connectWallet = async () => {
    try {
      const newSdk = new ContentPlatformSDK();
      const addr = await newSdk.initialize('polygon_mumbai');
      setSdk(newSdk);
      setAddress(addr);
      loadContents(newSdk, addr);
    } catch (error) {
      alert('连接失败: ' + error.message);
    }
  };

  // 加载用户内容
  const loadContents = async (sdkInstance, userAddress) => {
    const platform = sdkInstance.getPlatformContract();
    const contentIds = await platform.getUserContents(userAddress);
    
    const contentList = await Promise.all(
      contentIds.map(id => platform.getContent(id))
    );
    
    setContents(contentList);
  };

  // 发布内容
  const publishContent = async (ipfsHash) => {
    try {
      const platform = sdk.getPlatformContract();
      const contentId = await platform.publishContent(ipfsHash);
      alert('发布成功! ID: ' + contentId);
      loadContents(sdk, address);
    } catch (error) {
      alert('发布失败: ' + error.message);
    }
  };

  // 点赞内容
  const likeContent = async (contentId) => {
    try {
      const platform = sdk.getPlatformContract();
      await platform.likeContent(contentId);
      alert('点赞成功!');
      loadContents(sdk, address);
    } catch (error) {
      alert('点赞失败: ' + error.message);
    }
  };

  // 分享内容
  const shareContent = async (contentId) => {
    try {
      const platform = sdk.getPlatformContract();
      await platform.shareContent(contentId);
      alert('分享成功!');
      loadContents(sdk, address);
    } catch (error) {
      alert('分享失败: ' + error.message);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>去中心化内容创作平台</h1>
        {!address ? (
          <button onClick={connectWallet}>连接钱包</button>
        ) : (
          <div>已连接: {address.slice(0, 6)}...{address.slice(-4)}</div>
        )}
      </header>

      {address && (
        <main>
          <section className="publish-section">
            <h2>发布内容</h2>
            <input 
              type="text" 
              placeholder="IPFS哈希" 
              id="ipfsHash"
            />
            <button onClick={() => {
              const hash = document.getElementById('ipfsHash').value;
              publishContent(hash);
            }}>
              发布
            </button>
          </section>

          <section className="content-list">
            <h2>我的内容</h2>
            {contents.map((content, index) => (
              <div key={index} className="content-item">
                <div>IPFS: {content.ipfsHash}</div>
                <div>点赞: {content.likes} | 分享: {content.shares}</div>
                <div>收益: {content.totalEarnings} CPT</div>
              </div>
            ))}
          </section>
        </main>
      )}
    </div>
  );
}

// Next.js页面示例
export default function HomePage() {
  const [sdk, setSdk] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // 页面加载时初始化SDK
    const initSDK = async () => {
      try {
        const newSdk = new ContentPlatformSDK();
        setSdk(newSdk);
      } catch (error) {
        console.error('SDK初始化失败:', error);
      }
    };
    initSDK();
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const address = await sdk.initialize('polygon_mumbai');
      console.log('Connected:', address);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleConnect} disabled={loading}>
        {loading ? '连接中...' : '连接钱包'}
      </button>
    </div>
  );
}

// Vue.js组件示例
export default {
  name: 'ContentPlatform',
  data() {
    return {
      sdk: null,
      address: '',
      contents: []
    };
  },
  methods: {
    async connectWallet() {
      try {
        this.sdk = new ContentPlatformSDK();
        this.address = await this.sdk.initialize('polygon_mumbai');
        await this.loadContents();
      } catch (error) {
        alert('连接失败: ' + error.message);
      }
    },
    async loadContents() {
      const platform = this.sdk.getPlatformContract();
      const contentIds = await platform.getUserContents(this.address);
      
      this.contents = await Promise.all(
        contentIds.map(id => platform.getContent(id))
      );
    },
    async publishContent(ipfsHash) {
      try {
        const platform = this.sdk.getPlatformContract();
        await platform.publishContent(ipfsHash);
        await this.loadContents();
      } catch (error) {
        alert('发布失败: ' + error.message);
      }
    }
  }
};

// 运行示例
if (typeof window !== 'undefined') {
  example();
}
