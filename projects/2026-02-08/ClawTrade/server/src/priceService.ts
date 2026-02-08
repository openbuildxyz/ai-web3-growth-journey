import fetch from 'node-fetch';

// 价格缓存
interface PriceCache {
  [coinId: string]: {
    usd: number;
    usd_24h_change: number;
    usd_24h_vol: number;
    usd_market_cap: number;
  };
}

let priceCache: PriceCache = {};
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30秒缓存

// 支持的币种列表
const SUPPORTED_COINS = [
  'bitcoin', 'ethereum', 'solana', 'dogecoin', 'cardano', 'ripple',
  'chainlink', 'avalanche-2', 'polkadot', 'uniswap', 'litecoin', 'matic-network'
];

/**
 * 获取所有币种价格（带缓存）
 */
export async function getAllPrices(): Promise<PriceCache> {
  const now = Date.now();

  // 如果缓存有效，直接返回
  if (now - lastFetchTime < CACHE_DURATION && Object.keys(priceCache).length > 0) {
    console.log('📊 返回缓存价格数据');
    return priceCache;
  }

  try {
    console.log('🔄 从 CoinGecko 获取最新价格...');
    const ids = SUPPORTED_COINS.join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`CoinGecko API 错误: ${response.status}`);
    }

    const data = await response.json() as PriceCache;
    priceCache = data;
    lastFetchTime = now;

    console.log('✅ 价格数据更新成功');
    return priceCache;
  } catch (error) {
    console.error('❌ 获取价格失败:', error);

    // 如果有缓存，返回旧数据
    if (Object.keys(priceCache).length > 0) {
      console.log('⚠️  使用缓存数据（可能过期）');
      return priceCache;
    }

    // 完全失败时返回 mock 数据
    console.log('⚠️  使用 Mock 价格数据');
    return getMockPrices();
  }
}

/**
 * 获取单个币种价格
 */
export async function getCoinPrice(coinId: string): Promise<number> {
  const prices = await getAllPrices();
  const coinData = prices[coinId];

  if (!coinData) {
    throw new Error(`不支持的币种: ${coinId}`);
  }

  return coinData.usd;
}

/**
 * Mock 价格数据（备用）
 */
function getMockPrices(): PriceCache {
  const basePrices = [97500, 3200, 180, 0.32, 0.95, 2.1, 22, 35, 7.5, 12, 120, 0.45];
  const mock: PriceCache = {};

  SUPPORTED_COINS.forEach((coinId, i) => {
    const basePrice = basePrices[i];
    const change = (Math.random() - 0.5) * 10;
    mock[coinId] = {
      usd: basePrice * (1 + (Math.random() - 0.5) * 0.02),
      usd_24h_change: change,
      usd_24h_vol: basePrice * 1e6 * (5 + Math.random() * 20),
      usd_market_cap: basePrice * 1e6 * (100 + Math.random() * 900),
    };
  });

  return mock;
}
