import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { randomBytes, randomUUID } from 'crypto'
import type { Prisma } from '../../../generated/prisma/client'
import { $Enums } from '../../../generated/prisma/client'
import { PrismaService } from '../../Database/prisma.service'
import type { JwtPayload } from '../Auth/jwt.strategy'
import {
  CreateAgentDto,
  ListAgentsQueryDto,
  UpdateAgentDto,
} from './dto/agent.dto'

// Agent 业务服务：档案管理与列表查询。
@Injectable()
export class AgentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createAgent(user: JwtPayload, dto: CreateAgentDto) {
    // 实现步骤：
    // 1. 检查 base_url + invoke_path 是否重复。
    // 2. 处理标签字典与关联表。
    // 3. 创建 Agent 档案（默认状态 draft）。

    // 如果前端未传必填字段，直接报错提示补齐。
    if (
      !dto.auth_secret_hash ||
      !dto.base_url ||
      !dto.invoke_path ||
      !dto.display_name ||
      !dto.bio
    ) {
      throw new BadRequestException('缺少必填字段')
    }

    const existing = await this.prismaService.agents.findFirst({
      where: {
        user_id: user.userId,
        base_url: dto.base_url,
        invoke_path: dto.invoke_path,
      },
    })
    if (existing) {
      throw new BadRequestException('该 Agent 已存在')
    }

    const tags = this.normalizeTagArray(dto.tags)
    return this.prismaService.$transaction(async (tx) => {
      // TODO: 前端传入的tags应该类似于{id: 1,name: "a"}，这样让后端通过Id快速查找标签，如果不存在的情况通过传入的name新增出来。
      const tagIds = await this.ensureTags(tx, tags)
      const agent = await tx.agents.create({
        data: {
          id: randomUUID(),
          user_id: user.userId,
          auth_type: dto.auth_type as $Enums.agent_auth_type | 'platform_jwt',
          auth_secret_hash: dto.auth_secret_hash,
          base_url: dto.base_url,
          invoke_path: dto.invoke_path,
          status: 'draft',
          display_name: dto.display_name,
          avatar: dto.avatar,
          bio: dto.bio,
          price_per_task: dto.price_per_task,
          response_time: dto.response_time,
          tags,
          created_at: new Date(),
        },
      })

      if (tagIds.length > 0) {
        await tx.agent_tags.createMany({
          data: tagIds.map((tagId) => ({
            agent_id: agent.id,
            tag_id: tagId,
            created_at: new Date(),
          })),
          skipDuplicates: true,
        })
      }

      return agent
    })
  }

  async listAgents(query: ListAgentsQueryDto, user: JwtPayload) {
    // 实现步骤：
    // 1. 解析分页与过滤条件。
    // 2. 查询列表并返回分页结果。
    const page = Math.max(1, query.page ?? 1)
    const limit = Math.min(100, Math.max(1, query.limit ?? 20))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (query.q) {
      where.OR = [
        { display_name: { contains: query.q, mode: 'insensitive' } },
        { bio: { contains: query.q, mode: 'insensitive' } },
      ]
    }

    const tagList = this.normalizeTags(query.tags)
    if (tagList.length > 0) {
      where.tags = { hasSome: tagList }
    }

    if (query.min_rating !== undefined) {
      where.rating = { gte: query.min_rating }
    }

    if (query.is_online !== undefined) {
      where.is_online = query.is_online
    }

    if (query.view === 'mine') {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        { user_id: user.userId },
      ]
    } else {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        { is_online: true },
      ]
    }

    const [items, total] = await Promise.all([
      this.prismaService.agents.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prismaService.agents.count({ where }),
    ])

    return {
      items,
      page,
      limit,
      total,
    }
  }

  async getAgentById(id: string) {
    // 实现步骤：
    // 1. 查询 Agent。
    // 2. 不存在则抛错。
    const agent = await this.prismaService.agents.findUnique({
      where: { id },
    })
    if (!agent) {
      throw new NotFoundException('Agent 不存在')
    }
    return agent
  }

  async updateAgent(id: string, user: JwtPayload, dto: UpdateAgentDto) {
    // 实现步骤：
    // 1. 校验 Agent 存在与所有权。
    // 2. 检查更新后的 base_url + invoke_path 是否重复。
    // 3. 同步标签字典与关联表。
    const agent = await this.prismaService.agents.findUnique({
      where: { id },
    })
    if (!agent) {
      throw new NotFoundException('Agent 不存在')
    }
    if (agent.user_id !== user.userId) {
      throw new ForbiddenException('您不拥有该 Agent')
    }

    if (!agent.auth_secret_hash && !dto.auth_secret_hash) {
      throw new BadRequestException('缺少鉴权密钥')
    }

    if (dto.base_url || dto.invoke_path) {
      const targetBaseUrl = dto.base_url ?? agent.base_url
      const targetInvokePath = dto.invoke_path ?? agent.invoke_path
      if (targetBaseUrl && targetInvokePath) {
        const duplicate = await this.prismaService.agents.findFirst({
          where: {
            user_id: user.userId,
            base_url: targetBaseUrl,
            invoke_path: targetInvokePath,
            NOT: { id },
          },
        })
        if (duplicate) {
          throw new BadRequestException('该 Agent 已存在')
        }
      }
    }

    const tags = dto.tags ? this.normalizeTagArray(dto.tags) : undefined
    return this.prismaService.$transaction(async (tx) => {
      if (tags) {
        const tagIds = await this.ensureTags(tx, tags)
        await tx.agent_tags.deleteMany({ where: { agent_id: id } })
        if (tagIds.length > 0) {
          await tx.agent_tags.createMany({
            data: tagIds.map((tagId) => ({
              agent_id: id,
              tag_id: tagId,
              created_at: new Date(),
            })),
            skipDuplicates: true,
          })
        }
      }

      return tx.agents.update({
        where: { id },
        data: {
          auth_type: dto.auth_type as $Enums.agent_auth_type | undefined,
          auth_secret_hash: dto.auth_secret_hash,
          base_url: dto.base_url,
          invoke_path: dto.invoke_path,
          display_name: dto.display_name,
          avatar: dto.avatar,
          bio: dto.bio,
          price_per_task: dto.price_per_task,
          response_time: dto.response_time,
          tags,
          is_online: false,
          status: 'draft',
        },
      })
    })
  }

  async setOnlineStatus(id: string, user: JwtPayload, isOnline: boolean) {
    // 实现步骤：
    // 1. 校验 Agent 存在与所有权。
    // 2. 同步在线状态与业务状态。
    const agent = await this.prismaService.agents.findUnique({
      where: { id },
    })
    if (!agent) {
      throw new NotFoundException('Agent 不存在')
    }
    if (agent.user_id !== user.userId) {
      throw new ForbiddenException('您不拥有该 Agent')
    }

    return this.prismaService.agents.update({
      where: { id },
      data: {
        is_online: isOnline,
        status: isOnline ? 'active' : 'disabled',
      },
    })
  }

  async listTags() {
    // 实现步骤：
    // 1. 查询标签字典。
    // 2. 返回标签名称列表。
    const tags = await this.prismaService.agent_tag_dict.findMany({
      orderBy: { created_at: 'desc' },
    })
    return tags.map((item) => item.name)
  }

  async generateAgentSecret(taskId: string, user: JwtPayload) {
    // 实现步骤：
    // 1. 查询任务与关联 Agent，校验权限。
    // 2. 生成 Key/Secret 并更新 Agent 密钥。
    // 3. 返回明文（明文存储）。
    const task = await this.prismaService.tasks.findUnique({
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
    if (!task || !task.agent_id || !task.agents) {
      throw new NotFoundException('任务或 Agent 不存在')
    }
    const agentId = task.agent_id
    if (user.role !== 'seller' || task.agents.user_id !== user.userId) {
      throw new ForbiddenException('无权限生成密钥')
    }

    const keyId = this.generateKeyId()
    const secret = this.generateSecret()
    await this.prismaService.agents.update({
      where: { id: agentId },
      data: { auth_secret_hash: secret },
    })

    return { key_id: keyId, secret }
  }

  private normalizeTags(tags?: string) {
    // 实现步骤：
    // 1. 拆分逗号分隔字符串。
    // 2. 去除空白与空项。
    if (!tags) {
      return []
    }
    return tags
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  private generateKeyId() {
    return randomBytes(12).toString('hex')
  }

  private generateSecret() {
    return randomBytes(32).toString('hex')
  }

  private normalizeTagArray(tags?: string[]) {
    // 实现步骤：
    // 1. 清理空白与空项。
    // 2. 去重后返回。
    if (!tags) {
      return []
    }
    return Array.from(
      new Set(
        tags.map((item) => item.trim()).filter((item) => item.length > 0),
      ),
    )
  }

  private async ensureTags(
    tx: Prisma.TransactionClient,
    tags: string[],
  ): Promise<bigint[]> {
    // 实现步骤：
    // 1. 查询已存在标签。
    // 2. 批量创建缺失标签。
    // 3. 返回标签 ID 列表。
    if (tags.length === 0) {
      return []
    }
    const existing = await tx.agent_tag_dict.findMany({
      where: { name: { in: tags } },
    })
    const existingNames = new Set(existing.map((item) => item.name))
    const toCreate = tags.filter((name) => !existingNames.has(name))

    if (toCreate.length > 0) {
      await tx.agent_tag_dict.createMany({
        data: toCreate.map((name) => ({
          name,
          created_at: new Date(),
        })),
        skipDuplicates: true,
      })
    }

    const all = await tx.agent_tag_dict.findMany({
      where: { name: { in: tags } },
    })
    return all.map((item) => item.id)
  }
}
