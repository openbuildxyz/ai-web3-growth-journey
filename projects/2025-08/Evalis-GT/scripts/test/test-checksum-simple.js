async function testChecksum() {
  try {
    const address = '0x742d35Cc6479C13A7c1230Ab5D8d8F8d8e8E8f8a';
    console.log('Testing address:', address);
    
    // Try loading ethers the same way as the server
    let ethers;
    try {
      // Try modern import first
      ethers = await import('ethers');
    } catch {
      // Fallback to require
      ethers = require('ethers');
    }
    
    console.log('Loaded ethers successfully');
    console.log('Available methods:', Object.keys(ethers).filter(k => typeof ethers[k] === 'function').slice(0, 10));
    
    try {
      const checksummed = ethers.getAddress(address);
      console.log('Checksummed address:', checksummed);
      console.log('Success! Address is valid');
    } catch (error) {
      console.log('getAddress error:', error.message);
      console.log('Error code:', error.code);
      
      // Try alternative approaches
      try {
        if (ethers.utils && ethers.utils.getAddress) {
          console.log('Trying ethers.utils.getAddress...');
          const checksummed2 = ethers.utils.getAddress(address);
          console.log('Alternative checksummed:', checksummed2);
        }
      } catch (error2) {
        console.log('utils.getAddress also failed:', error2.message);
      }
      
      // Try direct validation
      try {
        if (ethers.isAddress) {
          console.log('Is valid address:', ethers.isAddress(address));
        }
      } catch (error3) {
        console.log('isAddress failed:', error3.message);
      }
    }
    
  } catch (error) {
    console.error('Error loading ethers:', error);
  }
}

testChecksum();
