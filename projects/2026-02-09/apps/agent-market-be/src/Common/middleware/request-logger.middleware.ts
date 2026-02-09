import { Injectable, NestMiddleware } from '@nestjs/common'
import type { Request, Response, NextFunction } from 'express'

// 基础设施中间件：输出请求日志（JSON 格式）。
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now()
    const { method, originalUrl } = req
    const requestId = req.headers['x-request-id']

    res.on('finish', () => {
      const durationMs = Date.now() - start
      const maskedHeaders = this.maskHeaders(req.headers)

      const log = {
        type: 'http_request',
        request_id: requestId ?? null,
        ip: req.ip,
        method,
        url: originalUrl,
        status: res.statusCode,
        duration_ms: durationMs,
        headers: maskedHeaders,
        query: req.query,
        body: req.body,
      }

      // 统一输出 JSON 便于日志采集。
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(log))
    })

    next()
  }

  private maskHeaders(headers: Request['headers']) {
    const masked: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() === 'authorization') {
        masked[key] = '***'
        continue
      }
      masked[key] = value
    }
    return masked
  }
}
