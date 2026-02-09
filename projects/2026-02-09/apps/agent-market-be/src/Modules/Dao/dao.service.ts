import { BadRequestException, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { $Enums } from '../../../generated/prisma/client'
import { PrismaService } from '../../Database/prisma.service'

// 业务模块：DAO 质押服务。
@Injectable()
export class DaoService {
  constructor(private readonly prismaService: PrismaService) {}

  async submitStakeTx(userId: string, txHash: string) {
    // 实现步骤：
    // 1. 校验交易哈希唯一性。
    // 2. 写入 pending 的支付记录，等待链上事件同步。
    const existing = await this.prismaService.payments.findFirst({
      where: { tx_hash: txHash },
    })
    if (existing) {
      throw new BadRequestException('交易哈希已存在')
    }

    return this.prismaService.payments.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        type: $Enums.payment_type.deposit,
        amount: 0,
        token_symbol: 'USDT',
        status: $Enums.payment_status.pending,
        tx_hash: txHash,
        description: 'dao_stake',
        created_at: new Date(),
      },
    })
  }

  async getMemberMe(userId: string) {
    // 实现步骤：
    // 1. 查询 DAO 成员记录。
    // 2. 无记录则返回空。
    return this.prismaService.dao_members.findUnique({
      where: { user_id: userId },
    })
  }

  async countMembers() {
    // 实现步骤：
    // 1. 统计 DAO 成员数量。
    // 2. 返回数量。
    const total = await this.prismaService.dao_members.count()
    return { total }
  }
}
