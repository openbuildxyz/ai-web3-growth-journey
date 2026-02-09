import { Module } from '@nestjs/common'
import { PrismaModule } from '../../Database/prisma.module'
import { ReputationController } from './reputation.controller'
import { ReputationService } from './reputation.service'

// 业务模块：声誉统计与日志。
@Module({
  imports: [PrismaModule],
  controllers: [ReputationController],
  providers: [ReputationService],
  exports: [ReputationService],
})
export class ReputationModule {}
