import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CurrentUser } from '../../Common/decorators/current-user.decorator'
import type { JwtPayload } from '../Auth/jwt.strategy'
import { ArbitrationService } from './arbitration.service'
import {
  DisputeTxDto,
  ListArbitrationsQueryDto,
  VoteDto,
} from './dto/arbitration.dto'

// 业务模块：仲裁接口。
@ApiTags('arbitrations')
@ApiBearerAuth()
@Controller()
export class ArbitrationController {
  constructor(private readonly arbitrationService: ArbitrationService) {}

  @Post('tasks/:id/dispute')
  @ApiOperation({ summary: '发起争议' })
  @ApiBody({ type: DisputeTxDto })
  @ApiResponse({ status: 201 })
  dispute(
    @Param('id') taskId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: DisputeTxDto,
  ) {
    // 实现步骤：
    // 1. 校验权限与任务状态。
    // 2. 写入争议记录。
    return this.arbitrationService.submitDispute(taskId, user, dto)
  }

  @Get('arbitrations')
  @ApiOperation({ summary: '查询仲裁列表' })
  @ApiResponse({ status: 200 })
  list(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListArbitrationsQueryDto,
  ) {
    // 实现步骤：
    // 1. 校验 DAO 角色。
    // 2. 返回列表。
    return this.arbitrationService.listArbitrations(user, query)
  }

  @Get('arbitrations/:id')
  @ApiOperation({ summary: '查询仲裁详情' })
  @ApiResponse({ status: 200 })
  detail(@Param('id') id: string) {
    // 实现步骤：
    // 1. 读取仲裁 ID。
    // 2. 返回详情。
    return this.arbitrationService.getArbitrationDetail(id)
  }

  @Post('arbitrations/:id/vote')
  @ApiOperation({ summary: '提交仲裁投票' })
  @ApiBody({ type: VoteDto })
  @ApiResponse({ status: 201 })
  vote(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: VoteDto,
  ) {
    // 实现步骤：
    // 1. 校验 DAO 角色。
    // 2. 记录投票。
    return this.arbitrationService.vote(id, user, dto)
  }
}
