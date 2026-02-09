import type { KycStatus, UserRole } from '../enums'

/**
 * 用户基础信息。
 */
export interface UserVo {
  /** 用户 ID */
  id: string
  /** 钱包地址 */
  wallet_address: string
  /** 邮箱 */
  email?: string
  /** 角色 */
  role: UserRole
  /** KYC 状态 */
  kyc_status: KycStatus
  /** 声誉分 */
  reputation_score: number
  /** 创建时间 */
  created_at: string
}

/**
 * 用户声誉信息。
 */
export interface UserReputationResponseVo {
  /** 用户 ID */
  user_id: string
  /** 声誉分 */
  score: number
  /** 分类汇总信息 */
  summary?: Record<string, unknown>
}
