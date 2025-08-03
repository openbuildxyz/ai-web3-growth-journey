import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000';

// 定义API响应类型
interface ApiResponse {
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// API测试函数
class ApiTester {
  
  static async makeRequest(endpoint: string, options: any = {}): Promise<ApiResponse | null> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`\n🔗 ${options.method || 'GET'} ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      const data = await response.json() as ApiResponse;
      
      if (response.ok) {
        console.log('✅ Success:', data);
        return data;
      } else {
        console.log('❌ Error:', data);
        return data;
      }
    } catch (error: any) {
      console.log('❌ Network Error:', error.message);
      return null;
    }
  }

  // 1. 健康检查
  static async healthCheck() {
    console.log('\n=== 1. Health Check ===');
    return await this.makeRequest('/health');
  }

  // 2. 获取代币信息
  static async getTokenInfo() {
    console.log('\n=== 2. Get Token Info ===');
    return await this.makeRequest('/token/info');
  }

  // 3. 生成测试地址
  static async generateTestAddress() {
    console.log('\n=== 3. Generate Test Address ===');
    return await this.makeRequest('/generate-test-address');
  }

  // 4. 铸造代币
  static async mintTokens(address: string, amount: number) {
    console.log(`\n=== 4. Mint ${amount} tokens to ${address} ===`);
    return await this.makeRequest('/mint', {
      method: 'POST',
      body: JSON.stringify({ address, amount })
    });
  }

  // 5. 批量铸造
  static async batchMint(recipients: Array<{address: string, amount: number}>) {
    console.log('\n=== 5. Batch Mint ===');
    return await this.makeRequest('/mint/batch', {
      method: 'POST',
      body: JSON.stringify({ recipients })
    });
  }
}

// 执行完整测试
async function runApiTests() {
  console.log('🧪 Starting API Tests...');
  
  // 1. 健康检查
  await ApiTester.healthCheck();
  
  // 2. 获取代币信息
  await ApiTester.getTokenInfo();
  
  // 3. 生成测试地址
  const testAddr1 = await ApiTester.generateTestAddress();
  const testAddr2 = await ApiTester.generateTestAddress();
  
  if (testAddr1 && testAddr1.data?.publicKey && testAddr2 && testAddr2.data?.publicKey) {
    // 4. 单个铸造测试
    await ApiTester.mintTokens(testAddr1.data.publicKey, 100);
    
    // 5. 批量铸造测试
    await ApiTester.batchMint([
      { address: testAddr1.data.publicKey, amount: 200 },
      { address: testAddr2.data.publicKey, amount: 300 }
    ]);
  }
  
  console.log('\n✅ API Tests completed!');
}

// 错误测试
async function runErrorTests() {
  console.log('\n🚨 Starting Error Tests...');
  
  // 测试无效地址
  console.log('\n--- Testing Invalid Address ---');
  await ApiTester.mintTokens('invalid-address', 100);
  
  // 测试无效数量
  console.log('\n--- Testing Invalid Amount ---');
  const testAddr = await ApiTester.generateTestAddress();
  if (testAddr?.data?.publicKey) {
    await ApiTester.mintTokens(testAddr.data.publicKey, -100);
    await ApiTester.mintTokens(testAddr.data.publicKey, 0);
  }
  
  console.log('\n✅ Error Tests completed!');
}

// 使用示例
async function usageExample() {
  console.log('\n📝 Usage Example:');
  console.log(`
// 基本使用
curl -X POST http://localhost:3000/mint \\
  -H "Content-Type: application/json" \\
  -d '{"address": "YOUR_SOLANA_ADDRESS", "amount": 1000}'

// 批量铸造
curl -X POST http://localhost:3000/mint/batch \\
  -H "Content-Type: application/json" \\
  -d '{
    "recipients": [
      {"address": "ADDRESS1", "amount": 100},
      {"address": "ADDRESS2", "amount": 200}
    ]
  }'

// 获取代币信息
curl http://localhost:3000/token/info

// 生成测试地址
curl http://localhost:3000/generate-test-address
  `);
}

// 主函数
async function main() {
  console.log('=== Solana Token Minter API Tester ===');
  
  // 等待服务器启动
  console.log('⏳ Waiting for server to be ready...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    await runApiTests();
    await runErrorTests();
    await usageExample();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

if (require.main === module) {
  main();
}
