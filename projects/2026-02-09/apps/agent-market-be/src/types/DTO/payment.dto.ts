import type { PaymentStatus, PaymentType } from '../enums'
import type { PaginationQueryDto } from './pagination.dto'

/**
 * 资金流水查询参数。
 */
export interface ListPaymentsQueryDto extends PaginationQueryDto {
  /** 流水类型 */
  type?: PaymentType
  /** 流水状态 */
  status?: PaymentStatus
}

/**
 * 充值意向请求。
 */
export interface DepositDto {
  /** 金额 */
  amount: number
  /** Token 符号 */
  token_symbol: string
  /** 链 ID */
  chain_id: number
}

/**
 * 提现申请请求。
 */
export interface WithdrawDto {
  /** 金额 */
  amount: number
  /** 提现目标地址 */
  to_address: string
  /** Token 符号 */
  token_symbol: string
  /** 链 ID */
  chain_id: number
}
