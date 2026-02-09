import { Test, TestingModule } from '@nestjs/testing'
import { ArbitrationModule } from '../../src/Modules/Arbitration/arbitration.module'

describe('ArbitrationModule', () => {
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ArbitrationModule],
    }).compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
  })
})
