import { Test, type TestingModule } from '@nestjs/testing'
import { PrismaService } from '../../src/Database/prisma.service'
import { TasksService } from '../../src/Modules/Tasks/tasks.service'
import { AgentInvocationService } from '../../src/Modules/AgentInvocation/agent-invocation.service'
import { NotificationsService } from '../../src/Modules/Notifications/notifications.service'
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import { randomUUID } from 'crypto'

import { EscrowService } from '../../src/Modules/Escrow/escrow.service'

describe('TasksService', () => {
  let service: TasksService
  let prisma: PrismaService
  let agentInvocationService: AgentInvocationService
  let notificationsService: NotificationsService

  const mockPrismaService = {
    tasks: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    task_events: {
      create: jest.fn(),
    },
    agents: {
      findUnique: jest.fn(),
    },
    task_deliverables: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest
      .fn()
      .mockImplementation((callback) => callback(mockPrismaService)),
  }

  const mockAgentInvocationService = {
    invokeForTask: jest.fn(),
    executeInvocation: jest.fn(),
  }

  const mockNotificationsService = {
    create: jest.fn(),
  }

  const mockEscrowService = {
    releaseEscrow: jest.fn(),
    refundEscrow: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: AgentInvocationService,
          useValue: mockAgentInvocationService,
        },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: EscrowService, useValue: mockEscrowService },
      ],
    }).compile()

    service = module.get<TasksService>(TasksService)
    prisma = module.get<PrismaService>(PrismaService)
    agentInvocationService = module.get<AgentInvocationService>(
      AgentInvocationService,
    )
    notificationsService =
      module.get<NotificationsService>(NotificationsService)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // Start with createTask
  describe('createTask', () => {
    const user = { userId: randomUUID(), role: 'buyer' }
    const dto = {
      title: 'Test Task',
      description: 'Test Description',
      budget_usd: 100,
      platform_fee: 10,
    }

    it('should throw ForbiddenException if user is not a buyer', async () => {
      const sellerUser = { userId: randomUUID(), role: 'seller' }
      await expect(service.createTask(sellerUser, dto)).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('should create a task successfully', async () => {
      mockPrismaService.tasks.create.mockResolvedValue({} as any)
      await service.createTask(user, dto)
      expect(mockPrismaService.tasks.create).toHaveBeenCalled()
      expect(mockPrismaService.task_events.create).toHaveBeenCalled()
    })
  })

  // Add tests for listTasks
  describe('listTasks', () => {
    const user = { userId: randomUUID(), role: 'buyer' }

    it('should throw BadRequestException if role is missing', async () => {
      await expect(service.listTasks(user, {})).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should list tasks for a buyer', async () => {
      mockPrismaService.tasks.findMany.mockResolvedValue([])
      mockPrismaService.tasks.count.mockResolvedValue(0)
      await service.listTasks(user, { role: 'buyer' })
      expect(mockPrismaService.tasks.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { buyer_id: user.userId },
        }),
      )
    })

    it('should return empty if seller has no agent profile', async () => {
      const sellerUser = { userId: randomUUID(), role: 'seller' }
      mockPrismaService.agents.findUnique.mockResolvedValue(null)
      const result = await service.listTasks(sellerUser, { role: 'seller' })
      expect(result.items).toEqual([])
      expect(result.total).toBe(0)
    })

    it('should handle pagination and search', async () => {
      await service.listTasks(user, {
        role: 'buyer',
        page: 2,
        limit: 5,
        q: 'search',
      })
      expect(mockPrismaService.tasks.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'search', mode: 'insensitive' } },
              { description: { contains: 'search', mode: 'insensitive' } },
            ],
          }),
        }),
      )
    })
  })

  describe('getTaskDetail', () => {
    it('should throw NotFoundException if task does not exist', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue(null)
      await expect(service.getTaskDetail('non-existent-id')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should return task details successfully', async () => {
      const task = {
        id: 'task-id',
        task_deliverables: [],
        task_events: [],
        escrows: [],
      }
      mockPrismaService.tasks.findUnique.mockResolvedValue(task)
      const result = await service.getTaskDetail('task-id')
      expect(result.task).toEqual(task)
    })
  })

  describe('acceptTask', () => {
    const user = { userId: randomUUID(), role: 'seller' }
    const taskId = randomUUID()

    it('should throw ForbiddenException if user is not a seller', async () => {
      const buyerUser = { ...user, role: 'buyer' }
      await expect(service.acceptTask(taskId, buyerUser)).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('should throw NotFoundException if agent profile not found', async () => {
      mockPrismaService.agents.findUnique.mockResolvedValue(null)
      await expect(service.acceptTask(taskId, user)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.agents.findUnique.mockResolvedValue({ id: 'agent-id' })
      mockPrismaService.tasks.findUnique.mockResolvedValue(null)
      await expect(service.acceptTask(taskId, user)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw BadRequestException if task status is not created', async () => {
      mockPrismaService.agents.findUnique.mockResolvedValue({ id: 'agent-id' })
      mockPrismaService.tasks.findUnique.mockResolvedValue({
        status: 'accepted',
      } as any)
      await expect(service.acceptTask(taskId, user)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should accept a task successfully', async () => {
      mockPrismaService.agents.findUnique.mockResolvedValue({ id: 'agent-id' })
      mockPrismaService.tasks.findUnique.mockResolvedValue({
        status: 'created',
        buyer_id: 'buyer-id',
        title: 'title',
      } as any)
      mockPrismaService.tasks.update.mockResolvedValue({
        buyer_id: 'buyer-id',
        title: 'title',
      } as any)

      process.env.NODE_ENV = 'test'
      await service.acceptTask(taskId, user)

      expect(mockPrismaService.tasks.update).toHaveBeenCalled()
      expect(mockNotificationsService.create).toHaveBeenCalled()
      expect(mockAgentInvocationService.invokeForTask).not.toHaveBeenCalled()
    })
  })

  describe('deliverTask', () => {
    const user = { userId: randomUUID(), role: 'seller' }
    const taskId = randomUUID()
    const dto = {
      title: 'delivery',
      content_url: 'http://a.com',
      notes: 'notes',
    }
    const agent = { id: 'agent-id', user_id: user.userId }
    const task = {
      id: taskId,
      agent_id: agent.id,
      status: 'accepted',
      buyer_id: 'buyer',
    }

    it('should throw ForbiddenException if user is not an agent', async () => {
      mockPrismaService.agents.findUnique.mockResolvedValue(null)
      await expect(service.deliverTask(taskId, user, dto)).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.agents.findUnique.mockResolvedValue(agent)
      mockPrismaService.tasks.findUnique.mockResolvedValue(null)
      await expect(service.deliverTask(taskId, user, dto)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw ForbiddenException if user is not the assigned agent', async () => {
      mockPrismaService.agents.findUnique.mockResolvedValue(agent)
      mockPrismaService.tasks.findUnique.mockResolvedValue({
        ...task,
        agent_id: 'another-agent-id',
      })
      await expect(service.deliverTask(taskId, user, dto)).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('should deliver a task successfully', async () => {
      mockPrismaService.agents.findUnique.mockResolvedValue(agent)
      mockPrismaService.tasks.findUnique.mockResolvedValue(task as any)
      mockPrismaService.task_deliverables.findFirst.mockResolvedValue(null)

      await service.deliverTask(taskId, user, dto)

      expect(mockPrismaService.task_deliverables.create).toHaveBeenCalled()
      expect(mockPrismaService.tasks.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'pending_review', delivered_at: expect.any(Date) },
        }),
      )
      expect(mockNotificationsService.create).toHaveBeenCalled()
    })
  })

  describe('completeTask', () => {
    const user = { userId: randomUUID(), role: 'buyer' }
    const taskId = randomUUID()
    const task = {
      id: taskId,
      buyer_id: user.userId,
      status: 'pending_review',
      agent_id: 'agent-id',
    }

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue(null)
      await expect(service.completeTask(taskId, user)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw ForbiddenException if user is not the buyer', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue({
        ...task,
        buyer_id: 'another-buyer',
      })
      await expect(service.completeTask(taskId, user)).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('should complete a task successfully', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue(task as any)
      mockPrismaService.agents.findUnique.mockResolvedValue({
        user_id: 'agent-user-id',
      })
      mockPrismaService.tasks.update.mockResolvedValue(task as any)
      await service.completeTask(taskId, user)
      expect(mockPrismaService.tasks.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'completed' } }),
      )
      expect(mockNotificationsService.create).toHaveBeenCalled()
    })
  })

  describe('executeTask', () => {
    const user = { userId: randomUUID(), role: 'buyer' }
    const taskId = randomUUID()
    const payload = { input: 'test' }
    const task = {
      id: taskId,
      buyer_id: user.userId,
      agent_id: 'agent-id',
      status: 'pending_review',
      escrows: { status: 'locked' },
      users: { wallet_address: '0xwallet' },
    }

    it('should throw NotFoundException for missing task', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue(null)
      await expect(service.executeTask(taskId, user, payload)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw ForbiddenException for wrong user', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue({
        ...task,
        buyer_id: 'wrong-user',
      })
      await expect(service.executeTask(taskId, user, payload)).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('should throw BadRequestException for wrong task status', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue({
        ...task,
        status: 'completed',
      })
      await expect(service.executeTask(taskId, user, payload)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should throw BadRequestException for wrong escrow status', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue({
        ...task,
        escrows: { status: 'released' },
      })
      await expect(service.executeTask(taskId, user, payload)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should throw BadRequestException if no agent is bound', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue({
        ...task,
        agent_id: null,
      })
      await expect(service.executeTask(taskId, user, payload)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should execute successfully', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue(task as any)
      mockAgentInvocationService.executeInvocation.mockResolvedValue('output')
      const result = await service.executeTask(taskId, user, payload)
      expect(result).toEqual({ output: 'output' })
    })
  })

  describe('cancelTask', () => {
    const user = { userId: randomUUID(), role: 'buyer' }
    const taskId = randomUUID()
    const task = { id: taskId, buyer_id: user.userId, status: 'created' }

    it('should throw NotFoundException for missing task', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue(null)
      await expect(service.cancelTask(taskId, user)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should cancel a task successfully', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue(task as any)
      await service.cancelTask(taskId, user)
      expect(mockPrismaService.tasks.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'cancelled' } }),
      )
    })
  })
})
