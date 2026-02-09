import { Test, type TestingModule } from '@nestjs/testing'
import { AgentInvocationService } from '../../src/Modules/AgentInvocation/agent-invocation.service'
import { PrismaService } from '../../src/Database/prisma.service'
import { NotFoundException, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { HttpService } from '@nestjs/axios'
import { of, throwError } from 'rxjs'
import { AxiosResponse } from 'axios'
import { createHmac } from 'crypto'

describe('AgentInvocationService', () => {
  let service: AgentInvocationService
  let prismaService: PrismaService
  let httpService: HttpService
  let jwtService: JwtService

  const mockPrismaService = {
    agent_invocations: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    agents: {
      findUnique: jest.fn(),
    },
  }

  const mockHttpService = {
    post: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn(),
  }

  const mockJwtService = {
    sign: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentInvocationService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile()

    service = module.get<AgentInvocationService>(AgentInvocationService)
    prismaService = module.get<PrismaService>(PrismaService)
    httpService = module.get<HttpService>(HttpService)
    jwtService = module.get<JwtService>(JwtService)
    jest.clearAllMocks()
  })

  describe('executeInvocation', () => {
    const agentId = 'agent-id'
    const taskId = 'task-id'
    const user = { userId: 'user-id', walletAddress: '0xwallet' }
    const agent = {
      id: agentId,
      base_url: 'http://a.com',
      invoke_path: '/',
      auth_secret_hash: 'super-secret',
    }
    const secret = 'super-secret'
    const payload = { data: 'test' }

    const mockSuccessfulInvocation = () => {
      mockPrismaService.agent_invocations.create.mockResolvedValue({
        id: 'inv-id',
      })
      const response: AxiosResponse = {
        data: { result: 'ok' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }
      mockHttpService.post.mockReturnValue(of(response))
    }

    it('should throw NotFoundException if agent not found', async () => {
      mockPrismaService.agents.findUnique.mockResolvedValue(null)
      await expect(
        service.executeInvocation(
          taskId,
          agentId,
          user.userId,
          user.walletAddress,
          {},
        ),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw InternalServerErrorException on failed invocation', async () => {
      mockPrismaService.agents.findUnique.mockResolvedValue(agent as any)
      mockPrismaService.agent_invocations.create.mockResolvedValue({
        id: 'inv-id',
      })
      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('invoke_failed')),
      )

      await expect(
        service.executeInvocation(
          taskId,
          agentId,
          user.userId,
          user.walletAddress,
          {},
        ),
      ).rejects.toThrow(InternalServerErrorException)
    })

    it('should not send auth headers if auth_type is not specified', async () => {
      mockPrismaService.agents.findUnique.mockResolvedValue(agent as any)
      mockSuccessfulInvocation()

      await service.executeInvocation(
        taskId,
        agentId,
        user.userId,
        user.walletAddress,
        payload,
      )

      expect(httpService.post).toHaveBeenCalledWith(
        expect.any(String),
        payload,
        expect.objectContaining({
          headers: {},
        }),
      )
    })

    it('should use hmac auth headers', async () => {
      const hmacAgent = { ...agent, auth_type: 'platform_hmac' }
      mockPrismaService.agents.findUnique.mockResolvedValue(hmacAgent as any)
      mockSuccessfulInvocation()

      await service.executeInvocation(
        taskId,
        agentId,
        user.userId,
        user.walletAddress,
        payload,
      )

      const expectedSignature = createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex')

      expect(httpService.post).toHaveBeenCalledWith(
        expect.any(String),
        payload,
        expect.objectContaining({
          headers: {
            'X-Signature': expectedSignature,
          },
        }),
      )
    })

    it('should use jwt auth when specified', async () => {
      const jwtAgent = { ...agent, auth_type: 'platform_jwt' }
      const token = 'a-jwt'
      mockPrismaService.agents.findUnique.mockResolvedValue(jwtAgent as any)
      mockJwtService.sign.mockReturnValue(token)
      mockSuccessfulInvocation()

      await service.executeInvocation(
        taskId,
        agentId,
        user.userId,
        user.walletAddress,
        payload,
      )

      expect(jwtService.sign).toHaveBeenCalledWith(payload, {
        secret,
        expiresIn: undefined,
      })
      expect(httpService.post).toHaveBeenCalledWith(
        expect.any(String),
        payload,
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      )
    })
  })

  describe('callback', () => {
    it('should throw NotFoundException if invocation record does not exist', async () => {
      const invocationId = BigInt(404)
      mockPrismaService.agent_invocations.findUnique.mockResolvedValue(null)
      await expect(service.callback(invocationId, {})).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should update status on successful callback', async () => {
      const invocationId = BigInt(123)
      const mockInvocation = { id: invocationId, status: 'running' }
      mockPrismaService.agent_invocations.findUnique.mockResolvedValue(
        mockInvocation,
      )

      await service.callback(invocationId, { result: 'success' })

      expect(prismaService.agent_invocations.update).toHaveBeenCalledWith({
        where: { id: invocationId },
        data: {
          status: 'success',
          finished_at: expect.any(Date),
          response_hash: expect.any(String),
        },
      })
    })
  })
})
