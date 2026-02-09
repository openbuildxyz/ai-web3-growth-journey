import type { TaskStatus } from '../enums'
import type { PaginationQueryDto } from './pagination.dto'

/**
 * 任务列表查询参数（按角色/状态/关键词）。
 */
export interface ListTasksQueryDto extends PaginationQueryDto {
  /** 查询角色：buyer / agent */
  role?: 'buyer' | 'agent'
  /** 任务状态 */
  status?: TaskStatus
  /** 标题/描述关键词 */
  q?: string
}

/**
 * 创建任务请求。
 */
export interface CreateTaskDto {
  /** 任务标题 */
  title: string
  /** 任务描述 */
  description: string
  /** 预算（USDT 计价） */
  budget_usd: number
  /** 平台手续费金额 */
  platform_fee?: number
  /** Token 符号，默认 USDT */
  token_symbol?: string
  /** 指定 Agent ID，可为空 */
  agent_id?: string
  /** 是否自动分配 Agent */
  auto_assign?: boolean
  /** 链 ID */
  chain_id?: number
  /** 验收截止时间 */
  review_deadline?: string
}

export interface DeliverDto {
  /** 交付标题 */
  title: string
  /** 交付内容链接 */
  content_url: string
  /** 备注 */
  notes?: string
}

/**
 * 发起争议请求。
 */
export interface DisputeDto {
  /** 争议原因 */
  reason: string
  /** 证据链接列表 */
  evidence_links?: string[]
  /** 争议金额 */
  amount_disputed?: number
}

/**
 * 创建托管挂单请求。
 */
export interface EscrowIntentDto {
  /** 托管金额 */
  amount: number
  /** Token 符号 */
  token_symbol: string
  /** 链 ID */
  chain_id: number
}

/**
 * 回传链上交易哈希请求。
 */
export interface TxHashDto {
  /** 链上交易哈希 */
  tx_hash: string
}

/**
 * 退款请求（未接单/仲裁退款）。
 */
export interface RefundDto {
  /** 退款原因 */
  reason?: string
  /** 退款相关交易哈希 */
  tx_hash?: string
}

/**
 * 任务评价请求。
 */
export interface ReviewRequestDto {
  /** 评分 1-5 */
  rating: number
  /** 文本反馈 */
  feedback?: string
}
