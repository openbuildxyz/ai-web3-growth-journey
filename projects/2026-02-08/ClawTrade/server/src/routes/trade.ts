import { Router } from 'express';
import type { Trade } from '@prisma/client';
import prisma from '../db.js';
import { getCoinPrice } from '../priceService.js';

const router = Router();

// 获取或创建用户（根据 userId）
async function getDemoUser(userId?: string) {
  // 使用传入的 userId 或默认 demo_user
  const username = userId ? `demo_${userId}` : 'demo_user';

  let user = await prisma.user.findUnique({
    where: { username }
  });

  if (!user) {
    user = await prisma.user.create({
      data: { username, currentCash: 100000 }
    });
    console.log(`✅ 创建新用户 ${username}，初始资金: $100,000`);
  }

  return user;
}

/**
 * POST /api/trade/buy
 * 买入币种
 */
router.post('/buy', async (req, res) => {
  try {
    const { coin_id, symbol, name, icon, amount_usd, source = 'WEB', userId } = req.body;

    // 验证参数
    if (!coin_id || !symbol || !amount_usd || amount_usd <= 0) {
      return res.status(400).json({
        success: false,
        message: '参数错误：缺少币种信息或金额无效'
      });
    }

    // 获取用户（使用前端传来的 userId）
    const user = await getDemoUser(userId);

    // 检查余额
    const cashNum = parseFloat(user.currentCash.toString());
    if (cashNum < amount_usd) {
      return res.status(400).json({
        success: false,
        message: `余额不足，当前余额: $${cashNum.toFixed(2)}`
      });
    }

    // 获取实时价格
    const currentPrice = await getCoinPrice(coin_id);
    const buyAmount = amount_usd / currentPrice;

    // 更新余额
    const newCash = cashNum - amount_usd;
    await prisma.user.update({
      where: { id: user.id },
      data: { currentCash: newCash }
    });

    // 更新或创建持仓
    const existingPosition = await prisma.position.findUnique({
      where: {
        userId_coinId: {
          userId: user.id,
          coinId: coin_id
        }
      }
    });

    if (existingPosition) {
      // 更新现有持仓
      const newAmount = parseFloat(existingPosition.amount.toString()) + buyAmount;
      const newTotalCost = parseFloat(existingPosition.totalCost.toString()) + amount_usd;
      const newAvgCost = newTotalCost / newAmount;

      await prisma.position.update({
        where: { id: existingPosition.id },
        data: {
          amount: newAmount,
          totalCost: newTotalCost,
          avgCost: newAvgCost
        }
      });
    } else {
      // 创建新持仓
      await prisma.position.create({
        data: {
          userId: user.id,
          coinId: coin_id,
          symbol,
          name: name || symbol,
          icon: icon || '●',
          amount: buyAmount,
          avgCost: currentPrice,
          totalCost: amount_usd
        }
      });
    }

    // 记录交易
    await prisma.trade.create({
      data: {
        userId: user.id,
        type: 'BUY',
        coinId: coin_id,
        symbol,
        icon: icon || '●',
        amount: buyAmount,
        price: currentPrice,
        totalValue: amount_usd,
        source
      }
    });

    console.log(`✅ 买入成功: ${buyAmount.toFixed(8)} ${symbol} @ $${currentPrice.toFixed(2)}`);

    res.json({
      success: true,
      message: `✅ 买入 ${buyAmount.toFixed(8)} ${symbol} @ $${currentPrice.toFixed(2)}`,
      new_balance: newCash,
      trade: {
        type: 'BUY',
        symbol,
        amount: buyAmount,
        price: currentPrice,
        total: amount_usd
      }
    });
  } catch (error: any) {
    console.error('❌ 买入失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '买入失败，请稍后重试'
    });
  }
});

/**
 * POST /api/trade/sell
 * 卖出币种
 */
router.post('/sell', async (req, res) => {
  try {
    const { coin_id, symbol, amount_usd, source = 'WEB', userId } = req.body;

    if (!coin_id || !symbol || !amount_usd || amount_usd <= 0) {
      return res.status(400).json({
        success: false,
        message: '参数错误'
      });
    }

    const user = await getDemoUser(userId);

    // 查找持仓
    const position = await prisma.position.findUnique({
      where: {
        userId_coinId: {
          userId: user.id,
          coinId: coin_id
        }
      }
    });

    if (!position) {
      return res.status(400).json({
        success: false,
        message: `无 ${symbol} 持仓可卖出`
      });
    }

    // 获取实时价格
    const currentPrice = await getCoinPrice(coin_id);
    const positionAmount = parseFloat(position.amount.toString());
    const maxSellValue = positionAmount * currentPrice;
    const sellValue = Math.min(amount_usd, maxSellValue);
    const sellAmount = sellValue / currentPrice;

    // 更新余额
    const cashNum = parseFloat(user.currentCash.toString());
    const newCash = cashNum + sellValue;
    await prisma.user.update({
      where: { id: user.id },
      data: { currentCash: newCash }
    });

    // 更新持仓
    const newAmount = positionAmount - sellAmount;
    if (newAmount < 0.00000001) {
      // 全部卖出，删除持仓
      await prisma.position.delete({
        where: { id: position.id }
      });
    } else {
      // 部分卖出
      const avgCost = parseFloat(position.avgCost.toString());
      await prisma.position.update({
        where: { id: position.id },
        data: {
          amount: newAmount,
          totalCost: avgCost * newAmount
        }
      });
    }

    // 记录交易
    await prisma.trade.create({
      data: {
        userId: user.id,
        type: 'SELL',
        coinId: coin_id,
        symbol,
        icon: position.icon,
        amount: sellAmount,
        price: currentPrice,
        totalValue: sellValue,
        source
      }
    });

    console.log(`✅ 卖出成功: ${sellAmount.toFixed(8)} ${symbol} @ $${currentPrice.toFixed(2)}`);

    res.json({
      success: true,
      message: `✅ 卖出 ${sellAmount.toFixed(8)} ${symbol} @ $${currentPrice.toFixed(2)}`,
      new_balance: newCash,
      trade: {
        type: 'SELL',
        symbol,
        amount: sellAmount,
        price: currentPrice,
        total: sellValue
      }
    });
  } catch (error: any) {
    console.error('❌ 卖出失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '卖出失败'
    });
  }
});

/**
 * GET /api/trade/history
 * 获取交易历史
 */
router.get('/history', async (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    const user = await getDemoUser(userId);

    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json({
      success: true,
      trades: trades.map((t: Trade) => ({
        id: t.id,
        type: t.type.toLowerCase(),
        symbol: t.symbol,
        icon: t.icon,
        amount: parseFloat(t.amount.toString()),
        price: parseFloat(t.price.toString()),
        total: parseFloat(t.totalValue.toString()),
        source: t.source,
        time: t.createdAt.toLocaleString('zh-CN', { hour12: false })
      }))
    });
  } catch (error: any) {
    console.error('❌ 获取交易历史失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
