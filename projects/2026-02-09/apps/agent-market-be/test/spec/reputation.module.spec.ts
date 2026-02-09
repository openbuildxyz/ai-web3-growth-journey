import { Test, TestingModule } from '@nestjs/testing'
import { ReputationModule } from '../../src/Modules/Reputation/reputation.module'

describe('ReputationModule', () => {
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ReputationModule],
    }).compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
  })
})
