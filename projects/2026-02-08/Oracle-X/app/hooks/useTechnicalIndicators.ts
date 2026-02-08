'use client';

import { useMemo } from 'react';
import { RSI, MACD, BollingerBands, ATR } from 'technicalindicators';
import type { KlineData } from './useBinanceKlines';

// 指标信号类型
export type IndicatorSignal = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

// 单个指标结果
export interface RSIIndicator {
  value: number;
  signal: IndicatorSignal;
  label: string;
}

export interface MACDIndicator {
  macd: number;
  signal: number;
  histogram: number;
  crossover: string;
  trend: IndicatorSignal;
}

export interface BBIndicator {
  upper: number;
  middle: number;
  lower: number;
  percentB: number;
  signal: IndicatorSignal;
  label: string;
}

export interface ATRIndicator {
  value: number;
  percent: number;
  volatilityLevel: string;
}

// 所有指标汇总
export interface IndicatorsResult {
  rsi: RSIIndicator | null;
  macd: MACDIndicator | null;
  bollingerBands: BBIndicator | null;
  atr: ATRIndicator | null;
  summaryText: string;
  signalCounts: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
}

export function useTechnicalIndicators(klines: KlineData[]): IndicatorsResult {
  return useMemo(() => {
    if (klines.length < 26) {
      return {
        rsi: null,
        macd: null,
        bollingerBands: null,
        atr: null,
        summaryText: '数据不足，无法计算指标',
        signalCounts: { bullish: 0, bearish: 0, neutral: 0 },
      };
    }

    const closes = klines.map(k => k.close);
    const highs = klines.map(k => k.high);
    const lows = klines.map(k => k.low);
    const currentPrice = closes[closes.length - 1];

    // RSI (14)
    let rsi: RSIIndicator | null = null;
    try {
      const rsiValues = RSI.calculate({ values: closes, period: 14 });
      if (rsiValues.length > 0) {
        const value = rsiValues[rsiValues.length - 1];
        let signal: IndicatorSignal = 'NEUTRAL';
        let label = '中性';

        if (value > 70) {
          signal = 'BEARISH';
          label = '超买';
        } else if (value < 30) {
          signal = 'BULLISH';
          label = '超卖';
        }

        rsi = { value, signal, label };
      }
    } catch { /* ignore */ }

    // MACD (12, 26, 9)
    let macd: MACDIndicator | null = null;
    try {
      const macdValues = MACD.calculate({
        values: closes,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
      });

      if (macdValues.length > 0) {
        const latest = macdValues[macdValues.length - 1];
        if (latest.MACD !== undefined && latest.signal !== undefined) {
          const histogram = latest.histogram || 0;
          const prev = macdValues.length > 1 ? macdValues[macdValues.length - 2] : null;
          const prevHistogram = prev?.histogram || 0;

          let trend: IndicatorSignal = 'NEUTRAL';
          let crossover = '无';

          if (histogram > 0 && prevHistogram <= 0) {
            crossover = '金叉';
            trend = 'BULLISH';
          } else if (histogram < 0 && prevHistogram >= 0) {
            crossover = '死叉';
            trend = 'BEARISH';
          } else if (histogram > 0) {
            crossover = '多头';
            trend = 'BULLISH';
          } else if (histogram < 0) {
            crossover = '空头';
            trend = 'BEARISH';
          }

          macd = {
            macd: latest.MACD,
            signal: latest.signal,
            histogram,
            crossover,
            trend,
          };
        }
      }
    } catch { /* ignore */ }

    // Bollinger Bands (20, 2)
    let bollingerBands: BBIndicator | null = null;
    try {
      const bbValues = BollingerBands.calculate({
        values: closes,
        period: 20,
        stdDev: 2,
      });

      if (bbValues.length > 0) {
        const latest = bbValues[bbValues.length - 1];
        const range = latest.upper - latest.lower;
        const percentB = range > 0 ? ((currentPrice - latest.lower) / range) * 100 : 50;

        let signal: IndicatorSignal = 'NEUTRAL';
        let label = '中部';

        if (percentB > 95) {
          signal = 'BEARISH';
          label = '触及上轨';
        } else if (percentB < 5) {
          signal = 'BULLISH';
          label = '触及下轨';
        }

        bollingerBands = {
          upper: latest.upper,
          middle: latest.middle,
          lower: latest.lower,
          percentB,
          signal,
          label,
        };
      }
    } catch { /* ignore */ }

    // ATR (14)
    let atr: ATRIndicator | null = null;
    try {
      const atrValues = ATR.calculate({
        high: highs,
        low: lows,
        close: closes,
        period: 14,
      });

      if (atrValues.length > 0) {
        const value = atrValues[atrValues.length - 1];
        const percent = (value / currentPrice) * 100;

        let volatilityLevel = '中等';
        if (percent > 3) volatilityLevel = '高';
        else if (percent < 1) volatilityLevel = '低';

        atr = { value, percent, volatilityLevel };
      }
    } catch { /* ignore */ }

    // 统计信号
    const signals = [rsi?.signal, macd?.trend, bollingerBands?.signal].filter(Boolean);
    const signalCounts = {
      bullish: signals.filter(s => s === 'BULLISH').length,
      bearish: signals.filter(s => s === 'BEARISH').length,
      neutral: signals.filter(s => s === 'NEUTRAL').length,
    };

    // 生成摘要文本
    const lines = ['技术指标实时计算结果：'];
    if (rsi) lines.push(`- RSI(14): ${rsi.value.toFixed(1)} → ${rsi.label} (${rsi.signal})`);
    if (macd) lines.push(`- MACD(12,26,9): ${macd.crossover} (${macd.trend})`);
    if (bollingerBands) lines.push(`- BB %B: ${bollingerBands.percentB.toFixed(0)}% → ${bollingerBands.label} (${bollingerBands.signal})`);
    if (atr) lines.push(`- ATR(14): ${atr.value.toFixed(2)} (${atr.percent.toFixed(1)}%) → ${atr.volatilityLevel}波动`);
    lines.push(`\n信号汇总: ${signalCounts.bullish}个看多 / ${signalCounts.bearish}个看空 / ${signalCounts.neutral}个中性`);

    return {
      rsi,
      macd,
      bollingerBands,
      atr,
      summaryText: lines.join('\n'),
      signalCounts,
    };
  }, [klines]);
}
