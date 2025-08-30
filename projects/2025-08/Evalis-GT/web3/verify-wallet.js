const { ethers } = require('ethers');

async function verifyWallet() {
  const provider = new ethers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/yIwdNZ5QhthLE60o-CTUW');
  const address = '0x101B5675aE6899b708F2a31EC490E528a0e98D53';

  try {
    console.log('🔍 WALLET VERIFICATION');
    console.log('='.repeat(50));
    console.log('Address:', address);
    console.log('Network: Sepolia Testnet');
    console.log('');
    
    // Get balance
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log('💰 BALANCE:');
    console.log('Raw (wei):', balance.toString());
    console.log('Formatted:', balanceInEth, 'ETH');
    console.log('');
    
    // Get transaction count
    const txCount = await provider.getTransactionCount(address);
    console.log('📊 TRANSACTION COUNT:', txCount);
    console.log('');
    
    // Check if sufficient for deployment
    const minRequired = ethers.parseEther('0.01');
    const sufficient = balance >= minRequired;
    
    console.log('✅ DEPLOYMENT READY:', sufficient ? 'YES' : 'NO');
    if (!sufficient) {
      console.log('❌ Need at least 0.01 ETH for deployment');
      console.log('💡 Current shortfall:', ethers.formatEther(minRequired - balance), 'ETH');
    }
    
    console.log('');
    console.log('🔗 View on Explorer:');
    console.log('https://sepolia.etherscan.io/address/' + address);
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyWallet();
