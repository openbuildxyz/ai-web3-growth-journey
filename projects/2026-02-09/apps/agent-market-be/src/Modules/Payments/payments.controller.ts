import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  HttpCode,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CurrentUser } from '../../Common/decorators/current-user.decorator'
import type { JwtPayload } from '../Auth/jwt.strategy'
import { ListPaymentsQueryDto, PaymentTxDto } from './dto/payment.dto'
import { PaymentsService } from './payments.service'

// 业务模块：资金流水控制器。
@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: '查询资金流水' })
  @ApiResponse({ status: 200 })
  list(@CurrentUser() user: JwtPayload, @Query() query: ListPaymentsQueryDto) {
    // 实现步骤：
    // 1. 读取用户信息与查询参数。
    // 2. 调用流水查询服务。
    return this.paymentsService.listPayments(user.userId, query)
  }

  @Post(':id/tx')
  @HttpCode(200)
  @ApiOperation({ summary: '回传支付交易哈希' })
  @ApiBody({ type: PaymentTxDto })
  @ApiResponse({ status: 200 })
  recordTx(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: PaymentTxDto,
  ) {
    // 实现步骤：
    // 1. 校验支付记录归属。
    // 2. 写入交易哈希。
    return this.paymentsService.recordTx(user.userId, id, dto.tx_hash)
  }
}
