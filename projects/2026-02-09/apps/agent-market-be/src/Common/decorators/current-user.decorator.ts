import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { JwtPayload } from '../../Modules/Auth/jwt.strategy'

// 通用装饰器：从请求中获取当前登录用户。
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>()
    return request.user as JwtPayload
  },
)
