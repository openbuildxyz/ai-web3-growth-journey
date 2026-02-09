import type { UserVo } from './user.vo'

/**
 * 登录挑战响应。
 */
export interface AuthChallengeResponseVo {
  /** 随机 nonce */
  nonce: string
  /** 待签名消息 */
  message: string
  /** 过期时间 */
  expires_at: string
}

/**
 * 签名登录响应。
 */
export interface AuthLoginResponseVo {
  /** JWT */
  token: string
  /** 登录用户信息 */
  user: UserVo
}
