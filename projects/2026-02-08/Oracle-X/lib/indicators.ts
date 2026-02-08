/**
 * 技术指标计算模块
 * 使用 technicalindicators 库计算 RSI, MACD, Bollinger Bands, ATR
 */

import { RSI, MACD, BollingerBands, ATR, SMA, EMA } from 'technicalindicators';
import { 
  KlineData, 
  RSIResult, 
  MACDResult, 
  BollingerBandsResult, 
  ATRResult,
  IndicatorsResult,
  IndicatorSignal,
  SMAResult,
  EMAResult
} from '@/types/analyze';

/**
 * 计算 RSI (14)
 */
export function calculateRSI(klines: KlineData[]): RSIResult | null {
  const closes = klines.map(k => parseFloat(k.close));
  
  if (closes.length < 14) return null;
  
  const rsiValues = RSI.calculate({ values: closes, period: 14 });
  if (rsiValues.length === 0) return null;
  
  const value = rsiValues[rsiValues.length - 1];
  let signal: IndicatorSignal = 'NEUTRAL';
  let description = '';
  
  if (value > 70) {
    signal = 'BEARISH';
    description = `RSI(14): ${value.toFixed(1)} → 信号: BEARISH（超买区域）`;
  } else if (value < 30) {
    signal = 'BULLISH';
    description = `RSI(14): ${value.toFixed(1)} → 信号: BULLISH（超卖区域）`;
  } else {
    signal = 'NEUTRAL';
    description = `RSI(14): ${value.toFixed(1)} → 信号: NEUTRAL（中性区域）`;
  }
  
  return { value, signal, description };
}

/**
 * 计算 MACD (12, 26, 9)
 */
export function calculateMACD(klines: KlineData[]): MACDResult | null {
  const closes = klines.map(k => parseFloat(k.close));
  
  if (closes.length < 26) return null;
  
  const macdValues = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });
  
  if (macdValues.length === 0) return null;
  
  const latest = macdValues[macdValues.length - 1];
  if (!latest.MACD || !latest.signal || latest.histogram === undefined) return null;
  
  const dif = latest.MACD;
  const dea = latest.signal;
  const histogram = latest.histogram;
  
  let signal: IndicatorSignal = 'NEUTRAL';
  let description = '';
  
  if (histogram > 0) {
    signal = 'BULLISH';
    description = `MACD: DIF ${dif.toFixed(1)}, DEA ${dea.toFixed(1)}, Histogram ${histogram.toFixed(1)} → 信号: BULLISH（金叉）`;
  } else {
    signal = 'BEARISH';
    description = `MACD: DIF ${dif.toFixed(1)}, DEA ${dea.toFixed(1)}, Histogram ${histogram.toFixed(1)} → 信号: BEARISH（死叉）`;
  }
  
  return { dif, dea, histogram, signal, description };
}

/**
 * 计算 Bollinger Bands (20, 2)
 */
export function calculateBollingerBands(klines: KlineData[], currentPrice: number): BollingerBandsResult | null {
  const closes = klines.map(k => parseFloat(k.close));
  
  if (closes.length < 20) return null;
  
  const bbValues = BollingerBands.calculate({
    values: closes,
    period: 20,
    stdDev: 2
  });
  
  if (bbValues.length === 0) return null;
  
  const latest = bbValues[bbValues.length - 1];
  const upper = latest.upper;
  const middle = latest.middle;
  const lower = latest.lower;
  
  // 计算价格在通道中的位置 (0-100)
  const range = upper - lower;
  const pricePosition = range > 0 ? ((currentPrice - lower) / range) * 100 : 50;
  
  let signal: IndicatorSignal = 'NEUTRAL';
  let description = '';
  
  if (pricePosition > 95) {
    signal = 'BEARISH';
    description = `Bollinger Bands: 上轨 $${upper.toFixed(0)} / 中轨 $${middle.toFixed(0)} / 下轨 $${lower.toFixed(0)}\n  当前价格位于上轨附近（${pricePosition.toFixed(0)}%位置）→ 信号: BEARISH`;
  } else if (pricePosition < 5) {
    signal = 'BULLISH';
    description = `Bollinger Bands: 上轨 $${upper.toFixed(0)} / 中轨 $${middle.toFixed(0)} / 下轨 $${lower.toFixed(0)}\n  当前价格位于下轨附近（${pricePosition.toFixed(0)}%位置）→ 信号: BULLISH`;
  } else {
    signal = 'NEUTRAL';
    description = `Bollinger Bands: 上轨 $${upper.toFixed(0)} / 中轨 $${middle.toFixed(0)} / 下轨 $${lower.toFixed(0)}\n  当前价格位于通道中部（${pricePosition.toFixed(0)}%位置）→ 信号: NEUTRAL`;
  }
  
  return { upper, middle, lower, pricePosition, signal, description };
}

/**
 * 计算 ATR (14)
 */
export function calculateATR(klines: KlineData[]): ATRResult | null {
  if (klines.length < 14) return null;
  
  const highs = klines.map(k => parseFloat(k.high));
  const lows = klines.map(k => parseFloat(k.low));
  const closes = klines.map(k => parseFloat(k.close));
  
  const atrValues = ATR.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: 14
  });
  
  if (atrValues.length === 0) return null;
  
  const value = atrValues[atrValues.length - 1];
  const currentPrice = closes[closes.length - 1];
  const atrPercent = (value / currentPrice) * 100;
  
  let volatilityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  let description: string;
  
  if (atrPercent < 2) {
    volatilityLevel = 'LOW';
    description = `ATR(14): ${value.toFixed(1)} → 波动率低（${atrPercent.toFixed(1)}%）`;
  } else if (atrPercent < 5) {
    volatilityLevel = 'MEDIUM';
    description = `ATR(14): ${value.toFixed(1)} → 波动率中等（${atrPercent.toFixed(1)}%）`;
  } else {
    volatilityLevel = 'HIGH';
    description = `ATR(14): ${value.toFixed(1)} → 波动率高（${atrPercent.toFixed(1)}%）`;
  }
  
  return { value, volatilityLevel, description };
}

/**
 * 计算 SMA
 */
export function calculateSMA(klines: KlineData[], period: number): SMAResult | null {
  const closes = klines.map(k => parseFloat(k.close));
  
  if (closes.length < period) return null;
  
  const smaValues = SMA.calculate({ values: closes, period });
  if (smaValues.length === 0) return null;
  
  const value = smaValues[smaValues.length - 1];
  const currentPrice = closes[closes.length - 1];
  
  let description = '';
  if (currentPrice > value) {
    description = `SMA(${period}): ${value.toFixed(1)} → 价格位于均线上方（看涨趋势）`;
  } else {
    description = `SMA(${period}): ${value.toFixed(1)} → 价格位于均线下方（看跌趋势）`;
  }
  
  return { period, value, description };
}

/**
 * 计算 EMA
 */
export function calculateEMA(klines: KlineData[], period: number): EMAResult | null {
  const closes = klines.map(k => parseFloat(k.close));
  
  if (closes.length < period) return null;
  
  const emaValues = EMA.calculate({ values: closes, period });
  if (emaValues.length === 0) return null;
  
  const value = emaValues[emaValues.length - 1];
  const currentPrice = closes[closes.length - 1];
  
  let description = '';
  if (currentPrice > value) {
    description = `EMA(${period}): ${value.toFixed(1)} → 价格位于EMA上方（短期强势）`;
  } else {
    description = `EMA(${period}): ${value.toFixed(1)} → 价格位于EMA下方（短期弱势）`;
  }
  
  return { period, value, description };
}

/**
 * 计算所有技术指标
 */
export function calculateAllIndicators(klines: KlineData[], currentPrice: number): IndicatorsResult {
  return {
    rsi: calculateRSI(klines),
    macd: calculateMACD(klines),
    bollingerBands: calculateBollingerBands(klines, currentPrice),
    atr: calculateATR(klines),
    sma50: calculateSMA(klines, 50),
    sma200: calculateSMA(klines, 200),
    ema12: calculateEMA(klines, 12),
    ema26: calculateEMA(klines, 26)
  };
}

/**
 * 格式化技术指标为文本
 */
export function formatIndicators(indicators: IndicatorsResult): string {
  const lines: string[] = ['技术指标计算结果：'];
  
  if (indicators.rsi) lines.push(`- ${indicators.rsi.description}`);
  if (indicators.macd) lines.push(`- ${indicators.macd.description}`);
  if (indicators.bollingerBands) lines.push(`- ${indicators.bollingerBands.description}`);
  if (indicators.atr) lines.push(`- ${indicators.atr.description}`);
  
  if (indicators.sma50) lines.push(`- ${indicators.sma50.description}`);
  if (indicators.sma200) lines.push(`- ${indicators.sma200.description}`);
  if (indicators.ema12) lines.push(`- ${indicators.ema12.description}`);
  if (indicators.ema26) lines.push(`- ${indicators.ema26.description}`);
  
  return lines.join('\n');
}
