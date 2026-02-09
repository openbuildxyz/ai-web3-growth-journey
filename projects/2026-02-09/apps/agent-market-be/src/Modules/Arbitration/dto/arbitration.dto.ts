import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'

// 争议提交请求（链上 tx_hash）。
export class DisputeTxDto {
  @ApiProperty({ description: '争议交易哈希' })
  @IsString()
  @IsNotEmpty()
  tx_hash: string
}

// 仲裁列表查询参数。
export class ListArbitrationsQueryDto {
  @ApiPropertyOptional({ description: '仲裁状态过滤' })
  @IsOptional()
  @IsString()
  @IsIn(['voting', 'resolved_buyer', 'resolved_seller', 'cancelled'])
  status?: string

  @ApiPropertyOptional({ description: '页码，从 1 开始' })
  @IsOptional()
  @Type(() => Number)
  page?: number

  @ApiPropertyOptional({ description: '每页数量，默认 20' })
  @IsOptional()
  @Type(() => Number)
  limit?: number
}

// 仲裁投票请求。
export class VoteDto {
  @ApiProperty({ description: '支持买家/卖家' })
  @IsString()
  @IsIn(['buyer', 'seller'])
  support: string

  @ApiProperty({ description: '链上投票哈希' })
  @IsString()
  @IsNotEmpty()
  tx_hash: string
}
