/**
 * Type definitions for the Agents Service
 */

export interface AgentConfig {
  name: string;
  ownerAddress: string;
  agentWallet: string;
  strategy: 'conservative' | 'moderate' | 'aggressive';
  riskTolerance: number;
  preferredPools: string[];
  expertiseContext?: string;
  uniswapHistory?: {
    totalSwaps: number;
    totalLiquidityProvided: string;
    topPools: string[];
  };
  characterConfig?: Record<string, unknown>;
  characterPlugins?: string[];
  configSource?: 'template' | 'upload';
}

export interface AgentCharacter {
  name: string;
  bio: string[] | string;
  adjectives?: string[];
  topics?: string[];
  knowledge?: Array<string | { path: string; shared?: boolean }>;
  system?: string;
  templates?: Record<string, string | ((params: any) => string)>;
  messageExamples?: Array<
    Array<{
      name: string;
      content: { text: string };
    }>
  >;
  postExamples?: string[];
  style?: {
    all?: string[];
    chat?: string[];
    post?: string[];
  };
  plugins?: string[];
  settings?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    memoryLimit?: number;
    conversationLength?: number;
    responseTimeout?: number;
    secrets?: Record<string, string | undefined>;
  };
  secrets?: Record<string, string | undefined>;
  clientConfig: {
    uniforum: {
      ensName: string;
      ownerAddress: string;
      agentWallet: string;
      strategy: string;
      riskTolerance: number;
      preferredPools: string[];
      expertiseContext?: string;
      uniswapHistory?: {
        totalSwaps: number;
        totalLiquidityProvided: string;
        topPools: string[];
      };
      rulesOfThumb?: string[];
      constraints?: Record<string, unknown>;
      objectiveWeights?: Record<string, number>;
      debate?: {
        enabled?: boolean;
        rounds?: number;
        delayMs?: number;
        minDurationMs?: number;
        maxRounds?: number;
        minIntervalMs?: number;
      };
      temperatureDelta?: number;
      modelProvider?: 'openai' | 'claude';
    };
  };
}

export interface AgentInstance {
  id: string;
  ensName: string;
  character: AgentCharacter;
  agentId?: string;
  runtime: any; // Will be typed when Eliza is integrated
  status: 'active' | 'idle' | 'offline';
  configSource?: 'template' | 'upload';
}

export interface ForumContext {
  forumId: string;
  goal: string;
  recentMessages: Array<{
    agent: string;
    content: string;
    timestamp: number;
  }>;
  currentProposal?: {
    action: string;
    params: Record<string, any>;
  };
}
