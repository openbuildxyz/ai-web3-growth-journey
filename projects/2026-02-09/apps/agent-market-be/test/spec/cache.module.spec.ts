import { Test, TestingModule } from '@nestjs/testing'
import { CacheModule } from '../../src/Cache/cache.module'

describe('CacheModule', () => {
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [CacheModule],
    }).compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
  })
})
