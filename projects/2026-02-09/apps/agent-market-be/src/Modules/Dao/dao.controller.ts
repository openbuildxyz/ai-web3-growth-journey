import { Body, Controller, Get, Post } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CurrentUser } from '../../Common/decorators/current-user.decorator'
import { Public } from '../../Common/decorators/public.decorator'
import type { JwtPayload } from '../Auth/jwt.strategy'
import { DaoStakeTxDto } from './dto/dao.dto'
import { DaoService } from './dao.service'

// 业务模块：DAO 接口。
@ApiTags('dao')
@ApiBearerAuth()
@Controller('dao')
export class DaoController {
  constructor(private readonly daoService: DaoService) {}

  @Post('stake/tx')
  @ApiOperation({ summary: '提交质押交易哈希' })
  @ApiBody({ type: DaoStakeTxDto })
  @ApiResponse({ status: 201 })
  submitStakeTx(@CurrentUser() user: JwtPayload, @Body() dto: DaoStakeTxDto) {
    // 实现步骤：
    // 1. 读取用户信息。
    // 2. 记录质押交易。
    return this.daoService.submitStakeTx(user.userId, dto.tx_hash)
  }

  @Get('members/me')
  @ApiOperation({ summary: '查询当前 DAO 身份' })
  @ApiResponse({ status: 200 })
  getMemberMe(@CurrentUser() user: JwtPayload) {
    // 实现步骤：
    // 1. 查询当前用户的 DAO 记录。
    return this.daoService.getMemberMe(user.userId)
  }

  @Get('members')
  @Public()
  @ApiOperation({ summary: '统计 DAO 成员数量' })
  @ApiResponse({ status: 200 })
  countMembers() {
    // 实现步骤：
    // 1. 统计 DAO 成员数量。
    return this.daoService.countMembers()
  }
}
