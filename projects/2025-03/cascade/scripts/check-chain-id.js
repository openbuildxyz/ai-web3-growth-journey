const { Web3 } = require('web3');

async function checkChainId() {
    console.log('开始检查Chain ID...');
    const web3 = new Web3('https://testnet-rpc.monad.xyz/');
    
    try {
        const chainId = await web3.eth.getChainId();
        console.log('Chain ID (十进制):', chainId);
        console.log('Chain ID (十六进制):', '0x' + chainId.toString(16));
    } catch (error) {
        console.error('获取Chain ID失败:', error);
    }
}

checkChainId();
