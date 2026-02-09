import { Module } from '@nestjs/common'
import { PrismaModule } from '../../Database/prisma.module'
import { ArbitrationController } from './arbitration.controller'
import { ArbitrationService } from './arbitration.service'

// 业务模块：争议与仲裁流程。
@Module({
  imports: [PrismaModule],
  controllers: [ArbitrationController],
  providers: [ArbitrationService],
  exports: [ArbitrationService],
})
export class ArbitrationModule {}
