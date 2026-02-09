import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

// DAO 质押交易上报请求。
export class DaoStakeTxDto {
  @ApiProperty({ description: '质押/解押交易哈希' })
  @IsString()
  @IsNotEmpty()
  tx_hash: string
}
