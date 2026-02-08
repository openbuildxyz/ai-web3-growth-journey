/**
 * Oracle-X 应用常量定义
 * 
 * 此文件包含应用级常量，避免在代码中使用魔法数字和硬编码字符串。
 */

// ===================================
// 技术指标参数
// ===================================

export const INDICATOR_PARAMS = {
  RSI: {
    PERIOD: 14,
    OVERBOUGHT: 70,
    OVERSOLD: 30,
  },
  MACD: {
    FAST_PERIOD: 12,
    SLOW_PERIOD: 26,
    SIGNAL_PERIOD: 9,
  },
  BOLLINGER_BANDS: {
    PERIOD: 20,
    STD_DEV: 2,
  },
  ATR: {
    PERIOD: 14,
  },
} as const;

// ===================================
// 数据要求
// ===================================

export const DATA_REQUIREMENTS = {
  MIN_KLINES: 100,
  RECOMMENDED_KLINES: 200,
  MAX_KLINES: 1000,
} as const;

// ===================================
// API 配置
// ===================================

export const API_CONFIG = {
  BINANCE_BASE_URL: 'https://api.binance.com/api/v3',
  TIMEOUT_MS: 10000,
  MAX_RETRIES: 3,
} as const;

// ===================================
// 支持的交易对
// ===================================

export const SUPPORTED_SYMBOLS = [
  'ETHUSDT',
  'BTCUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'ADAUSDT',
] as const;

export type SupportedSymbol = typeof SUPPORTED_SYMBOLS[number];

// ===================================
// 风险级别阈值
// ===================================

export const RISK_THRESHOLDS = {
  HIGH_VOLATILITY_ATR: 0.05,    // ATR > 5% 视为高波动
  EXTREME_RSI_HIGH: 80,         // RSI > 80 极度超买
  EXTREME_RSI_LOW: 20,          // RSI < 20 极度超卖
} as const;

// ===================================
// UI 常量
// ===================================

export const UI_CONSTANTS = {
  PRICE_DECIMAL_PLACES: 2,
  PERCENTAGE_DECIMAL_PLACES: 2,
  VOLUME_ABBREVIATION_THRESHOLD: 1000000, // 1M
} as const;

// ===================================
// 错误代码
// ===================================

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_KLINES: 'MISSING_KLINES',
  INVALID_SYMBOL: 'INVALID_SYMBOL',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

// ===================================
// AI 提示词常量
// ===================================

export const AI_PROMPTS = {
  SYSTEM_ROLE: '资深量化交易分析师',
  OUTPUT_FORMAT: {
    SECTIONS: [
      '【趋势分析】',
      '【波动性评估】',
      '【量价关系】',
      '【市场情绪】',
      '【风险评估】',
    ],
  },
} as const;

// ===================================
// 恐慌贪婪指数
// ===================================

export const FEAR_GREED_LABELS = {
  EXTREME_FEAR: 'Extreme Fear',
  FEAR: 'Fear',
  NEUTRAL: 'Neutral',
  GREED: 'Greed',
  EXTREME_GREED: 'Extreme Greed',
} as const;

export const FEAR_GREED_THRESHOLDS = {
  EXTREME_FEAR_MAX: 25,
  FEAR_MAX: 45,
  NEUTRAL_MAX: 55,
  GREED_MAX: 75,
  // > 75 is Extreme Greed
} as const;
