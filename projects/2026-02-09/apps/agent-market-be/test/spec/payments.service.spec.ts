import { Test, TestingModule } from '@nestjs/testing'
import { PaymentsService } from '../../src/Modules/Payments/payments.service'
import { PrismaService } from '../../src/Database/prisma.service'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { $Enums } from '../../generated/prisma/client'

describe('PaymentsService', () => {
  let service: PaymentsService
  let prismaService: PrismaService

  const mockPrismaService = {
    payments: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile()

    service = module.get<PaymentsService>(PaymentsService)
    prismaService = module.get<PrismaService>(PrismaService)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('listPayments', () => {
    const userId = randomUUID()
    const payments = [
      { id: randomUUID(), user_id: userId, amount: 100 },
      { id: randomUUID(), user_id: userId, amount: 200 },
    ]

    it('should return a paginated list of payments for a user', async () => {
      mockPrismaService.payments.findMany.mockResolvedValue(payments)
      mockPrismaService.payments.count.mockResolvedValue(payments.length)

      const result = await service.listPayments(userId, {})

      expect(prismaService.payments.findMany).toHaveBeenCalledWith({
        where: { user_id: userId },
        skip: 0,
        take: 20,
        orderBy: { created_at: 'desc' },
      })
      expect(prismaService.payments.count).toHaveBeenCalledWith({
        where: { user_id: userId },
      })
      expect(result.items).toEqual(payments)
      expect(result.total).toBe(payments.length)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
    })

    it('should correctly filter by type and status', async () => {
      mockPrismaService.payments.findMany.mockResolvedValue([payments[0]])
      mockPrismaService.payments.count.mockResolvedValue(1)

      const query = {
        type: 'deposit',
        status: 'completed',
        page: 2,
        limit: 10,
      }
      const result = await service.listPayments(userId, query)

      const expectedWhere = {
        user_id: userId,
        type: query.type as $Enums.payment_type,
        status: query.status as $Enums.payment_status,
      }

      expect(prismaService.payments.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        skip: 10,
        take: 10,
        orderBy: { created_at: 'desc' },
      })
      expect(prismaService.payments.count).toHaveBeenCalledWith({
        where: expectedWhere,
      })

      expect(result.items).toEqual([payments[0]])
      expect(result.total).toBe(1)
      expect(result.page).toBe(2)
      expect(result.limit).toBe(10)
    })
  })

  describe('recordTx', () => {
    const userId = randomUUID()
    const otherUserId = randomUUID()
    const paymentId = randomUUID()
    const txHash = '0x' + randomUUID().replace(/-/g, '')

    const payment = {
      id: paymentId,
      user_id: userId,
      amount: 100,
      status: 'pending',
    }

    it('should update the tx_hash for a given payment', async () => {
      mockPrismaService.payments.findUnique.mockResolvedValue(payment)
      const updatedPayment = { ...payment, tx_hash: txHash }
      mockPrismaService.payments.update.mockResolvedValue(updatedPayment)

      const result = await service.recordTx(userId, paymentId, txHash)

      expect(prismaService.payments.findUnique).toHaveBeenCalledWith({
        where: { id: paymentId },
      })
      expect(prismaService.payments.update).toHaveBeenCalledWith({
        where: { id: paymentId },
        data: { tx_hash: txHash },
      })
      expect(result).toEqual(updatedPayment)
    })

    it('should throw NotFoundException if payment does not exist', async () => {
      mockPrismaService.payments.findUnique.mockResolvedValue(null)

      await expect(service.recordTx(userId, paymentId, txHash)).rejects.toThrow(
        new NotFoundException('支付记录不存在'),
      )
    })

    it('should throw BadRequestException if payment does not belong to the user', async () => {
      const paymentBelongingToOtherUser = { ...payment, user_id: otherUserId }
      mockPrismaService.payments.findUnique.mockResolvedValue(
        paymentBelongingToOtherUser,
      )

      await expect(service.recordTx(userId, paymentId, txHash)).rejects.toThrow(
        new BadRequestException('无权限更新该支付记录'),
      )
    })
  })
})
