/**
 * Oracle-X 类型定义
 */

// K线数据结构
export interface KlineData {
  openTime: number;      // 开盘时间戳
  time?: number;         // 可选: 秒级时间戳
  open: string;          // 开盘价
  high: string;          // 最高价
  low: string;           // 最低价
  close: string;         // 收盘价
  volume: string;        // 成交量
}

// Twitter 情绪分析数据
export interface TweetData {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export interface TwitterSentimentResult {
  query: string;
  totalCount: number;
  positive: number;
  negative: number;
  neutral: number;
  overallSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidencePercent: number;
  tweets: TweetData[];
}

// 市场数据结构
export interface MarketData {
  price: string;                     // 当前价格
  change24h: string;                 // 24h涨跌幅百分比
  volume: string;                    // 24h成交量
  high24h: string;                   // 24h最高价
  low24h: string;                    // 24h最低价
  fearGreedIndex: number | null;     // FGI值
  fearGreedLabel: string | null;     // FGI标签
  klines: KlineData[] | null;        // K线数据
  twitterSentiment?: TwitterSentimentResult | null; // Twitter 情绪
}

// 请求参数
export interface AnalyzeRequest {
  symbol: string;                    // 交易对
  direction: Direction;              // 交易方向
  marketData: MarketData;
}

// 交易方向
export type Direction = 'LONG' | 'SHORT';

// 允许的交易对
export const ALLOWED_SYMBOLS = ['ETHUSDT', 'BTCUSDT', 'SOLUSDT'] as const;
export type AllowedSymbol = typeof ALLOWED_SYMBOLS[number];

// 技术指标信号
export type IndicatorSignal = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

// RSI 计算结果
export interface RSIResult {
  value: number;
  signal: IndicatorSignal;
  description: string;
}

// MACD 计算结果
export interface MACDResult {
  dif: number;
  dea: number;
  histogram: number;
  signal: IndicatorSignal;
  description: string;
}

// Bollinger Bands 计算结果
export interface BollingerBandsResult {
  upper: number;
  middle: number;
  lower: number;
  pricePosition: number;  // 0-100, 当前价格在通道中的位置
  signal: IndicatorSignal;
  description: string;
}

// ATR 计算结果
export interface ATRResult {
  value: number;
  volatilityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

// SMA 计算结果
export interface SMAResult {
  period: number;
  value: number;
  description: string;
}

// EMA 计算结果
export interface EMAResult {
  period: number;
  value: number;
  description: string;
}

// 价格变化结果
export interface PriceChangeResult {
  period: string;
  changePercent: number;
  trend: 'UP' | 'DOWN' | 'FLAT';
}

// 所有技术指标汇总 (增强版)
export interface IndicatorsResult {
  rsi: RSIResult | null;
  macd: MACDResult | null;
  bollingerBands: BollingerBandsResult | null;
  atr: ATRResult | null;
  sma50: SMAResult | null;
  sma200: SMAResult | null;
  ema12: EMAResult | null;
  ema26: EMAResult | null;
}

// K线压缩结果 (增强版)
export interface KlineSummary {
  priceFrom: number;
  priceTo: number;
  changePercent: number;
  high: number;
  highHoursAgo: number;
  low: number;
  lowHoursAgo: number;
  volumeTrend: 'UP' | 'DOWN' | 'FLAT';
  volumeChangePercent: number;
  volatility: number;
  consecutiveDirection: 'UP' | 'DOWN' | 'MIXED';
  consecutiveCount: number;
  trend7d?: 'UP' | 'DOWN' | 'SIDEWAYS';  // 基于 4h/1d K线
  trend30d?: 'UP' | 'DOWN' | 'SIDEWAYS'; // 基于 1d K线
  supportLevel?: number;
  resistanceLevel?: number;
  text: string;
}

// 错误响应
export interface ErrorResponse {
  error: string;
  detail?: string;
}
