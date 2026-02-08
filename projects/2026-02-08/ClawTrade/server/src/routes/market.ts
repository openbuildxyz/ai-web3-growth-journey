import { Router } from 'express';
import { getAllPrices } from '../priceService.js';

const router = Router();

/**
 * GET /api/market/prices
 * 获取所有币种价格
 */
router.get('/prices', async (req, res) => {
  try {
    const prices = await getAllPrices();
    res.json(prices);
  } catch (error: any) {
    console.error('❌ 获取价格失败:', error);
    res.status(500).json({
      error: '获取价格失败',
      message: error.message
    });
  }
});

export default router;
