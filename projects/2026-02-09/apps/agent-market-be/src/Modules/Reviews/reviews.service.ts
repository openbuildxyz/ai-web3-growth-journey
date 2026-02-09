import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { randomUUID } from 'crypto'
import { PrismaService } from '../../Database/prisma.service'
import type { JwtPayload } from '../Auth/jwt.strategy'
import { ReputationService } from '../Reputation/reputation.service'
import { CreateReviewDto, ListAgentReviewsQueryDto } from './dto/review.dto'

// 业务模块：评价服务。
@Injectable()
export class ReviewsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reputationService: ReputationService,
  ) {}

  async createReview(taskId: string, user: JwtPayload, dto: CreateReviewDto) {
    // 实现步骤：
    // 1. 校验任务状态与买家权限。
    // 2. 创建评价记录。
    // 3. 触发声誉更新。
    const task = await this.prismaService.tasks.findUnique({
      where: { id: taskId },
    })
    if (!task) {
      throw new NotFoundException('任务不存在')
    }
    if (task.buyer_id !== user.userId) {
      throw new ForbiddenException('无权限评价该任务')
    }
    if (task.status !== 'completed') {
      throw new BadRequestException('当前任务状态无法评价')
    }

    const existing = await this.prismaService.reviews.findUnique({
      where: { task_id: taskId },
    })
    if (existing) {
      throw new BadRequestException('该任务已评价')
    }
    if (!task.agent_id) {
      throw new BadRequestException('任务未绑定 Agent')
    }

    const review = await this.prismaService.reviews.create({
      data: {
        id: randomUUID(),
        task_id: taskId,
        reviewer_id: user.userId,
        agent_id: task.agent_id,
        rating: dto.rating,
        feedback: dto.feedback,
        created_at: new Date(),
      },
    })

    await this.reputationService.handleTaskCompletionReview({
      agentId: task.agent_id,
      reviewerId: user.userId,
      taskId,
      rating: dto.rating,
    })

    return review
  }

  async listAgentReviews(agentId: string, query: ListAgentReviewsQueryDto) {
    // 实现步骤：
    // 1. 解析分页参数。
    // 2. 查询评价列表。
    const page = Math.max(1, query.page ?? 1)
    const limit = Math.min(100, Math.max(1, query.limit ?? 20))
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      this.prismaService.reviews.findMany({
        where: { agent_id: agentId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prismaService.reviews.count({ where: { agent_id: agentId } }),
    ])

    return { items, page, limit, total }
  }
}
