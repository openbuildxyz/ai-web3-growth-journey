import type { EscrowStatus, PaymentStatus } from '../enums'

/**
 * 托管记录。
 */
export interface EscrowVo {
  /** 托管 ID */
  id: string
  /** 关联任务 ID */
  task_id: string
  /** 托管金额 */
  amount: number
  /** 托管状态 */
  status: EscrowStatus
  /** 锁定资金交易哈希 */
  onchain_tx_hash?: string
  /** 放款交易哈希 */
  released_tx_hash?: string
  /** 退款交易哈希 */
  refund_tx_hash?: string
  /** 创建时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
}

/**
 * 托管挂单响应。
 */
export interface EscrowIntentResponseVo {
  /** 支付挂单 ID */
  payment_id: string
  /** 关联任务 ID */
  task_id: string
  /** 金额 */
  amount: number
  /** Token 符号 */
  token_symbol: string
  /** 链 ID */
  chain_id: number
  /** 挂单状态 */
  status: PaymentStatus
}
