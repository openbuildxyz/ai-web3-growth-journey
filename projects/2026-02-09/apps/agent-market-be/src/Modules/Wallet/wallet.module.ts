import { Module } from '@nestjs/common'
import { PrismaModule } from '../../Database/prisma.module'
import { WalletController } from './wallet.controller'
import { WalletService } from './wallet.service'

// 业务模块：钱包余额与充值意向。
@Module({
  imports: [PrismaModule],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
