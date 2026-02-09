import { Test, type TestingModule } from '@nestjs/testing'
import { PrismaService } from '../../src/Database/prisma.service'
import { AgentsService } from '../../src/Modules/Agents/agents.service'
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import { randomUUID } from 'crypto'
import { ConfigService } from '@nestjs/config'

describe('AgentsService', () => {
  let service: AgentsService
  let prisma: PrismaService

  const mockPrismaService = {
    agents: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    agent_tag_dict: {
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
    agent_tags: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    tasks: {
      findUnique: jest.fn(),
    },
    $transaction: jest
      .fn()
      .mockImplementation((callback) => callback(mockPrismaService)),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile()

    service = module.get<AgentsService>(AgentsService)
    prisma = module.get<PrismaService>(PrismaService)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createAgent', () => {
    const user = { userId: randomUUID(), role: 'seller' }
    const dto = {
      auth_secret_hash: 'secret',
      base_url: 'http://test.com',
      invoke_path: '/api',
      display_name: 'Test Agent',
      tags: ['tag1', 'tag2'],
    }

    it('should throw ForbiddenException if user is not a seller', async () => {
      const buyerUser = { ...user, role: 'buyer' }
      await expect(service.createAgent(buyerUser, dto)).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('should throw BadRequestException if auth_secret_hash is missing', async () => {
      await expect(
        service.createAgent(user, { ...dto, auth_secret_hash: undefined }),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException if required fields are missing', async () => {
      await expect(
        service.createAgent(user, { ...dto, base_url: undefined }),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException if agent already exists', async () => {
      mockPrismaService.agents.findFirst.mockResolvedValue({ id: 'agent-id' })
      await expect(service.createAgent(user, dto)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should create an agent successfully', async () => {
      mockPrismaService.agents.findFirst.mockResolvedValue(null)
      mockPrismaService.agent_tag_dict.findMany.mockResolvedValue([
        { id: 1, name: 'tag1' },
      ])
      mockPrismaService.agents.create.mockResolvedValue({
        id: 'new-agent-id',
      } as any)

      await service.createAgent(user, dto)

      expect(mockPrismaService.agents.create).toHaveBeenCalled()
      expect(mockPrismaService.agent_tags.createMany).toHaveBeenCalled()
    })
  })

  describe('listAgents', () => {
    it('should list agents with filters', async () => {
      mockPrismaService.agents.findMany.mockResolvedValue([])
      mockPrismaService.agents.count.mockResolvedValue(0)
      await service.listAgents({
        q: 'test',
        tags: 'tag1',
        min_rating: 4,
        is_online: true,
      })
      expect(mockPrismaService.agents.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { display_name: { contains: 'test', mode: 'insensitive' } },
              { bio: { contains: 'test', mode: 'insensitive' } },
            ],
            tags: { hasSome: ['tag1'] },
            rating: { gte: 4 },
            is_online: true,
          },
        }),
      )
    })
  })

  describe('getAgentById', () => {
    it('should throw NotFoundException if agent not found', async () => {
      mockPrismaService.agents.findUnique.mockResolvedValue(null)
      await expect(service.getAgentById('id')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('updateAgent', () => {
    const user = { userId: randomUUID(), role: 'seller' }
    const agentId = randomUUID()
    const agent = { id: agentId, user_id: user.userId }

    it('should throw NotFoundException if agent not found', async () => {
      mockPrismaService.agents.findUnique.mockResolvedValue(null)
      await expect(service.updateAgent(agentId, user, {})).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw ForbiddenException if user is not the owner', async () => {
      mockPrismaService.agents.findUnique.mockResolvedValue(agent)
      const otherUser = { ...user, userId: randomUUID() }
      await expect(service.updateAgent(agentId, otherUser, {})).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('should update an agent successfully', async () => {
      mockPrismaService.agents.findUnique.mockResolvedValue(agent as any)
      mockPrismaService.agents.findFirst.mockResolvedValue(null)
      mockPrismaService.agent_tag_dict.findMany.mockResolvedValue([
        { id: 1, name: 'new-tag' },
      ])

      await service.updateAgent(agentId, user, { tags: ['new-tag'] })
      expect(mockPrismaService.agents.update).toHaveBeenCalled()
      expect(mockPrismaService.agent_tags.deleteMany).toHaveBeenCalled()
      expect(mockPrismaService.agent_tags.createMany).toHaveBeenCalled()
    })
  })

  describe('setOnlineStatus', () => {
    it('should call updateAgent', async () => {
      const updateAgentSpy = jest
        .spyOn(service, 'updateAgent')
        .mockResolvedValue({} as any)
      await service.setOnlineStatus('id', {} as any, true)
      expect(updateAgentSpy).toHaveBeenCalledWith('id', {}, { is_online: true })
    })
  })

  describe('listTags', () => {
    it('should return a list of tag names', async () => {
      mockPrismaService.agent_tag_dict.findMany.mockResolvedValue([
        { name: 'tag1' },
        { name: 'tag2' },
      ] as any)
      const result = await service.listTags()
      expect(result).toEqual(['tag1', 'tag2'])
    })
  })

  describe('generateAgentSecret', () => {
    const taskId = randomUUID()
    const agentId = randomUUID()
    const userId = randomUUID()
    const user = { userId: userId, role: 'seller', username: 'test' }
    const taskWithAgent = {
      id: taskId,
      agent_id: agentId,
      agents: {
        id: agentId,
        user_id: userId,
      },
    }

    it('should generate a new agent secret successfully', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue(taskWithAgent)

      const result = await service.generateAgentSecret(taskId, user)

      expect(result).toHaveProperty('key_id')
      expect(result).toHaveProperty('secret')
      expect(typeof result.key_id).toBe('string')
      expect(typeof result.secret).toBe('string')

      expect(prisma.tasks.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
        select: {
          agent_id: true,
          agents: {
            select: {
              id: true,
              user_id: true,
            },
          },
        },
      })

      expect(prisma.agents.update).toHaveBeenCalledWith({
        where: { id: agentId },
        data: { auth_secret_hash: result.secret },
      })
    })

    it('should throw NotFoundException if task or agent not found', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue(null)

      await expect(service.generateAgentSecret(taskId, user)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw ForbiddenException if user is not the agent owner', async () => {
      const otherUserId = randomUUID()
      mockPrismaService.tasks.findUnique.mockResolvedValue(taskWithAgent)

      await expect(
        service.generateAgentSecret(taskId, { ...user, userId: otherUserId }),
      ).rejects.toThrow(ForbiddenException)
    })

    it('should throw ForbiddenException if user role is not seller', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue(taskWithAgent)

      await expect(
        service.generateAgentSecret(taskId, { ...user, role: 'buyer' }),
      ).rejects.toThrow(ForbiddenException)
    })
  })
})
