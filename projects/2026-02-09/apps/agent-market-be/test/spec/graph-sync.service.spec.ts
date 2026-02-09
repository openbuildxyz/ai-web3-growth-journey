import { Test, type TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../src/Database/prisma.service'
import { GraphSyncService } from '../../src/Web3/graph-sync.service'
import { ethers } from 'ethers'
import * as fs from 'fs'

jest.mock('ethers')
jest.mock('fs')

describe('GraphSyncService', () => {
  let service: GraphSyncService
  let configService: ConfigService
  let prismaService: PrismaService

  const mockPrismaService = {
    tasks: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    escrows: {
      upsert: jest.fn(),
      updateMany: jest.fn(),
    },
    arbitrations: {
      upsert: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
    },
    arbitration_votes: {
      upsert: jest.fn(),
    },
    dao_members: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    payments: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    users: {
      findUnique: jest.fn(),
    },
    wallet_balances: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $queryRaw: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      if (key === 'CHAIN_RPC_URL') return 'http://localhost:8545'
      if (key === 'CHAIN_SYNC_INTERVAL_MS') return 1000
      if (key === 'ESCROW_VAULT_ADDRESS') return '0xEscrowVault'
      if (key === 'TASK_MANAGER_ADDRESS') return '0xTaskManager'
      if (key === 'ARBITRATION_ADDRESS') return '0xArbitration'
      if (key === 'TOKEN_EXCHANGE_ADDRESS') return '0xTokenExchange'
      if (key === 'CHAIN_ID') return 1
      return defaultValue
    }),
  }

  const mockContract = {
    queryFilter: jest.fn(),
    filters: {
      Deposited: jest.fn(),
      Released: jest.fn(),
      Refunded: jest.fn(),
      TaskDisputed: jest.fn(),
      TaskArbitrated: jest.fn(),
      CaseOpened: jest.fn(),
      Voted: jest.fn(),
      CaseFinalized: jest.fn(),
      Staked: jest.fn(),
      Unstaked: jest.fn(),
      TokensPurchased: jest.fn(),
    },
  }

  ;(ethers.Contract as jest.Mock).mockReturnValue(mockContract)
  ;(ethers.JsonRpcProvider as jest.Mock).mockReturnValue({
    getBlockNumber: jest.fn().mockResolvedValue(101),
  })

  beforeEach(async () => {
    jest.useFakeTimers()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GraphSyncService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile()

    service = module.get<GraphSyncService>(GraphSyncService)
    configService = module.get<ConfigService>(ConfigService)
    prismaService = module.get<PrismaService>(PrismaService)

    jest.clearAllMocks()
    ;(fs.readFileSync as jest.Mock).mockReturnValue('{}')
  })

  afterEach(() => {
    jest.useRealTimers()
    service.onModuleDestroy()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('onModuleInit', () => {
    it('should start polling if RPC_URL is set', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval')
      service.onModuleInit()
      expect(setIntervalSpy).toHaveBeenCalled()
    })

    it('should not start polling if RPC_URL is not set', () => {
      mockConfigService.get.mockImplementationOnce((key: string) =>
        key === 'CHAIN_RPC_URL' ? undefined : 'value',
      )
      const setIntervalSpy = jest.spyOn(global, 'setInterval')
      service.onModuleInit()
      expect(setIntervalSpy).not.toHaveBeenCalled()
    })
    it('should set lastBlock if start block is configured', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'CHAIN_SYNC_START_BLOCK') return 100
        return 'value'
      })
      service.onModuleInit()
      expect(service['lastBlock']).toBe(99)
    })
  })

  describe('pollOnce', () => {
    it('should sync events if lastBlock is defined', async () => {
      service['provider'] = {
        getBlockNumber: jest.fn().mockResolvedValue(101),
      } as any
      service['lastBlock'] = 100
      const syncTaskManagerEvents = jest
        .spyOn(service as any, 'syncTaskManagerEvents')
        .mockResolvedValue(undefined)
      const syncArbitrationEvents = jest
        .spyOn(service as any, 'syncArbitrationEvents')
        .mockResolvedValue(undefined)
      const syncEscrowEvents = jest
        .spyOn(service as any, 'syncEscrowEvents')
        .mockResolvedValue(undefined)
      const syncTokenExchangeEvents = jest
        .spyOn(service as any, 'syncTokenExchangeEvents')
        .mockResolvedValue(undefined)

      await service['pollOnce']()

      expect(syncTaskManagerEvents).toHaveBeenCalledWith(101, 101)
      expect(syncArbitrationEvents).toHaveBeenCalledWith(101, 101)
      expect(syncEscrowEvents).toHaveBeenCalledWith(101, 101)
      expect(syncTokenExchangeEvents).toHaveBeenCalledWith(101, 101)
      expect(service['lastBlock']).toBe(101)
    })

    it('should not sync events if provider is not defined', async () => {
      service['provider'] = undefined
      const syncTaskManagerEvents = jest.spyOn(
        service as any,
        'syncTaskManagerEvents',
      )
      await service['pollOnce']()
      expect(syncTaskManagerEvents).not.toHaveBeenCalled()
    })

    it('should set lastBlock if it is undefined', async () => {
      service['provider'] = {
        getBlockNumber: jest.fn().mockResolvedValue(101),
      } as any
      service['lastBlock'] = undefined
      await service['pollOnce']()
      expect(service['lastBlock']).toBe(101)
    })

    it('should return if fromBlock > toBlock', async () => {
      service['provider'] = {
        getBlockNumber: jest.fn().mockResolvedValue(100),
      } as any
      service['lastBlock'] = 100
      const syncTaskManagerEvents = jest.spyOn(
        service as any,
        'syncTaskManagerEvents',
      )
      await service['pollOnce']()
      expect(syncTaskManagerEvents).not.toHaveBeenCalled()
    })
  })

  describe('sync events', () => {
    beforeEach(() => {
      service['lastBlock'] = 100
      service['provider'] = {
        getBlockNumber: jest.fn().mockResolvedValue(101),
      } as any
      mockPrismaService.$queryRaw.mockResolvedValue([{ id: 'task-id' }])
    })

    it('syncEscrowEvents - should process Deposited, Released, and Refunded events', async () => {
      const depositedLogs = [
        { args: { taskId: 1n, amount: 100n }, transactionHash: '0x1' },
      ]
      const releasedLogs = [
        {
          args: { taskId: 2n, to: '0xto', amount: 50n },
          transactionHash: '0x2',
        },
      ]
      const refundedLogs = [
        {
          args: { taskId: 3n, to: '0xto', amount: 50n },
          transactionHash: '0x3',
        },
      ]

      mockContract.queryFilter
        .mockResolvedValueOnce(depositedLogs)
        .mockResolvedValueOnce(releasedLogs)
        .mockResolvedValueOnce(refundedLogs)

      const upsertEscrowByChainTaskId = jest
        .spyOn(service as any, 'upsertEscrowByChainTaskId')
        .mockResolvedValue(undefined)
      const updateEscrowByChainTaskId = jest
        .spyOn(service as any, 'updateEscrowByChainTaskId')
        .mockResolvedValue(undefined)
      const updateWalletBalance = jest
        .spyOn(service as any, 'updateWalletBalance')
        .mockResolvedValue(undefined)

      await service['syncEscrowEvents'](101, 101)

      expect(upsertEscrowByChainTaskId).toHaveBeenCalledWith({
        chainTaskId: 1n,
        amount: 100n,
        status: 'locked',
        txHash: '0x1',
      })
      expect(updateEscrowByChainTaskId).toHaveBeenCalledWith({
        chainTaskId: 2n,
        status: 'released',
        txHash: '0x2',
      })
      expect(updateEscrowByChainTaskId).toHaveBeenCalledWith({
        chainTaskId: 3n,
        status: 'refunded',
        txHash: '0x3',
      })
      expect(updateWalletBalance).toHaveBeenCalledTimes(2)
    })

    it('syncTaskManagerEvents - should process TaskDisputed and TaskArbitrated events', async () => {
      mockContract.queryFilter
        .mockResolvedValueOnce([{ args: { taskId: 1n } }])
        .mockResolvedValueOnce([{ args: { taskId: 2n } }])

      const updateTaskStatusByChainTaskId = jest
        .spyOn(service as any, 'updateTaskStatusByChainTaskId')
        .mockResolvedValue(undefined)
      await service['syncTaskManagerEvents'](101, 101)

      expect(updateTaskStatusByChainTaskId).toHaveBeenCalledWith({
        chainTaskId: 1n,
        status: 'disputed',
      })
      expect(updateTaskStatusByChainTaskId).toHaveBeenCalledWith({
        chainTaskId: 2n,
        status: 'arbitrated',
      })
    })

    it('syncArbitrationEvents - should process all arbitration events', async () => {
      mockContract.queryFilter
        .mockResolvedValueOnce([
          { args: { taskId: 1n, amount: 100n, deadline: 123n } },
        ]) // CaseOpened
        .mockResolvedValueOnce([
          {
            args: { taskId: 2n, voter: '0xvoter', decision: 0 },
            transactionHash: '0x4',
          },
        ]) // Voted
        .mockResolvedValueOnce([{ args: { taskId: 3n, result: 1 } }]) // CaseFinalized
        .mockResolvedValueOnce([{ args: { user: '0xstaker', amount: 1000n } }]) // Staked
        .mockResolvedValueOnce([{ args: { user: '0xunstaker', amount: 500n } }]) // Unstaked

      const upsertArbitrationByChainTaskId = jest
        .spyOn(service as any, 'upsertArbitrationByChainTaskId')
        .mockResolvedValue(undefined)
      const upsertVoteByChainTaskId = jest
        .spyOn(service as any, 'upsertVoteByChainTaskId')
        .mockResolvedValue(undefined)
      const updateArbitrationStatusByChainTaskId = jest
        .spyOn(service as any, 'updateArbitrationStatusByChainTaskId')
        .mockResolvedValue(undefined)
      const updateDaoMemberStake = jest
        .spyOn(service as any, 'updateDaoMemberStake')
        .mockResolvedValue(undefined)

      await service['syncArbitrationEvents'](101, 101)

      expect(upsertArbitrationByChainTaskId).toHaveBeenCalled()
      expect(upsertVoteByChainTaskId).toHaveBeenCalled()
      expect(updateArbitrationStatusByChainTaskId).toHaveBeenCalled()
      expect(updateDaoMemberStake).toHaveBeenCalledTimes(2)
    })

    it('syncTokenExchangeEvents - should process TokensPurchased events', async () => {
      mockContract.queryFilter.mockResolvedValue([
        { args: { buyer: '0xbuyer', tokensOut: 100n }, transactionHash: '0x5' },
      ])
      const completePaymentByTxHash = jest
        .spyOn(service as any, 'completePaymentByTxHash')
        .mockResolvedValue(undefined)
      const updateWalletBalance = jest
        .spyOn(service as any, 'updateWalletBalance')
        .mockResolvedValue(undefined)

      await service['syncTokenExchangeEvents'](101, 101)

      expect(completePaymentByTxHash).toHaveBeenCalled()
      expect(updateWalletBalance).toHaveBeenCalled()
    })
  })

  describe('helper methods', () => {
    beforeEach(() => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ id: 'task-id' }])
      mockPrismaService.users.findUnique.mockResolvedValue({
        id: 'user-id',
        wallet_address: '0xwallet',
      })
      mockPrismaService.tasks.findUnique.mockResolvedValue({
        id: 'task-id',
        buyer_id: 'buyer-id',
      })
      mockPrismaService.arbitrations.findUnique.mockResolvedValue({
        id: 'arbitration-id',
        task_id: 'task-id',
      })
      mockPrismaService.dao_members.findUnique.mockResolvedValue(null)
      mockPrismaService.wallet_balances.findUnique.mockResolvedValue(null)
      mockPrismaService.payments.findFirst.mockResolvedValue({
        id: 'payment-id',
      })
    })

    it('upsertEscrowByChainTaskId - should upsert an escrow', async () => {
      await service['upsertEscrowByChainTaskId']({
        chainTaskId: 1n,
        amount: 100n,
        status: 'locked',
        txHash: '0x1',
      })
      expect(mockPrismaService.escrows.upsert).toHaveBeenCalled()
    })

    it('updateEscrowByChainTaskId - should update an escrow for release', async () => {
      await service['updateEscrowByChainTaskId']({
        chainTaskId: 1n,
        status: 'released',
        txHash: '0x2',
      })
      expect(mockPrismaService.escrows.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'released', released_tx_hash: '0x2' },
        }),
      )
    })

    it('updateEscrowByChainTaskId - should update an escrow for refund', async () => {
      await service['updateEscrowByChainTaskId']({
        chainTaskId: 1n,
        status: 'refunded',
        txHash: '0x3',
      })
      expect(mockPrismaService.escrows.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'refunded', refund_tx_hash: '0x3' },
        }),
      )
    })

    it('updateTaskStatusByChainTaskId - should update task status', async () => {
      await service['updateTaskStatusByChainTaskId']({
        chainTaskId: 1n,
        status: 'disputed',
      })
      expect(mockPrismaService.tasks.updateMany).toHaveBeenCalled()
    })

    it('upsertArbitrationByChainTaskId - should upsert an arbitration', async () => {
      await service['upsertArbitrationByChainTaskId']({
        chainTaskId: 1n,
        amount: 100n,
        deadline: BigInt(new Date().getTime()),
      })
      expect(mockPrismaService.arbitrations.upsert).toHaveBeenCalled()
      expect(mockPrismaService.tasks.updateMany).toHaveBeenCalled()
    })

    it('upsertVoteByChainTaskId - should upsert a vote', async () => {
      await service['upsertVoteByChainTaskId']({
        chainTaskId: 1n,
        voter: '0xwallet',
        decision: 0,
        txHash: '0x4',
      })
      expect(mockPrismaService.arbitration_votes.upsert).toHaveBeenCalled()
    })

    it('updateArbitrationStatusByChainTaskId - should update arbitration status', async () => {
      await service['updateArbitrationStatusByChainTaskId']({
        chainTaskId: 1n,
        result: 1,
      })
      expect(mockPrismaService.arbitrations.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'resolved_seller', resolved_at: expect.any(Date) },
        }),
      )
    })

    it('updateDaoMemberStake - should upsert dao member for stake action', async () => {
      await service['updateDaoMemberStake']('0xwallet', 100n, 'stake')
      expect(mockPrismaService.dao_members.upsert).toHaveBeenCalled()
    })

    it('updateDaoMemberStake - should update dao member stake for unstake action', async () => {
      mockPrismaService.dao_members.findUnique.mockResolvedValue({
        staked_amount: '200',
      } as any)
      await service['updateDaoMemberStake']('0xwallet', 100n, 'unstake')
      expect(mockPrismaService.dao_members.upsert).toHaveBeenCalled()
    })

    it('completePaymentByTxHash - should complete a payment', async () => {
      await service['completePaymentByTxHash']('0x5', 100n)
      expect(mockPrismaService.payments.update).toHaveBeenCalled()
    })

    it('updateWalletBalance - should create balance if not exists', async () => {
      await service['updateWalletBalance']('0xwallet', 100n, 'credit')
      expect(mockPrismaService.wallet_balances.create).toHaveBeenCalled()
    })

    it('updateWalletBalance - should update balance if exists', async () => {
      mockPrismaService.wallet_balances.findUnique.mockResolvedValue({
        available: '100',
      } as any)
      await service['updateWalletBalance']('0xwallet', 100n, 'debit')
      expect(mockPrismaService.wallet_balances.update).toHaveBeenCalled()
    })

    it('upsertEscrowByChainTaskId - should not run if taskId not found', async () => {
      jest
        .spyOn(service as any, 'findTaskIdByChainTaskId')
        .mockResolvedValue(null)
      await service['upsertEscrowByChainTaskId']({
        chainTaskId: 1n,
        amount: 100n,
        status: 'locked',
        txHash: '0x1',
      })
      expect(mockPrismaService.escrows.upsert).not.toHaveBeenCalled()
    })

    it('updateEscrowByChainTaskId - should not run if taskId not found', async () => {
      jest
        .spyOn(service as any, 'findTaskIdByChainTaskId')
        .mockResolvedValue(null)
      await service['updateEscrowByChainTaskId']({
        chainTaskId: 1n,
        status: 'released',
        txHash: '0x2',
      })
      expect(mockPrismaService.escrows.updateMany).not.toHaveBeenCalled()
    })

    it('upsertArbitrationByChainTaskId - should not run if task not found', async () => {
      jest
        .spyOn(service as any, 'findTaskIdByChainTaskId')
        .mockResolvedValue('task-id')
      mockPrismaService.tasks.findUnique.mockResolvedValue(null)
      await service['upsertArbitrationByChainTaskId']({
        chainTaskId: 1n,
        amount: 100n,
        deadline: BigInt(new Date().getTime()),
      })
      expect(mockPrismaService.arbitrations.upsert).not.toHaveBeenCalled()
    })

    it('upsertVoteByChainTaskId - should not run if arbitration or user not found', async () => {
      jest
        .spyOn(service as any, 'findTaskIdByChainTaskId')
        .mockResolvedValue('task-id')
      mockPrismaService.arbitrations.findUnique.mockResolvedValue(null)
      await service['upsertVoteByChainTaskId']({
        chainTaskId: 1n,
        voter: '0xwallet',
        decision: 0,
        txHash: '0x4',
      })
      expect(mockPrismaService.arbitration_votes.upsert).not.toHaveBeenCalled()

      mockPrismaService.arbitrations.findUnique.mockResolvedValue({
        id: 'arb-id',
      })
      mockPrismaService.users.findUnique.mockResolvedValue(null)
      await service['upsertVoteByChainTaskId']({
        chainTaskId: 1n,
        voter: '0xwallet',
        decision: 0,
        txHash: '0x4',
      })
      expect(mockPrismaService.arbitration_votes.upsert).not.toHaveBeenCalled()
    })

    it('updateWalletBalance - should not run if user not found', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null)
      await service['updateWalletBalance']('0xwallet', 100n, 'credit')
      expect(mockPrismaService.wallet_balances.create).not.toHaveBeenCalled()
      expect(mockPrismaService.wallet_balances.update).not.toHaveBeenCalled()
    })

    it('completePaymentByTxHash - should not run if payment not found', async () => {
      mockPrismaService.payments.findFirst.mockResolvedValue(null)
      await service['completePaymentByTxHash']('0x5', 100n)
      expect(mockPrismaService.payments.update).not.toHaveBeenCalled()
    })
  })
})
