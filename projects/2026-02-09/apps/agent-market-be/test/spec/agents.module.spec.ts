import { Test, TestingModule } from '@nestjs/testing'
import { AgentsService } from '../../src/Modules/Agents/agents.service'
import { PrismaService } from '../../src/Database/prisma.service'
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import {
  CreateAgentDto,
  ListAgentsQueryDto,
  UpdateAgentDto,
} from '../../src/Modules/Agents/dto/agent.dto'
import { AGENT_SECRET_PROVIDER } from '../../src/Common/providers/agent-secret.provider'
import { ConfigService } from '@nestjs/config'

describe('AgentsService', () => {
  let service: AgentsService
  let prismaService: PrismaService

  const mockPrismaService = {
    agents: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    agent_tag_dict: {
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
    agent_tags: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest
      .fn()
      .mockImplementation((callback) => callback(mockPrismaService)),
  }

  const mockAgentSecretProvider = {
    getSecret: jest.fn(),
    setSecret: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        { provide: AGENT_SECRET_PROVIDER, useValue: mockAgentSecretProvider },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile()

    service = module.get<AgentsService>(AgentsService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockUser = {
    userId: 'user-1',
    role: 'seller',
    walletAddress: '0x123',
  }

  describe('createAgent', () => {
    const dto: CreateAgentDto = {
      display_name: 'Test Agent',
      base_url: 'http://test.com',
      invoke_path: '/invoke',
      price_per_task: 10,
    }

    it('should create an agent successfully', async () => {
      ;(prismaService.agents.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prismaService.agents.create as jest.Mock).mockResolvedValue({
        id: 'agent-1',
        ...dto,
      })
      ;(prismaService.agent_tag_dict.findMany as jest.Mock).mockResolvedValue(
        [],
      )

      const result = await service.createAgent(mockUser, dto)

      expect(result).toBeDefined()
      expect(prismaService.agents.create).toHaveBeenCalled()
    })

    it('should throw ForbiddenException if user is not a seller', async () => {
      const buyerUser = { ...mockUser, role: 'buyer' }
      await expect(service.createAgent(buyerUser, dto)).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('should throw BadRequestException if agent already exists', async () => {
      ;(prismaService.agents.findFirst as jest.Mock).mockResolvedValue({
        id: 'agent-1',
      })
      await expect(service.createAgent(mockUser, dto)).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('listAgents', () => {
    it('should return paginated list of agents', async () => {
      const query: ListAgentsQueryDto = { page: 1, limit: 10, q: 'test' }
      const agents = [{ id: 'agent-1', display_name: 'test' }]
      ;(prismaService.agents.findMany as jest.Mock).mockResolvedValue(agents)
      ;(prismaService.agents.count as jest.Mock).mockResolvedValue(1)

      const result = await service.listAgents(query)

      expect(result.items).toEqual(agents)
      expect(result.total).toBe(1)
      expect(prismaService.agents.findMany).toHaveBeenCalled()
    })
  })

  describe('getAgentById', () => {
    it('should return agent details', async () => {
      const agent = { id: 'agent-1' }
      ;(prismaService.agents.findUnique as jest.Mock).mockResolvedValue(agent)

      const result = await service.getAgentById('agent-1')
      expect(result).toEqual(agent)
    })

    it('should throw NotFoundException if agent not found', async () => {
      ;(prismaService.agents.findUnique as jest.Mock).mockResolvedValue(null)
      await expect(service.getAgentById('agent-1')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('updateAgent', () => {
    const updateDto: UpdateAgentDto = { display_name: 'Updated Name' }

    it('should update agent successfully', async () => {
      const existingAgent = { id: 'agent-1', user_id: 'user-1' }
      ;(prismaService.agents.findUnique as jest.Mock).mockResolvedValue(
        existingAgent,
      )
      ;(prismaService.agents.update as jest.Mock).mockResolvedValue({
        ...existingAgent,
        ...updateDto,
      })
      ;(prismaService.agent_tag_dict.findMany as jest.Mock).mockResolvedValue(
        [],
      )

      const result = await service.updateAgent('agent-1', mockUser, updateDto)

      expect(result.display_name).toBe('Updated Name')
    })

    it('should throw ForbiddenException if user is not owner', async () => {
      const existingAgent = { id: 'agent-1', user_id: 'other-user' }
      ;(prismaService.agents.findUnique as jest.Mock).mockResolvedValue(
        existingAgent,
      )

      await expect(
        service.updateAgent('agent-1', mockUser, updateDto),
      ).rejects.toThrow(ForbiddenException)
    })
  })
})
