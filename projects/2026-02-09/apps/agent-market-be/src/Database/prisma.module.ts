import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'

// 基础设施模块：数据库访问能力。
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
