import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from '../../src/Modules/Users/users.service'
import { PrismaService } from '../../src/Database/prisma.service'
import { NotFoundException } from '@nestjs/common'
import { UpdateUserDto } from '../../src/Modules/Users/dto/user.dto'

describe('UsersService', () => {
  let service: UsersService
  let prismaService: PrismaService

  const mockPrismaService = {
    users: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getMe', () => {
    it('should return user details if user exists', async () => {
      const mockUser = {
        id: 'user-123',
        wallet_address: '0x123',
        role: 'buyer',
        created_at: new Date(),
        updated_at: new Date(),
      }

      ;(prismaService.users.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const result = await service.getMe('user-123')
      expect(result).toEqual(mockUser)
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      })
    })

    it('should throw NotFoundException if user does not exist', async () => {
      ;(prismaService.users.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(service.getMe('non-existent-id')).rejects.toThrow(
        NotFoundException,
      )
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      })
    })
  })

  describe('updateMe', () => {
    const mockUser = {
      id: 'user-123',
      wallet_address: '0x123',
      email: 'old@example.com',
      role: 'buyer',
      created_at: new Date(),
      updated_at: new Date(),
    }

    it('should update user email', async () => {
      const dto: UpdateUserDto = { email: 'new@example.com' }
      const updatedUser = { ...mockUser, email: 'new@example.com' }

      ;(prismaService.users.update as jest.Mock).mockResolvedValue(updatedUser)

      const result = await service.updateMe('user-123', dto)

      expect(result).toEqual(updatedUser)
      expect(prismaService.users.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { email: 'new@example.com' },
      })
    })

    it('should return current user if no updates provided', async () => {
      const dto: UpdateUserDto = {}

      // Mock getMe behavior which is called internally when no updates
      ;(prismaService.users.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const result = await service.updateMe('user-123', dto)

      expect(result).toEqual(mockUser)
      expect(prismaService.users.update).not.toHaveBeenCalled()
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      })
    })
  })
})
