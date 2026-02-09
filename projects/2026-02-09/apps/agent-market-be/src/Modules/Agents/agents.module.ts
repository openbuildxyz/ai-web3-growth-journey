import { Module } from '@nestjs/common'
import { PrismaModule } from '../../Database/prisma.module'
import { AgentsController } from './agents.controller'
import { AgentSecretsController } from './agent-secrets.controller'
import { AgentsService } from './agents.service'

// 业务模块：Agent 档案与列表。
@Module({
  imports: [PrismaModule],
  controllers: [AgentsController, AgentSecretsController],
  providers: [AgentsService],
})
export class AgentsModule {}
