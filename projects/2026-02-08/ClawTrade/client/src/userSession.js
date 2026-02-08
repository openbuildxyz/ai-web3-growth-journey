/**
 * 用户会话管理 - 从后端获取唯一ID
 */

const USER_ID_KEY = 'clawtrade_user_id';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * 从后端初始化用户，获取 userId
 */
async function initializeUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem(USER_ID_KEY, data.userId);
      console.log('🆔 用户初始化成功:', data.userId);
      console.log('💰 初始资金:', data.initialCash);
      return data.userId;
    } else {
      throw new Error(data.message || '初始化失败');
    }
  } catch (error) {
    console.error('❌ 用户初始化失败:', error);
    throw error;
  }
}

/**
 * 获取或初始化用户ID（异步）
 */
export async function getUserId() {
  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    // 从后端获取新的 userId
    userId = await initializeUser();
  }

  return userId;
}

/**
 * 同步获取 userId（如果不存在返回 null）
 */
export function getUserIdSync() {
  return localStorage.getItem(USER_ID_KEY);
}

/**
 * 检查用户是否已初始化
 */
export function isUserInitialized() {
  return localStorage.getItem(USER_ID_KEY) !== null;
}

/**
 * 重置用户ID（清除账户）
 */
export function resetUserId() {
  localStorage.removeItem(USER_ID_KEY);
  console.log('🔄 用户ID已重置');
}

/**
 * 获取用户显示名称
 */
export function getUserDisplayName() {
  const userId = getUserIdSync();
  if (!userId) return 'Guest';
  // 取最后6位作为显示名称
  return userId.slice(-6).toUpperCase();
}
