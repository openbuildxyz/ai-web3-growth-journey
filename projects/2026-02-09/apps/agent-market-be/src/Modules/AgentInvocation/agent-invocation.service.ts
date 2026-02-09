import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { firstValueFrom } from 'rxjs'
import { createHash, createHmac } from 'crypto'
import type { StringValue } from 'ms'
import { PrismaService } from '../../Database/prisma.service'
import { $Enums } from '../../../generated/prisma/client'

type InvocationResult = {
  success: boolean
  responseHash?: string
  responseBody?: unknown
  errorMessage?: string
}

// 业务模块：Agent 调用与执行。
@Injectable()
export class AgentInvocationService {
  private readonly logger = new Logger(AgentInvocationService.name)

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async invokeForTask(taskId: string, agentId: string) {
    // 实现步骤：
    // 1. 读取 Agent 配置与校验调用信息。
    // 2. 创建 agent_invocations 记录并计算 request_hash。
    // 3. 发送调用请求并更新状态。
    const agent = await this.prismaService.agents.findUnique({
      where: { id: agentId },
    })
    const baseUrl = agent?.base_url ?? null
    const invokePath = agent?.invoke_path ?? null
    if (!agent || !baseUrl || !invokePath) {
      this.logger.warn(`Agent ${agentId} 无可用调用地址`)
      return
    }

    const task = await this.prismaService.tasks.findUnique({
      where: { id: taskId },
      select: {
        buyer_id: true,
        buyer_wallet_address: true,
        users: {
          select: { wallet_address: true },
        },
      },
    })
    if (!task) {
      this.logger.warn(`Task ${taskId} 不存在，无法创建调用记录`)
      return
    }
    const requesterUserId = task.buyer_id
    const requesterWalletAddress =
      task.buyer_wallet_address ?? task.users?.wallet_address ?? null
    if (!requesterWalletAddress) {
      this.logger.warn(`Task ${taskId} 无买家钱包地址，无法创建调用记录`)
      return
    }

    const basePayload = {
      task_id: taskId,
      agent_id: agentId,
      callback_url: this.buildCallbackUrl(agentId),
    }
    const requestHash = this.hashPayload(basePayload)
    const invocation = await this.prismaService.agent_invocations.create({
      data: {
        task_id: taskId,
        agent_id: agentId,
        requester_user_id: requesterUserId,
        requester_wallet_address: requesterWalletAddress,
        status: 'pending',
        request_hash: requestHash,
        created_at: new Date(),
      },
    })

    const payload = {
      ...basePayload,
      invocation_id: invocation.id.toString(),
    }
    const finalHash = this.hashPayload(payload)
    if (finalHash !== requestHash) {
      await this.prismaService.agent_invocations.update({
        where: { id: invocation.id },
        data: { request_hash: finalHash },
      })
    }

    await this.prismaService.agent_invocations.update({
      where: { id: invocation.id },
      data: {
        status: 'running',
      },
    })

    const result = await this.callAgent(
      {
        id: agent.id,
        base_url: baseUrl,
        invoke_path: invokePath,
        auth_type: agent.auth_type,
        auth_secret_hash: agent.auth_secret_hash,
        timeout_ms: agent.timeout_ms,
      },
      payload,
    )
    const status: $Enums.agent_invocation_status = result.success
      ? 'success'
      : result.errorMessage === 'timeout'
        ? 'timeout'
        : 'failed'

    await (this.prismaService as any).agent_invocations.update({
      where: { id: invocation.id },
      data: {
        status,
        response_hash: result.responseHash,
        result: result.responseBody ?? null,
        error_message: result.errorMessage,
        finished_at: new Date(),
      },
    })
  }

  async executeInvocation(
    taskId: string,
    agentId: string,
    requester_user_id: string,
    requester_wallet_address: string,
    payload: Record<string, unknown>,
  ) {
    // 实现步骤：
    // 1. 读取 Agent 配置并创建调用记录。
    // 2. 发起调用并更新状态。
    // 3. 返回响应或抛出调用失败异常。
    const agent = await this.prismaService.agents.findUnique({
      where: { id: agentId },
    })
    const baseUrl = agent?.base_url ?? null
    const invokePath = agent?.invoke_path ?? null
    if (!agent || !baseUrl || !invokePath) {
      throw new NotFoundException('Agent 调用地址不存在')
    }

    const basePayload = {
      ...payload,
      callback_url: this.buildCallbackUrl(agentId),
    }
    const requestHash = this.hashPayload(basePayload)
    const invocation = await this.prismaService.agent_invocations.create({
      data: {
        task_id: taskId,
        agent_id: agentId,
        requester_user_id,
        requester_wallet_address,
        status: 'pending',
        request_hash: requestHash,
        created_at: new Date(),
      },
    })

    const callPayload = {
      ...basePayload,
      invocation_id: invocation.id.toString(),
    }
    const finalHash = this.hashPayload(callPayload)
    if (finalHash !== requestHash) {
      await this.prismaService.agent_invocations.update({
        where: { id: invocation.id },
        data: { request_hash: finalHash },
      })
    }

    await this.prismaService.agent_invocations.update({
      where: { id: invocation.id },
      data: { status: 'running' },
    })

    const result = await this.callAgent(
      {
        id: agent.id,
        base_url: baseUrl,
        invoke_path: invokePath,
        auth_type: agent.auth_type,
        auth_secret_hash: agent.auth_secret_hash,
        timeout_ms: agent.timeout_ms,
      },
      callPayload,
    )
    const status: $Enums.agent_invocation_status = result.success
      ? 'success'
      : result.errorMessage === 'timeout'
        ? 'timeout'
        : 'failed'

    await (this.prismaService as any).agent_invocations.update({
      where: { id: invocation.id },
      data: {
        status,
        response_hash: result.responseHash,
        result: result.responseBody ?? null,
        error_message: result.errorMessage,
        finished_at: new Date(),
      },
    })

    if (!result.success) {
      throw new InternalServerErrorException('Agent 调用失败')
    }

    return result.responseBody ?? {}
  }

  async callback(invocationId: bigint, body: unknown) {
    // 实现步骤：
    // 1. 校验回调来源（预留）。
    // 2. 记录回调内容并更新状态。
    await this.storeInvocationResult({
      invocationId,
      result: body,
    })
  }

  async storeAgentResult(agentId: string, body: unknown) {
    // 实现步骤：
    // 1. 解析 invocation_id 或 task_id。
    // 2. 校验调用记录归属并写入结果。
    const payload = body as Record<string, unknown>
    const rawInvocationId = payload?.invocation_id
    const rawTaskId = payload?.task_id
    const result = Object.prototype.hasOwnProperty.call(payload, 'result')
      ? (payload as Record<string, unknown>).result
      : body

    let invocationId: bigint | null = null
    if (rawInvocationId !== undefined && rawInvocationId !== null) {
      invocationId = BigInt(String(rawInvocationId))
    } else if (rawTaskId) {
      const latest = await this.prismaService.agent_invocations.findFirst({
        where: {
          agent_id: agentId,
          task_id: String(rawTaskId),
          status: { in: ['pending', 'running'] },
        },
        orderBy: { created_at: 'desc' },
      })
      invocationId = latest?.id ?? null
    }

    if (!invocationId) {
      throw new BadRequestException('缺少 invocation_id 或 task_id')
    }

    const existing = await this.prismaService.agent_invocations.findUnique({
      where: { id: invocationId },
    })
    if (!existing) {
      throw new NotFoundException('调用记录不存在')
    }
    if (existing.agent_id !== agentId) {
      throw new NotFoundException('调用记录不存在')
    }

    await this.storeInvocationResult({
      invocationId,
      result,
    })
  }

  private async callAgent(
    agent: {
      id: string
      base_url: string
      invoke_path: string
      auth_type?: $Enums.agent_auth_type | null
      auth_secret_hash?: string | null
      timeout_ms?: number | null
    },
    payload: Record<string, unknown>,
  ): Promise<InvocationResult> {
    const url = `${agent.base_url}${agent.invoke_path}`
    const timeout =
      agent.timeout_ms ??
      this.configService.get<number>('AGENT_INVOKE_TIMEOUT_MS', 30000)
    const headers = await this.buildAuthHeaders(agent, payload)

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers,
          timeout,
        }),
      )
      return {
        success: true,
        responseHash: this.hashPayload(response.data ?? {}),
        responseBody: response.data ?? {},
      }
    } catch (error) {
      const err = error as { code?: string; message?: string }
      if (err.code === 'ECONNABORTED') {
        return { success: false, errorMessage: 'timeout' }
      }
      return { success: false, errorMessage: err.message ?? 'invoke_failed' }
    }
  }

  private async buildAuthHeaders(
    agent: {
      id: string
      auth_type?: $Enums.agent_auth_type | null
      auth_secret_hash?: string | null
    },
    payload: Record<string, unknown>,
  ) {
    // 实现步骤：
    // 1. 按 auth_type 生成认证头。
    // 2. 无鉴权返回空头。
    if (!agent.auth_type || !agent.auth_secret_hash) {
      return {}
    }

    if (agent.auth_type === 'platform_hmac') {
      const body = JSON.stringify(payload)
      const signature = createHmac('sha256', agent.auth_secret_hash)
        .update(body)
        .digest('hex')
      return {
        'X-Signature': signature,
      }
    }

    if (agent.auth_type === 'platform_jwt') {
      const token = this.jwtService.sign(payload, {
        secret: agent.auth_secret_hash,
        expiresIn: this.configService.get<StringValue>(
          'AGENT_JWT_EXPIRES_IN',
          '5m',
        ),
      })
      return {
        Authorization: `Bearer ${token}`,
      }
    }

    return {}
  }

  private hashPayload(payload: unknown) {
    return createHash('sha256').update(JSON.stringify(payload)).digest('hex')
  }

  private async storeInvocationResult(params: {
    invocationId: bigint
    result: unknown
  }) {
    const responseHash = this.hashPayload(params.result ?? {})
    await (this.prismaService as any).agent_invocations.update({
      where: { id: params.invocationId },
      data: {
        status: 'success',
        response_hash: responseHash,
        result: params.result ?? null,
        error_message: null,
        finished_at: new Date(),
      },
    })
  }

  private buildCallbackUrl(agentId: string) {
    const baseUrl = this.configService.get<string>('PLATFORM_BASE_URL')
    if (!baseUrl) {
      throw new InternalServerErrorException('未配置 PLATFORM_BASE_URL')
    }
    return `${baseUrl.replace(/\/$/, '')}/agent/${agentId}/result`
  }
}
