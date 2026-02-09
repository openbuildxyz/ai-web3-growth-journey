import { Test, TestingModule } from '@nestjs/testing'
import { NotificationsService } from '../../src/Modules/Notifications/notifications.service'
import { PrismaService } from '../../src/Database/prisma.service'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { $Enums } from '../../generated/prisma/client'

describe('NotificationsService', () => {
  let service: NotificationsService
  let prisma: PrismaService

  const userId = randomUUID()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: {
            notifications: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile()

    service = module.get<NotificationsService>(NotificationsService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a notification', async () => {
      const dto = {
        userId,
        type: 'task_update' as $Enums.notification_type,
        title: 'Task Update',
        content: 'Your task has been updated.',
      }
      const notification = {
        id: randomUUID(),
        ...dto,
        read: false,
        created_at: new Date(),
      }
      jest.spyOn(prisma.notifications, 'create').mockResolvedValue(notification)

      const result = await service.create(
        dto.userId,
        dto.type,
        dto.title,
        dto.content,
      )

      expect(result).toEqual(notification)
      expect(prisma.notifications.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          user_id: dto.userId,
          type: dto.type,
          title: dto.title,
          content: dto.content,
        },
      })
    })
  })

  describe('list', () => {
    it('should return paginated notifications for a user', async () => {
      const notifications = [
        { id: randomUUID(), user_id: userId, title: 'Test' },
      ]
      jest
        .spyOn(prisma.notifications, 'findMany')
        .mockResolvedValue(notifications as any)
      jest.spyOn(prisma.notifications, 'count').mockResolvedValue(1)

      const result = await service.list(userId, { page: 1, limit: 10 })

      expect(result.items).toEqual(notifications)
      expect(result.total).toBe(1)
      expect(prisma.notifications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { user_id: userId } }),
      )
    })

    it('should filter by read status', async () => {
      const query = { page: 1, limit: 10, read: true }
      jest.spyOn(prisma.notifications, 'findMany').mockResolvedValue([])
      jest.spyOn(prisma.notifications, 'count').mockResolvedValue(0)

      await service.list(userId, query)
      expect(prisma.notifications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: userId, read: true },
        }),
      )
    })
  })

  describe('markRead', () => {
    const notificationId = randomUUID()
    const notification = { id: notificationId, user_id: userId, read: false }

    it('should mark a notification as read', async () => {
      jest
        .spyOn(prisma.notifications, 'findUnique')
        .mockResolvedValue(notification as any)
      jest
        .spyOn(prisma.notifications, 'update')
        .mockResolvedValue({ ...notification, read: true } as any)

      const result = await service.markRead(userId, notificationId)

      expect(result.read).toBe(true)
      expect(prisma.notifications.findUnique).toHaveBeenCalledWith({
        where: { id: notificationId },
      })
      expect(prisma.notifications.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: { read: true },
      })
    })

    it('should throw NotFoundException if notification not found', async () => {
      jest.spyOn(prisma.notifications, 'findUnique').mockResolvedValue(null)
      await expect(service.markRead(userId, notificationId)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw ForbiddenException if notification does not belong to user', async () => {
      jest
        .spyOn(prisma.notifications, 'findUnique')
        .mockResolvedValue({ ...notification, user_id: randomUUID() } as any)
      await expect(service.markRead(userId, notificationId)).rejects.toThrow(
        ForbiddenException,
      )
    })
  })
})
