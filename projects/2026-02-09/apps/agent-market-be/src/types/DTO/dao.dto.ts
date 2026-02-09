/**
 * DAO 质押意向请求。
 */
export interface DaoStakeIntentDto {
  /** 质押数量 */
  amount: number
  /** Token 符号 */
  token_symbol: string
  /** 链 ID */
  chain_id: number
  /** 可选：链上交易哈希 */
  tx_hash?: string
}
