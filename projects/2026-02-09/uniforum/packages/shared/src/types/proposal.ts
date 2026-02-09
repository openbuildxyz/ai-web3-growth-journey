/**
 * Proposal-related types
 */

import { z } from 'zod';

// Status enum
export const ProposalStatus = {
  VOTING: 'voting',
  APPROVED: 'approved',
  EXECUTING: 'executing',
  REJECTED: 'rejected',
  EXECUTED: 'executed',
  EXPIRED: 'expired',
} as const;

export type ProposalStatus = (typeof ProposalStatus)[keyof typeof ProposalStatus];

// Action types
export const ProposalAction = {
  SWAP: 'swap',
  ADD_LIQUIDITY: 'addLiquidity',
  REMOVE_LIQUIDITY: 'removeLiquidity',
  LIMIT_ORDER: 'limitOrder',
} as const;

export type ProposalAction = (typeof ProposalAction)[keyof typeof ProposalAction];

// Vote type
export const VoteType = {
  AGREE: 'agree',
  DISAGREE: 'disagree',
} as const;

export type VoteType = (typeof VoteType)[keyof typeof VoteType];

// Execution status
export const ExecutionStatus = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

export type ExecutionStatus = (typeof ExecutionStatus)[keyof typeof ExecutionStatus];

// Proposal parameters
export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amount: string;
  slippage?: number;
  deadline?: number;
}

export interface LiquidityParams {
  pool: string;
  amount0?: string;
  amount1?: string;
  tickLower?: number;
  tickUpper?: number;
}

export interface LimitOrderParams {
  tokenIn: string;
  tokenOut: string;
  amount: string;
  targetTick: number;
  zeroForOne: boolean;
}

export interface RemoveLiquidityParams {
  tokenId: string;
  liquidityAmount: string;
}

export type ProposalParams =
  | SwapParams
  | LiquidityParams
  | LimitOrderParams
  | RemoveLiquidityParams;

// Hook configuration
export interface ProposalHooks {
  /**
   * The deployed hook contract address. When set, this is included in the pool key
   * (currency0, currency1, fee, tickSpacing, hooks). The pool must have been initialized
   * with this hook address for the transaction to succeed.
   */
  hooksAddress?: string;
  /**
   * Arbitrary hook data bytes (hex-encoded) to pass to the hook contract.
   * Used when a hook requires custom data for beforeSwap/afterSwap/beforeMint etc.
   * For limit orders, hookData is auto-generated from targetTick + zeroForOne.
   */
  hookData?: string;
  antiSandwich?: {
    enabled: boolean;
  };
  limitOrder?: {
    enabled: boolean;
    targetTick: number;
    zeroForOne: boolean;
  };
  dynamicFee?: {
    enabled: boolean;
    feeBps: number;
  };
  overrideFee?: {
    enabled: boolean;
    feeBps: number;
  };
}

// Zod schema for proposal creation
export const createProposalSchema = z.object({
  action: z.enum(['swap', 'addLiquidity', 'removeLiquidity', 'limitOrder']),
  params: z.record(z.any()),
  hooks: z
    .object({
      hooksAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
      hookData: z.string().regex(/^0x[a-fA-F0-9]*$/).optional(),
      antiSandwich: z.object({ enabled: z.boolean() }).optional(),
      limitOrder: z
        .object({
          enabled: z.boolean(),
          targetTick: z.number(),
          zeroForOne: z.boolean(),
        })
        .optional(),
      dynamicFee: z
        .object({
          enabled: z.boolean(),
          feeBps: z.number().min(0).max(10000),
        })
        .optional(),
      overrideFee: z
        .object({
          enabled: z.boolean(),
          feeBps: z.number().min(0).max(10000),
        })
        .optional(),
    })
    .optional(),
  description: z.string().max(500).optional(),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;

// Proposal interface
export interface Proposal {
  id: string;
  forumId: string;
  creatorAgentId: string;
  creatorEnsName: string;
  description?: string;
  action: ProposalAction;
  params: ProposalParams;
  hooks?: ProposalHooks;
  status: ProposalStatus;
  agreeCount: number;
  disagreeCount: number;
  createdAt: string;
  expiresAt: string;
  resolvedAt?: string;
}

// Proposal with votes (for detailed view)
export interface ProposalDetailed extends Proposal {
  votes: Vote[];
  consensusPercentage: number;
  executions?: Execution[];
}

// Vote
export interface Vote {
  id: string;
  proposalId: string;
  agentId: string;
  agentEnsName: string;
  vote: VoteType;
  reason?: string;
  createdAt: string;
}

// Execution
export interface Execution {
  id: string;
  proposalId: string;
  agentId: string;
  agentEnsName: string;
  status: ExecutionStatus;
  txHash?: string;
  error?: string;
  gasUsed?: string;
  blockNumber?: number;
  createdAt: string;
  completedAt?: string;
}

// Consensus result
export interface ConsensusResult {
  reached: boolean;
  result?: 'approved' | 'rejected';
  reason?: string;
  percentage?: number;
  agreeingAgents?: string[];
}

/**
 * Execution payload: the data format the backend returns so the agent (or
 * execution worker) can form and execute the transaction. Topic-agnostic and
 * action-agnostic — works for any forum and any action (swap, addLiquidity,
 * removeLiquidity, limitOrder).
 *
 * The executor is always the forum creator's agent; other agents only vote.
 */
export interface ExecutionPayload {
  /** Proposal and forum identifiers */
  proposalId: string;
  forumId: string;
  /** ENS name of the single agent that must execute (forum creator) */
  executorEnsName: string;
  /** Action to perform; params shape depends on action */
  action: ProposalAction;
  params: ProposalParams;
  hooks?: ProposalHooks;
  /** Chain to execute on (e.g. 1301 for Unichain) */
  chainId: number;
  /** Optional deadline (unix seconds); used for swaps */
  deadline?: number;
  /** Human-readable forum goal (for logging/display) */
  forumGoal?: string;
  /** When the proposal was approved (ISO string) */
  approvedAt?: string;
}
