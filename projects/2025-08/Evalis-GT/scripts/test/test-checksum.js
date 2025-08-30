const loadEthers = require('./server/utils/loadEthers');

async function testChecksum() {
  try {
    const address = '0x742d35Cc6479C13A7c1230Ab5D8d8F8d8e8E8f8a';
    console.log('Testing address:', address);
    
    const ethers = await loadEthers();
    console.log('Loaded ethers version:', ethers.version);
    
    try {
      const checksummed = ethers.getAddress(address);
      console.log('Checksummed address:', checksummed);
      console.log('Success! Address is valid');
    } catch (error) {
      console.log('Checksum error:', error.message);
      console.log('Error code:', error.code);
      
      // Try alternative approach
      try {
        console.log('Trying utils.getAddress...');
        const checksummed2 = ethers.utils.getAddress(address);
        console.log('Alternative checksummed:', checksummed2);
      } catch (error2) {
        console.log('Alternative also failed:', error2.message);
      }
    }
    
  } catch (error) {
    console.error('Error loading ethers:', error);
  }
}

testChecksum();
