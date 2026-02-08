/**
 * K线数据压缩模块
 * 将24根K线压缩为自然语言摘要
 */

import { KlineData, KlineSummary } from '@/types/analyze';

/**
 * 计算简单趋势
 */
function calculateTrend(klines: KlineData[]): 'UP' | 'DOWN' | 'SIDEWAYS' {
  if (klines.length < 2) return 'SIDEWAYS';
  
  const first = parseFloat(klines[0].close);
  const last = parseFloat(klines[klines.length - 1].close);
  const change = ((last - first) / first) * 100;
  
  if (change > 5) return 'UP';
  if (change < -5) return 'DOWN';
  return 'SIDEWAYS';
}

/**
 * 寻找支撑和阻力位 (简单算法: 近期高点和低点)
 */
function findSupportResistance(klines: KlineData[]): { support: number, resistance: number } {
  if (klines.length === 0) return { support: 0, resistance: 0 };
  
  let support = Infinity;
  let resistance = 0;
  
  for (const k of klines) {
    const low = parseFloat(k.low);
    const high = parseFloat(k.high);
    if (low < support) support = low;
    if (high > resistance) resistance = high;
  }
  
  return { support, resistance };
}

/**
 * 压缩K线数据为文本摘要 (旧版兼容)
 */
export function compressKlines(klines: KlineData[]): KlineSummary {
  return compressKlinesMulti(klines, [], []);
}

/**
 * 压缩K线数据为文本摘要 (多周期增强版)
 */
export function compressKlinesMulti(
  klines1h: KlineData[], 
  klines4h: KlineData[], 
  klines1d: KlineData[]
): KlineSummary {
  const klines = klines1h; // 主要使用 1h 数据生成基础摘要

  if (klines.length === 0) {
    return {
      priceFrom: 0,
      priceTo: 0,
      changePercent: 0,
      high: 0,
      highHoursAgo: 0,
      low: 0,
      lowHoursAgo: 0,
      volumeTrend: 'FLAT',
      volumeChangePercent: 0,
      volatility: 0,
      consecutiveDirection: 'MIXED',
      consecutiveCount: 0,
      text: '无K线数据'
    };
  }

  // 按时间排序（升序）
  const sorted = [...klines].sort((a, b) => a.openTime - b.openTime);
  
  // 价格走势
  const priceFrom = parseFloat(sorted[0].open);
  const priceTo = parseFloat(sorted[sorted.length - 1].close);
  const changePercent = ((priceTo - priceFrom) / priceFrom) * 100;
  
  // 找最高价和最低价 (24h内)
  // 注意：如果我们拉取了 200 条 1h K线，这里应该只取最近 24 条来计算 "24h" 数据
  const recent24 = sorted.slice(-24);
  let high = 0;
  let highIndex = 0;
  let low = Infinity;
  let lowIndex = 0;
  
  recent24.forEach((k, i) => {
    const h = parseFloat(k.high);
    const l = parseFloat(k.low);
    if (h > high) {
      high = h;
      highIndex = i;
    }
    if (l < low) {
      low = l;
      lowIndex = i;
    }
  });
  
  const highHoursAgo = recent24.length - 1 - highIndex;
  const lowHoursAgo = recent24.length - 1 - lowIndex;
  
  // 成交量趋势（最近6根 vs 之前）
  let volumeTrend: 'UP' | 'DOWN' | 'FLAT' = 'FLAT';
  let volumeChangePercent = 0;
  
  if (sorted.length >= 6) {
    const recentVolumes = sorted.slice(-6).map(k => parseFloat(k.volume));
    const earlierVolumes = sorted.slice(0, -6).map(k => parseFloat(k.volume));
    
    // 取最后 24 小时的 volumes 来做对比，如果 available
    const compareVolumes = earlierVolumes.slice(-18);

    const recentAvg = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
    const earlierAvg = compareVolumes.length > 0 
      ? compareVolumes.reduce((a, b) => a + b, 0) / compareVolumes.length 
      : recentAvg;
    
    volumeChangePercent = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;
    
    if (volumeChangePercent > 10) {
      volumeTrend = 'UP';
    } else if (volumeChangePercent < -10) {
      volumeTrend = 'DOWN';
    }
  }
  
  // 波动率（收盘价标准差 / 平均价格）- 使用最近 24 条
  const closes = recent24.map(k => parseFloat(k.close));
  const avgClose = closes.reduce((a, b) => a + b, 0) / closes.length;
  const variance = closes.reduce((sum, c) => sum + Math.pow(c - avgClose, 2), 0) / closes.length;
  const volatility = (Math.sqrt(variance) / avgClose) * 100;
  
  // 连续涨跌
  let consecutiveCount = 1;
  let consecutiveDirection: 'UP' | 'DOWN' | 'MIXED' = 'MIXED';
  
  for (let i = sorted.length - 1; i > 0; i--) {
    const current = parseFloat(sorted[i].close);
    const previous = parseFloat(sorted[i].open);
    const prevCandle = parseFloat(sorted[i - 1].close);
    const prevOpen = parseFloat(sorted[i - 1].open);
    
    const currentUp = current > previous;
    const prevUp = prevCandle > prevOpen;
    
    if (i === sorted.length - 1) {
      consecutiveDirection = currentUp ? 'UP' : 'DOWN';
    }
    
    if ((currentUp && prevUp) || (!currentUp && !prevUp)) {
      consecutiveCount++;
    } else {
      break;
    }
  }

  // 多周期趋势分析
  const trend7d = calculateTrend(klines4h); // 4h 数据用于判断周趋势 (100条4h = 400h ≈ 16天)
  const trend30d = calculateTrend(klines1d); // 1d 数据用于判断月趋势
  
  // 支撑压力位 (基于 4h 数据)
  const { support, resistance } = findSupportResistance(klines4h.slice(-50)); // 最近 ~8 天的支撑阻力
  
  // 生成文本摘要
  const volumeTrendText = volumeTrend === 'UP' 
    ? `放大${Math.abs(volumeChangePercent).toFixed(0)}%` 
    : volumeTrend === 'DOWN' 
      ? `缩小${Math.abs(volumeChangePercent).toFixed(0)}%` 
      : '基本持平';
  
  const volatilityLevel = volatility < 2 ? '低' : volatility < 4 ? '中等' : '高';
  const changeSign = changePercent >= 0 ? '+' : '';
  const directionText = consecutiveDirection === 'UP' ? '阳线' : '阴线';
  
  let text = `24h价格走势: 从 $${priceFrom.toLocaleString()} 到 $${priceTo.toLocaleString()} (${changeSign}${changePercent.toFixed(1)}%)
24h最高: $${high.toLocaleString()} (${highHoursAgo}小时前)
24h最低: $${low.toLocaleString()} (${lowHoursAgo}小时前)
成交量趋势: 近6h平均成交量较前18h${volumeTrendText}
波动率: ${volatility.toFixed(1)}% (${volatilityLevel})
最近走势: 连续${consecutiveCount}根${directionText}`;

  if (klines4h.length > 0) {
    text += `\n中期趋势(7d): ${trend7d === 'UP' ? '上升' : trend7d === 'DOWN' ? '下降' : '盘整'}`;
  }
  if (klines1d.length > 0) {
    text += `\n长期趋势(30d): ${trend30d === 'UP' ? '上升' : trend30d === 'DOWN' ? '下降' : '盘整'}`;
  }
  if (support > 0 && resistance > 0) {
    text += `\n支撑位: $${support.toLocaleString()} / 阻力位: $${resistance.toLocaleString()}`;
  }

  return {
    priceFrom,
    priceTo,
    changePercent,
    high,
    highHoursAgo,
    low,
    lowHoursAgo,
    volumeTrend,
    volumeChangePercent,
    volatility,
    consecutiveDirection,
    consecutiveCount,
    trend7d,
    trend30d,
    supportLevel: support,
    resistanceLevel: resistance,
    text
  };
}
