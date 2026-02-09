import { Test, TestingModule } from '@nestjs/testing'
import { PaymentsModule } from '../../src/Modules/Payments/payments.module'

describe('PaymentsModule', () => {
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [PaymentsModule],
    }).compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
  })
})
