import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common'
import { PrismaClient } from '../../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg' // 👈 必须显式引入 pg 的 Pool
import * as fs from 'fs'
import { RequestContext } from '../Common/context/request-context'
import { maskSensitiveData, safeJsonStringify } from '../Common/utils/log-utils'

const isLocalDatabase = (connectionString: string) => {
  try {
    const url = new URL(connectionString)
    const host = url.hostname
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.endsWith('.local')
    )
  } catch {
    return false
  }
}

// 基础设施服务：封装 Prisma Client 生命周期管理。
// Prisma client wrapper to manage lifecycle inside Nest.
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger('Prisma')
  private readonly createdAtModels: Set<string>
  private readonly updatedAtModels: Set<string>
  private readonly writeActions = new Set([
    'create',
    'update',
    'delete',
    'upsert',
    'createMany',
    'updateMany',
    'deleteMany',
  ])
  constructor() {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL 未配置')
    }

    // 1. 判断是否为本地数据库连接（本地不使用 SSL）
    const isLocal = isLocalDatabase(connectionString)

    // 2. 更加健壮的判断逻辑 (去除空格，防止 'false ' 这种低级错误)
    const rejectUnauthorizedEnv = process.env.DB_SSL_REJECT_UNAUTHORIZED?.trim()
    const shouldVerify = rejectUnauthorizedEnv !== 'false'
    const caPath = process.env.DB_SSL_CA_PATH?.trim()

    // 3. 构造 SSL 配置
    // 如果允许自签名(shouldVerify=false)，我们只传 rejectUnauthorized: false
    // 绝对不要传 ca: undefined，这可能会触发默认行为
    const sslConfig = isLocal
      ? undefined
      : shouldVerify
        ? {
            rejectUnauthorized: true,
            // 这里可以按需加载你的 CA 证书
            ca: caPath ? fs.readFileSync(caPath).toString() : undefined,
          }
        : {
            rejectUnauthorized: false,
          }

    // 4. 初始化 Pool
    // 注意：如果 DATABASE_URL 包含 ?sslmode=require，它可能会与这里的 ssl 配置冲突
    // 但通常对象配置(ssl: {...})优先级更高
    const pool = new Pool({
      connectionString,
      ssl: sslConfig,
    })

    // 4. 将 Pool 传给 Adapter
    const adapter = new PrismaPg(pool)

    // 5. 初始化 Prisma
    super({ adapter })

    this.createdAtModels = new Set([
      'users',
      'agents',
      'agent_tag_dict',
      'agent_tags',
      'tasks',
      'task_deliverables',
      'task_events',
      'escrows',
      'payments',
      'notifications',
      'arbitrations',
      'arbitration_votes',
      'reviews',
      'reputation_logs',
      'dao_members',
      'agent_invocations',
      'wallet_balances',
      'agent_api_credentials',
    ])
    this.updatedAtModels = new Set(['escrows', 'wallet_balances'])

    return this.wrapWithLogging()
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Database connected')
    const [row] = await this.$queryRawUnsafe<
      {
        current_user: string
        current_database: string
        inet_server_addr: string | null
      }[]
    >('select current_user, current_database(), inet_server_addr()')
    if (row) {
      this.logger.log(
        `DB identity user=${row.current_user} db=${row.current_database} host=${row.inet_server_addr}`,
      )
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log('Database connection closed')
  }

  private wrapWithLogging() {
    const delegateCache = new Map<string, any>()
    const wrapDelegate = (model: string, delegate: any) => {
      if (delegateCache.has(model)) {
        return delegateCache.get(model)
      }
      const proxy = new Proxy(delegate, {
        get: (target, prop: string | symbol) => {
          const value = (target as any)[prop]
          if (typeof prop !== 'string' || typeof value !== 'function') {
            return value
          }
          if (!this.writeActions.has(prop)) {
            return value.bind(target)
          }
          return async (...args: any[]) => {
            const ctx = RequestContext.get()
            const log = {
              type: 'db_operation',
              model,
              action: prop,
              user_id: ctx?.userId ?? null,
              request_id: ctx?.requestId ?? null,
              method: ctx?.method ?? null,
              path: ctx?.path ?? null,
              args: maskSensitiveData(args[0]),
            }
            this.logger.log(safeJsonStringify(log))
            return value.apply(target, args)
          }
        },
      })
      delegateCache.set(model, proxy)
      return proxy
    }

    const wrapClient = (client: any) =>
      new Proxy(client, {
        get: (target, prop: string | symbol, receiver) => {
          const value = Reflect.get(target, prop, receiver)
          if (prop === '$transaction' && typeof value === 'function') {
            return (...args: any[]) => {
              if (typeof args[0] === 'function') {
                const original = args[0]
                args[0] = (tx: any) => original(wrapClient(tx))
              }
              return value.apply(target, args)
            }
          }
          if (typeof prop === 'string' && value && typeof value === 'object') {
            if (typeof value.create === 'function') {
              return wrapDelegate(prop, value)
            }
          }
          return value
        },
      })

    return wrapClient(this)
  }
}
