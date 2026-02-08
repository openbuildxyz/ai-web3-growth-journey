// ClawTrade API 客户端
import { getUserId } from './userSession.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * 获取市场价格
 */
export async function fetchMarketPrices() {
  const res = await fetch(`${API_BASE_URL}/api/market/prices`);
  if (!res.ok) throw new Error('获取价格失败');
  return res.json();
}

/**
 * 买入
 */
export async function buyTrade(params) {
  const res = await fetch(`${API_BASE_URL}/api/trade/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      userId: getUserId() // 自动添加用户ID
    })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
}

/**
 * 卖出
 */
export async function sellTrade(params) {
  const res = await fetch(`${API_BASE_URL}/api/trade/sell`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      userId: getUserId() // 自动添加用户ID
    })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
}

/**
 * 获取持仓
 */
export async function fetchPortfolio() {
  const userId = getUserId();
  const res = await fetch(`${API_BASE_URL}/api/portfolio?userId=${userId}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '获取持仓失败');
  return data;
}

/**
 * 获取交易历史
 */
export async function fetchTradeHistory() {
  const userId = getUserId();
  const res = await fetch(`${API_BASE_URL}/api/trade/history?userId=${userId}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '获取历史失败');
  return data.trades;
}

/**
 * 获取 OpenClaw AI 建议
 */
export async function getOpenClawSuggestion(params) {
  const res = await fetch(`${API_BASE_URL}/api/openclaw/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'AI 建议获取失败');
  return data.suggestion;
}

/**
 * 检查 OpenClaw 状态
 */
export async function checkOpenClawStatus() {
  const res = await fetch(`${API_BASE_URL}/api/openclaw/status`);
  return res.json();
}

/**
 * 深度分析加密货币
 */
export async function analyzeCrypto(symbol, query) {
  const res = await fetch(`${API_BASE_URL}/api/analysis/crypto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, query })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '分析失败');
  return data;
}

/**
 * 获取支持的分析币种
 */
export async function getSupportedAssets() {
  const res = await fetch(`${API_BASE_URL}/api/analysis/supported-assets`);
  return res.json();
}
