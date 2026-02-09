import { Test, type TestingModule } from '@nestjs/testing'
import { JwtStrategy, JwtPayload } from '../../src/Modules/Auth/jwt.strategy'
import { ConfigService } from '@nestjs/config'

describe('JwtStrategy', () => {
  let strategy: JwtStrategy

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue: any) => {
      if (key === 'JWT_SECRET') {
        return 'test-secret'
      }
      return defaultValue
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    strategy = module.get<JwtStrategy>(JwtStrategy)
  })

  it('should be defined', () => {
    expect(strategy).toBeDefined()
  })

  describe('validate', () => {
    it('should return the payload', async () => {
      const payload: JwtPayload = {
        userId: '1',
        role: 'user',
        walletAddress: '0x123',
      }
      const result = await strategy.validate(payload)
      expect(result).toEqual(payload)
    })
  })
})
