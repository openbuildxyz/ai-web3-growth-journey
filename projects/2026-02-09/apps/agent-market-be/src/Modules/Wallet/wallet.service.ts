import { BadRequestException, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { $Enums } from '../../../generated/prisma/client'
import { PrismaService } from '../../Database/prisma.service'
import { DepositIntentDto } from './dto/wallet.dto'

// 业务模块：钱包余额与充值意向。
@Injectable()
export class WalletService {
  constructor(private readonly prismaService: PrismaService) {}

  async createDepositIntent(userId: string, dto: DepositIntentDto) {
    // 实现步骤：
    // 1. 校验必填字段。
    // 2. 创建 pending 状态的支付记录。
    if (!dto.token_symbol || !dto.chain_id) {
      throw new BadRequestException('缺少必填字段')
    }

    return this.prismaService.payments.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        type: $Enums.payment_type.deposit,
        amount: dto.amount,
        token_symbol: dto.token_symbol,
        chain_id: dto.chain_id,
        status: $Enums.payment_status.pending,
        created_at: new Date(),
      },
    })
  }

  async getBalance(userId: string) {
    // 实现步骤：
    // 1. 查询余额记录。
    // 2. 不存在则返回 0。
    const balance = await this.prismaService.wallet_balances.findUnique({
      where: { user_id: userId },
    })
    if (!balance) {
      return { available: '0', locked: '0' }
    }
    return { available: balance.available, locked: balance.locked }
  }
}
