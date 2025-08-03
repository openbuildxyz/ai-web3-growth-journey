import { TokenMinter } from './token-minter';

async function testMinting() {
  console.log('=== Testing Token Minting Functions ===\n');
  
  const minter = new TokenMinter();
  
  try {
    // 测试1: 创建代币
    console.log('Test 1: Creating token...');
    const mintAddress = await minter.createToken();
    console.log(`✅ Token created: ${mintAddress.toBase58()}\n`);
    
    // 测试2: 生成多个测试地址
    console.log('Test 2: Generating test addresses...');
    const testAddresses = [];
    for (let i = 0; i < 3; i++) {
      const addr = TokenMinter.generateTestAddress();
      testAddresses.push(addr.publicKey);
      console.log(`Test address ${i + 1}: ${addr.publicKey}`);
    }
    console.log('✅ Test addresses generated\n');
    
    // 测试3: 批量铸造不同数量的代币
    console.log('Test 3: Minting different amounts...');
    const amounts = [100, 250, 500];
    
    for (let i = 0; i < testAddresses.length; i++) {
      console.log(`Minting ${amounts[i]} tokens to address ${i + 1}...`);
      await minter.mintTokens(testAddresses[i], amounts[i]);
      console.log(`✅ Minted ${amounts[i]} tokens successfully`);
    }
    
    console.log('\n=== All Tests Passed ===');
    console.log(`Mint Address: ${mintAddress.toBase58()}`);
    console.log('Test addresses and their token amounts:');
    testAddresses.forEach((addr, i) => {
      console.log(`  ${addr}: ${amounts[i]} tokens`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// 单独的功能测试函数
export async function testSingleMint(address: string, amount: number) {
  console.log(`Testing single mint: ${amount} tokens to ${address}`);
  
  const minter = new TokenMinter();
  
  // 如果还没有创建mint，先创建
  if (!minter.getMintAddress()) {
    await minter.createToken();
  }
  
  const signature = await minter.mintTokens(address, amount);
  console.log(`✅ Mint successful: ${signature}`);
  return signature;
}

if (require.main === module) {
  testMinting().catch(console.error);
}
