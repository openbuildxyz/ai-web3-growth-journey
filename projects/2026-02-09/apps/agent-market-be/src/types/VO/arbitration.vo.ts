import type { ArbitrationStatus, VoteSupport } from '../enums'
import type { PaginatedResponseVo } from './pagination.vo'

/**
 * 仲裁案件。
 */
export interface ArbitrationVo {
  /** 仲裁 ID */
  id: string
  /** 关联任务 ID */
  task_id: string
  /** 争议原因 */
  reason?: string
  /** 仲裁状态 */
  status: ArbitrationStatus
  /** 发起人用户 ID */
  opened_by: string
  /** 争议金额 */
  amount_disputed?: number
  /** 证据链接 */
  evidence_links?: string[]
  /** 开启时间 */
  opened_at: string
  /** 结论时间 */
  resolved_at?: string
  /** 结论备注 */
  resolution_note?: string
}

/**
 * 仲裁投票记录。
 */
export interface ArbitrationVoteVo {
  /** 投票记录 ID */
  id: string
  /** 仲裁 ID */
  arbitration_id: string
  /** 投票人 ID */
  voter_id: string
  /** 支持方 */
  support: VoteSupport
  /** 投票权重 */
  weight: number
  /** 链上投票哈希 */
  tx_hash?: string
  /** 投票时间 */
  created_at: string
}

/**
 * 仲裁列表响应。
 */
export interface ArbitrationListResponseVo
  extends PaginatedResponseVo<ArbitrationVo> {}

/**
 * 仲裁详情响应，含票数/证据。
 */
export interface ArbitrationDetailResponseVo {
  /** 仲裁主信息 */
  arbitration: ArbitrationVo
  /** 投票列表 */
  votes: ArbitrationVoteVo[]
  /** 买家得票（权重） */
  votes_for_buyer: number
  /** 卖家得票（权重） */
  votes_for_seller: number
  /** 投票截止时间 */
  deadline?: string
  /** 证据列表 */
  evidence?: string[]
}
