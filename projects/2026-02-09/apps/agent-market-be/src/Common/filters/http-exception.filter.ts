import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const errorResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined

    if (!(exception instanceof HttpException)) {
      const error = exception as Error
      this.logger.error(error?.message ?? 'Unexpected error', error?.stack)
    }

    const responseBody: Record<string, unknown> = {
      statusCode: status,
      message:
        typeof errorResponse === 'object' && errorResponse !== null
          ? ((errorResponse as { message?: string }).message ??
            'Unexpected error')
          : 'Unexpected error',
      timestamp: new Date().toISOString(),
      path: request.url,
    }

    if (typeof errorResponse === 'object' && errorResponse !== null) {
      const details = errorResponse as {
        errors?: unknown
        message?: string | string[]
      }
      if (details.errors) {
        responseBody.errors = details.errors
      } else if (Array.isArray(details.message)) {
        responseBody.errors = details.message
      }
    }

    response.status(status).json(responseBody)
  }
}
