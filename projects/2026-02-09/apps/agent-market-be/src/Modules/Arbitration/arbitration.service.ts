import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { randomUUID } from 'crypto'
import { $Enums } from '../../../generated/prisma/client'
import { PrismaService } from '../../Database/prisma.service'
import type { JwtPayload } from '../Auth/jwt.strategy'
import {
  DisputeTxDto,
  ListArbitrationsQueryDto,
  VoteDto,
} from './dto/arbitration.dto'

// 业务模块：仲裁服务。
@Injectable()
export class ArbitrationService {
  constructor(private readonly prismaService: PrismaService) {}

  async submitDispute(taskId: string, user: JwtPayload, dto: DisputeTxDto) {
    // 实现步骤：
    // 1. 校验任务存在与用户权限。
    // 2. 写入争议事件，并更新任务状态为 disputed。
    const task = await this.prismaService.tasks.findUnique({
      where: { id: taskId },
    })
    if (!task) {
      throw new NotFoundException('任务不存在')
    }

    const agent = task.agent_id
      ? await this.prismaService.agents.findUnique({
          where: { id: task.agent_id },
        })
      : null
    const isBuyer = task.buyer_id === user.userId
    const isAgentOwner = agent?.user_id === user.userId
    if (!isBuyer && !isAgentOwner) {
      throw new ForbiddenException('无权限发起争议')
    }
    if (task.status !== 'pending_review') {
      throw new BadRequestException('当前任务状态无法发起争议')
    }

    await this.prismaService.$transaction(async (tx) => {
      const now = new Date()
      await tx.tasks.update({
        where: { id: taskId },
        data: { status: 'disputed' },
      })
      await tx.task_events.create({
        data: {
          id: randomUUID(),
          task_id: taskId,
          type: 'dispute_opened',
          actor_id: user.userId,
          data: { tx_hash: dto.tx_hash },
          created_at: now,
        },
      })
    })

    return { ok: true }
  }

  async listArbitrations(user: JwtPayload, query: ListArbitrationsQueryDto) {
    // 实现步骤：
    // 1. 校验 DAO 成员资格。
    // 2. 按状态分页查询。
    const daoMember = await this.prismaService.dao_members.findUnique({
      where: { user_id: user.userId },
    })
    if (!daoMember) {
      throw new ForbiddenException('需要 DAO 成员资格')
    }

    const page = Math.max(1, query.page ?? 1)
    const limit = Math.min(100, Math.max(1, query.limit ?? 20))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (query.status) {
      where.status = query.status as $Enums.arbitration_status
    }

    const [items, total] = await Promise.all([
      this.prismaService.arbitrations.findMany({
        where,
        skip,
        take: limit,
        orderBy: { opened_at: 'desc' },
      }),
      this.prismaService.arbitrations.count({ where }),
    ])

    return { items, page, limit, total }
  }

  async getArbitrationDetail(id: string) {
    // 实现步骤：
    // 1. 查询仲裁记录。
    // 2. 聚合投票信息。
    const arbitration = await this.prismaService.arbitrations.findUnique({
      where: { id },
    })
    if (!arbitration) {
      throw new NotFoundException('仲裁记录不存在')
    }

    const votes = await this.prismaService.arbitration_votes.findMany({
      where: { arbitration_id: id },
      orderBy: { created_at: 'desc' },
    })

    return { arbitration, votes }
  }

  async vote(arbitrationId: string, user: JwtPayload, dto: VoteDto) {
    // 实现步骤：
    // 1. 校验 DAO 成员资格与仲裁存在。
    // 2. 记录投票哈希与支持方。
    const daoMember = await this.prismaService.dao_members.findUnique({
      where: { user_id: user.userId },
    })
    if (!daoMember) {
      throw new ForbiddenException('需要 DAO 成员资格')
    }

    const arbitration = await this.prismaService.arbitrations.findUnique({
      where: { id: arbitrationId },
    })
    if (!arbitration) {
      throw new NotFoundException('仲裁记录不存在')
    }

    const existing = await this.prismaService.arbitration_votes.findFirst({
      where: { arbitration_id: arbitrationId, voter_id: user.userId },
    })
    if (existing) {
      throw new BadRequestException('已投票')
    }

    return this.prismaService.arbitration_votes.create({
      data: {
        id: randomUUID(),
        arbitration_id: arbitrationId,
        voter_id: user.userId,
        support: dto.support as $Enums.vote_support,
        weight: '1',
        tx_hash: dto.tx_hash,
        created_at: new Date(),
      },
    })
  }
}
