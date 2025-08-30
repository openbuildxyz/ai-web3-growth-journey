async function testChecksumFixed() {
  try {
    const address = '0x742d35Cc6479C13A7c1230Ab5D8d8F8d8e8E8f8a';
    console.log('Testing address:', address);
    
    // Try loading ethers the same way as the server
    let ethers;
    try {
      ethers = await import('ethers');
    } catch {
      ethers = require('ethers');
    }
    
    try {
      // Convert to lowercase first, then apply proper checksum
      const checksummed = ethers.getAddress(address.toLowerCase());
      console.log('Original address:    ', address);
      console.log('Lowercase address:   ', address.toLowerCase());
      console.log('Checksummed address: ', checksummed);
      console.log('SUCCESS! Address checksum fixed');
    } catch (error) {
      console.log('Still failed:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testChecksumFixed();
