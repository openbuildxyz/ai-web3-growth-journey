import { Body, Controller, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Public } from '../../Common/decorators/public.decorator'
import { AuthService } from './auth.service'
import {
  AuthChallengeRequestDto,
  AuthChallengeResponseDto,
  AuthLoginRequestDto,
  AuthLoginResponseDto,
} from './dto/auth.dto'

// 认证业务控制器：签名挑战与登录。
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('challenge')
  @ApiOperation({ summary: '获取登录挑战' })
  @ApiBody({ type: AuthChallengeRequestDto })
  @ApiResponse({ status: 200, type: AuthChallengeResponseDto })
  createChallenge(@Body() dto: AuthChallengeRequestDto) {
    // 实现步骤：
    // 1. 读取钱包地址。
    // 2. 调用挑战生成服务。
    return this.authService.createChallenge(dto.address)
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: '钱包签名登录' })
  @ApiBody({ type: AuthLoginRequestDto })
  @ApiResponse({ status: 200, type: AuthLoginResponseDto })
  login(@Body() dto: AuthLoginRequestDto) {
    // 实现步骤：
    // 1. 读取地址、签名、nonce 与角色。
    // 2. 调用登录服务。
    return this.authService.login(
      dto.address,
      dto.signature,
      dto.nonce,
      dto.role,
    )
  }
}
