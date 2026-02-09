import { Test, TestingModule } from '@nestjs/testing'
import { WalletService } from '../../src/Modules/Wallet/wallet.service'
import { PrismaService } from '../../src/Database/prisma.service'
import { BadRequestException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { $Enums } from '../../generated/prisma/client'

describe('WalletService', () => {
  let service: WalletService
  let prismaService: PrismaService

  const mockPrismaService = {
    payments: {
      create: jest.fn(),
    },
    wallet_balances: {
      findUnique: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile()

    service = module.get<WalletService>(WalletService)
    prismaService = module.get<PrismaService>(PrismaService)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createDepositIntent', () => {
    const userId = randomUUID()
    const dto = {
      amount: 100,
      token_symbol: 'USDT',
      chain_id: 1,
    }

    it('should create a new payment record with status pending', async () => {
      const createdPayment = {
        id: randomUUID(),
        user_id: userId,
        type: $Enums.payment_type.deposit,
        amount: dto.amount,
        token_symbol: dto.token_symbol,
        chain_id: dto.chain_id,
        status: $Enums.payment_status.pending,
        created_at: new Date(),
        updated_at: new Date(),
        task_id: null,
        tx_hash: null,
        description: null,
      }
      mockPrismaService.payments.create.mockResolvedValue(createdPayment)

      const result = await service.createDepositIntent(userId, dto)

      expect(prismaService.payments.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          user_id: userId,
          type: $Enums.payment_type.deposit,
          amount: dto.amount,
          token_symbol: dto.token_symbol,
          chain_id: dto.chain_id,
          status: $Enums.payment_status.pending,
        },
      })
      expect(result).toEqual(createdPayment)
    })

    it('should throw BadRequestException if token_symbol is missing', async () => {
      const invalidDto: any = { amount: 100, chain_id: 1 }
      await expect(
        service.createDepositIntent(userId, invalidDto),
      ).rejects.toThrow(new BadRequestException('缺少必填字段'))
    })

    it('should throw BadRequestException if chain_id is missing', async () => {
      const invalidDto: any = { amount: 100, token_symbol: 'USDT' }
      await expect(
        service.createDepositIntent(userId, invalidDto),
      ).rejects.toThrow(new BadRequestException('缺少必填字段'))
    })
  })

  describe('getBalance', () => {
    const userId = randomUUID()

    it('should return the user balance if it exists', async () => {
      const balance = {
        user_id: userId,
        available: '1000.00',
        locked: '200.00',
        updated_at: new Date(),
      }
      mockPrismaService.wallet_balances.findUnique.mockResolvedValue(balance)

      const result = await service.getBalance(userId)

      expect(prismaService.wallet_balances.findUnique).toHaveBeenCalledWith({
        where: { user_id: userId },
      })
      expect(result).toEqual({
        available: balance.available,
        locked: balance.locked,
      })
    })

    it('should return zero balance if no balance record exists', async () => {
      mockPrismaService.wallet_balances.findUnique.mockResolvedValue(null)

      const result = await service.getBalance(userId)

      expect(prismaService.wallet_balances.findUnique).toHaveBeenCalledWith({
        where: { user_id: userId },
      })
      expect(result).toEqual({ available: '0', locked: '0' })
    })
  })
})
