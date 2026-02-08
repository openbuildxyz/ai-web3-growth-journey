import { Router } from 'express';

const router = Router();

// Crypto Analysis API URL (可以是本地或 Railway 部署的服务)
const ANALYSIS_API_URL = process.env.ANALYSIS_API_URL || 'http://localhost:8000';

/**
 * POST /api/analysis/crypto
 * 调用 Crypto Agent 分析
 */
router.post('/crypto', async (req, res) => {
  try {
    const { symbol, query } = req.body;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: '缺少必填参数: symbol'
      });
    }

    console.log(`🔍 请求分析: ${symbol} - ${query || '市场分析'}`);

    // 调用 Python 分析服务
    const response = await fetch(`${ANALYSIS_API_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol,
        query: query || `${symbol} 市场分析`
      })
    });

    if (!response.ok) {
      throw new Error(`分析服务返回错误: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`✅ 分析完成: ${symbol}`);

    res.json(data);
  } catch (error: any) {
    console.error('❌ 分析请求失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '分析服务暂时不可用'
    });
  }
});

/**
 * GET /api/analysis/supported-assets
 * 获取支持的币种列表
 */
router.get('/supported-assets', async (req, res) => {
  try {
    const response = await fetch(`${ANALYSIS_API_URL}/api/supported-assets`);
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('❌ 获取币种列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取币种列表失败'
    });
  }
});

/**
 * GET /api/analysis/status
 * 检查分析服务状态
 */
router.get('/status', async (req, res) => {
  try {
    const response = await fetch(`${ANALYSIS_API_URL}/health`);
    const data = await response.json();
    res.json({
      success: true,
      analysis_service: data
    });
  } catch (error: any) {
    res.status(503).json({
      success: false,
      message: '分析服务不可用'
    });
  }
});

export default router;
