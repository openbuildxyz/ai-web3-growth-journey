import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

// 充值意向请求。
export class DepositIntentDto {
  @ApiProperty({ description: '购买代币数量' })
  @Type(() => Number)
  @IsNumber()
  amount: number

  @ApiProperty({ description: 'Token 符号' })
  @IsString()
  @IsNotEmpty()
  token_symbol: string

  @ApiProperty({ description: '链 ID' })
  @Type(() => Number)
  @IsNumber()
  chain_id: number
}
