import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { randomUUID } from 'crypto'

import type { JwtPayload } from '../Auth/jwt.strategy'
import { EscrowService } from '../Escrow/escrow.service'
import { PrismaService } from '../../Database/prisma.service'
import { NotificationsService } from '../Notifications/notifications.service'
import { CreateTaskDto, DeliverDto, ListTasksQueryDto } from './dto/task.dto'
import { AgentInvocationService } from '../AgentInvocation/agent-invocation.service'

// 任务业务服务：生命周期管理。
@Injectable()
export class TasksService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly escrowService: EscrowService,
    private readonly agentInvocationService: AgentInvocationService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createTask(user: JwtPayload, dto: CreateTaskDto) {
    // 实现步骤：
    // 1. 创建任务记录并初始化状态。
    // 2. 记录 created 事件。
    // 3. 洗牌挑选 3 个 Agent 并发起调用。

    const taskId = randomUUID()
    const prisma = this.prismaService as any
    const createdTask = await prisma.$transaction(
      async (tx: any) => {
        const now = new Date()
        const task = await tx.tasks.create({
          data: {
            id: taskId,
            buyer_id: user.userId,
            agent_id: dto.agent_id,
            title: dto.title,
            description: dto.description,
            budget_usd: dto.budget_usd,
            platform_fee: dto.platform_fee,
            token_symbol: dto.token_symbol ?? 'USDT',
            chain_id: dto.chain_id ? BigInt(dto.chain_id) : undefined,
            create_tx_hash: dto.tx_hash,
            buyer_wallet_address: dto.buyer_wallet_address,
            status: 'created',
            review_deadline: dto.review_deadline
              ? new Date(dto.review_deadline)
              : undefined,
            created_at: now,
          },
        })

        await tx.task_events.create({
          data: {
            id: randomUUID(),
            task_id: taskId,
            type: 'created',
            actor_id: user.userId,
            created_at: now,
          },
        })

        return task
      },
      {
        maxWait: 300000,
        timeout: 300000,
      },
    )

    // 实现步骤：
    // 1. 获取可用 Agent 列表。
    // 2. 洗牌后挑选 3 个。
    // 3. 记录分配事件并发起调用（不阻塞主流程）。
    const availableAgents = await this.pickAgentsForTask()
    if (availableAgents.length > 0) {
      const selected = this.shuffleAgents(availableAgents).slice(0, 3)
      const agentIds = selected.map((agent) => agent.id)

      await prisma.task_events.create({
        data: {
          id: randomUUID(),
          task_id: taskId,
          type: 'agent_invocation_started',
          actor_id: user.userId,
          data: { agent_ids: agentIds },
          created_at: new Date(),
        },
      })

      if (!createdTask.agent_id) {
        await prisma.tasks.update({
          where: { id: taskId },
          data: { agent_id: agentIds[0] },
        })
      }

      const buyerWallet =
        user.walletAddress ??
        (
          await prisma.users.findUnique({
            where: { id: user.userId },
            select: { wallet_address: true },
          })
        )?.wallet_address

      if (
        buyerWallet &&
        process.env.NODE_ENV !== 'test' &&
        process.env.DISABLE_AGENT_INVOCATION !== 'true'
      ) {
        const inputPayload = {
          description: createdTask.description ?? '',
        }
        setImmediate(() => {
          Promise.all(
            selected.map((agent) =>
              this.agentInvocationService.executeInvocation(
                taskId,
                agent.id,
                user.userId,
                buyerWallet,
                {
                  task_id: taskId,
                  input: inputPayload,
                },
              ),
            ),
          ).catch(() => {
            // 仅记录异常，不影响主流程。
          })
        })
      }
    }

    return createdTask
  }

  private async pickAgentsForTask() {
    // 实现步骤：
    // 1. 优先挑选在线且可用的 Agent。
    // 2. 不足时补充可用 Agent。
    const online = await this.prismaService.agents.findMany({
      where: { status: 'active', is_online: true },
      select: { id: true },
    })
    if (online.length >= 3) {
      return online
    }
    const active = await this.prismaService.agents.findMany({
      where: { status: 'active' },
      select: { id: true },
    })
    return active
  }

  private shuffleAgents<T>(items: T[]) {
    // 实现步骤：
    // 1. 使用 Fisher-Yates 算法洗牌。
    // 2. 返回新数组。
    const list = items.slice()
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = list[i]
      list[i] = list[j]
      list[j] = temp
    }
    return list
  }

  async listTasks(user: JwtPayload, query: ListTasksQueryDto) {
    // 实现步骤：
    // 1. 根据查询参数构建查询条件。
    // 2. 追加状态与关键词过滤。
    // 3. 返回分页结果。
    const page = Math.max(1, query.page ?? 1)
    const limit = Math.min(100, Math.max(1, query.limit ?? 20))
    const skip = (page - 1) * limit

    const prisma = this.prismaService as any
    const where: Record<string, unknown> = {}

    // Filter by buyer or agent based on query parameter
    if (query.role === 'buyer') {
      where.buyer_id = user.userId
    } else if (query.role === 'agent') {
      const agents = await prisma.agents.findMany({
        where: { user_id: user.userId },
        select: { id: true },
      })
      if (agents.length === 0) {
        return { items: [], page, limit, total: 0 }
      }
      where.agent_id = { in: agents.map((item: { id: string }) => item.id) }
    }

    if (query.status) {
      where.status = query.status
    }

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.tasks.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.tasks.count({ where }),
    ])

    return { items, page, limit, total }
  }

  async getTaskDetail(id: string) {
    // 实现步骤：
    // 1. 查询任务基础信息。
    // 2. 聚合交付物、事件与托管。
    const prisma = this.prismaService as any
    const task = await prisma.tasks.findUnique({
      where: { id },
      include: {
        task_deliverables: { orderBy: { version: 'desc' } },
        task_events: { orderBy: { created_at: 'desc' } },
        escrows: true,
      },
    })
    if (!task) {
      throw new NotFoundException('任务不存在')
    }

    return {
      task,
      deliverables: task.task_deliverables,
      events: task.task_events,
      escrow: task.escrows,
    }
  }

  async listTaskAgents(taskId: string) {
    // 实现步骤：
    // 1. 校验任务存在。
    // 2. 读取最新的 Agent 分配事件。
    // 3. 返回 Agent 基础信息（名称+简介）。
    const prisma = this.prismaService as any
    const task = await prisma.tasks.findUnique({ where: { id: taskId } })
    if (!task) {
      throw new NotFoundException('任务不存在')
    }

    const latestAssign = await prisma.task_events.findFirst({
      where: { task_id: taskId, type: 'agent_invocation_started' },
      orderBy: { created_at: 'desc' },
    })

    const agentIds =
      (latestAssign?.data as { agent_ids?: string[] } | null)?.agent_ids ?? []
    if (!Array.isArray(agentIds) || agentIds.length === 0) {
      return { items: [] }
    }

    const agents = await prisma.agents.findMany({
      where: { id: { in: agentIds } },
      select: { id: true, display_name: true, bio: true },
    })

    const agentMap = new Map(
      agents.map((agent: { id: string }) => [agent.id, agent]),
    )
    const ordered = agentIds.map((id) => agentMap.get(id)).filter(Boolean)

    return { items: ordered }
  }

  async listTaskAgentResults(taskId: string) {
    // 实现步骤：
    // 1. 校验任务存在。
    // 2. 读取最新的 Agent 分配事件。
    // 3. 返回对应 Agent 的最新执行结果。
    const prisma = this.prismaService as any
    const task = await prisma.tasks.findUnique({ where: { id: taskId } })
    if (!task) {
      throw new NotFoundException('任务不存在')
    }

    const latestAssign = await prisma.task_events.findFirst({
      where: { task_id: taskId, type: 'agent_invocation_started' },
      orderBy: { created_at: 'desc' },
    })

    const agentIds =
      (latestAssign?.data as { agent_ids?: string[] } | null)?.agent_ids ?? []
    if (!Array.isArray(agentIds) || agentIds.length === 0) {
      return { items: [] }
    }

    const invocations = await prisma.agent_invocations.findMany({
      where: { task_id: taskId, agent_id: { in: agentIds } },
      orderBy: { started_at: 'desc' },
      select: { agent_id: true, result: true },
    })

    const resultMap = new Map<string, unknown>()
    for (const invocation of invocations) {
      if (!resultMap.has(invocation.agent_id)) {
        resultMap.set(invocation.agent_id, invocation.result ?? null)
      }
    }

    return {
      items: agentIds.map((agentId) => ({
        agent_id: agentId,
        result: resultMap.get(agentId) ?? null,
      })),
    }
  }

  async acceptTask(id: string, user: JwtPayload) {
    // 实现步骤：
    // 1. 校验用户拥有 Agent 且 Agent 状态为 active。
    // 2. 绑定 agent_id 并更新状态与时间。
    // 3. 记录 accepted 事件。

    const prisma = this.prismaService as any
    const agent = await prisma.agents.findFirst({
      where: { user_id: user.userId, status: 'active' },
      orderBy: { created_at: 'desc' },
    })
    if (!agent) {
      throw new ForbiddenException('您没有 Agent 档案')
    }

    const task = await prisma.tasks.findUnique({ where: { id } })
    if (!task) {
      throw new NotFoundException('任务不存在')
    }
    if (task.status !== 'created') {
      throw new BadRequestException('当前任务状态无法接单')
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      const now = new Date()
      const task = await tx.tasks.update({
        where: { id },
        data: {
          agent_id: agent.id,
          status: 'accepted',
          accepted_at: now,
        },
      })

      await tx.task_events.create({
        data: {
          id: randomUUID(),
          task_id: id,
          type: 'accepted',
          actor_id: user.userId,
          created_at: now,
        },
      })

      return task
    })

    // 触发通知：任务被接单。
    await this.notificationsService.create(
      updated.buyer_id,
      'task_update',
      '任务已被接单',
      `任务 ${updated.title} 已被 Agent 接单`,
    )

    // 测试环境跳过异步调用，避免测试结束后仍在运行的异步任务。
    if (
      process.env.NODE_ENV === 'test' ||
      process.env.DISABLE_AGENT_INVOCATION === 'true'
    ) {
      return updated
    }

    // 异步触发 Agent 调用，不阻塞接单流程。
    setImmediate(() => {
      this.agentInvocationService.invokeForTask(id, agent.id).catch(() => {
        // 避免测试或进程退出时出现多余日志。
      })
    })

    return updated
  }

  async deliverTask(id: string, user: JwtPayload, dto: DeliverDto) {
    // 实现步骤：
    // 1. 校验任务与 Agent 权限。
    // 2. 创建交付物并更新任务状态。
    // 3. 记录 delivered 事件。
    const prisma = this.prismaService as any
    const task = await prisma.tasks.findUnique({ where: { id } })
    if (!task) {
      throw new NotFoundException('任务不存在')
    }
    const assignedAgent = task.agent_id
      ? await prisma.agents.findUnique({ where: { id: task.agent_id } })
      : null
    if (!assignedAgent || assignedAgent.user_id !== user.userId) {
      throw new ForbiddenException('当前用户无 Agent 身份')
    }
    if (!task.agent_id || task.agent_id !== assignedAgent.id) {
      throw new ForbiddenException('无权限提交该任务交付物')
    }
    if (!['accepted', 'in_progress'].includes(task.status)) {
      throw new BadRequestException('当前任务状态无法交付')
    }

    const deliverable = await prisma.$transaction(async (tx: any) => {
      const now = new Date()
      const latest = await tx.task_deliverables.findFirst({
        where: { task_id: id },
        orderBy: { version: 'desc' },
      })
      const nextVersion = (latest?.version ?? 0) + 1

      const deliverable = await tx.task_deliverables.create({
        data: {
          id: randomUUID(),
          task_id: id,
          version: nextVersion,
          title: dto.title,
          content_url: dto.content_url,
          notes: dto.notes,
          created_at: now,
        },
      })

      await tx.tasks.update({
        where: { id },
        data: {
          status: 'pending_review',
          delivered_at: now,
        },
      })

      await tx.task_events.create({
        data: {
          id: randomUUID(),
          task_id: id,
          type: 'delivered',
          actor_id: user.userId,
          created_at: now,
        },
      })

      return deliverable
    })

    // 触发通知：任务已交付。
    await this.notificationsService.create(
      task.buyer_id,
      'task_update',
      '任务已交付',
      `任务 ${task.title} 已提交交付物`,
    )

    return deliverable
  }

  async completeTask(id: string, user: JwtPayload) {
    // 实现步骤：
    // 1. 校验买家权限与任务状态。
    // 2. 更新任务状态。
    // 3. 记录 completed 事件。
    const prisma = this.prismaService as any
    const task = await prisma.tasks.findUnique({ where: { id } })
    if (!task) {
      throw new NotFoundException('任务不存在')
    }
    if (task.buyer_id !== user.userId) {
      throw new ForbiddenException('无权限验收该任务')
    }
    if (task.status !== 'pending_review') {
      throw new BadRequestException('当前任务状态无法验收')
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      const now = new Date()
      const updated = await tx.tasks.update({
        where: { id },
        data: { status: 'completed' },
      })

      await tx.task_events.create({
        data: {
          id: randomUUID(),
          task_id: id,
          type: 'completed',
          actor_id: user.userId,
          created_at: now,
        },
      })

      // 触发放款逻辑
      await this.escrowService.releaseEscrow(id, user.userId)

      return updated
    })

    if (task.agent_id) {
      const agent = await prisma.agents.findUnique({
        where: { id: task.agent_id },
      })
      if (agent) {
        await this.notificationsService.create(
          agent.user_id,
          'task_update',
          '任务已验收',
          `任务 ${task.title} 已完成验收`,
        )
      }
    }

    return updated
  }

  async executeTask(
    id: string,
    user: JwtPayload,
    payload: Record<string, unknown>,
  ) {
    // 实现步骤：
    // 1. 校验任务存在、买家权限、状态与托管状态。
    // 2. 调用 Agent 执行并记录调用结果。
    // 3. 返回 Agent 输出。
    const prisma = this.prismaService as any
    const task = await prisma.tasks.findUnique({
      where: { id },
      include: { escrows: true, users: true },
    })
    if (!task) {
      throw new NotFoundException('任务不存在')
    }
    if (task.buyer_id !== user.userId) {
      throw new ForbiddenException('无权限执行该任务')
    }
    if (task.status !== 'pending_review') {
      throw new BadRequestException('当前任务状态无法执行')
    }
    if (!task.escrows || task.escrows.status !== 'locked') {
      throw new BadRequestException('托管状态不允许执行')
    }
    if (!task.agent_id) {
      throw new BadRequestException('未绑定 Agent')
    }

    const output = await this.agentInvocationService.executeInvocation(
      task.id,
      task.agent_id,
      user.userId,
      task.users.wallet_address,
      {
        task_id: task.id,
        input: payload,
      },
    )
    return { output }
  }

  async cancelTask(id: string, user: JwtPayload) {
    // 实现步骤：
    // 1. 校验买家权限与任务状态。
    // 2. 更新任务状态。
    // 3. 记录 cancelled 事件。
    const prisma = this.prismaService as any
    const task = await prisma.tasks.findUnique({ where: { id } })
    if (!task) {
      throw new NotFoundException('任务不存在')
    }
    if (task.buyer_id !== user.userId) {
      throw new ForbiddenException('无权限取消该任务')
    }
    if (task.status !== 'created' && task.status !== 'accepted') {
      throw new BadRequestException('当前任务状态无法取消')
    }

    return prisma.$transaction(async (tx: any) => {
      const now = new Date()
      const updated = await tx.tasks.update({
        where: { id },
        data: { status: 'cancelled' },
      })

      await tx.task_events.create({
        data: {
          id: randomUUID(),
          task_id: id,
          type: 'cancelled',
          actor_id: user.userId,
          created_at: now,
        },
      })

      // 触发退款逻辑
      await this.escrowService.refundEscrow(id, user.userId)

      return updated
    })
  }
}
