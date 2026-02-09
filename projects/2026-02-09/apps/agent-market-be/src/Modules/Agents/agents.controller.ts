import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Public } from '../../Common/decorators/public.decorator'
import { CurrentUser } from '../../Common/decorators/current-user.decorator'
import type { JwtPayload } from '../Auth/jwt.strategy'
import { AgentsService } from './agents.service'
import {
  CreateAgentDto,
  ListAgentsQueryDto,
  UpdateAgentDto,
} from './dto/agent.dto'

// Agent 业务控制器：档案管理与列表查询。
@ApiTags('agents')
@ApiBearerAuth()
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @ApiOperation({ summary: '创建 Agent 档案' })
  @ApiBody({ type: CreateAgentDto })
  @ApiResponse({ status: 201 })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAgentDto) {
    // 实现步骤：
    // 1. 读取当前用户。
    // 2. 调用创建服务。
    return this.agentsService.createAgent(user, dto)
  }

  @Get('tags')
  @Public()
  @ApiOperation({ summary: '获取 Agent 标签列表' })
  @ApiResponse({ status: 200 })
  listTags() {
    // 实现步骤：
    // 1. 查询标签字典。
    // 2. 返回标签名称列表。
    return this.agentsService.listTags()
  }

  @Get()
  @ApiOperation({ summary: '查询 Agent 列表' })
  @ApiResponse({ status: 200 })
  list(@CurrentUser() user: JwtPayload, @Query() query: ListAgentsQueryDto) {
    // 实现步骤：
    // 1. 解析查询参数。
    // 2. 调用列表服务。
    return this.agentsService.listAgents(query, user)
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '获取 Agent 详情' })
  @ApiResponse({ status: 200 })
  getById(@Param('id') id: string) {
    // 实现步骤：
    // 1. 读取 Agent ID。
    // 2. 查询详情。
    return this.agentsService.getAgentById(id)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新 Agent 档案' })
  @ApiBody({ type: UpdateAgentDto })
  @ApiResponse({ status: 200 })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateAgentDto,
  ) {
    // 实现步骤：
    // 1. 校验权限。
    // 2. 更新 Agent。
    return this.agentsService.updateAgent(id, user, dto)
  }

  @Patch(':id/online')
  @ApiOperation({ summary: 'Agent 上线' })
  @ApiResponse({ status: 200 })
  online(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    // 实现步骤：
    // 1. 校验权限。
    // 2. 更新在线状态。
    return this.agentsService.setOnlineStatus(id, user, true)
  }

  @Patch(':id/offline')
  @ApiOperation({ summary: 'Agent 下线' })
  @ApiResponse({ status: 200 })
  offline(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    // 实现步骤：
    // 1. 校验权限。
    // 2. 更新在线状态。
    return this.agentsService.setOnlineStatus(id, user, false)
  }
}
