import { Test, TestingModule } from '@nestjs/testing'
import { ReviewsModule } from '../../src/Modules/Reviews/reviews.module'

describe('ReviewsModule', () => {
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ReviewsModule],
    }).compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
  })
})
