import { Test, TestingModule } from '@nestjs/testing'
import { ReputationService } from '../../src/Modules/Reputation/reputation.service'
import { PrismaService } from '../../src/Database/prisma.service'
import { Prisma } from '../../generated/prisma/client'
import { randomUUID } from 'crypto'

describe('ReputationService', () => {
  let service: ReputationService
  let prisma: PrismaService

  const agentId = randomUUID()
  const userId = randomUUID()
  const agent = { id: agentId, user_id: userId }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReputationService,
        {
          provide: PrismaService,
          useValue: {
            agents: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            reviews: {
              aggregate: jest.fn(),
            },
            reputation_logs: {
              create: jest.fn(),
              aggregate: jest.fn(),
              groupBy: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
            users: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile()

    service = module.get<ReputationService>(ReputationService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('handleTaskCompletionReview', () => {
    const payload = {
      agentId,
      reviewerId: randomUUID(),
      taskId: randomUUID(),
      rating: 5,
    }

    it('should update agent reputation and logs on review', async () => {
      jest.spyOn(prisma.agents, 'findUnique').mockResolvedValue(agent as any)
      jest.spyOn(prisma.reputation_logs, 'create').mockResolvedValue({} as any)
      jest.spyOn(prisma.reviews, 'aggregate').mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: { rating: 10 },
      } as any)
      jest.spyOn(prisma.agents, 'update').mockResolvedValue({} as any)
      jest.spyOn(prisma.reputation_logs, 'aggregate').mockResolvedValue({
        _sum: { delta: new Prisma.Decimal(50) },
      } as any)
      jest.spyOn(prisma.users, 'update').mockResolvedValue({} as any)

      await service.handleTaskCompletionReview(payload)

      expect(prisma.reputation_logs.create).toHaveBeenCalled()
      expect(prisma.agents.update).toHaveBeenCalledWith({
        where: { id: agentId },
        data: {
          rating: new Prisma.Decimal(4.5),
          completed_tasks: 10,
        },
      })
      expect(prisma.users.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { reputation_score: new Prisma.Decimal(50) },
      })
    })

    it('should not throw if agent is not found', async () => {
      jest.spyOn(prisma.agents, 'findUnique').mockResolvedValue(null)
      await expect(
        service.handleTaskCompletionReview(payload),
      ).resolves.not.toThrow()
    })
  })

  describe('getUserReputation', () => {
    it('should return user reputation data', async () => {
      const user = { id: userId, reputation_score: new Prisma.Decimal(10) }
      const logs = [
        { source: 'task_completion', _sum: { delta: new Prisma.Decimal(10) } },
      ]
      jest.spyOn(prisma.users, 'findUnique').mockResolvedValue(user as any)
      jest
        .spyOn(prisma.reputation_logs, 'groupBy')
        .mockResolvedValue(logs as any)

      const result = await service.getUserReputation(userId)

      expect(result).toEqual({
        user_id: userId,
        score: new Prisma.Decimal(10),
        summary: {
          task_completion: '10',
        },
      })
    })

    it('should return null if user not found', async () => {
      jest.spyOn(prisma.users, 'findUnique').mockResolvedValue(null)
      const result = await service.getUserReputation(userId)
      expect(result).toBeNull()
    })
  })

  describe('listLogs', () => {
    it('should return paginated reputation logs', async () => {
      const logs = [{ id: randomUUID(), user_id: userId, delta: 5 }]
      jest
        .spyOn(prisma.reputation_logs, 'findMany')
        .mockResolvedValue(logs as any)
      jest.spyOn(prisma.reputation_logs, 'count').mockResolvedValue(1)

      const result = await service.listLogs(userId, 1, 10)

      expect(result.items).toEqual(logs)
      expect(result.total).toBe(1)
    })
  })
})
