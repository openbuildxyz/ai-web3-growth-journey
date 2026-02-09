import { Controller, Get, Param, Post, Query } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CurrentUser } from '../../Common/decorators/current-user.decorator'
import type { JwtPayload } from '../Auth/jwt.strategy'
import { NotificationsQueryDto } from './dto/notification.dto'
import { NotificationsService } from './notifications.service'

// 业务模块：通知接口。
@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: '查询通知列表' })
  @ApiResponse({ status: 200 })
  list(@CurrentUser() user: JwtPayload, @Query() query: NotificationsQueryDto) {
    // 实现步骤：
    // 1. 读取用户信息与查询参数。
    // 2. 返回通知列表。
    return this.notificationsService.list(user.userId, query)
  }

  @Post(':id/read')
  @ApiOperation({ summary: '标记通知为已读' })
  @ApiResponse({ status: 200 })
  markRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    // 实现步骤：
    // 1. 校验通知归属。
    // 2. 更新已读状态。
    return this.notificationsService.markRead(user.userId, id)
  }
}
