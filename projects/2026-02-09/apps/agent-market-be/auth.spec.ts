import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Wallet } from 'ethers'
import { Cache } from 'cache-manager'
import { AuthController } from ''
import { AuthService } from '@/Modules/Auth/auth.service'
import { ChallengeDto } from '@/Modules/aAuth/dto/challenge.dto'
import { LoginDto } from '../../src/auth/dto/login.dto'
import { User } from '../../src/users/entities/user.entity'
import { UsersService } from '../../src/users/users.service'
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager'

// Mock services and repositories
const mockUsersService = {
  findOneByWalletAddress: jest.fn(),
  create: jest.fn(),
}

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
}

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'JWT_SECRET') return 'test-secret'
    if (key === 'JWT_EXPIRES_IN') return '1d'
    return null
  }),
}

describe('Auth Module', () => {
  let authController: AuthController
  let authService: AuthService
  let cacheManager: Cache
  let usersService: UsersService

  // Create a real wallet for signing to ensure cryptographic validity
  const testWallet = Wallet.createRandom()
  const testAddress = testWallet.address

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // Use a simple in-memory cache for testing purposes
      imports: [CacheModule.register({ ttl: 60 * 5, store: 'memory' })],
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        // Mocking the User repository is not strictly needed if we mock the service layer,
        // but it's good practice to have it available.
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
    }).compile()

    authController = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(AuthService)
    cacheManager = module.get<Cache>(CACHE_MANAGER)
    usersService = module.get<UsersService>(UsersService)

    // Reset mocks and cache before each test
    jest.clearAllMocks()
    await cacheManager.reset()
  })

  it('should be defined', () => {
    expect(authController).toBeDefined()
    expect(authService).toBeDefined()
  })

  describe('POST /auth/challenge', () => {
    it('should return a challenge message and store the nonce in cache', async () => {
      const challengeDto: ChallengeDto = { walletAddress: testAddress }
      const result = await authController.createChallenge(challengeDto)

      expect(result).toHaveProperty('message')
      expect(result.message).toContain('Please sign this message to log in:')

      const nonce = result.message.split(': ')[1]
      expect(nonce).toBeDefined()
      expect(nonce.length).toBeGreaterThan(10)

      // Verify nonce is correctly stored in the cache against the wallet address
      const cachedNonce = await cacheManager.get(`nonce:${testAddress}`)
      expect(cachedNonce).toBe(nonce)
    })

    it('should throw BadRequestException for an invalid wallet address', async () => {
      const challengeDto: ChallengeDto = { walletAddress: 'invalid-address' }
      await expect(
        authController.createChallenge(challengeDto),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('POST /auth/login', () => {
    let nonce: string
    let signature: string
    let loginDto: LoginDto

    beforeEach(async () => {
      // 1. Get a valid nonce by calling the challenge service
      const challenge = await authService.createChallenge({
        walletAddress: testAddress,
      })
      nonce = challenge.message.split(': ')[1]

      // 2. Sign the challenge message with the test wallet
      signature = await testWallet.signMessage(challenge.message)

      loginDto = {
        walletAddress: testAddress,
        signature,
      }
    })

    it('should successfully log in an existing user and return a JWT', async () => {
      const existingUser = {
        id: 'user-uuid-1',
        walletAddress: testAddress,
        role: 'buyer',
      }
      await cacheManager.set(`nonce:${testAddress}`, nonce)
      ;(usersService.findOneByWalletAddress as jest.Mock).mockResolvedValue(
        existingUser,
      )

      const result = await authController.login(loginDto)

      expect(usersService.findOneByWalletAddress).toHaveBeenCalledWith(
        testAddress,
      )
      expect(usersService.create).not.toHaveBeenCalled()
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: existingUser.id,
        walletAddress: testAddress,
        role: 'buyer',
      })
      expect(result).toEqual({ accessToken: 'mock.jwt.token' })

      // Verify the nonce is consumed after successful login
      const consumedNonce = await cacheManager.get(`nonce:${testAddress}`)
      expect(consumedNonce).toBeUndefined()
    })

    it('should create a new user if not found, log them in, and return a JWT', async () => {
      const newUser = {
        id: 'user-uuid-2',
        walletAddress: testAddress,
        role: 'buyer',
      }
      await cacheManager.set(`nonce:${testAddress}`, nonce)
      ;(usersService.findOneByWalletAddress as jest.Mock).mockResolvedValue(
        null,
      )
      ;(usersService.create as jest.Mock).mockResolvedValue(newUser)

      const result = await authController.login(loginDto)

      expect(usersService.findOneByWalletAddress).toHaveBeenCalledWith(
        testAddress,
      )
      expect(usersService.create).toHaveBeenCalledWith({
        walletAddress: testAddress,
        role: 'buyer',
      })
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: newUser.id,
        walletAddress: testAddress,
        role: 'buyer',
      })
      expect(result).toEqual({ accessToken: 'mock.jwt.token' })
    })

    it('should throw UnauthorizedException for an invalid signature', async () => {
      const wrongWallet = Wallet.createRandom()
      const wrongSignature = await wrongWallet.signMessage(
        `Please sign this message to log in: ${nonce}`,
      )
      await cacheManager.set(`nonce:${testAddress}`, nonce)

      await expect(
        authController.login({
          walletAddress: testAddress,
          signature: wrongSignature,
        }),
      ).rejects.toThrow(new UnauthorizedException('Invalid signature'))
    })

    it('should throw UnauthorizedException if nonce is invalid or expired (not in cache)', async () => {
      // Do not set the nonce in the cache to simulate expiration/invalidity
      await expect(authController.login(loginDto)).rejects.toThrow(
        new UnauthorizedException(
          'Invalid or expired challenge. Please try again.',
        ),
      )
    })
  })
})
