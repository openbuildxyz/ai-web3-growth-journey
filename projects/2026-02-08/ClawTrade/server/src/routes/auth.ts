import { Router } from 'express';
import prisma from '../db.js';
import { randomBytes } from 'crypto';

const router = Router();

/**
 * POST /api/auth/init
 * 初始化用户，返回 userId
 */
router.post('/init', async (req, res) => {
  try {
    // 生成唯一 userId
    const userId = `user_${Date.now()}_${randomBytes(4).toString('hex')}`;
    const username = `demo_${userId}`;

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        currentCash: 100000 // 初始资金
      }
    });

    console.log(`✅ 新用户创建: ${userId}`);

    res.json({
      success: true,
      userId,
      initialCash: 100000,
      message: '欢迎使用 ClawTrade！'
    });

  } catch (error: any) {
    console.error('❌ 用户初始化失败:', error);
    res.status(500).json({
      success: false,
      message: '初始化失败，请重试'
    });
  }
});

/**
 * GET /api/auth/verify
 * 验证 userId 是否存在
 */
router.get('/verify', async (req, res) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少 userId'
      });
    }

    const username = `demo_${userId}`;
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.json({
        success: false,
        exists: false,
        message: 'userId 不存在'
      });
    }

    res.json({
      success: true,
      exists: true,
      userId,
      cash: parseFloat(user.currentCash.toString())
    });

  } catch (error: any) {
    console.error('❌ 验证失败:', error);
    res.status(500).json({
      success: false,
      message: '验证失败'
    });
  }
});

export default router;
