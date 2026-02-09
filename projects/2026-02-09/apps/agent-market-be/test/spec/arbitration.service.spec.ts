import { Test, type TestingModule } from '@nestjs/testing'
import { PrismaService } from '../../src/Database/prisma.service'
import { ArbitrationService } from '../../src/Modules/Arbitration/arbitration.service'
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import { randomUUID } from 'crypto'

describe('ArbitrationService', () => {
  let service: ArbitrationService
  let prisma: PrismaService

  const mockPrismaService = {
    tasks: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    agents: {
      findUnique: jest.fn(),
    },
    task_events: {
      create: jest.fn(),
    },
    arbitrations: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
    arbitration_votes: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest
      .fn()
      .mockImplementation((callback) => callback(mockPrismaService)),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArbitrationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    service = module.get<ArbitrationService>(ArbitrationService)
    prisma = module.get<PrismaService>(PrismaService)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('submitDispute', () => {
    const taskId = randomUUID()
    const user = { userId: randomUUID(), role: 'buyer' }
    const dto = { tx_hash: '0x123' }
    const task = {
      id: taskId,
      buyer_id: user.userId,
      agent_id: null,
      status: 'pending_review',
    }

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue(null)
      await expect(service.submitDispute(taskId, user, dto)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw ForbiddenException if user is not buyer or agent owner', async () => {
      const otherUser = { userId: randomUUID(), role: 'buyer' }
      mockPrismaService.tasks.findUnique.mockResolvedValue(task)
      await expect(
        service.submitDispute(taskId, otherUser, dto),
      ).rejects.toThrow(ForbiddenException)
    })

    it('should throw BadRequestException if task status is not pending_review', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue({
        ...task,
        status: 'completed',
      })
      await expect(service.submitDispute(taskId, user, dto)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should submit a dispute successfully for agent owner', async () => {
      const agentOwnerId = randomUUID()
      const agentId = randomUUID()
      const taskWithAgent = {
        ...task,
        buyer_id: randomUUID(),
        agent_id: agentId,
      }
      const agent = { id: agentId, user_id: agentOwnerId }
      const agentOwnerUser = { userId: agentOwnerId, role: 'seller' }

      mockPrismaService.tasks.findUnique.mockResolvedValue(taskWithAgent)
      mockPrismaService.agents.findUnique.mockResolvedValue(agent)

      const result = await service.submitDispute(taskId, agentOwnerUser, dto)
      expect(result).toEqual({ ok: true })
    })

    it('should submit a dispute successfully', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue(task)
      const result = await service.submitDispute(taskId, user, dto)
      expect(mockPrismaService.$transaction).toHaveBeenCalled()
      expect(mockPrismaService.tasks.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: { status: 'disputed' },
      })
      expect(mockPrismaService.task_events.create).toHaveBeenCalled()
      expect(result).toEqual({ ok: true })
    })
  })

  describe('listArbitrations', () => {
    const user = { userId: randomUUID(), role: 'dao' }
    const query = { page: 1, limit: 10 }

    it('should throw ForbiddenException if user is not a DAO member', async () => {
      const notDaoUser = { userId: randomUUID(), role: 'buyer' }
      await expect(service.listArbitrations(notDaoUser, query)).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('should list arbitrations successfully with default pagination', async () => {
      mockPrismaService.arbitrations.findMany.mockResolvedValue([])
      mockPrismaService.arbitrations.count.mockResolvedValue(0)

      const result = await service.listArbitrations(user, {})
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
    })

    it('should handle pagination edge cases', async () => {
      mockPrismaService.arbitrations.findMany.mockResolvedValue([])
      mockPrismaService.arbitrations.count.mockResolvedValue(0)

      const result1 = await service.listArbitrations(user, {
        page: 0,
        limit: -10,
      })
      expect(result1.page).toBe(1)
      expect(result1.limit).toBe(1)

      const result2 = await service.listArbitrations(user, {
        page: 1,
        limit: 200,
      })
      expect(result2.limit).toBe(100)
    })

    it('should list arbitrations successfully', async () => {
      mockPrismaService.arbitrations.findMany.mockResolvedValue([])
      mockPrismaService.arbitrations.count.mockResolvedValue(0)

      const result = await service.listArbitrations(user, query)
      expect(result).toEqual({ items: [], page: 1, limit: 10, total: 0 })
      expect(mockPrismaService.arbitrations.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { opened_at: 'desc' },
      })
    })

    it('should list arbitrations with status filter', async () => {
      const queryWithStatus = { ...query, status: 'voting' as any }
      mockPrismaService.arbitrations.findMany.mockResolvedValue([])
      mockPrismaService.arbitrations.count.mockResolvedValue(0)

      await service.listArbitrations(user, queryWithStatus)
      expect(mockPrismaService.arbitrations.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'voting' },
        }),
      )
    })
  })

  describe('getArbitrationDetail', () => {
    const arbitrationId = randomUUID()
    const arbitration = { id: arbitrationId }

    it('should throw NotFoundException if arbitration not found', async () => {
      mockPrismaService.arbitrations.findUnique.mockResolvedValue(null)
      await expect(service.getArbitrationDetail(arbitrationId)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should get arbitration detail successfully', async () => {
      mockPrismaService.arbitrations.findUnique.mockResolvedValue(arbitration)
      mockPrismaService.arbitration_votes.findMany.mockResolvedValue([])

      const result = await service.getArbitrationDetail(arbitrationId)
      expect(result).toEqual({ arbitration, votes: [] })
    })
  })

  describe('vote', () => {
    const arbitrationId = randomUUID()
    const user = { userId: randomUUID(), role: 'dao' }
    const dto = { tx_hash: '0x456', support: 'buyer' as any }
    const arbitration = { id: arbitrationId }

    it('should throw ForbiddenException if user is not a DAO member', async () => {
      const notDaoUser = { userId: randomUUID(), role: 'buyer' }
      await expect(
        service.vote(arbitrationId, notDaoUser, dto),
      ).rejects.toThrow(ForbiddenException)
    })

    it('should throw NotFoundException if arbitration not found', async () => {
      mockPrismaService.arbitrations.findUnique.mockResolvedValue(null)
      await expect(service.vote(arbitrationId, user, dto)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw BadRequestException if user has already voted', async () => {
      mockPrismaService.arbitrations.findUnique.mockResolvedValue(arbitration)
      mockPrismaService.arbitration_votes.findFirst.mockResolvedValue({
        id: randomUUID(),
      })
      await expect(service.vote(arbitrationId, user, dto)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should create a vote successfully', async () => {
      mockPrismaService.arbitrations.findUnique.mockResolvedValue(arbitration)
      mockPrismaService.arbitration_votes.findFirst.mockResolvedValue(null)
      mockPrismaService.arbitration_votes.create.mockResolvedValue({} as any)
      await service.vote(arbitrationId, user, dto)
      expect(mockPrismaService.arbitration_votes.create).toHaveBeenCalled()
    })
  })
})
