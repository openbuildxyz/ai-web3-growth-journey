import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import {
  AGENT_SECRET_PROVIDER,
  AwsSecretsManagerAgentSecretProvider,
  DevAgentSecretProvider,
} from './providers/agent-secret.provider'

// 基础设施模块：Agent 密钥读取与存储能力。
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AGENT_SECRET_PROVIDER,
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV', 'development')
        if (nodeEnv === 'production') {
          return new AwsSecretsManagerAgentSecretProvider(configService)
        }
        return new DevAgentSecretProvider(configService)
      },
      inject: [ConfigService],
    },
  ],
  exports: [AGENT_SECRET_PROVIDER],
})
export class AgentSecretModule {}
