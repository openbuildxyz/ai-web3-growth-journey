import { Test, TestingModule } from '@nestjs/testing'
import { DaoModule } from '../../src/Modules/Dao/dao.module'

describe('DaoModule', () => {
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [DaoModule],
    }).compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
  })
})
