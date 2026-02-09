import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'

// 任务列表查询参数（按角色/状态/关键词）。
export class ListTasksQueryDto {
  @ApiPropertyOptional({ description: '查询角色：buyer / agent' })
  @IsOptional()
  @IsString()
  @IsIn(['buyer', 'agent'])
  role?: 'buyer' | 'agent'

  @ApiPropertyOptional({ description: '任务状态' })
  @IsOptional()
  @IsString()
  @IsIn([
    'created',
    'accepted',
    'in_progress',
    'pending_review',
    'completed',
    'disputed',
    'arbitrated',
    'cancelled',
  ])
  status?: string

  @ApiPropertyOptional({ description: '标题/描述关键词' })
  @IsOptional()
  @IsString()
  q?: string

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

// 创建任务请求。
export class CreateTaskDto {
  @ApiProperty({ description: '链上创建交易哈希' })
  @IsString()
  @IsNotEmpty()
  tx_hash: string

  @ApiProperty({ description: '任务标题' })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({ description: '任务描述' })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty({ description: '预算（USDT 计价）' })
  @Type(() => Number)
  @IsNumber()
  budget_usd: number

  @ApiPropertyOptional({ description: '平台手续费金额' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  platform_fee?: number

  @ApiPropertyOptional({ description: 'Token 符号，默认 USDT' })
  @IsOptional()
  @IsString()
  token_symbol?: string

  @ApiPropertyOptional({ description: '指定 Agent ID，可为空' })
  @IsOptional()
  @IsUUID()
  agent_id?: string

  @ApiPropertyOptional({ description: '买家钱包地址（链下提交）' })
  @IsOptional()
  @IsString()
  buyer_wallet_address?: string

  @ApiPropertyOptional({ description: '是否自动分配 Agent' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  auto_assign?: boolean

  @ApiPropertyOptional({ description: '链 ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  chain_id?: number

  @ApiPropertyOptional({ description: '验收截止时间' })
  @IsOptional()
  @IsDateString()
  review_deadline?: string
}

// 交付请求。
export class DeliverDto {
  @ApiProperty({ description: '交付标题' })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({ description: '交付内容链接' })
  @IsString()
  @IsNotEmpty()
  content_url: string

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  notes?: string
}
