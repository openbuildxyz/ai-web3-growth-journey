/**
 * 获取登录挑战（nonce / message）请求。
 */
export interface AuthChallengeRequestDto {
  /** 钱包地址，用于生成挑战信息 */
  address: string
}

/**
 * 钱包签名登录请求。
 */
export interface AuthLoginRequestDto {
  /** 钱包地址 */
  address: string
  /** 对挑战 message 的签名 */
  signature: string
  /** 与挑战一致的 nonce */
  nonce: string
}
