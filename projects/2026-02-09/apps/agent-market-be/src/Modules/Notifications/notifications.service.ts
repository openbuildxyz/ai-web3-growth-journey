import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { randomUUID } from 'crypto'
import { $Enums } from '../../../generated/prisma/client'
import { PrismaService } from '../../Database/prisma.service'
import { NotificationsQueryDto } from './dto/notification.dto'

// 业务模块：通知服务。
@Injectable()
export class NotificationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    userId: string,
    type: $Enums.notification_type,
    title: string,
    content?: string,
  ) {
    // 实现步骤：
    // 1. 创建通知记录。
    // 2. 返回记录。
    return this.prismaService.notifications.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        type,
        title,
        content,
        created_at: new Date(),
      },
    })
  }

  async list(userId: string, query: NotificationsQueryDto) {
    // 实现步骤：
    // 1. 解析分页与筛选条件。
    // 2. 查询通知列表。
    const rawPage = Number(query.page)
    const rawLimit = Number(query.limit)
    const page = Math.max(1, Number.isFinite(rawPage) ? rawPage : 1)
    const limit = Math.min(
      100,
      Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 20),
    )
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { user_id: userId }
    if (query.read !== undefined) {
      if (typeof query.read === 'string') {
        where.read = query.read === 'true'
      } else {
        where.read = query.read
      }
    }

    const [items, total] = await Promise.all([
      this.prismaService.notifications.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prismaService.notifications.count({ where }),
    ])

    return { items, page, limit, total }
  }

  async markRead(userId: string, notificationId: string) {
    // 实现步骤：
    // 1. 校验通知归属。
    // 2. 标记为已读。
    const notification = await this.prismaService.notifications.findUnique({
      where: { id: notificationId },
    })
    if (!notification) {
      throw new NotFoundException('通知不存在')
    }
    if (notification.user_id !== userId) {
      throw new ForbiddenException('无权限更新该通知')
    }

    return this.prismaService.notifications.update({
      where: { id: notificationId },
      data: { read: true },
    })
  }
}
