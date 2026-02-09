/**
 * Agent-related types
 */

import { z } from 'zod';

// Strategy enum
export const AgentStrategy = {
  CONSERVATIVE: 'conservative',
  MODERATE: 'moderate',
  AGGRESSIVE: 'aggressive',
} as const;

export type AgentStrategy = (typeof AgentStrategy)[keyof typeof AgentStrategy];

// Status enum
export const AgentStatus = {
  ACTIVE: 'active',
  IDLE: 'idle',
  OFFLINE: 'offline',
} as const;

export type AgentStatus = (typeof AgentStatus)[keyof typeof AgentStatus];

// Zod schema for agent creation
export const createAgentSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Name must be lowercase alphanumeric with hyphens'),
  strategy: z.enum(['conservative', 'moderate', 'aggressive']),
  riskTolerance: z.number().min(0).max(1),
  preferredPools: z.array(z.string()).min(1),
  expertiseContext: z.string().max(2000).optional(),
  avatarUrl: z.string().url().optional(),
  rulesOfThumb: z.array(z.string().min(3)).min(1),
  constraints: z.record(z.any()).refine((value) => Object.keys(value).length > 0, {
    message: 'constraints must include at least one field',
  }),
  objectiveWeights: z.record(z.number()).refine((value) => Object.keys(value).length > 0, {
    message: 'objectiveWeights must include at least one field',
  }),
  debate: z
    .object({
      enabled: z.boolean().optional(),
      rounds: z.number().min(1).max(12).optional(),
      delayMs: z.number().min(250).max(30000).optional(),
      minDurationMs: z.number().min(0).max(300000).optional(),
      maxRounds: z.number().min(1).max(20).optional(),
      minIntervalMs: z.number().min(250).max(60000).optional(),
    })
    .optional(),
  temperatureDelta: z.number().min(-0.2).max(0.2).optional(),
  modelProvider: z.enum(['openai', 'claude']).optional(),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;

// Zod schema for agent creation with uploaded character config
export const uploadAgentSchema = createAgentSchema.extend({
  characterConfig: z.record(z.any()),
  plugins: z.array(z.string()).optional(),
});

export type UploadAgentInput = z.infer<typeof uploadAgentSchema>;

// Agent interface (for API responses)
export interface Agent {
  id: string;
  ensName: string;
  fullEnsName: string;
  ownerAddress: string;
  agentWallet: string;
  strategy: AgentStrategy;
  riskTolerance: number;
  preferredPools: string[];
  expertiseContext?: string;
  avatarUrl?: string;
  status: AgentStatus;
  createdAt: string;
  lastActiveAt: string;
  configSource?: 'template' | 'upload';
  characterPlugins?: string[];
}

// Agent with metrics (for detailed views)
export interface AgentWithMetrics extends Agent {
  metrics: AgentMetrics;
  currentForumId?: string;
}

export interface AgentMetrics {
  messagesPosted: number;
  proposalsMade: number;
  votesParticipated: number;
  forumsParticipated: number;
  successfulExecutions: number;
  failedExecutions: number;
  totalGasSpent: string;
  totalVolumeTraded: string;
  timesInMajority: number;
  timesInMinority: number;
}

// Uniswap history (fetched during creation)
export interface UniswapHistory {
  totalSwaps: number;
  totalLiquidityProvided: string;
  topPools: string[];
}
