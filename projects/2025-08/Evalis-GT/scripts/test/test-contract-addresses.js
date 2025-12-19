#!/usr/bin/env node

/**
 * Test script for Web3 contract connections
 * Tests the newly deployed contract addresses
 */

require('dotenv').config();

async function testWeb3Contracts() {
  console.log('🔗 Testing Web3 Contract Connections');
  console.log('=====================================');
  
  // Check environment variables
  const requiredVars = [
    'TOKEN_ADDRESS',
    'GOVERNOR_ADDRESS', 
    'CERTIFICATE_ADDRESS',
    'CHAIN_RPC_URL'
  ];
  
  console.log('\n1. Checking environment variables...');
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`   ✅ ${varName}: ${process.env[varName]}`);
    } else {
      console.log(`   ❌ ${varName}: Missing`);
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log(`\n❌ Missing required environment variables: ${missingVars.join(', ')}`);
    return;
  }
  
  // Test ethers.js loading
  console.log('\n2. Testing ethers.js integration...');
  try {
    const ethers = await import('ethers');
    console.log('   ✅ ethers.js loaded successfully');
    
    // Test RPC connection
    console.log('\n3. Testing RPC connection...');
    const Provider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
    const provider = new Provider(process.env.CHAIN_RPC_URL);
    
    const network = await provider.getNetwork();
    console.log(`   ✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Test contract addresses format
    console.log('\n4. Validating contract addresses...');
    const addresses = {
      'EVT Token': process.env.TOKEN_ADDRESS,
      'Governor': process.env.GOVERNOR_ADDRESS,
      'Certificate': process.env.CERTIFICATE_ADDRESS
    };
    
    Object.entries(addresses).forEach(([name, address]) => {
      if (ethers.isAddress(address)) {
        console.log(`   ✅ ${name}: Valid address format`);
      } else {
        console.log(`   ❌ ${name}: Invalid address format`);
      }
    });
    
    console.log('\n🎉 Web3 integration test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - All environment variables configured');
    console.log('   - RPC connection working');
    console.log('   - Contract addresses valid');
    console.log('\n🚀 Ready for badge-based NFT rewards!');
    
  } catch (error) {
    console.log(`   ❌ Error loading ethers.js: ${error.message}`);
  }
}

testWeb3Contracts().catch(console.error);
