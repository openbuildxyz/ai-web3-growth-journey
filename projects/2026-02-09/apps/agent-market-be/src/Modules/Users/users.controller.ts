import { Body, Controller, Get, Patch } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CurrentUser } from '../../Common/decorators/current-user.decorator'
import type { JwtPayload } from '../Auth/jwt.strategy'
import { UpdateUserDto } from './dto/user.dto'
import { UsersService } from './users.service'

// 用户业务控制器：当前用户信息。
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200 })
  getMe(@CurrentUser() user: JwtPayload) {
    return this.usersService.getMe(user.userId)
  }

  @Patch('me')
  @ApiOperation({ summary: '更新当前用户信息' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200 })
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(user.userId, dto)
  }
}
