import type { EscrowStatus, TaskEventType, TaskStatus } from '../enums'
import type { EscrowVo } from './escrow.vo'
import type { PaginatedResponseVo } from './pagination.vo'

/**
 * 任务基础信息。
 */
export interface TaskVo {
  /** 任务 ID */
  id: string
  /** 买家用户 ID */
  buyer_id: string
  /** 接单 Agent ID */
  agent_id?: string
  /** 标题 */
  title: string
  /** 描述 */
  description?: string
  /** 预算 */
  budget_usd: number
  /** 平台费 */
  platform_fee?: number
  /** Token 符号 */
  token_symbol: string
  /** 链 ID */
  chain_id?: number
  /** 状态 */
  status: TaskStatus
  /** 进度百分比 */
  progress?: number
  /** 创建时间 */
  created_at: string
  /** 接单时间 */
  accepted_at?: string
  /** 交付时间 */
  delivered_at?: string
  /** 验收截止 */
  review_deadline?: string
  /** 仲裁截止 */
  arbitration_deadline?: string
}

/**
 * 任务事件时间线。
 */
export interface TaskEventVo {
  /** 事件 ID */
  id: string
  /** 事件类型 */
  type: TaskEventType
  /** 触发人 ID */
  actor_id?: string
  /** 事件附加数据 */
  data?: Record<string, unknown>
  /** 创建时间 */
  created_at: string
}

/**
 * 任务交付物（版本化）。
 */
export interface TaskDeliverableVo {
  /** 交付物 ID */
  id: string
  /** 关联任务 ID */
  task_id: string
  /** 版本号 */
  version: number
  /** 标题 */
  title?: string
  /** 内容链接 */
  content_url?: string
  /** 备注 */
  notes?: string
  /** 创建时间 */
  created_at: string
}

/**
 * 任务详情响应，包含交付物/事件/托管。
 */
export interface TaskDetailResponseVo {
  /** 任务详情 */
  task: TaskVo
  /** 交付物列表 */
  deliverables: TaskDeliverableVo[]
  /** 事件列表 */
  events: TaskEventVo[]
  /** 托管信息 */
  escrow?: EscrowVo
}

/**
 * 创建任务响应。
 */
export interface CreateTaskResponseVo {
  /** 任务 ID */
  task_id: string
  /** 创建后的状态 */
  status: TaskStatus
  /** 托管挂单 ID */
  escrow_intent_id?: string
}

/**
 * 任务列表响应。
 */
export interface TaskListResponseVo extends PaginatedResponseVo<TaskVo> {}
