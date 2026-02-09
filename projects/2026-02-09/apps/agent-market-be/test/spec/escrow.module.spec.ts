import { Test, TestingModule } from '@nestjs/testing'
import { EscrowModule } from '../../src/Modules/Escrow/escrow.module'
import { PrismaService } from '../../src/Database/prisma.service'

describe('EscrowModule', () => {
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [EscrowModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
  })
})
