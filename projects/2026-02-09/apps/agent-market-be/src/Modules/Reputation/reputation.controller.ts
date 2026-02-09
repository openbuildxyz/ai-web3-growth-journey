import { Controller, Get, Param, Query } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CurrentUser } from '../../Common/decorators/current-user.decorator'
import type { JwtPayload } from '../Auth/jwt.strategy'
import { ReputationLogsQueryDto } from './dto/reputation.dto'
import { ReputationService } from './reputation.service'

// 业务模块：声誉接口。
@ApiTags('reputation')
@ApiBearerAuth()
@Controller()
export class ReputationController {
  constructor(private readonly reputationService: ReputationService) {}

  @Get('users/:id/reputation')
  @ApiOperation({ summary: '查询用户声誉' })
  @ApiResponse({ status: 200 })
  getUserReputation(@Param('id') userId: string) {
    // 实现步骤：
    // 1. 查询用户声誉分与汇总。
    // 2. 返回结果。
    return this.reputationService.getUserReputation(userId)
  }

  @Get('reputation/logs')
  @ApiOperation({ summary: '查询声誉变更日志' })
  @ApiResponse({ status: 200 })
  listLogs(
    @CurrentUser() user: JwtPayload,
    @Query() query: ReputationLogsQueryDto,
  ) {
    // 实现步骤：
    // 1. 读取分页参数。
    // 2. 查询当前用户日志。
    const page = query.page ?? 1
    const limit = query.limit ?? 20
    return this.reputationService.listLogs(user.userId, page, limit)
  }
}
