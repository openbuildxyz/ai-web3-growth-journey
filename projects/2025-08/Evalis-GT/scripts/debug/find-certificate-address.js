#!/usr/bin/env node

/**
 * Script to find the complete certificate contract address
 * from the truncated address provided
 */

require('dotenv').config();

async function findCompleteAddress() {
  console.log('🔍 Searching for complete certificate contract address...');
  console.log('=======================================================');
  
  const truncatedAddress = '0x60EDC65E706E21C2b6CAe7A9F3A35Bb780B1F6';
  console.log(`Truncated address: ${truncatedAddress} (${truncatedAddress.length} characters)`);
  console.log('Expected length: 42 characters');
  console.log('Missing: 1 character at the end');
  
  // Possible hex characters for the missing digit
  const hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
  
  console.log('\n📋 Possible complete addresses:');
  hexChars.forEach(char => {
    const completeAddress = truncatedAddress + char;
    console.log(`   ${completeAddress}`);
  });
  
  console.log('\n💡 How to find the correct one:');
  console.log('1. Check your deployment terminal output for the complete address');
  console.log('2. Look at your wallet transaction history for the contract creation');
  console.log('3. Check Sepolia Etherscan for recent contract deployments from your address');
  console.log(`4. Visit: https://sepolia.etherscan.io/address/YOUR_WALLET_ADDRESS`);
  
  console.log('\n🔧 Quick fix options:');
  console.log('Option 1: Use the newly deployed certificate contract (recommended):');
  console.log('   CERTIFICATE_ADDRESS=0x4BAbb3731B3c69447b53E0644A3E1bA2a210e674');
  console.log('\nOption 2: Find your original complete address from deployment logs');
  
  return {
    truncated: truncatedAddress,
    newDeployed: '0x4BAbb3731B3c69447b53E0644A3E1bA2a210e674',
    possibleAddresses: hexChars.map(char => truncatedAddress + char)
  };
}

findCompleteAddress().then(result => {
  console.log('\n✅ Recommendation: Use the newly deployed certificate contract');
  console.log(`   CERTIFICATE_ADDRESS=${result.newDeployed}`);
}).catch(console.error);
