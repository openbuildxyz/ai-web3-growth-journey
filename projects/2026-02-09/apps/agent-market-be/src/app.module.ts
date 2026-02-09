import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { CacheModule } from './Cache/cache.module'
import { AgentSecretModule } from './Common/agent-secret.module'
import { PrismaModule } from './Database/prisma.module'
import { Web3Module } from './Web3/web3.module'
import { AgentsModule } from './Modules/Agents/agents.module'
import { AgentInvocationModule } from './Modules/AgentInvocation/agent-invocation.module'
import { ArbitrationModule } from './Modules/Arbitration/arbitration.module'
import { AuthModule } from './Modules/Auth/auth.module'
import { JwtAuthGuard } from './Modules/Auth/jwt-auth.guard'
import { DaoModule } from './Modules/Dao/dao.module'
import { EscrowModule } from './Modules/Escrow/escrow.module'
import { NotificationsModule } from './Modules/Notifications/notifications.module'
import { PaymentsModule } from './Modules/Payments/payments.module'
import { ReputationModule } from './Modules/Reputation/reputation.module'
import { ReviewsModule } from './Modules/Reviews/reviews.module'
import { TasksModule } from './Modules/Tasks/tasks.module'
import { UsersModule } from './Modules/Users/users.module'
import { WalletModule } from './Modules/Wallet/wallet.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PrismaModule,
    AgentSecretModule,
    CacheModule,
    Web3Module,
    AuthModule,
    UsersModule,
    AgentsModule,
    TasksModule,
    AgentInvocationModule,
    EscrowModule,
    ArbitrationModule,
    ReviewsModule,
    ReputationModule,
    NotificationsModule,
    PaymentsModule,
    WalletModule,
    DaoModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
