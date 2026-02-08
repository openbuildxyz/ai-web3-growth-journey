/**
 * 参数校验模块
 */

import { 
  AnalyzeRequest, 
  ALLOWED_SYMBOLS, 
  ErrorResponse 
} from '@/types/analyze';

const MAX_KLINES = 50;

/**
 * 校验分析请求参数
 */
export function validateAnalyzeRequest(body: unknown): { 
  valid: true; data: AnalyzeRequest 
} | { 
  valid: false; error: ErrorResponse 
} {
  // 检查是否为对象
  if (!body || typeof body !== 'object') {
    return { 
      valid: false, 
      error: { error: 'Invalid parameters', detail: 'Request body must be an object' } 
    };
  }

  const req = body as Record<string, unknown>;

  // 校验 symbol
  if (!req.symbol || typeof req.symbol !== 'string') {
    return { 
      valid: false, 
      error: { error: 'Invalid parameters', detail: 'symbol is required' } 
    };
  }
  if (!ALLOWED_SYMBOLS.includes(req.symbol as typeof ALLOWED_SYMBOLS[number])) {
    return { 
      valid: false, 
      error: { error: 'Invalid parameters', detail: `symbol must be one of: ${ALLOWED_SYMBOLS.join(', ')}` } 
    };
  }

  // 校验 direction
  if (!req.direction || (req.direction !== 'LONG' && req.direction !== 'SHORT')) {
    return { 
      valid: false, 
      error: { error: 'Invalid parameters', detail: 'direction must be LONG or SHORT' } 
    };
  }

  // 校验 marketData
  if (!req.marketData || typeof req.marketData !== 'object') {
    return { 
      valid: false, 
      error: { error: 'Invalid parameters', detail: 'marketData is required' } 
    };
  }

  const marketData = req.marketData as Record<string, unknown>;

  // 校验 price
  if (!marketData.price) {
    return { 
      valid: false, 
      error: { error: 'Invalid parameters', detail: 'marketData.price is required' } 
    };
  }

  // 校验 klines（可选，Extension 可能不传）
  if (marketData.klines) {
    if (!Array.isArray(marketData.klines)) {
      return { 
        valid: false, 
        error: { error: 'Invalid parameters', detail: 'marketData.klines must be an array' } 
      };
    }

    if (marketData.klines.length > MAX_KLINES) {
      return { 
        valid: false, 
        error: { error: 'Invalid parameters', detail: `marketData.klines cannot exceed ${MAX_KLINES} items` } 
      };
    }
  }

  return { 
    valid: true, 
    data: req as unknown as AnalyzeRequest 
  };
}
