import { TokenMinter, TOKEN_CONFIG } from './token-minter';

console.log('=== Solana Token Minter Demo (Offline Mode) ===\n');

console.log('📋 Token Configuration:');
console.log(`- Name: ${TOKEN_CONFIG.name}`);
console.log(`- Symbol: ${TOKEN_CONFIG.symbol}`);
console.log(`- Decimals: ${TOKEN_CONFIG.decimals}`);
console.log(`- Description: ${TOKEN_CONFIG.description}`);

console.log('\n🔑 Wallet Information:');
const minter = new TokenMinter();

console.log('\n🆕 Generated Test Addresses:');
const testAddresses = [];
for (let i = 0; i < 5; i++) {
  const addr = TokenMinter.generateTestAddress();
  testAddresses.push(addr);
  console.log(`${i + 1}. ${addr.publicKey}`);
}

console.log('\n📝 Available Functions:');
console.log('1. createToken() - 创建新的代币mint');
console.log('2. mintTokens(address, amount) - 向指定地址铸造代币');
console.log('3. generateTestAddress() - 生成测试地址');
console.log('4. getBalance(address?) - 获取SOL余额');
console.log('5. getMintAddress() - 获取代币mint地址');

console.log('\n💡 使用示例:');
console.log(`
// 创建代币铸造器
const minter = new TokenMinter();

// 创建代币
const mintAddress = await minter.createToken();
console.log('Token created:', mintAddress.toBase58());

// 生成测试地址
const testAddr = TokenMinter.generateTestAddress();
console.log('Test address:', testAddr.publicKey);

// 铸造代币到测试地址
const signature = await minter.mintTokens(testAddr.publicKey, 1000);
console.log('Minted 1000 tokens, signature:', signature);
`);

console.log('\n🔧 修改代币配置:');
console.log(`
在 src/token-minter.ts 文件中修改 TOKEN_CONFIG 常量:

export const TOKEN_CONFIG = {
  name: 'YOUR_TOKEN_NAME',
  symbol: 'YOUR_SYMBOL', 
  decimals: 9,
  description: 'Your token description',
};
`);

console.log('\n🚀 运行步骤:');
console.log('1. 确保网络连接正常');
console.log('2. 确保钱包有足够的 devnet SOL');
console.log('3. 运行: npm run simple');
console.log('4. 或者运行: npm run dev (完整演示)');

console.log('\n⚠️  注意事项:');
console.log('- 确保 .env 文件包含正确的私钥');
console.log('- 运行在 Solana devnet 上');
console.log('- 需要足够的 SOL 来支付交易费用');
console.log('- 首次运行会创建新的代币mint');

console.log('\n✅ Demo completed successfully!');
console.log('代币铸造功能已准备就绪，等待网络连接恢复后即可测试。');
