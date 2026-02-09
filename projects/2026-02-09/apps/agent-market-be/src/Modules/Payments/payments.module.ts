import { Module } from '@nestjs/common'
import { PrismaModule } from '../../Database/prisma.module'
import { PaymentsController } from './payments.controller'
import { PaymentsService } from './payments.service'

// 业务模块：支付与资金流水。
@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
