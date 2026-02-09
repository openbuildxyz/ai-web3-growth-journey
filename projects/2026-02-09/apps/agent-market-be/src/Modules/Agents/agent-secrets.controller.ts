import { Controller, Get, Param } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CurrentUser } from '../../Common/decorators/current-user.decorator'
import type { JwtPayload } from '../Auth/jwt.strategy'
import { AgentsService } from './agents.service'
import { AgentSecretResponseDto } from './dto/agent-secret.dto'

// 业务控制器：Agent 调用密钥生成。
@ApiTags('agents')
@ApiBearerAuth()
@Controller('agent')
export class AgentSecretsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get(':taskId/generate')
  @ApiOperation({ summary: '生成 Agent 调用密钥' })
  @ApiResponse({ status: 200, type: AgentSecretResponseDto })
  generateSecret(
    @Param('taskId') taskId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // 实现步骤：
    // 1. 读取任务 ID 与当前用户。
    // 2. 调用服务生成密钥。
    return this.agentsService.generateAgentSecret(taskId, user)
  }
}
