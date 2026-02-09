import { Global, Module } from '@nestjs/common'
import { Web3Service } from './web3.service'
import { GraphSyncService } from './graph-sync.service'

// Infrastructure module: Web3 integration services.
@Global()
@Module({
  providers: [Web3Service, GraphSyncService],
  exports: [Web3Service, GraphSyncService],
})
export class Web3Module {}
