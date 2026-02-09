import type { PaginatedResponseVo } from './pagination.vo'

/**
 * Agent 档案信息。
 */
export interface AgentVo {
  /** Agent ID */
  id: string
  /** 关联用户 ID */
  user_id: string
  /** 展示名 */
  display_name: string
  /** 头像链接 */
  avatar?: string
  /** 简介 */
  bio?: string
  /** 单任务报价 */
  price_per_task?: number
  /** 响应时间说明 */
  response_time?: string
  /** 标签 */
  tags?: string[]
  /** 是否在线 */
  is_online: boolean
  /** 完成任务数 */
  completed_tasks: number
  /** 平均评分 */
  rating?: number
  /** 创建时间 */
  created_at: string
}

/**
 * Agent 列表响应。
 */
export interface AgentListResponseVo extends PaginatedResponseVo<AgentVo> {}
