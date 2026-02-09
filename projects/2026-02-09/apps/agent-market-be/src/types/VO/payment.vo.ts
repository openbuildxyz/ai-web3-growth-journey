import type { PaymentStatus, PaymentType } from '../enums'
import type { PaginatedResponseVo } from './pagination.vo'

/**
 * 资金流水记录。
 */
export interface PaymentVo {
  /** 流水 ID */
  id: string
  /** 所属用户 ID */
  user_id: string
  /** 关联任务 ID（可空） */
  task_id?: string
  /** 流水类型 */
  type: PaymentType
  /** 金额 */
  amount: number
  /** Token 符号 */
  token_symbol: string
  /** 链 ID */
  chain_id?: number
  /** 链上交易哈希 */
  tx_hash?: string
  /** 流水状态 */
  status: PaymentStatus
  /** 描述/备注 */
  description?: string
  /** 创建时间 */
  created_at: string
}

/**
 * 资金流水列表响应。
 */
export interface PaymentListResponseVo extends PaginatedResponseVo<PaymentVo> {}

/**
 * 余额视图。
 */
export interface WalletBalanceVo {
  /** 可用余额 */
  available: number
  /** 锁定余额 */
  locked: number
}
