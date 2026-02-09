import { Test, type TestingModule } from '@nestjs/testing'
import { JwtAuthGuard } from '../../src/Modules/Auth/jwt-auth.guard'
import { Reflector } from '@nestjs/core'
import { ExecutionContext } from '@nestjs/common'

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard
  let reflector: Reflector

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile()

    guard = module.get<JwtAuthGuard>(JwtAuthGuard)
    reflector = module.get<Reflector>(Reflector)
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  it('should allow access for public routes', () => {
    mockReflector.getAllAndOverride.mockReturnValue(true)
    const context = {
      getHandler: () => {},
      getClass: () => {},
    } as unknown as ExecutionContext

    expect(guard.canActivate(context)).toBe(true)
  })

  it('should call super.canActivate for protected routes', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false)
    const context = {
      getHandler: () => {},
      getClass: () => {},
    } as unknown as ExecutionContext

    // Mock the result of super.canActivate
    const superCanActivateResult = true
    jest
      .spyOn(Object.getPrototypeOf(guard), 'canActivate')
      .mockReturnValue(superCanActivateResult)

    const result = guard.canActivate(context)
    expect(result).toBe(superCanActivateResult)
    expect(Object.getPrototypeOf(guard).canActivate).toHaveBeenCalledWith(
      context,
    )
  })
})
