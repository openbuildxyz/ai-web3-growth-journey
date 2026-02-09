import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from '../../src/Modules/Auth/auth.service'
import { CacheService } from '../../src/Cache/cache.service'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../src/Database/prisma.service'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { ethers } from 'ethers'

describe('AuthService', () => {
  let service: AuthService
  let cacheService: CacheService
  let prismaService: PrismaService
  let jwtService: JwtService

  const mockCacheService = {
    set: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn().mockReturnValue(300000), // 5 minutes
  }

  const mockJwtService = {
    signAsync: jest.fn(),
  }

  const mockPrismaService = {
    users: {
      upsert: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: CacheService, useValue: mockCacheService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    cacheService = module.get<CacheService>(CacheService)
    prismaService = module.get<PrismaService>(PrismaService)
    jwtService = module.get<JwtService>(JwtService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createChallenge', () => {
    it('should generate a challenge and cache it', () => {
      const address = '0x1234567890123456789012345678901234567890'
      const result = service.createChallenge(address)

      expect(result).toHaveProperty('nonce')
      expect(result).toHaveProperty('message')
      expect(result.message).toContain(address)
      expect(result.message).toContain(result.nonce)
      expect(mockCacheService.set).toHaveBeenCalled()
    })

    it('should throw BadRequestException for invalid address', () => {
      expect(() => service.createChallenge('invalid-address')).toThrow(
        BadRequestException,
      )
    })
  })

  describe('login', () => {
    const address = '0x1234567890123456789012345678901234567890'
    const nonce = 'test-nonce'
    const message = `Web3 Agent Market 登录验证\n\n地址: ${address}\nNonce: ${nonce}`
    // Mock signature (would need a real wallet to generate a valid one, but we can mock verifyMessage)
    const signature = '0xsignature'

    it('should login successfully with valid credentials', async () => {
      mockCacheService.get.mockReturnValue({ nonce, message })

      // Mock ethers.verifyMessage to return the correct address
      jest.spyOn(ethers, 'verifyMessage').mockReturnValue(address)
      // Mock ethers.getAddress to behave correctly
      jest.spyOn(ethers, 'getAddress').mockImplementation((addr) => addr)

      const mockUser = {
        id: 'user-123',
        wallet_address: address,
        role: 'buyer',
      }
      ;(mockPrismaService.users.upsert as jest.Mock).mockResolvedValue(mockUser)
      ;(mockJwtService.signAsync as jest.Mock).mockResolvedValue('jwt-token')

      const result = await service.login(address, signature, nonce)

      expect(result).toEqual({ accessToken: 'jwt-token' })
      expect(mockCacheService.delete).toHaveBeenCalled()
      expect(mockPrismaService.users.upsert).toHaveBeenCalled()
    })

    it('should throw UnauthorizedException if nonce is invalid', async () => {
      mockCacheService.get.mockReturnValue(null)

      await expect(service.login(address, signature, nonce)).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('should throw UnauthorizedException if signature verification fails', async () => {
      mockCacheService.get.mockReturnValue({ nonce, message })
      jest.spyOn(ethers, 'verifyMessage').mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      await expect(service.login(address, signature, nonce)).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('should throw UnauthorizedException if recovered address does not match', async () => {
      mockCacheService.get.mockReturnValue({ nonce, message })
      jest.spyOn(ethers, 'verifyMessage').mockReturnValue('0xotheraddress')
      jest.spyOn(ethers, 'getAddress').mockImplementation((addr) => addr)

      await expect(service.login(address, signature, nonce)).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })
})
