import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { RequestContext } from '../context/request-context'

// 基础设施拦截器：为每个请求建立上下文，供数据库日志等读取 userId。
@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp()
    const request = http.getRequest<{
      user?: { userId?: string }
      headers?: Record<string, string | string[] | undefined>
      method?: string
      originalUrl?: string
    }>()

    const requestId = request?.headers?.['x-request-id']
    const ctx = {
      userId: request?.user?.userId,
      requestId: typeof requestId === 'string' ? requestId : undefined,
      method: request?.method,
      path: request?.originalUrl,
    }

    return RequestContext.run(ctx, () => next.handle())
  }
}
