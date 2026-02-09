import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsOptional } from 'class-validator'

// 更新当前用户资料请求。
export class UpdateUserDto {
  @ApiPropertyOptional({ description: '邮箱地址' })
  @IsEmail()
  @IsOptional()
  email?: string
}
