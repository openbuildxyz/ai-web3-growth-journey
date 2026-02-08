/**
 * 测试 7892 代理是否能正常访问 Binance API
 * 运行: node scripts/test-proxy.mjs
 */

import { ProxyAgent, fetch } from 'undici';

const PROXY_URL = 'http://127.0.0.1:7892';
const BINANCE_URL = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=5';

async function testProxy() {
  console.log(`\n🔍 Testing Binance API via proxy: ${PROXY_URL}\n`);
  
  const proxyAgent = new ProxyAgent(PROXY_URL);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
    
    console.log(`📡 Fetching: ${BINANCE_URL}`);
    const startTime = Date.now();
    
    const response = await fetch(BINANCE_URL, {
      signal: controller.signal,
      dispatcher: proxyAgent
    });
    
    clearTimeout(timeoutId);
    const elapsed = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      console.log(`\n✅ SUCCESS! Response time: ${elapsed}ms`);
      console.log(`📊 Received ${data.length} klines for BTCUSDT\n`);
      console.log('Sample data (first kline):');
      const [openTime, open, high, low, close, volume] = data[0];
      console.log({
        openTime: new Date(openTime).toISOString(),
        open, high, low, close, volume
      });
      console.log('\n✅ Proxy 7892 is working correctly!\n');
    } else {
      console.log(`\n❌ FAILED! Status: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
    if (error.cause) {
      console.log(`   Cause: ${error.cause.message || error.cause}`);
    }
    console.log('\n请检查:');
    console.log('1. 代理软件是否正在运行');
    console.log('2. 端口 7892 是否正确');
    console.log('3. 代理是否支持 HTTPS 请求\n');
  }
}

testProxy();
