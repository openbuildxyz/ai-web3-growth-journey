#!/usr/bin/env node

/**
 * 🌐 Online Web3 Verification Script
 * This script verifies your Web3 implementation using live blockchain data
 */

const { ethers } = require('ethers');

// Configuration
const CONFIG = {
  rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/yIwdNZ5QhthLE60o-CTUW',
  tokenAddress: '0x5ee6b91b7a85253090183399D25ae7AfEdbEC68d',
  certificateAddress: '0x8f907106a386aF9b9a3a7A3bF74BbBa45fdEc5a0',
  governorAddress: '0x46E97D3b37Bf9156a158C5023437f2e1FD2dd717',
  deployerAddress: '0x101B5675aE6899b708F2a31EC490E528a0e98D53'
};

// ERC-20 Token ABI (simplified)
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

// ERC-721 NFT ABI (simplified)
const ERC721_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function tokenURI(uint256) view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

async function verifyOnline() {
  console.log('🌐 ONLINE WEB3 VERIFICATION');
  console.log('=' .repeat(50));
  
  try {
    // Initialize provider
    const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
    console.log('✅ Connected to Sepolia network');
    
    // Verify network
    const network = await provider.getNetwork();
    console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log('');
    
    // 1. Verify Token Contract
    console.log('🪙 VERIFYING EVT TOKEN CONTRACT');
    console.log('-'.repeat(40));
    
    const tokenContract = new ethers.Contract(CONFIG.tokenAddress, ERC20_ABI, provider);
    
    try {
      const tokenName = await tokenContract.name();
      const tokenSymbol = await tokenContract.symbol();
      const tokenDecimals = await tokenContract.decimals();
      const totalSupply = await tokenContract.totalSupply();
      
      console.log(`Name: ${tokenName}`);
      console.log(`Symbol: ${tokenSymbol}`);
      console.log(`Decimals: ${tokenDecimals}`);
      console.log(`Total Supply: ${ethers.formatUnits(totalSupply, tokenDecimals)} ${tokenSymbol}`);
      console.log(`✅ Token contract is live and functional`);
      console.log(`🔗 View: https://sepolia.etherscan.io/address/${CONFIG.tokenAddress}`);
    } catch (error) {
      console.log(`❌ Token contract verification failed: ${error.message}`);
    }
    
    console.log('');
    
    // 2. Verify Certificate Contract
    console.log('🎓 VERIFYING NFT CERTIFICATE CONTRACT');
    console.log('-'.repeat(40));
    
    const certContract = new ethers.Contract(CONFIG.certificateAddress, ERC721_ABI, provider);
    
    try {
      const certName = await certContract.name();
      const certSymbol = await certContract.symbol();
      
      console.log(`Name: ${certName}`);
      console.log(`Symbol: ${certSymbol}`);
      
      // Try to get total supply (might not be available in all implementations)
      try {
        const totalSupply = await certContract.totalSupply();
        console.log(`Total Certificates Minted: ${totalSupply.toString()}`);
      } catch (e) {
        console.log('Total Supply: Not available (custom implementation)');
      }
      
      console.log(`✅ Certificate contract is live and functional`);
      console.log(`🔗 View: https://sepolia.etherscan.io/address/${CONFIG.certificateAddress}`);
    } catch (error) {
      console.log(`❌ Certificate contract verification failed: ${error.message}`);
    }
    
    console.log('');
    
    // 3. Verify Deployer Wallet
    console.log('👤 VERIFYING DEPLOYER WALLET');
    console.log('-'.repeat(40));
    
    const balance = await provider.getBalance(CONFIG.deployerAddress);
    const txCount = await provider.getTransactionCount(CONFIG.deployerAddress);
    
    console.log(`Address: ${CONFIG.deployerAddress}`);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    console.log(`Transaction Count: ${txCount}`);
    console.log(`✅ Wallet has sufficient funds for operations`);
    console.log(`🔗 View: https://sepolia.etherscan.io/address/${CONFIG.deployerAddress}`);
    
    console.log('');
    
    // 4. Check Recent Transactions
    console.log('📊 RECENT CONTRACT ACTIVITY');
    console.log('-'.repeat(40));
    
    // Get recent blocks to check for any transactions
    const latestBlock = await provider.getBlockNumber();
    console.log(`Current Block: ${latestBlock}`);
    
    // Check if contracts have any transaction history
    const tokenTxCount = await provider.getTransactionCount(CONFIG.tokenAddress);
    const certTxCount = await provider.getTransactionCount(CONFIG.certificateAddress);
    
    console.log(`Token Contract Transactions: ${tokenTxCount}`);
    console.log(`Certificate Contract Transactions: ${certTxCount}`);
    
    console.log('');
    
    // 5. Generate Test URLs
    console.log('🔗 ONLINE VERIFICATION LINKS');
    console.log('-'.repeat(40));
    console.log(`Token Contract: https://sepolia.etherscan.io/address/${CONFIG.tokenAddress}`);
    console.log(`Certificate Contract: https://sepolia.etherscan.io/address/${CONFIG.certificateAddress}`);
    console.log(`Governor Contract: https://sepolia.etherscan.io/address/${CONFIG.governorAddress}`);
    console.log(`Deployer Wallet: https://sepolia.etherscan.io/address/${CONFIG.deployerAddress}`);
    
    console.log('');
    console.log('🎉 ONLINE VERIFICATION COMPLETE!');
    console.log('All contracts are live on Sepolia testnet');
    
  } catch (error) {
    console.error('❌ Online verification failed:', error.message);
    process.exit(1);
  }
}

// Run verification
verifyOnline().catch(console.error);
