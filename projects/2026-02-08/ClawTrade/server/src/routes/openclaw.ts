import { Router } from 'express';
import { getCoinPrice } from '../priceService.js';

const router = Router();

type OpenClawAction = 'BUY' | 'SELL' | 'HOLD';
type OpenClawRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

type OpenClawSuggestion = {
  action: OpenClawAction;
  confidence: number;
  reason: string;
  suggested_amount: number;
  risk_level: OpenClawRiskLevel;
  entry_price?: number;
  target_price?: number;
  stop_loss?: number;
  current_pnl?: number;
  take_profit_price?: number;
  stop_loss_price?: number;
  watch_price_above?: number;
  watch_price_below?: number;
};

/**
 * POST /api/openclaw/suggest
 * OpenClaw AI 交易建议（Mock 版本）
 *
 * 请求参数：
 * - coin_id: 币种 ID
 * - symbol: 币种符号
 * - current_price: 当前价格
 * - user_cash: 用户余额
 * - user_positions: 用户持仓
 */
router.post('/suggest', async (req, res) => {
  try {
    const { coin_id, symbol, current_price, user_cash, user_positions = {} } = req.body;

    if (!coin_id || !symbol) {
      return res.status(400).json({
        success: false,
        message: '缺少币种信息'
      });
    }

    // 获取实时价格
    const price = current_price || await getCoinPrice(coin_id);

    // Mock AI 策略生成
    const strategies = generateMockStrategies(coin_id, symbol, price, user_cash, user_positions);

    // 随机选择一个策略
    const suggestion = strategies[Math.floor(Math.random() * strategies.length)];

    console.log(`🤖 OpenClaw 建议 [${symbol}]: ${suggestion.action} - ${suggestion.reason}`);

    res.json({
      success: true,
      agent: 'OpenClaw Agent v1.0 (Mock)',
      timestamp: new Date().toISOString(),
      suggestion
    });
  } catch (error: any) {
    console.error('❌ OpenClaw 建议生成失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/openclaw/status
 * 检查 OpenClaw Agent 状态
 */
router.get('/status', (req, res) => {
  res.json({
    connected: true,
    agent_version: 'v1.0-mock',
    mode: 'SUGGESTION_ASSISTANT',
    capabilities: ['price_analysis', 'trade_suggestion', 'risk_assessment'],
    message: 'OpenClaw Agent 运行正常（Mock 模式）'
  });
});

/**
 * 生成 Mock 交易策略
 */
function generateMockStrategies(
  coinId: string,
  symbol: string,
  price: number,
  userCash: number,
  userPositions: any
) {
  const hasPosition = userPositions[symbol] && userPositions[symbol].amount > 0;
  const suggestedBuyAmount = Math.min(userCash * 0.1, 5000);

  const strategies: OpenClawSuggestion[] = [
    // 买入策略
    {
      action: 'BUY',
      confidence: 0.75,
      reason: `${symbol} 技术面显示超卖信号，RSI 接近 30，建议分批建仓`,
      suggested_amount: suggestedBuyAmount,
      risk_level: 'MEDIUM',
      entry_price: price,
      target_price: price * 1.15,
      stop_loss: price * 0.92
    },
    {
      action: 'BUY',
      confidence: 0.68,
      reason: `${symbol} 突破 20 日均线，成交量放大，趋势向好`,
      suggested_amount: suggestedBuyAmount * 0.8,
      risk_level: 'MEDIUM',
      entry_price: price,
      target_price: price * 1.12,
      stop_loss: price * 0.95
    },
    // 观望策略
    {
      action: 'HOLD',
      confidence: 0.60,
      reason: `当前市场震荡，${symbol} 在关键支撑位附近，建议观望等待更好入场点`,
      suggested_amount: 0,
      risk_level: 'LOW',
      watch_price_above: price * 1.05,
      watch_price_below: price * 0.95
    },
    {
      action: 'HOLD',
      confidence: 0.55,
      reason: `${symbol} 近期波动较大，建议等待趋势明确后再入场`,
      suggested_amount: 0,
      risk_level: 'LOW',
      watch_price_above: price * 1.03,
      watch_price_below: price * 0.97
    }
  ];

  // 如果已有持仓，添加卖出策略
  if (hasPosition) {
    const position = userPositions[symbol];
    const pnlPct = ((price / position.avgCost) - 1) * 100;

    if (pnlPct > 10) {
      strategies.push({
        action: 'SELL',
        confidence: 0.70,
        reason: `${symbol} 已盈利 ${pnlPct.toFixed(1)}%，建议止盈一半仓位，锁定利润`,
        suggested_amount: position.amount * price * 0.5,
        risk_level: 'LOW',
        current_pnl: pnlPct,
        take_profit_price: price
      });
    } else if (pnlPct < -8) {
      strategies.push({
        action: 'SELL',
        confidence: 0.65,
        reason: `${symbol} 亏损 ${Math.abs(pnlPct).toFixed(1)}%，跌破止损位，建议减仓控制风险`,
        suggested_amount: position.amount * price * 0.3,
        risk_level: 'HIGH',
        current_pnl: pnlPct,
        stop_loss_price: price
      });
    }
  }

  return strategies;
}

export default router;
