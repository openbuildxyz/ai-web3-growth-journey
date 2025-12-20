// 简单的客户端加密工具（用于保护 API 密钥）

class SimpleCrypto {
  constructor() {
    // 使用简单的混淆算法，不是真正的加密，但能防止明文暴露
    this.key = 'ProposalDAO2024';
  }

  // 简单的 XOR 加密
  encrypt(text) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length)
      );
    }
    return btoa(result); // Base64 编码
  }

  // 简单的 XOR 解密
  decrypt(encryptedText) {
    try {
      const decoded = atob(encryptedText); // Base64 解码
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(
          decoded.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length)
        );
      }
      return result;
    } catch (error) {
      console.error('解密失败:', error);
      return null;
    }
  }

  // 获取安全的 API 密钥
  getSecureApiKey() {
    const rawKey = import.meta.env.VITE_METASO_API_KEY;
    if (!rawKey) {
      console.warn('未找到 Metaso API 密钥');
      return null;
    }

    // 如果密钥看起来已经是加密的，尝试解密
    if (rawKey.length > 50 && !rawKey.startsWith('mk-')) {
      return this.decrypt(rawKey);
    }

    // 否则直接返回（开发环境）
    return rawKey;
  }
}

export const crypto = new SimpleCrypto();
export default crypto;