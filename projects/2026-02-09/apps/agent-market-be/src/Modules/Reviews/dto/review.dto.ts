import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'

// 评价请求。
export class CreateReviewDto {
  @ApiProperty({ description: '评分 1-5' })
  @Type(() => Number)
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number

  @ApiPropertyOptional({ description: '评价内容' })
  @IsOptional()
  @IsString()
  feedback?: string
}

// 评价列表查询参数。
export class ListAgentReviewsQueryDto {
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
