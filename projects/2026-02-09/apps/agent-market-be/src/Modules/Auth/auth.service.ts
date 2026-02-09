import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { randomBytes, randomUUID } from 'crypto'
import { ethers } from 'ethers'
import { CacheService } from '../../Cache/cache.service'
import { PrismaService } from '../../Database/prisma.service'
import { $Enums } from '../../../generated/prisma/client'

type CachedChallenge = {
  nonce: string
  message: string
}

// 认证业务服务：挑战生成与签名登录。
@Injectable()
export class AuthService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  // 生成签名挑战，并缓存 nonce。
  createChallenge(address: string) {
    // 实现步骤：
    // 1. 规范化地址并生成随机 nonce。
    // 2. 生成待签名 message。
    // 3. 按 TTL 缓存挑战信息。
    const normalized = this.normalizeAddress(address)
    const nonce = randomBytes(16).toString('hex')
    const message = `Web3 Agent Market 登录验证\n\n地址: ${normalized}\nNonce: ${nonce}`

    const ttlMs = this.configService.get<number>(
      'AUTH_NONCE_TTL_MS',
      5 * 60 * 1000,
    )
    this.cacheService.set<CachedChallenge>(
      this.getCacheKey(normalized),
      { nonce, message },
      ttlMs,
    )

    return { nonce, message }
  }

  // 校验签名并签发 JWT。
  async login(
    address: string,
    signature: string,
    nonce: string,
    role?: $Enums.user_role,
  ) {
    // 实现步骤：
    // 1. 读取缓存挑战并验证 nonce。
    // 2. 校验签名地址一致。
    // 3. 创建或更新用户角色。
    // 4. 签发 JWT 返回。
    const normalized = this.normalizeAddress(address)
    const cached = this.cacheService.get<CachedChallenge>(
      this.getCacheKey(normalized),
    )

    if (!cached || cached.nonce !== nonce) {
      throw new UnauthorizedException('挑战已失效或 nonce 不匹配')
    }

    let recovered: string
    try {
      recovered = ethers.verifyMessage(cached.message, signature)
    } catch {
      throw new UnauthorizedException('签名校验失败')
    }

    if (this.normalizeAddress(recovered) !== normalized) {
      throw new UnauthorizedException('签名地址不匹配')
    }

    this.cacheService.delete(this.getCacheKey(normalized))

    const desiredRole = role ?? 'buyer'
    const user = await this.prismaService.users.upsert({
      where: { wallet_address: normalized },
      update: role ? { role: desiredRole } : {},
      create: {
        id: randomUUID(),
        wallet_address: normalized,
        role: desiredRole,
        created_at: new Date(),
      },
    })

    const payload = {
      userId: user.id,
      walletAddress: user.wallet_address,
      role: user.role,
    }
    const accessToken = await this.jwtService.signAsync(payload)

    return { accessToken }
  }

  private getCacheKey(address: string) {
    return `auth:nonce:${address}`
  }

  private normalizeAddress(address: string) {
    try {
      return ethers.getAddress(address)
    } catch {
      throw new BadRequestException('钱包地址格式不正确')
    }
  }
}
