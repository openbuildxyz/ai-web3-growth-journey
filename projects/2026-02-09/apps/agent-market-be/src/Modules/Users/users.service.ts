import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../Database/prisma.service'
import { UpdateUserDto } from './dto/user.dto'

// 用户业务服务：查询与更新当前用户。
@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prismaService.users.findUnique({
      where: { id: userId },
    })
    if (!user) {
      throw new NotFoundException('用户不存在')
    }
    return user
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    const updates: UpdateUserDto = {}
    if (dto.email !== undefined) {
      updates.email = dto.email
    }

    if (Object.keys(updates).length === 0) {
      return this.getMe(userId)
    }

    return this.prismaService.users.update({
      where: { id: userId },
      data: updates,
    })
  }
}
