import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../src/Database/prisma.service'
import { GraphSyncService } from '../../src/Web3/graph-sync.service'
import { Web3Service } from '../../src/Web3/web3.service'

describe('Web3Module Services', () => {
  let web3Service: Web3Service
  let graphSyncService: GraphSyncService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Web3Service,
        GraphSyncService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              // Provide mock values for config keys used in onModuleInit
              if (key === 'CHAIN_RPC_URL') {
                return 'http://localhost:8545'
              }
              return null
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {}, // Mock PrismaService
        },
      ],
    }).compile()

    web3Service = module.get<Web3Service>(Web3Service)
    graphSyncService = module.get<GraphSyncService>(GraphSyncService)
  })

  it('Web3Service should be defined', () => {
    expect(web3Service).toBeDefined()
  })

  it('GraphSyncService should be defined', () => {
    expect(graphSyncService).toBeDefined()
  })
})
