import type { PaginationQueryDto } from './pagination.dto'

/**
 * 通知列表查询参数。
 */
export interface NotificationsQueryDto extends PaginationQueryDto {
  /** 已读筛选：true 仅已读，false 仅未读 */
  read?: boolean
}
