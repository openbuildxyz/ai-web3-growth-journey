import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { $Enums } from 'generated/prisma/client'

// 获取登录挑战（nonce / message）请求。
export class AuthChallengeRequestDto {
  @ApiProperty({ description: '钱包地址，用于生成挑战信息' })
  @IsString()
  @IsNotEmpty()
  address: string
}

// 钱包签名登录请求。
export class AuthLoginRequestDto {
  @ApiProperty({ description: '钱包地址' })
  @IsString()
  @IsNotEmpty()
  address: string

  @ApiProperty({ description: '对挑战 message 的签名' })
  @IsString()
  @IsNotEmpty()
  signature: string

  @ApiProperty({ description: '与挑战一致的 nonce' })
  @IsString()
  @IsNotEmpty()
  nonce: string

  @ApiPropertyOptional({
    description: '登录角色',
    enum: ['buyer', 'seller', 'dao', 'admin'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['buyer', 'seller', 'dao', 'admin'])
  role: $Enums.user_role
}

// 获取挑战响应。
export class AuthChallengeResponseDto {
  @ApiProperty({ description: '随机生成的 nonce' })
  nonce: string

  @ApiProperty({ description: '待签名的消息' })
  message: string
}

// 登录响应。
export class AuthLoginResponseDto {
  @ApiProperty({ description: '访问令牌' })
  accessToken: string
}
