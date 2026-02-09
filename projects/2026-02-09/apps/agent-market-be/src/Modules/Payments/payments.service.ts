import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { $Enums } from '../../../generated/prisma/client'
import { PrismaService } from '../../Database/prisma.service'
import { ListPaymentsQueryDto } from './dto/payment.dto'

// 业务模块：资金流水服务。
@Injectable()
export class PaymentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async listPayments(userId: string, query: ListPaymentsQueryDto) {
    // 实现步骤：
    // 1. 解析分页与过滤条件。
    // 2. 查询用户流水并返回分页。
    const page = Math.max(1, query.page ?? 1)
    const limit = Math.min(100, Math.max(1, query.limit ?? 20))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { user_id: userId }
    if (query.type) {
      where.type = query.type as $Enums.payment_type
    }
    if (query.status) {
      where.status = query.status as $Enums.payment_status
    }

    const [items, total] = await Promise.all([
      this.prismaService.payments.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prismaService.payments.count({ where }),
    ])

    return { items, page, limit, total }
  }

  async recordTx(userId: string, paymentId: string, txHash: string) {
    // 实现步骤：
    // 1. 校验支付记录归属。
    // 2. 写入 tx_hash，保持 pending 状态。
    const payment = await this.prismaService.payments.findUnique({
      where: { id: paymentId },
    })
    if (!payment) {
      throw new NotFoundException('支付记录不存在')
    }
    if (payment.user_id !== userId) {
      throw new BadRequestException('无权限更新该支付记录')
    }

    return this.prismaService.payments.update({
      where: { id: paymentId },
      data: { tx_hash: txHash },
    })
  }
}
