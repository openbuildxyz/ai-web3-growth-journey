import { Body, Controller, Get, Post } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CurrentUser } from '../../Common/decorators/current-user.decorator'
import type { JwtPayload } from '../Auth/jwt.strategy'
import { DepositIntentDto } from './dto/wallet.dto'
import { WalletService } from './wallet.service'

// 业务模块：钱包相关接口。
@ApiTags('wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('deposit/intent')
  @ApiOperation({ summary: '充值意向' })
  @ApiBody({ type: DepositIntentDto })
  @ApiResponse({ status: 201 })
  createDepositIntent(
    @CurrentUser() user: JwtPayload,
    @Body() dto: DepositIntentDto,
  ) {
    // 实现步骤：
    // 1. 读取用户信息。
    // 2. 创建充值意向记录。
    return this.walletService.createDepositIntent(user.userId, dto)
  }

  @Get('balance')
  @ApiOperation({ summary: '查询余额' })
  @ApiResponse({ status: 200 })
  getBalance(@CurrentUser() user: JwtPayload) {
    // 实现步骤：
    // 1. 读取用户信息。
    // 2. 查询余额记录。
    return this.walletService.getBalance(user.userId)
  }
}
