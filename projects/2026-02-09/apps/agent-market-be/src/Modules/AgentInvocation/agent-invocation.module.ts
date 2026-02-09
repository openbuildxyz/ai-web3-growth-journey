import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { AgentInvocationController } from './agent-invocation.controller'
import { AgentInvocationService } from './agent-invocation.service'

// 业务模块：外部 Agent 调用与执行。
@Module({
  imports: [HttpModule, ConfigModule, JwtModule.register({})],
  controllers: [AgentInvocationController],
  providers: [AgentInvocationService],
  exports: [AgentInvocationService],
})
export class AgentInvocationModule {}
