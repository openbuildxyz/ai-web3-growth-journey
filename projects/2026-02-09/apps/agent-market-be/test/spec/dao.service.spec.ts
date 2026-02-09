import { Test, type TestingModule } from '@nestjs/testing'
import { PrismaService } from '../../src/Database/prisma.service'
import { DaoService } from '../../src/Modules/Dao/dao.service'
import { BadRequestException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { $Enums } from '../../generated/prisma/client'

describe('DaoService', () => {
  let service: DaoService
  let prisma: PrismaService

  const mockPrismaService = {
    payments: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    dao_members: {
      findUnique: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DaoService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    service = module.get<DaoService>(DaoService)
    prisma = module.get<PrismaService>(PrismaService)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('submitStakeTx', () => {
    const userId = randomUUID()
    const txHash = '0x123'

    it('should throw BadRequestException if txHash already exists', async () => {
      mockPrismaService.payments.findFirst.mockResolvedValue({
        id: randomUUID(),
      })
      await expect(service.submitStakeTx(userId, txHash)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should create a pending payment for staking', async () => {
      mockPrismaService.payments.findFirst.mockResolvedValue(null)
      mockPrismaService.payments.create.mockResolvedValue({} as any)
      await service.submitStakeTx(userId, txHash)
      expect(mockPrismaService.payments.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          user_id: userId,
          type: $Enums.payment_type.deposit,
          amount: 0,
          token_symbol: 'USDT',
          status: $Enums.payment_status.pending,
          tx_hash: txHash,
          description: 'dao_stake',
        },
      })
    })
  })

  describe('getMemberMe', () => {
    const userId = randomUUID()

    it('should return null if dao member is not found', async () => {
      mockPrismaService.dao_members.findUnique.mockResolvedValue(null)
      const result = await service.getMemberMe(userId)
      expect(result).toBeNull()
    })

    it('should return the dao member if found', async () => {
      const member = {
        user_id: userId,
        staked_amount: '1000',
        joined_at: new Date(),
      }
      mockPrismaService.dao_members.findUnique.mockResolvedValue(member)
      const result = await service.getMemberMe(userId)
      expect(result).toEqual(member)
    })
  })
})
