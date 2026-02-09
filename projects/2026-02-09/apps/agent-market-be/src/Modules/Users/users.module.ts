import { Module } from '@nestjs/common'
import { PrismaModule } from '../../Database/prisma.module'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

// 业务模块：用户账户与资料。
@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
