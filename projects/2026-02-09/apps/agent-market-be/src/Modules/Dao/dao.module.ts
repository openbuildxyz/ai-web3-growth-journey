import { Module } from '@nestjs/common'
import { PrismaModule } from '../../Database/prisma.module'
import { DaoController } from './dao.controller'
import { DaoService } from './dao.service'

// 业务模块：DAO 治理与质押。
@Module({
  imports: [PrismaModule],
  controllers: [DaoController],
  providers: [DaoService],
  exports: [DaoService],
})
export class DaoModule {}
