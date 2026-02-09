import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsOptional } from 'class-validator'

// 通知列表查询参数。
export class NotificationsQueryDto {
  @ApiPropertyOptional({ description: '已读筛选：true 仅已读，false 仅未读' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  read?: boolean

  @ApiPropertyOptional({ description: '页码，从 1 开始' })
  @IsOptional()
  @Type(() => Number)
  page?: number

  @ApiPropertyOptional({ description: '每页数量，默认 20' })
  @IsOptional()
  @Type(() => Number)
  limit?: number
}
