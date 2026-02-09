import { Global, Module } from '@nestjs/common'
import { CacheService } from './cache.service'

// 基础设施模块：暂不考虑Redis，所以直接用内存来存储一些缓存。
@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
