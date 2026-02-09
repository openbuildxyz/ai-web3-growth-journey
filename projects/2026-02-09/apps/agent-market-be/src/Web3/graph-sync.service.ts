import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { readFileSync } from 'fs'
import { join } from 'path'
import { ethers } from 'ethers'
import { randomUUID } from 'crypto'
import { $Enums, Prisma } from '../../generated/prisma/client'
import { PrismaService } from '../Database/prisma.service'

// 基础设施服务：链上事件轮询与数据库同步。
@Injectable()
export class GraphSyncService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GraphSyncService.name)
  private pollTimer?: NodeJS.Timeout
  private provider?: ethers.JsonRpcProvider
  private lastBlock?: number

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  onModuleInit() {
    // 实现步骤：
    // 1. 读取链上 RPC 与合约地址配置。
    // 2. 初始化 provider 与起始区块。
    // 3. 启动轮询定时器。
    return
    /* 
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development')
    if (nodeEnv !== 'production') {
      this.logger.log('开发环境不启动链上轮询')
      return
    }
    const rpcUrl = this.configService.get<string>('CHAIN_RPC_URL')
    if (!rpcUrl) {
      this.logger.warn('未配置 CHAIN_RPC_URL，跳过链上轮询')
      return
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl)
    const startBlock = this.configService.get<number>('CHAIN_SYNC_START_BLOCK')
    if (startBlock && startBlock > 0) {
      this.lastBlock = startBlock - 1
    }

    const intervalMs = this.configService.get<number>(
      'CHAIN_SYNC_INTERVAL_MS',
      8000,
    )
    this.pollTimer = setInterval(() => {
      this.pollOnce().catch((error) => {
        this.logger.error('链上轮询失败', error)
      })
    }, intervalMs) */
  }

  onModuleDestroy() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
    }
  }

  private async pollOnce() {
    // 实现步骤：
    // 1. 读取最新区块高度。
    // 2. 分别拉取 TaskManager / Arbitration / EscrowVault / TokenExchange 事件。
    // 3. 更新 lastBlock 防止重复消费。
    if (!this.provider) {
      return
    }

    const latestBlock = await this.provider.getBlockNumber()
    if (this.lastBlock === undefined) {
      this.lastBlock = latestBlock
      return
    }

    const fromBlock = this.lastBlock + 1
    const toBlock = latestBlock
    if (fromBlock > toBlock) {
      return
    }

    await this.syncTaskManagerEvents(fromBlock, toBlock)
    await this.syncArbitrationEvents(fromBlock, toBlock)
    await this.syncEscrowEvents(fromBlock, toBlock)
    await this.syncTokenExchangeEvents(fromBlock, toBlock)

    this.lastBlock = toBlock
  }

  private async syncEscrowEvents(fromBlock: number, toBlock: number) {
    // 实现步骤：
    // 1. 拉取托管相关事件。
    // 2. 更新 escrows 状态并同步余额。
    const address = this.configService.get<string>('ESCROW_VAULT_ADDRESS')
    if (!address || !this.provider) {
      return
    }

    const abi = this.readAbi('EscrowVaultAbi.json')
    const contract = new ethers.Contract(address, abi, this.provider)

    const deposited = await contract.queryFilter(
      contract.filters.Deposited(),
      fromBlock,
      toBlock,
    )
    for (const log of deposited) {
      const args = (log as ethers.EventLog).args
      if (!args?.taskId) continue
      await this.upsertEscrowByChainTaskId({
        chainTaskId: args.taskId,
        amount: args.amount,
        status: 'locked',
        txHash: log.transactionHash,
      })
    }

    const released = await contract.queryFilter(
      contract.filters.Released(),
      fromBlock,
      toBlock,
    )
    for (const log of released) {
      const args = (log as ethers.EventLog).args
      if (!args?.taskId) continue
      await this.updateEscrowByChainTaskId({
        chainTaskId: args.taskId,
        status: 'released',
        txHash: log.transactionHash,
      })
      await this.updateWalletBalance(args.to, args.amount, 'credit')
    }

    const refunded = await contract.queryFilter(
      contract.filters.Refunded(),
      fromBlock,
      toBlock,
    )
    for (const log of refunded) {
      const args = (log as ethers.EventLog).args
      if (!args?.taskId) continue
      await this.updateEscrowByChainTaskId({
        chainTaskId: args.taskId,
        status: 'refunded',
        txHash: log.transactionHash,
      })
      await this.updateWalletBalance(args.to, args.amount, 'credit')
    }
  }

  private async syncTaskManagerEvents(fromBlock: number, toBlock: number) {
    // 实现步骤：
    // 1. 拉取争议/仲裁相关事件。
    // 2. 更新任务状态，以链上为准。
    const address = this.configService.get<string>('TASK_MANAGER_ADDRESS')
    if (!address || !this.provider) {
      return
    }

    const abi = this.readAbi('TaskManagerAbi.json')
    const contract = new ethers.Contract(address, abi, this.provider)

    const created = await contract.queryFilter(
      contract.filters.TaskCreated(),
      fromBlock,
      toBlock,
    )
    for (const log of created) {
      try {
        const args = (log as ethers.EventLog).args
        if (!args?.taskId || !args?.buyer) continue
        await this.handleTaskCreatedEvent({
          chainTaskId: args.taskId,
          buyer: args.buyer,
          amount: args.amount,
          metaHash: args.metaHash,
          txHash: log.transactionHash,
        })
      } catch (error) {
        this.logger.error(
          `处理 TaskCreated 事件失败: txHash=${log.transactionHash}`,
          error,
        )
      }
    }

    const accepted = await contract.queryFilter(
      contract.filters.TaskAccepted(),
      fromBlock,
      toBlock,
    )
    for (const log of accepted) {
      try {
        const args = (log as ethers.EventLog).args
        if (!args?.taskId || !args?.agent) continue
        await this.handleTaskAcceptedEvent({
          chainTaskId: args.taskId,
          agent: args.agent,
          txHash: log.transactionHash,
        })
      } catch (error) {
        this.logger.error(
          `处理 TaskAccepted 事件失败: txHash=${log.transactionHash}`,
          error,
        )
      }
    }

    const submitted = await contract.queryFilter(
      contract.filters.TaskSubmitted(),
      fromBlock,
      toBlock,
    )
    for (const log of submitted) {
      try {
        const args = (log as ethers.EventLog).args
        if (!args?.taskId || !args?.deliveryHash) continue
        await this.handleTaskSubmittedEvent({
          chainTaskId: args.taskId,
          deliveryHash: args.deliveryHash,
          txHash: log.transactionHash,
        })
      } catch (error) {
        this.logger.error(
          `处理 TaskSubmitted 事件失败: txHash=${log.transactionHash}`,
          error,
        )
      }
    }

    const approved = await contract.queryFilter(
      contract.filters.TaskApproved(),
      fromBlock,
      toBlock,
    )
    for (const log of approved) {
      try {
        const args = (log as ethers.EventLog).args
        if (!args?.taskId) continue
        await this.handleTaskApprovedEvent({
          chainTaskId: args.taskId,
          txHash: log.transactionHash,
        })
      } catch (error) {
        this.logger.error(
          `处理 TaskApproved 事件失败: txHash=${log.transactionHash}`,
          error,
        )
      }
    }

    const cancelled = await contract.queryFilter(
      contract.filters.TaskCancelled(),
      fromBlock,
      toBlock,
    )
    for (const log of cancelled) {
      try {
        const args = (log as ethers.EventLog).args
        if (!args?.taskId) continue
        await this.handleTaskCancelledEvent({
          chainTaskId: args.taskId,
          txHash: log.transactionHash,
        })
      } catch (error) {
        this.logger.error(
          `处理 TaskCancelled 事件失败: txHash=${log.transactionHash}`,
          error,
        )
      }
    }

    const disputed = await contract.queryFilter(
      contract.filters.TaskDisputed(),
      fromBlock,
      toBlock,
    )
    for (const log of disputed) {
      try {
        const args = (log as ethers.EventLog).args
        if (!args?.taskId || !args?.by) continue
        await this.handleTaskDisputedEvent({
          chainTaskId: args.taskId,
          by: args.by,
          txHash: log.transactionHash,
        })
      } catch (error) {
        this.logger.error(
          `处理 TaskDisputed 事件失败: txHash=${log.transactionHash}`,
          error,
        )
      }
    }

    const arbitrated = await contract.queryFilter(
      contract.filters.TaskArbitrated(),
      fromBlock,
      toBlock,
    )
    for (const log of arbitrated) {
      try {
        const args = (log as ethers.EventLog).args
        if (!args?.taskId) continue
        await this.handleTaskArbitratedEvent({
          chainTaskId: args.taskId,
          buyerAmount: args.buyerAmount,
          agentAmount: args.agentAmount,
          txHash: log.transactionHash,
        })
      } catch (error) {
        this.logger.error(
          `处理 TaskArbitrated 事件失败: txHash=${log.transactionHash}`,
          error,
        )
      }
    }
  }

  private async syncArbitrationEvents(fromBlock: number, toBlock: number) {
    // 实现步骤：
    // 1. 拉取仲裁事件。
    // 2. 同步仲裁案件与投票记录。
    const address = this.configService.get<string>('ARBITRATION_ADDRESS')
    if (!address || !this.provider) {
      return
    }

    const abi = this.readAbi('ArbitrationAbi.json')
    const contract = new ethers.Contract(address, abi, this.provider)

    const opened = await contract.queryFilter(
      contract.filters.CaseOpened(),
      fromBlock,
      toBlock,
    )
    for (const log of opened) {
      const args = (log as ethers.EventLog).args
      if (!args?.taskId) continue
      await this.upsertArbitrationByChainTaskId({
        chainTaskId: args.taskId,
        amount: args.amount,
        deadline: args.deadline,
      })
    }

    const voted = await contract.queryFilter(
      contract.filters.Voted(),
      fromBlock,
      toBlock,
    )
    for (const log of voted) {
      const args = (log as ethers.EventLog).args
      if (!args?.taskId || !args?.voter) continue
      await this.upsertVoteByChainTaskId({
        chainTaskId: args.taskId,
        voter: args.voter,
        decision: args.decision,
        txHash: log.transactionHash,
      })
    }

    const finalized = await contract.queryFilter(
      contract.filters.CaseFinalized(),
      fromBlock,
      toBlock,
    )
    for (const log of finalized) {
      const args = (log as ethers.EventLog).args
      if (!args?.taskId) continue
      await this.updateArbitrationStatusByChainTaskId({
        chainTaskId: args.taskId,
        result: args.result,
      })
    }

    const staked = await contract.queryFilter(
      contract.filters.Staked(),
      fromBlock,
      toBlock,
    )
    for (const log of staked) {
      const args = (log as ethers.EventLog).args
      if (!args?.user || !args?.amount) continue
      await this.updateDaoMemberStake(args.user, args.amount, 'stake')
    }

    const unstaked = await contract.queryFilter(
      contract.filters.Unstaked(),
      fromBlock,
      toBlock,
    )
    for (const log of unstaked) {
      const args = (log as ethers.EventLog).args
      if (!args?.user || !args?.amount) continue
      await this.updateDaoMemberStake(args.user, args.amount, 'unstake')
    }
  }

  private async syncTokenExchangeEvents(fromBlock: number, toBlock: number) {
    // 实现步骤：
    // 1. 拉取 TokensPurchased 事件。
    // 2. 更新支付记录并同步余额。
    const address = this.configService.get<string>('TOKEN_EXCHANGE_ADDRESS')
    if (!address || !this.provider) {
      return
    }

    const abi = this.readAbi('TokenExchangeAbi.json')
    const contract = new ethers.Contract(address, abi, this.provider)

    const purchases = await contract.queryFilter(
      contract.filters.TokensPurchased(),
      fromBlock,
      toBlock,
    )
    for (const log of purchases) {
      const args = (log as ethers.EventLog).args
      if (!args?.buyer || !args?.tokensOut) continue
      await this.completePaymentByTxHash(log.transactionHash, args.tokensOut)
      await this.updateWalletBalance(args.buyer, args.tokensOut, 'credit')
    }
  }

  private async upsertEscrowByChainTaskId(params: {
    chainTaskId: bigint
    amount: bigint
    status: $Enums.escrow_status
    txHash: string
  }) {
    const taskId = await this.findTaskIdByChainTaskId(params.chainTaskId)
    if (!taskId) {
      return
    }
    await this.prismaService.escrows.upsert({
      where: { task_id: taskId },
      update: {
        status: params.status,
        onchain_tx_hash: params.txHash,
        updated_at: new Date(),
      },
      create: {
        id: randomUUID(),
        task_id: taskId,
        amount: params.amount.toString(),
        status: params.status,
        onchain_tx_hash: params.txHash,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
  }

  private async updateEscrowByChainTaskId(params: {
    chainTaskId: bigint
    status: $Enums.escrow_status
    txHash: string
  }) {
    // 实现步骤：
    // 1. 定位链上任务对应的数据库任务。
    // 2. 更新托管状态与交易哈希。
    const taskId = await this.findTaskIdByChainTaskId(params.chainTaskId)
    if (!taskId) {
      return
    }
    const data: {
      status: $Enums.escrow_status
      released_tx_hash?: string
      refund_tx_hash?: string
    } =
      params.status === 'released'
        ? { status: params.status, released_tx_hash: params.txHash }
        : { status: params.status, refund_tx_hash: params.txHash }
    await this.prismaService.escrows.updateMany({
      where: { task_id: taskId },
      data: {
        ...data,
        updated_at: new Date(),
      },
    })
  }

  private async findTaskIdByChainTaskId(chainTaskId: bigint) {
    const chainId = this.configService.get<number>('CHAIN_ID')
    if (!chainId) {
      return null
    }
    const rows = await this.prismaService.$queryRaw<
      Array<{ id: string }>
    >`SELECT id FROM tasks WHERE chain_id = ${chainId} AND chain_task_id = ${chainTaskId} LIMIT 1`
    return rows[0]?.id ?? null
  }

  private async findTaskByChainTaskId(chainTaskId: bigint) {
    const chainId = this.configService.get<number>('CHAIN_ID')
    if (!chainId) {
      return null
    }
    return this.prismaService.tasks.findFirst({
      where: { chain_id: chainId, chain_task_id: chainTaskId },
    })
  }

  private async findTaskByCreateTxHash(txHash: string) {
    const chainId = this.configService.get<number>('CHAIN_ID')
    if (!chainId) {
      return null
    }
    return this.prismaService.tasks.findFirst({
      where: { chain_id: chainId, create_tx_hash: txHash },
    })
  }

  private logMissingTask(eventName: string, chainTaskId: bigint) {
    this.logger.warn(
      `未找到 chain_task_id=${chainTaskId.toString()} 的任务，跳过 ${eventName}`,
    )
  }

  private async handleTaskCreatedEvent(params: {
    chainTaskId: bigint
    buyer: string
    amount: bigint
    metaHash: string
    txHash: string
  }) {
    const task = await this.findTaskByCreateTxHash(params.txHash)
    if (!task) {
      this.logger.warn(
        `未找到 create_tx_hash=${params.txHash} 的任务，跳过 TaskCreated`,
      )
      return
    }

    await this.prismaService.$transaction(async (tx) => {
      const now = new Date()
      await tx.tasks.update({
        where: { id: task.id },
        data: {
          chain_task_id: params.chainTaskId,
          create_tx_hash: params.txHash,
          status: 'created',
        },
      })
      await tx.task_events.create({
        data: {
          id: randomUUID(),
          task_id: task.id,
          type: 'created',
          data: {
            chain_task_id: params.chainTaskId.toString(),
            amount: params.amount.toString(),
            metaHash: params.metaHash,
            tx_hash: params.txHash,
          },
          created_at: now,
        },
      })
    })
  }

  private async handleTaskAcceptedEvent(params: {
    chainTaskId: bigint
    agent: string
    txHash: string
  }) {
    const task = await this.findTaskByChainTaskId(params.chainTaskId)
    if (!task) {
      this.logMissingTask('TaskAccepted', params.chainTaskId)
      return
    }
    await this.prismaService.$transaction(async (tx) => {
      const now = new Date()
      await tx.tasks.update({
        where: { id: task.id },
        data: {
          status: 'accepted',
          accepted_at: now,
          agent_wallet_address: ethers.getAddress(params.agent),
        },
      })
      await tx.task_events.create({
        data: {
          id: randomUUID(),
          task_id: task.id,
          type: 'accepted',
          data: {
            chain_task_id: params.chainTaskId.toString(),
            agent: ethers.getAddress(params.agent),
            tx_hash: params.txHash,
          },
          created_at: now,
        },
      })
    })
  }

  private async handleTaskSubmittedEvent(params: {
    chainTaskId: bigint
    deliveryHash: string
    txHash: string
  }) {
    const task = await this.findTaskByChainTaskId(params.chainTaskId)
    if (!task) {
      this.logMissingTask('TaskSubmitted', params.chainTaskId)
      return
    }
    await this.prismaService.$transaction(async (tx) => {
      const now = new Date()
      await tx.tasks.update({
        where: { id: task.id },
        data: {
          status: 'pending_review',
          delivered_at: now,
        },
      })
      await tx.task_events.create({
        data: {
          id: randomUUID(),
          task_id: task.id,
          type: 'delivered',
          data: {
            chain_task_id: params.chainTaskId.toString(),
            deliveryHash: params.deliveryHash,
            tx_hash: params.txHash,
          },
          created_at: now,
        },
      })
    })
  }

  private async handleTaskApprovedEvent(params: {
    chainTaskId: bigint
    txHash: string
  }) {
    const task = await this.findTaskByChainTaskId(params.chainTaskId)
    if (!task) {
      this.logMissingTask('TaskApproved', params.chainTaskId)
      return
    }
    await this.prismaService.$transaction(async (tx) => {
      const now = new Date()
      await tx.tasks.update({
        where: { id: task.id },
        data: { status: 'completed' },
      })
      await tx.task_events.create({
        data: {
          id: randomUUID(),
          task_id: task.id,
          type: 'completed',
          data: {
            chain_task_id: params.chainTaskId.toString(),
            tx_hash: params.txHash,
          },
          created_at: now,
        },
      })
    })
  }

  private async handleTaskCancelledEvent(params: {
    chainTaskId: bigint
    txHash: string
  }) {
    const task = await this.findTaskByChainTaskId(params.chainTaskId)
    if (!task) {
      this.logMissingTask('TaskCancelled', params.chainTaskId)
      return
    }
    await this.prismaService.$transaction(async (tx) => {
      const now = new Date()
      await tx.tasks.update({
        where: { id: task.id },
        data: { status: 'cancelled' },
      })
      await tx.task_events.create({
        data: {
          id: randomUUID(),
          task_id: task.id,
          type: 'cancelled',
          data: {
            chain_task_id: params.chainTaskId.toString(),
            tx_hash: params.txHash,
          },
          created_at: now,
        },
      })
    })
  }

  private async handleTaskDisputedEvent(params: {
    chainTaskId: bigint
    by: string
    txHash: string
  }) {
    const task = await this.findTaskByChainTaskId(params.chainTaskId)
    if (!task) {
      this.logMissingTask('TaskDisputed', params.chainTaskId)
      return
    }
    await this.prismaService.$transaction(async (tx) => {
      const now = new Date()
      await tx.tasks.update({
        where: { id: task.id },
        data: { status: 'disputed' },
      })
      await tx.task_events.create({
        data: {
          id: randomUUID(),
          task_id: task.id,
          type: 'dispute_opened',
          data: {
            chain_task_id: params.chainTaskId.toString(),
            by: ethers.getAddress(params.by),
            tx_hash: params.txHash,
          },
          created_at: now,
        },
      })
    })
  }

  private async handleTaskArbitratedEvent(params: {
    chainTaskId: bigint
    buyerAmount: bigint
    agentAmount: bigint
    txHash: string
  }) {
    const task = await this.findTaskByChainTaskId(params.chainTaskId)
    if (!task) {
      this.logMissingTask('TaskArbitrated', params.chainTaskId)
      return
    }
    await this.prismaService.$transaction(async (tx) => {
      const now = new Date()
      await tx.tasks.update({
        where: { id: task.id },
        data: { status: 'arbitrated' },
      })
      await tx.task_events.create({
        data: {
          id: randomUUID(),
          task_id: task.id,
          type: 'arbitrated',
          data: {
            chain_task_id: params.chainTaskId.toString(),
            buyerAmount: params.buyerAmount.toString(),
            agentAmount: params.agentAmount.toString(),
            tx_hash: params.txHash,
          },
          created_at: now,
        },
      })
    })
  }

  private async upsertArbitrationByChainTaskId(params: {
    chainTaskId: bigint
    amount: bigint
    deadline: bigint
  }) {
    // 实现步骤：
    // 1. 定位任务与买家。
    // 2. 创建或更新仲裁记录。
    const taskId = await this.findTaskIdByChainTaskId(params.chainTaskId)
    if (!taskId) {
      return
    }
    const task = await this.prismaService.tasks.findUnique({
      where: { id: taskId },
    })
    if (!task) {
      return
    }

    await this.prismaService.arbitrations.upsert({
      where: { task_id: taskId },
      update: {
        status: 'voting',
        amount_disputed: params.amount.toString(),
        opened_at: new Date(),
      },
      create: {
        id: randomUUID(),
        task_id: taskId,
        opened_by: task.buyer_id,
        status: 'voting',
        amount_disputed: params.amount.toString(),
        opened_at: new Date(),
      },
    })

    await this.prismaService.tasks.updateMany({
      where: { id: taskId },
      data: { arbitration_deadline: new Date(Number(params.deadline) * 1000) },
    })
  }

  private async upsertVoteByChainTaskId(params: {
    chainTaskId: bigint
    voter: string
    decision: number
    txHash: string
  }) {
    // 实现步骤：
    // 1. 找到仲裁记录与投票人。
    // 2. 创建或更新投票记录。
    const taskId = await this.findTaskIdByChainTaskId(params.chainTaskId)
    if (!taskId) {
      return
    }
    const arbitration = await this.prismaService.arbitrations.findUnique({
      where: { task_id: taskId },
    })
    if (!arbitration) {
      return
    }
    const voterAddress = ethers.getAddress(params.voter)
    const voterUser = await this.prismaService.users.findUnique({
      where: { wallet_address: voterAddress },
    })
    if (!voterUser) {
      return
    }

    const support: $Enums.vote_support =
      Number(params.decision) === 0 ? 'buyer' : 'seller'

    await this.prismaService.arbitration_votes.upsert({
      where: {
        arbitration_id_voter_id: {
          arbitration_id: arbitration.id,
          voter_id: voterUser.id,
        },
      },
      update: {
        support,
        tx_hash: params.txHash,
      },
      create: {
        id: randomUUID(),
        arbitration_id: arbitration.id,
        voter_id: voterUser.id,
        support,
        weight: '1',
        tx_hash: params.txHash,
        created_at: new Date(),
      },
    })
  }

  private async updateArbitrationStatusByChainTaskId(params: {
    chainTaskId: bigint
    result: number
  }) {
    // 实现步骤：
    // 1. 定位仲裁记录。
    // 2. 按链上结果更新状态。
    const taskId = await this.findTaskIdByChainTaskId(params.chainTaskId)
    if (!taskId) {
      return
    }
    const status: $Enums.arbitration_status =
      Number(params.result) === 0 ? 'resolved_buyer' : 'resolved_seller'
    await this.prismaService.arbitrations.updateMany({
      where: { task_id: taskId },
      data: {
        status,
        resolved_at: new Date(),
      },
    })
  }

  private async updateDaoMemberStake(
    walletAddress: string,
    amount: bigint,
    action: 'stake' | 'unstake',
  ) {
    // 实现步骤：
    // 1. 找到用户与 DAO 成员记录。
    // 2. 更新质押金额与投票权。
    const address = ethers.getAddress(walletAddress)
    const user = await this.prismaService.users.findUnique({
      where: { wallet_address: address },
    })
    if (!user) {
      return
    }

    const current = await this.prismaService.dao_members.findUnique({
      where: { user_id: user.id },
    })
    const delta = new Prisma.Decimal(amount.toString())
    const currentStake = current
      ? new Prisma.Decimal(current.staked_amount)
      : new Prisma.Decimal(0)
    const nextStake =
      action === 'stake' ? currentStake.plus(delta) : currentStake.minus(delta)
    const normalized = nextStake.lessThan(0) ? new Prisma.Decimal(0) : nextStake

    await this.prismaService.dao_members.upsert({
      where: { user_id: user.id },
      update: {
        staked_amount: normalized.toString(),
        voting_power: normalized.toString(),
      },
      create: {
        id: randomUUID(),
        user_id: user.id,
        staked_amount: normalized.toString(),
        voting_power: normalized.toString(),
        joined_at: new Date(),
      },
    })
  }

  private async updateWalletBalance(
    walletAddress: string,
    amount: bigint,
    direction: 'credit' | 'debit',
  ) {
    // 实现步骤：
    // 1. 通过地址找到用户。
    // 2. 更新 wallet_balances 余额。
    const user = await this.prismaService.users.findUnique({
      where: { wallet_address: walletAddress },
    })
    if (!user) {
      return
    }
    const delta = amount.toString()
    const existing = await this.prismaService.wallet_balances.findUnique({
      where: { user_id: user.id },
    })
    if (!existing) {
      await this.prismaService.wallet_balances.create({
        data: {
          user_id: user.id,
          available: direction === 'credit' ? delta : '0',
          locked: '0',
          updated_at: new Date(),
        },
      })
      return
    }

    const available =
      direction === 'credit'
        ? new Prisma.Decimal(existing.available).plus(delta)
        : new Prisma.Decimal(existing.available).minus(delta)
    await this.prismaService.wallet_balances.update({
      where: { user_id: user.id },
      data: {
        available: available.toString(),
        updated_at: new Date(),
      },
    })
  }

  private async completePaymentByTxHash(txHash: string, tokensOut: bigint) {
    // 实现步骤：
    // 1. 按 tx_hash 找到支付记录。
    // 2. 更新状态为 completed，并写入实际到账金额。
    const payment = await this.prismaService.payments.findFirst({
      where: { tx_hash: txHash },
    })
    if (!payment) {
      return
    }
    await this.prismaService.payments.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        amount: tokensOut.toString(),
      },
    })
  }

  private readAbi(fileName: string) {
    const abiPath = join(process.cwd(), 'abis', fileName)
    return JSON.parse(readFileSync(abiPath, 'utf-8'))
  }
}
