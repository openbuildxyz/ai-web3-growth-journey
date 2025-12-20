import { TokenMinter } from './token-minter';

async function simpleTest() {
  console.log('=== Simple Token Test ===\n');
  
  try {
    // 创建TokenMinter实例
    const minter = new TokenMinter();
    console.log('✅ TokenMinter created successfully');
    
    // 生成测试地址（不需要网络连接）
    console.log('\n--- Generating Test Addresses ---');
    for (let i = 0; i < 3; i++) {
      const testAddr = TokenMinter.generateTestAddress();
      console.log(`Test Address ${i + 1}: ${testAddr.publicKey}`);
    }
    console.log('✅ Test addresses generated successfully');
    
    // 检查网络连接
    console.log('\n--- Testing Network Connection ---');
    try {
      const balance = await minter.getBalance();
      console.log(`✅ Network connection OK. Payer SOL balance: ${balance.toFixed(4)} SOL`);
      
      if (balance > 0.01) {
        console.log('\n--- Creating Token ---');
        const mintAddress = await minter.createToken();
        console.log(`✅ Token created successfully: ${mintAddress.toBase58()}`);
        
        console.log('\n--- Testing Token Minting ---');
        const testAddr = TokenMinter.generateTestAddress();
        const signature = await minter.mintTokens(testAddr.publicKey, 1000);
        console.log(`✅ Successfully minted 1000 tokens to test address`);
        console.log(`Transaction: ${signature}`);
      } else {
        console.log('❌ Insufficient SOL balance for transactions');
        console.log('Please airdrop SOL to your address first');
      }
      
    } catch (networkError) {
      console.log('❌ Network connection failed:', networkError.message);
      console.log('This might be due to network issues or insufficient funds');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  simpleTest().catch(console.error);
}
