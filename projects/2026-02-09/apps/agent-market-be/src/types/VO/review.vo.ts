import type { PaginatedResponseVo } from './pagination.vo'

/**
 * 任务评价。
 */
export interface ReviewVo {
  /** 评价 ID */
  id: string
  /** 任务 ID */
  task_id: string
  /** 评价人 ID */
  reviewer_id: string
  /** 被评 Agent ID */
  agent_id: string
  /** 评分 1-5 */
  rating: number
  /** 文本反馈 */
  feedback?: string
  /** 创建时间 */
  created_at: string
}

/**
 * 评价列表响应。
 */
export interface ReviewListResponseVo extends PaginatedResponseVo<ReviewVo> {}
