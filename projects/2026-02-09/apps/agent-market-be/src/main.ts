import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './Common/filters/http-exception.filter'
import { ResponseInterceptor } from './Common/interceptors/response.interceptor'
import { RequestContextInterceptor } from './Common/interceptors/request-context.interceptor'
import { RequestLoggerMiddleware } from './Common/middleware/request-logger.middleware'

async function bootstrap() {
  const requiredEnv = [
    'DATABASE_URL',
    'PLATFORM_BASE_URL',
    'JWT_SECRET',
    'CHAIN_RPC_URL',
    'CHAIN_ID',
    'TASK_MANAGER_ADDRESS',
    'ARBITRATION_ADDRESS',
    'ESCROW_VAULT_ADDRESS',
    'TOKEN_EXCHANGE_ADDRESS',
  ]
  if (process.env.NODE_ENV === 'production') {
    requiredEnv.push('AWS_REGION')
  }
  const missing = requiredEnv.filter((key) => !process.env[key])
  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`Missing required env vars: ${missing.join(', ')}`)
    process.exit(1)
  }

  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const errorMessages = errors.map((error) => {
          const constraints = error.constraints ?? {}
          const firstKey = Object.keys(constraints)[0]
          const message = translateValidationMessage(firstKey, error.property)
          return { field: error.property, message }
        })
        return new BadRequestException({
          message: '参数校验失败',
          errors: errorMessages,
        })
      },
    }),
  )
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalInterceptors(
    new RequestContextInterceptor(),
    new ResponseInterceptor(),
  )
  const requestLogger = new RequestLoggerMiddleware()
  app.use(requestLogger.use.bind(requestLogger))

  const config = new DocumentBuilder()
    .setTitle('Web3 Agent Market API')
    .setDescription('Backend API for Web3 Agent Market')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()

function translateValidationMessage(constraintKey?: string, field?: string) {
  const name = field ?? '字段'
  const mapping: Record<string, string> = {
    isNotEmpty: `${name}不能为空`,
    isString: `${name}必须为字符串`,
    isNumber: `${name}必须为数字`,
    isBoolean: `${name}必须为布尔值`,
    isUUID: `${name}必须为UUID`,
    isArray: `${name}必须为数组`,
    arrayNotEmpty: `${name}不能为空数组`,
    arrayMinSize: `${name}数量不足`,
    arrayMaxSize: `${name}数量超出限制`,
    isIn: `${name}取值不合法`,
    isDateString: `${name}必须为合法的日期字符串`,
    isEmail: `${name}必须为合法的邮箱`,
    isInt: `${name}必须为整数`,
    isPositive: `${name}必须为正数`,
    isNegative: `${name}必须为负数`,
    min: `${name}不能小于最小值`,
    max: `${name}不能超过最大值`,
    minLength: `${name}长度不足`,
    maxLength: `${name}长度超出限制`,
    length: `${name}长度不符合要求`,
    matches: `${name}格式不正确`,
    isEnum: `${name}取值不合法`,
    isObject: `${name}必须为对象`,
    isNotEmptyObject: `${name}不能为空对象`,
    isNumberString: `${name}必须为数字字符串`,
    isUrl: `${name}必须为合法的URL`,
    isHexadecimal: `${name}必须为十六进制字符串`,
    whitelistValidation: `${name}包含未允许的字段`,
    unknownValue: `${name}参数不合法`,
  }
  if (constraintKey && mapping[constraintKey]) {
    return mapping[constraintKey]
  }
  return `${name}参数不合法`
}
