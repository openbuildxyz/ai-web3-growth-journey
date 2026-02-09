import { Module } from '@nestjs/common'
import { PrismaModule } from '../../Database/prisma.module'
import { AgentInvocationModule } from '../AgentInvocation/agent-invocation.module'
import { NotificationsModule } from '../Notifications/notifications.module'
import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'
import { EscrowModule } from '../Escrow/escrow.module'

// 业务模块：任务生命周期。
@Module({
  imports: [
    PrismaModule,
    EscrowModule,
    AgentInvocationModule,
    NotificationsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
