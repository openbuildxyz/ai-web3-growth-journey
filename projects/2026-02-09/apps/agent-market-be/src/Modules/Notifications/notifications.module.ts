import { Module } from '@nestjs/common'
import { PrismaModule } from '../../Database/prisma.module'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'

// 业务模块：通知与消息记录。
@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
