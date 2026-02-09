import { ApiProperty } from '@nestjs/swagger'

// DTO: Agent 密钥生成响应
export class AgentSecretResponseDto {
  @ApiProperty({ description: '平台 Key ID' })
  key_id!: string

  @ApiProperty({ description: '仅返回一次的 Secret' })
  secret!: string
}
