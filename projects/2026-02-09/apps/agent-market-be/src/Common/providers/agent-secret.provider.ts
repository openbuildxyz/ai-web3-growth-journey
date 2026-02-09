import { ConfigService } from '@nestjs/config'
import {
  CreateSecretCommand,
  GetSecretValueCommand,
  PutSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager'

export const AGENT_SECRET_PROVIDER = Symbol('AGENT_SECRET_PROVIDER')

export interface AgentSecretProvider {
  getSecret(agentId: string): Promise<string>
  setSecret(agentId: string, secret: string): Promise<void>
}

export class DevAgentSecretProvider implements AgentSecretProvider {
  private readonly secrets = new Map<string, string>()

  constructor(private readonly configService: ConfigService) {}

  async getSecret(agentId: string): Promise<string> {
    const stored = this.secrets.get(agentId)
    if (stored) {
      return stored
    }
    const secret = this.configService.get<string>('AGENT_TEST_SECRET')
    if (!secret) {
      throw new Error('AGENT_TEST_SECRET 未配置')
    }
    return secret
  }

  async setSecret(agentId: string, secret: string): Promise<void> {
    this.secrets.set(agentId, secret)
    return
  }
}

export class AwsSecretsManagerAgentSecretProvider
  implements AgentSecretProvider
{
  private readonly client: SecretsManagerClient
  private readonly prefix: string

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION')
    if (!region) {
      throw new Error('AWS_REGION 未配置')
    }
    this.client = new SecretsManagerClient({ region })
    this.prefix = this.configService.get<string>(
      'AGENT_SECRET_PREFIX',
      'AGENT_',
    )
  }

  async getSecret(agentId: string): Promise<string> {
    const secretId = this.buildSecretId(agentId)
    const response = await this.client.send(
      new GetSecretValueCommand({ SecretId: secretId }),
    )
    if (!response.SecretString) {
      throw new Error('Agent Secret 为空')
    }
    return response.SecretString
  }

  async setSecret(agentId: string, secret: string): Promise<void> {
    const secretId = this.buildSecretId(agentId)
    try {
      await this.client.send(
        new CreateSecretCommand({
          Name: secretId,
          SecretString: secret,
        }),
      )
    } catch (error) {
      const err = error as { name?: string }
      if (err?.name !== 'ResourceExistsException') {
        throw error
      }
      await this.client.send(
        new PutSecretValueCommand({
          SecretId: secretId,
          SecretString: secret,
        }),
      )
    }
  }

  private buildSecretId(agentId: string) {
    return `${this.prefix}${agentId}_SECRET`
  }
}
