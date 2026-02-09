import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional } from 'class-validator'

// 声誉日志查询参数。
export class ReputationLogsQueryDto {
  @ApiPropertyOptional({ description: '页码，从 1 开始' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number

  @ApiPropertyOptional({ description: '每页数量，默认 20' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number
}
