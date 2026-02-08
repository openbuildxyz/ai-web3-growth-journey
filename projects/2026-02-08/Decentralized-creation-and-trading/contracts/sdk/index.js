import { ethers } from 'ethers';
import ContentTokenABI from './abis/ContentToken.json';
import ContentPlatformABI from './abis/ContentPlatform.json';

/**
 * Web3配置类
 * 管理合约地址和网络配置
 */
export class Web3Config {
  static NETWORKS = {
    // Monad 测试网配置
    monad_testnet: {
      chainId: '0x...', // 替换为实际的Monad测试网ChainId
      name: 'Monad Testnet',
      rpcUrl: 'https://testnet-rpc.monad.xyz', // 替换为实际的RPC URL
      explorer: 'https://testnet-explorer.monad.xyz',
      nativeCurrency: {
        name: 'MONAD',
        symbol: 'MONAD',
        decimals: 18
      }
    },
    // Polygon PoS测试网配置
    polygon_mumbai: {
      chainId: '0x13881',
      name: 'Polygon Mumbai',
      rpcUrl: 'https://rpc-mumbai.maticvigil.com',
      explorer: 'https://mumbai.polygonscan.com',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
      }
    },
    // 本地开发网络
    localhost: {
      chainId: '0x7A69',
      name: 'Localhost',
      rpcUrl: 'http://127.0.0.1:8545',
      explorer: null,
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
      }
    }
  };

  // 合约地址（需要在部署后更新）
  static CONTRACTS = {
    monad_testnet: {
      ContentToken: '0x...',
      ContentPlatform: '0x...'
    },
    polygon_mumbai: {
      ContentToken: '0x...',
      ContentPlatform: '0x...'
    },
    localhost: {
      ContentToken: '0x...',
      ContentPlatform: '0x...'
    }
  };

  /**
   * 获取当前网络配置
   * @param {string} networkName 网络名称
   * @returns {Object} 网络配置
   */
  static getNetworkConfig(networkName) {
    return this.NETWORKS[networkName];
  }

  /**
   * 获取合约地址
   * @param {string} networkName 网络名称
   * @param {string} contractName 合约名称
   * @returns {string} 合约地址
   */
  static getContractAddress(networkName, contractName) {
    return this.CONTRACTS[networkName]?.[contractName];
  }
}

/**
 * Web3提供者管理类
 * 处理钱包连接和提供者初始化
 */
export class Web3Provider {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.networkName = null;
  }

  /**
   * 检查是否安装了MetaMask
   * @returns {boolean}
   */
  isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined';
  }

  /**
   * 连接钱包
   * @returns {Promise<string>} 用户地址
   */
  async connect() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('请先安装MetaMask钱包');
    }

    try {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      this.signer = await this.provider.getSigner();
      
      // 获取网络信息
      const network = await this.provider.getNetwork();
      this.networkName = this._getNetworkName(network.chainId.toString());
      
      return accounts[0];
    } catch (error) {
      throw new Error(`连接钱包失败: ${error.message}`);
    }
  }

  /**
   * 切换网络
   * @param {string} networkName 网络名称
   */
  async switchNetwork(networkName) {
    const networkConfig = Web3Config.getNetworkConfig(networkName);
    
    if (!networkConfig) {
      throw new Error(`不支持的网络: ${networkName}`);
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      });
      this.networkName = networkName;
    } catch (switchError) {
      // 如果网络不存在，则添加网络
      if (switchError.code === 4902) {
        await this._addNetwork(networkConfig);
      } else {
        throw switchError;
      }
    }
  }

  /**
   * 添加网络到MetaMask
   * @private
   */
  async _addNetwork(networkConfig) {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: networkConfig.chainId,
        chainName: networkConfig.name,
        rpcUrls: [networkConfig.rpcUrl],
        nativeCurrency: networkConfig.nativeCurrency,
        blockExplorerUrls: networkConfig.explorer ? [networkConfig.explorer] : null
      }]
    });
  }

  /**
   * 根据chainId获取网络名称
   * @private
   */
  _getNetworkName(chainId) {
    const networks = Web3Config.NETWORKS;
    for (const [name, config] of Object.entries(networks)) {
      if (config.chainId === chainId) {
        return name;
      }
    }
    return 'unknown';
  }

  /**
   * 获取当前账户地址
   * @returns {Promise<string>}
   */
  async getAddress() {
    if (!this.signer) {
      throw new Error('钱包未连接');
    }
    return await this.signer.getAddress();
  }

  /**
   * 获取账户余额
   * @returns {Promise<string>}
   */
  async getBalance() {
    if (!this.signer) {
      throw new Error('钱包未连接');
    }
    const address = await this.signer.getAddress();
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  /**
   * 监听账户变化
   * @param {Function} callback 回调函数
   */
  onAccountsChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  /**
   * 监听网络变化
   * @param {Function} callback 回调函数
   */
  onChainChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  }
}

/**
 * ContentToken合约交互类
 */
export class ContentTokenContract {
  constructor(web3Provider) {
    this.provider = web3Provider;
    this.contract = null;
    this._initContract();
  }

  /**
   * 初始化合约实例
   * @private
   */
  _initContract() {
    if (!this.provider.signer || !this.provider.networkName) {
      throw new Error('Web3提供者未初始化');
    }

    const contractAddress = Web3Config.getContractAddress(
      this.provider.networkName,
      'ContentToken'
    );

    if (!contractAddress) {
      throw new Error('未找到合约地址');
    }

    this.contract = new ethers.Contract(
      contractAddress,
      ContentTokenABI,
      this.provider.signer
    );
  }

  /**
   * 获取代币余额
   * @param {string} address 地址
   * @returns {Promise<string>}
   */
  async balanceOf(address) {
    const balance = await this.contract.balanceOf(address);
    return ethers.formatEther(balance);
  }

  /**
   * 获取代币总供应量
   * @returns {Promise<string>}
   */
  async totalSupply() {
    const supply = await this.contract.totalSupply();
    return ethers.formatEther(supply);
  }

  /**
   * 转账代币
   * @param {string} to 接收地址
   * @param {string} amount 转账数量
   * @returns {Promise<Object>} 交易回执
   */
  async transfer(to, amount) {
    const amountWei = ethers.parseEther(amount);
    const tx = await this.contract.transfer(to, amountWei);
    return await tx.wait();
  }

  /**
   * 授权代币
   * @param {string} spender 授权地址
   * @param {string} amount 授权数量
   * @returns {Promise<Object>} 交易回执
   */
  async approve(spender, amount) {
    const amountWei = ethers.parseEther(amount);
    const tx = await this.contract.approve(spender, amountWei);
    return await tx.wait();
  }

  /**
   * 查询授权额度
   * @param {string} owner 所有者地址
   * @param {string} spender 授权地址
   * @returns {Promise<string>}
   */
  async allowance(owner, spender) {
    const allowance = await this.contract.allowance(owner, spender);
    return ethers.formatEther(allowance);
  }

  /**
   * 销毁代币
   * @param {string} amount 销毁数量
   * @returns {Promise<Object>} 交易回执
   */
  async burn(amount) {
    const amountWei = ethers.parseEther(amount);
    const tx = await this.contract.burn(amountWei);
    return await tx.wait();
  }
}

/**
 * ContentPlatform合约交互类
 */
export class ContentPlatformContract {
  constructor(web3Provider) {
    this.provider = web3Provider;
    this.contract = null;
    this._initContract();
  }

  /**
   * 初始化合约实例
   * @private
   */
  _initContract() {
    if (!this.provider.signer || !this.provider.networkName) {
      throw new Error('Web3提供者未初始化');
    }

    const contractAddress = Web3Config.getContractAddress(
      this.provider.networkName,
      'ContentPlatform'
    );

    if (!contractAddress) {
      throw new Error('未找到合约地址');
    }

    this.contract = new ethers.Contract(
      contractAddress,
      ContentPlatformABI,
      this.provider.signer
    );
  }

  /**
   * 发布内容
   * @param {string} ipfsHash IPFS哈希
   * @returns {Promise<number>} 内容ID
   */
  async publishContent(ipfsHash) {
    const tx = await this.contract.publishContent(ipfsHash);
    const receipt = await tx.wait();
    
    // 从事件中获取内容ID
    const event = receipt.logs.find(log => {
      try {
        const parsed = this.contract.interface.parseLog(log);
        return parsed.name === 'ContentPublished';
      } catch {
        return false;
      }
    });

    if (event) {
      const parsed = this.contract.interface.parseLog(event);
      return Number(parsed.args.contentId);
    }

    return null;
  }

  /**
   * 点赞内容
   * @param {number} contentId 内容ID
   * @returns {Promise<Object>} 交易回执
   */
  async likeContent(contentId) {
    const tx = await this.contract.likeContent(contentId);
    return await tx.wait();
  }

  /**
   * 分享内容
   * @param {number} contentId 内容ID
   * @returns {Promise<Object>} 交易回执
   */
  async shareContent(contentId) {
    const tx = await this.contract.shareContent(contentId);
    return await tx.wait();
  }

  /**
   * 获取内容信息
   * @param {number} contentId 内容ID
   * @returns {Promise<Object>} 内容信息
   */
  async getContent(contentId) {
    const content = await this.contract.getContent(contentId);
    return {
      creator: content[0],
      ipfsHash: content[1],
      timestamp: Number(content[2]),
      likes: Number(content[3]),
      shares: Number(content[4]),
      totalEarnings: ethers.formatEther(content[5])
    };
  }

  /**
   * 获取用户发布的所有内容ID
   * @param {string} userAddress 用户地址
   * @returns {Promise<number[]>}
   */
  async getUserContents(userAddress) {
    const contents = await this.contract.getUserContents(userAddress);
    return contents.map(id => Number(id));
  }

  /**
   * 获取分润配置
   * @returns {Promise<Object>}
   */
  async getRevenueConfig() {
    const config = await this.contract.revenueConfig();
    return {
      likeReward: ethers.formatEther(config.likeReward),
      shareReward: ethers.formatEther(config.shareReward),
      creatorShare: Number(config.creatorShare),
      platformFee: Number(config.platformFee)
    };
  }

  /**
   * 检查是否已点赞
   * @param {number} contentId 内容ID
   * @param {string} userAddress 用户地址
   * @returns {Promise<boolean>}
   */
  async hasLiked(contentId, userAddress) {
    return await this.contract.hasLiked(contentId, userAddress);
  }

  /**
   * 检查是否已分享
   * @param {number} contentId 内容ID
   * @param {string} userAddress 用户地址
   * @returns {Promise<boolean>}
   */
  async hasShared(contentId, userAddress) {
    return await this.contract.hasShared(contentId, userAddress);
  }

  /**
   * 获取内容总数
   * @returns {Promise<number>}
   */
  async getContentCounter() {
    const counter = await this.contract.contentCounter();
    return Number(counter);
  }

  /**
   * 监听内容发布事件
   * @param {Function} callback 回调函数
   */
  onContentPublished(callback) {
    this.contract.on('ContentPublished', (contentId, creator, ipfsHash, event) => {
      callback({
        contentId: Number(contentId),
        creator,
        ipfsHash,
        transactionHash: event.log.transactionHash
      });
    });
  }

  /**
   * 监听点赞事件
   * @param {Function} callback 回调函数
   */
  onContentLiked(callback) {
    this.contract.on('ContentLiked', (contentId, user, event) => {
      callback({
        contentId: Number(contentId),
        user,
        transactionHash: event.log.transactionHash
      });
    });
  }

  /**
   * 监听分享事件
   * @param {Function} callback 回调函数
   */
  onContentShared(callback) {
    this.contract.on('ContentShared', (contentId, user, event) => {
      callback({
        contentId: Number(contentId),
        user,
        transactionHash: event.log.transactionHash
      });
    });
  }

  /**
   * 移除所有事件监听
   */
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}

/**
 * SDK主类 - 统一的API接口
 */
export class ContentPlatformSDK {
  constructor() {
    this.web3Provider = new Web3Provider();
    this.tokenContract = null;
    this.platformContract = null;
  }

  /**
   * 初始化SDK
   * @param {string} networkName 网络名称（可选）
   * @returns {Promise<string>} 用户地址
   */
  async initialize(networkName = null) {
    const address = await this.web3Provider.connect();
    
    if (networkName && this.web3Provider.networkName !== networkName) {
      await this.web3Provider.switchNetwork(networkName);
    }

    this.tokenContract = new ContentTokenContract(this.web3Provider);
    this.platformContract = new ContentPlatformContract(this.web3Provider);

    return address;
  }

  /**
   * 获取Web3提供者
   * @returns {Web3Provider}
   */
  getProvider() {
    return this.web3Provider;
  }

  /**
   * 获取代币合约
   * @returns {ContentTokenContract}
   */
  getTokenContract() {
    return this.tokenContract;
  }

  /**
   * 获取平台合约
   * @returns {ContentPlatformContract}
   */
  getPlatformContract() {
    return this.platformContract;
  }

  /**
   * 检查是否已初始化
   * @returns {boolean}
   */
  isInitialized() {
    return this.tokenContract !== null && this.platformContract !== null;
  }
}

// 默认导出
export default ContentPlatformSDK;
