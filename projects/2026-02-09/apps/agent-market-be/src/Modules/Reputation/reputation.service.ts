import { Injectable } from '@nestjs/common'
import { Prisma } from '../../../generated/prisma/client'
import { randomUUID } from 'crypto'
import { PrismaService } from '../../Database/prisma.service'

type ReviewPayload = {
  agentId: string
  reviewerId: string
  taskId: string
  rating: number
}

// 业务模块：声誉更新服务。
@Injectable()
export class ReputationService {
  constructor(private readonly prismaService: PrismaService) {}

  async handleTaskCompletionReview(payload: ReviewPayload) {
    // 实现步骤：
    // 1. 记录声誉变更日志（Agent 用户）。
    // 2. 重新计算 Agent 评分与完成任务数。
    // 3. 更新用户声誉分。
    const agent = await this.prismaService.agents.findUnique({
      where: { id: payload.agentId },
    })
    if (!agent) {
      return
    }

    await this.prismaService.reputation_logs.create({
      data: {
        id: randomUUID(),
        user_id: agent.user_id,
        source: 'task_completion',
        delta: new Prisma.Decimal(payload.rating),
        reason: 'task_review',
        created_at: new Date(),
      },
    })

    const agg = await this.prismaService.reviews.aggregate({
      where: { agent_id: payload.agentId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    const rating = agg._avg.rating ?? 0
    const completedTasks = agg._count.rating ?? 0

    await this.prismaService.agents.update({
      where: { id: payload.agentId },
      data: {
        rating: new Prisma.Decimal(rating),
        completed_tasks: completedTasks,
      },
    })

    const logSum = await this.prismaService.reputation_logs.aggregate({
      where: { user_id: agent.user_id },
      _sum: { delta: true },
    })

    const score = logSum._sum.delta ?? new Prisma.Decimal(0)
    await this.prismaService.users.update({
      where: { id: agent.user_id },
      data: { reputation_score: score },
    })
  }

  async getUserReputation(userId: string) {
    // 实现步骤：
    // 1. 查询用户声誉分。
    // 2. 汇总不同来源的声誉日志。
    const user = await this.prismaService.users.findUnique({
      where: { id: userId },
    })
    if (!user) {
      return null
    }

    const grouped = await this.prismaService.reputation_logs.groupBy({
      by: ['source'],
      where: { user_id: userId },
      _sum: { delta: true },
    })

    const summary = Object.fromEntries(
      grouped.map((item) => [item.source, item._sum.delta?.toString() ?? '0']),
    )

    return {
      user_id: userId,
      score: user.reputation_score,
      summary,
    }
  }

  async listLogs(userId: string, page = 1, limit = 20) {
    // 实现步骤：
    // 1. 分页查询声誉日志。
    // 2. 返回分页结果。
    const safePage = Number.isFinite(Number(page)) ? Number(page) : 1
    const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 20
    const skip = (safePage - 1) * safeLimit
    const [items, total] = await Promise.all([
      this.prismaService.reputation_logs.findMany({
        where: { user_id: userId },
        skip,
        take: safeLimit,
        orderBy: { created_at: 'desc' },
      }),
      this.prismaService.reputation_logs.count({ where: { user_id: userId } }),
    ])

    return { items, page: safePage, limit: safeLimit, total }
  }
}
