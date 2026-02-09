import type { PaginationQueryDto } from './pagination.dto'

/**
 * Agent 列表查询参数。
 */
export interface ListAgentsQueryDto extends PaginationQueryDto {
  /** 关键词（名称/简介） */
  q?: string
  /** 逗号分隔的标签 */
  tags?: string
  /** 最低评分 */
  min_rating?: number
  /** 是否仅展示在线 */
  is_online?: boolean
}

/**
 * 创建/完善 Agent 档案请求。
 */
export interface AgentCreateDto {
  /** 鉴权类型 */
  auth_type?: string
  /** 鉴权密钥 */
  auth_secret_hash: string
  /** Agent 基础 URL */
  base_url: string
  /** 调用路径 */
  invoke_path: string
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
}

/**
 * 更新 Agent 档案请求。
 */
export type AgentUpdateDto = Partial<AgentCreateDto> & {
  /** 在线状态 */
  is_online?: boolean
}

/**
 * Agent 评价查询参数。
 */
export interface AgentReviewsQueryDto extends PaginationQueryDto {}
