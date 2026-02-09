/**
 * 通用分页响应。
 */
export interface PaginatedResponseVo<T> {
  /** 数据列表 */
  data: T[]
  /** 当前页码 */
  page: number
  /** 每页数量 */
  limit: number
  /** 总数 */
  total: number
}
