import type { ReputationSource } from '../enums'
import type { PaginatedResponseVo } from './pagination.vo'

/**
 * 声誉变更日志。
 */
export interface ReputationLogVo {
  /** 日志 ID */
  id: string
  /** 用户 ID */
  user_id: string
  /** 声誉来源类型 */
  source: ReputationSource
  /** 变动值 */
  delta: number
  /** 原因说明 */
  reason?: string
  /** 创建时间 */
  created_at: string
}

/**
 * 声誉日志列表响应。
 */
export interface ReputationLogListResponseVo
  extends PaginatedResponseVo<ReputationLogVo> {}
