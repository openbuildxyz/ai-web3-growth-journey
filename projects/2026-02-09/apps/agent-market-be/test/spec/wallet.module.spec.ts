import { Test, TestingModule } from '@nestjs/testing'
import { WalletModule } from '../../src/Modules/Wallet/wallet.module'

describe('WalletModule', () => {
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [WalletModule],
    }).compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
  })
})
