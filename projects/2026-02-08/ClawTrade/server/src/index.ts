import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tradeRoutes from './routes/trade.js';
import portfolioRoutes from './routes/portfolio.js';
import marketRoutes from './routes/market.js';
import openclawRoutes from './routes/openclaw.js';
import analysisRoutes from './routes/analysis.js';
import authRoutes from './routes/auth.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// 中间件
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ClawTrade API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/openclaw', openclawRoutes);
app.use('/api/analysis', analysisRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: '接口不存在',
    path: req.path
  });
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ 服务器错误:', err);
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 ClawTrade API Server 启动成功    ║
╠════════════════════════════════════════╣
║  端口: ${PORT.toString().padEnd(33)}║
║  环境: ${(process.env.NODE_ENV || 'development').padEnd(33)}║
║  CORS: ${CORS_ORIGIN.padEnd(33)}║
╚════════════════════════════════════════╝

📊 可用接口:
  - GET  /health              健康检查
  - POST /api/auth/init       初始化用户
  - GET  /api/auth/verify     验证用户
  - GET  /api/market/prices   获取价格
  - POST /api/trade/buy       买入
  - POST /api/trade/sell      卖出
  - GET  /api/trade/history   交易历史
  - GET  /api/portfolio       持仓概览
  - POST /api/openclaw/suggest AI建议
  - GET  /api/openclaw/status  Agent状态
  - POST /api/analysis/crypto  深度分析
  - GET  /api/analysis/status  分析服务状态
  `);
});

export default app;
