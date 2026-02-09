/**
 * 通用分页查询参数。
 */
export interface PaginationQueryDto {
  /** 页码，从 1 开始 */
  page?: number
  /** 每页数量，默认 20 */
  limit?: number
}
