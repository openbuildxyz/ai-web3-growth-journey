import type { NotificationType } from '../enums'
import type { PaginatedResponseVo } from './pagination.vo'

/**
 * 通知消息。
 */
export interface NotificationVo {
  /** 通知 ID */
  id: string
  /** 目标用户 ID */
  user_id: string
  /** 通知类型 */
  type: NotificationType
  /** 标题 */
  title: string
  /** 内容 */
  content?: string
  /** 是否已读 */
  read: boolean
  /** 创建时间 */
  created_at: string
}

/**
 * 通知列表响应。
 */
export interface NotificationListResponseVo
  extends PaginatedResponseVo<NotificationVo> {}
