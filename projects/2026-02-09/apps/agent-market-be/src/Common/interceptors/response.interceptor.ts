import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return this.serializeData(data)
      }),
    )
  }

  private serializeData(data: any): any {
    if (data === null || data === undefined) {
      return data
    }

    if (typeof data === 'bigint') {
      return data.toString()
    }

    if (data instanceof Date) {
      return this.formatDateTime(data)
    }

    if (typeof data === 'object') {
      // Check for Prisma Decimal
      if (typeof data.toFixed === 'function') {
        return data.toString()
      }
      if (Array.isArray(data)) {
        return data.map((item) => this.serializeData(item))
      }
      return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          this.serializeData(value),
        ]),
      )
    }

    return data
  }

  private formatDateTime(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0')
    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const hours = pad(date.getHours())
    const minutes = pad(date.getMinutes())
    const seconds = pad(date.getSeconds())
    return `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`
  }
}
