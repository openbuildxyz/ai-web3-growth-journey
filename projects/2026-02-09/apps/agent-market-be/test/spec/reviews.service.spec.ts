import { Test, TestingModule } from '@nestjs/testing'
import { ReviewsService } from '../../src/Modules/Reviews/reviews.service'
import { PrismaService } from '../../src/Database/prisma.service'
import { ReputationService } from '../../src/Modules/Reputation/reputation.service'
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { randomUUID } from 'crypto'

describe('ReviewsService', () => {
  let service: ReviewsService
  let prisma: PrismaService
  let reputationService: ReputationService

  const userBuyer = {
    userId: randomUUID(),
    wallet_address: '0xBuyer',
    role: 'buyer',
  }
  const userAgent = {
    userId: randomUUID(),
    wallet_address: '0xAgent',
    role: 'seller',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: PrismaService,
          useValue: {
            tasks: {
              findUnique: jest.fn(),
            },
            reviews: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: ReputationService,
          useValue: {
            handleTaskCompletionReview: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<ReviewsService>(ReviewsService)
    prisma = module.get<PrismaService>(PrismaService)
    reputationService = module.get<ReputationService>(ReputationService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createReview', () => {
    const taskId = randomUUID()
    const agentId = randomUUID()
    const dto = { rating: 5, feedback: 'Excellent work!' }
    const task = {
      id: taskId,
      buyer_id: userBuyer.userId,
      agent_id: agentId,
      status: 'completed',
    }

    it('should create a review successfully', async () => {
      jest.spyOn(prisma.tasks, 'findUnique').mockResolvedValue(task)
      jest.spyOn(prisma.reviews, 'findUnique').mockResolvedValue(null)
      jest.spyOn(prisma.reviews, 'create').mockResolvedValue({
        ...dto,
        id: randomUUID(),
        task_id: taskId,
        reviewer_id: userBuyer.userId,
        agent_id: agentId,
        created_at: new Date(),
      })

      const result = await service.createReview(taskId, userBuyer, dto)

      expect(prisma.tasks.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
      })
      expect(prisma.reviews.findUnique).toHaveBeenCalledWith({
        where: { task_id: taskId },
      })
      expect(prisma.reviews.create).toHaveBeenCalled()
      expect(reputationService.handleTaskCompletionReview).toHaveBeenCalledWith(
        {
          agentId: task.agent_id,
          reviewerId: userBuyer.userId,
          taskId,
          rating: dto.rating,
        },
      )
      expect(result).toBeDefined()
      expect(result.rating).toBe(dto.rating)
    })

    it('should throw NotFoundException if task does not exist', async () => {
      jest.spyOn(prisma.tasks, 'findUnique').mockResolvedValue(null)
      await expect(
        service.createReview(taskId, userBuyer, dto),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw ForbiddenException if user is not the buyer', async () => {
      jest
        .spyOn(prisma.tasks, 'findUnique')
        .mockResolvedValue({ ...task, buyer_id: randomUUID() })
      await expect(
        service.createReview(taskId, userBuyer, dto),
      ).rejects.toThrow(ForbiddenException)
    })

    it('should throw BadRequestException if task is not completed', async () => {
      jest
        .spyOn(prisma.tasks, 'findUnique')
        .mockResolvedValue({ ...task, status: 'in_progress' })
      await expect(
        service.createReview(taskId, userBuyer, dto),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException if review already exists', async () => {
      jest.spyOn(prisma.tasks, 'findUnique').mockResolvedValue(task)
      jest.spyOn(prisma.reviews, 'findUnique').mockResolvedValue({} as any)
      await expect(
        service.createReview(taskId, userBuyer, dto),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException if task has no agent', async () => {
      jest
        .spyOn(prisma.tasks, 'findUnique')
        .mockResolvedValue({ ...task, agent_id: null })
      await expect(
        service.createReview(taskId, userBuyer, dto),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('listAgentReviews', () => {
    const agentId = randomUUID()
    const query = { page: 1, limit: 10 }

    it('should return a paginated list of reviews', async () => {
      const reviews = [
        { id: randomUUID(), agent_id: agentId, rating: 5, feedback: 'Great!' },
      ]
      jest.spyOn(prisma.reviews, 'findMany').mockResolvedValue(reviews as any)
      jest.spyOn(prisma.reviews, 'count').mockResolvedValue(1)

      const result = await service.listAgentReviews(agentId, query)

      expect(result.items).toEqual(reviews)
      expect(result.total).toBe(1)
      expect(result.page).toBe(query.page)
      expect(result.limit).toBe(query.limit)
      expect(prisma.reviews.findMany).toHaveBeenCalledWith({
        where: { agent_id: agentId },
        skip: 0,
        take: query.limit,
        orderBy: { created_at: 'desc' },
      })
      expect(prisma.reviews.count).toHaveBeenCalledWith({
        where: { agent_id: agentId },
      })
    })
  })
})
