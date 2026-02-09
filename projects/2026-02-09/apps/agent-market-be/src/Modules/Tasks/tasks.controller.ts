import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CurrentUser } from '../../Common/decorators/current-user.decorator'
import type { JwtPayload } from '../Auth/jwt.strategy'
import { CreateTaskDto, DeliverDto, ListTasksQueryDto } from './dto/task.dto'
import { TasksService } from './tasks.service'

// 任务业务控制器：任务创建与流程操作。
@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: '创建任务' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201 })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTaskDto) {
    // 实现步骤：
    // 1. 读取当前用户。
    // 2. 调用创建任务服务。
    return this.tasksService.createTask(user, dto)
  }

  @Get()
  @ApiOperation({ summary: '任务列表' })
  @ApiResponse({ status: 200 })
  list(@CurrentUser() user: JwtPayload, @Query() query: ListTasksQueryDto) {
    // 实现步骤：
    // 1. 读取查询参数。
    // 2. 调用列表查询服务。
    return this.tasksService.listTasks(user, query)
  }

  @Get(':id')
  @ApiOperation({ summary: '任务详情' })
  @ApiResponse({ status: 200 })
  detail(@Param('id') id: string) {
    // 实现步骤：
    // 1. 读取任务 ID。
    // 2. 返回详情。
    return this.tasksService.getTaskDetail(id)
  }

  @Post(':id/accept')
  @HttpCode(200)
  @ApiOperation({ summary: 'Agent 接单' })
  @ApiResponse({ status: 200 })
  accept(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    // 实现步骤：
    // 1. 校验接单权限。
    // 2. 更新任务状态。
    return this.tasksService.acceptTask(id, user)
  }

  @Post(':id/deliver')
  @HttpCode(200)
  @ApiOperation({ summary: '提交交付' })
  @ApiBody({ type: DeliverDto })
  @ApiResponse({ status: 200 })
  deliver(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: DeliverDto,
  ) {
    // 实现步骤：
    // 1. 校验交付权限。
    // 2. 提交交付物。
    return this.tasksService.deliverTask(id, user, dto)
  }

  @Post(':id/execute')
  @HttpCode(200)
  @ApiOperation({ summary: '任务执行' })
  @ApiBody({ schema: { type: 'object', additionalProperties: true } })
  @ApiResponse({ status: 200 })
  execute(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: Record<string, unknown>,
  ) {
    // 实现步骤：
    // 1. 校验执行权限。
    // 2. 调用执行服务并返回输出。
    return this.tasksService.executeTask(id, user, body)
  }

  @Post(':id/complete')
  @HttpCode(200)
  @ApiOperation({ summary: '买家验收' })
  @ApiResponse({ status: 200 })
  complete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    // 实现步骤：
    // 1. 校验验收权限。
    // 2. 更新任务状态。
    return this.tasksService.completeTask(id, user)
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @ApiOperation({ summary: '取消任务' })
  @ApiResponse({ status: 200 })
  cancel(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    // 实现步骤：
    // 1. 校验取消权限。
    // 2. 更新任务状态。
    return this.tasksService.cancelTask(id, user)
  }

  @Get(':id/agents')
  @ApiOperation({ summary: '任务关联的 Agent' })
  @ApiResponse({ status: 200 })
  listAgents(@Param('id') id: string) {
    // 实现步骤：
    // 1. 读取任务 ID。
    // 2. 返回任务关联的 Agent 基础信息。
    return this.tasksService.listTaskAgents(id)
  }

  @Get(':id/agents/results')
  @ApiOperation({ summary: '任务关联 Agent 的结果' })
  @ApiResponse({ status: 200 })
  listAgentResults(@Param('id') id: string) {
    // 实现步骤：
    // 1. 读取任务 ID。
    // 2. 返回 Agent 执行结果。
    return this.tasksService.listTaskAgentResults(id)
  }
}
