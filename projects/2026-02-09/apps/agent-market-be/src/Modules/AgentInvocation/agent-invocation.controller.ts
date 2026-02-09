import { Body, Controller, Param, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Public } from '../../Common/decorators/public.decorator'
import { AgentInvocationService } from './agent-invocation.service'

// 业务模块：Agent 回调入口（可选）。
@ApiTags('agent')
@Controller('agent')
export class AgentInvocationController {
  constructor(
    private readonly agentInvocationService: AgentInvocationService,
  ) {}

  @Public()
  @Post('callback/:invocationId')
  @ApiOperation({ summary: 'Agent 回调' })
  @ApiBody({ schema: { type: 'object', additionalProperties: true } })
  @ApiResponse({ status: 200 })
  async callback(
    @Param('invocationId') invocationId: string,
    @Body() body: unknown,
  ) {
    // 实现步骤：
    // 1. 解析 invocationId 。
    // 2. 调用回调处理服务。
    await this.agentInvocationService.callback(BigInt(invocationId), body)
    return { ok: true }
  }

  @Public()
  @Post(':agentId/result')
  @ApiOperation({ summary: 'Agent 回调结果' })
  @ApiBody({ schema: { type: 'object', additionalProperties: true } })
  @ApiResponse({ status: 200 })
  async submitResult(@Param('agentId') agentId: string, @Body() body: unknown) {
    // 实现步骤：
    // 1. 读取 Agent ID 与回调结果。
    // 2. 写入调用记录结果。
    await this.agentInvocationService.storeAgentResult(agentId, body)
    return { ok: true }
  }
}
