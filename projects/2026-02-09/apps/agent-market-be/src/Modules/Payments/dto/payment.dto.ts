import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator'

// 资金流水查询参数。
export class ListPaymentsQueryDto {
  @ApiPropertyOptional({ description: '流水类型' })
  @IsOptional()
  @IsString()
  @IsIn(['deposit', 'withdraw', 'payment', 'refund', 'reward', 'fee'])
  type?: string

  @ApiPropertyOptional({ description: '流水状态' })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'completed', 'failed'])
  status?: string

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

// 回传交易哈希请求。
export class PaymentTxDto {
  @ApiProperty({ description: '链上交易哈希' })
  @IsString()
  @IsNotEmpty()
  tx_hash: string
}
