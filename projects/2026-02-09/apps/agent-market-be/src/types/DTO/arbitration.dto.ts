import type { ArbitrationStatus, VoteSupport } from '../enums'
import type { PaginationQueryDto } from './pagination.dto'

/**
 * 仲裁列表查询参数。
 */
export interface ListArbitrationsQueryDto extends PaginationQueryDto {
  /** 仲裁状态过滤 */
  status?: ArbitrationStatus
}

/**
 * 创建仲裁请求。
 */
export interface CreateArbitrationDto {
  /** 争议原因 */
  reason: string
  /** 证据链接数组 */
  evidence_links?: string[]
  /** 争议金额 */
  amount_disputed?: number
}

/**
 * 仲裁投票请求。
 */
export interface VoteDto {
  /** 支持买家/卖家 */
  support: VoteSupport
  /** 链上投票哈希 */
  tx_hash?: string
}

/**
 * 仲裁结算请求（写入终态）。
 */
export interface FinalizeArbitrationDto {
  /** 裁决备注 */
  resolution_note?: string
  /** 结算链上哈希 */
  tx_hash?: string
  /** 终态状态 */
  status?: ArbitrationStatus
}
