import { TokenMinter } from './token-minter';

async function main() {
  try {
    console.log('=== Solana Token Minter Demo ===\n');
    
    // 创建TokenMinter实例
    const minter = new TokenMinter();
    
    // 检查payer余额
    const balance = await minter.getBalance();
    console.log(`Payer SOL balance: ${balance.toFixed(4)} SOL`);
    
    if (balance < 0.01) {
      console.log('Warning: Low SOL balance. You may need to airdrop more SOL for transactions.');
      console.log('Run: solana airdrop 2 <your-address> --url devnet');
    }
    
    console.log('\n--- Step 1: Creating Token ---');
    const mintAddress = await minter.createToken();
    
    console.log('\n--- Step 2: Generating Test Address ---');
    const testAddress = TokenMinter.generateTestAddress();
    console.log(`Test address: ${testAddress.publicKey}`);
    console.log(`Test address secret key: [${testAddress.secretKey.slice(0, 5).join(', ')}...]`);
    
    console.log('\n--- Step 3: Minting Tokens ---');
    
    // 测试铸造代币到测试地址
    console.log('\n3.1 Minting to test address:');
    await minter.mintTokens(testAddress.publicKey, 1000);
    
    // 测试铸造代币到自己的地址
    console.log('\n3.2 Minting to payer address:');
    await minter.mintTokens(minter['payer'].publicKey.toBase58(), 500);
    
    console.log('\n=== Demo Completed Successfully ===');
    console.log(`\nToken Mint Address: ${mintAddress.toBase58()}`);
    console.log(`Test Address: ${testAddress.publicKey}`);
    console.log('\nYou can check the token accounts on Solana Explorer:');
    console.log(`https://explorer.solana.com/address/${mintAddress.toBase58()}?cluster=devnet`);
    
  } catch (error) {
    console.error('Demo failed:', error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}
