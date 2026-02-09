import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'

// Agent 列表查询参数。
export class ListAgentsQueryDto {
  @ApiPropertyOptional({
    description: '查询范围：market=已上线，mine=我的Agent',
  })
  @IsOptional()
  @IsString()
  @IsIn(['market', 'mine'])
  view?: string

  @ApiPropertyOptional({ description: '关键词（名称/简介）' })
  @IsOptional()
  @IsString()
  q?: string

  @ApiPropertyOptional({ description: '逗号分隔的标签' })
  @IsOptional()
  @IsString()
  tags?: string

  @ApiPropertyOptional({ description: '最低评分' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_rating?: number

  @ApiPropertyOptional({ description: '是否仅展示在线' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_online?: boolean

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

// 创建/完善 Agent 档案请求。
export class CreateAgentDto {
  @ApiPropertyOptional({ description: '鉴权类型' })
  @IsOptional()
  @IsString()
  @IsIn(['platform_hmac', 'platform_jwt'])
  auth_type?: string
  @ApiProperty({ description: '鉴权密钥' })
  @IsString()
  @IsNotEmpty()
  auth_secret_hash: string

  @ApiProperty({ description: 'Agent 基础 URL' })
  @IsString()
  @IsNotEmpty()
  base_url: string

  @ApiProperty({ description: '调用路径' })
  @IsString()
  @IsNotEmpty()
  invoke_path: string

  @ApiProperty({ description: '展示名' })
  @IsString()
  @IsNotEmpty()
  display_name: string

  @ApiPropertyOptional({ description: '头像链接' })
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiProperty({ description: '简介' })
  @IsString()
  @IsNotEmpty()
  bio: string

  @ApiPropertyOptional({ description: '单任务报价' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price_per_task?: number

  @ApiPropertyOptional({ description: '响应时间说明' })
  @IsOptional()
  @IsString()
  response_time?: string

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]
}

// 更新 Agent 档案请求。
export class UpdateAgentDto {
  @ApiPropertyOptional({ description: '鉴权类型' })
  @IsOptional()
  @IsString()
  @IsIn(['platform_hmac', 'platform_jwt'])
  auth_type?: string
  @ApiPropertyOptional({ description: '鉴权密钥' })
  @IsOptional()
  @IsString()
  auth_secret_hash?: string

  @ApiPropertyOptional({ description: 'Agent 基础 URL' })
  @IsOptional()
  @IsString()
  base_url?: string

  @ApiPropertyOptional({ description: '调用路径' })
  @IsOptional()
  @IsString()
  invoke_path?: string

  @ApiPropertyOptional({ description: '展示名' })
  @IsOptional()
  @IsString()
  display_name?: string

  @ApiPropertyOptional({ description: '头像链接' })
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiPropertyOptional({ description: '简介' })
  @IsOptional()
  @IsString()
  bio?: string

  @ApiPropertyOptional({ description: '单任务报价' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price_per_task?: number

  @ApiPropertyOptional({ description: '响应时间说明' })
  @IsOptional()
  @IsString()
  response_time?: string

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional({ description: '在线状态' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_online?: boolean
}
