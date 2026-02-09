/**
 * Discussion Message Generation
 *
 * Generate context-aware discussion messages for agents.
 */

import type { Forum, ForumMessage } from '@uniforum/shared';

export interface AgentDiscussionContext {
  name: string;
  ensName: string;
  strategy: 'conservative' | 'moderate' | 'aggressive';
  riskTolerance: number;
  preferredPools: string[];
  expertiseContext?: string;
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
}

export interface DiscussionContext {
  forum: Forum;
  recentMessages: ForumMessage[];
  currentProposal?: {
    action: string;
    params: Record<string, any>;
  };
  poolSnapshot?: Record<string, unknown> | null;
}

/**
 * Build a prompt for generating a discussion message
 */
export function buildDiscussionPrompt(
  agent: AgentDiscussionContext,
  context: DiscussionContext
): string {
  const nowIso = new Date().toISOString();
  const recentMessagesText = context.recentMessages
    .slice(-5)
    .map((m) => `${m.agentEnsName}: ${m.content}`)
    .join('\n');

  return `
You are ${agent.name} (${agent.ensName}), an autonomous DeFi agent participating in a Uniforum discussion.

Your Profile:
- Strategy: ${agent.strategy}
- Risk Tolerance: ${(agent.riskTolerance * 100).toFixed(0)}%
- Preferred Pools: ${agent.preferredPools.join(', ')}
- Expertise: ${agent.expertiseContext || 'General DeFi knowledge'}
${agent.rulesOfThumb?.length ? `- Rules of Thumb: ${agent.rulesOfThumb.join(' | ')}` : ''}
${agent.constraints ? `- Constraints: ${JSON.stringify(agent.constraints)}` : ''}
${agent.objectiveWeights ? `- Objective Weights: ${JSON.stringify(agent.objectiveWeights)}` : ''}

Forum Context:
- Title: ${context.forum.title}
- Goal: ${context.forum.goal}
- Pool Focus: ${context.forum.pool || 'General'}
- Current Time (UTC): ${nowIso}
${context.poolSnapshot ? `- Pool Data: ${JSON.stringify(context.poolSnapshot)}` : `- Pool Data: Not available (use your ${agent.preferredPools.join(', ')} expertise)`}

Recent Messages:
${recentMessagesText || '(No messages yet - you are starting the discussion)'}

${context.currentProposal ? `Current Proposal: ${JSON.stringify(context.currentProposal)}` : '(No proposal yet)'}

Instructions:
1. Share a SPECIFIC strategy or opinion based on your ${agent.strategy} approach
2. Use concrete numbers and parameters (amounts, ranges, fee tiers, slippage)
3. Explain WHY your strategy would work given your expertise
4. If pool data is available, reference it; otherwise use your knowledge of ${agent.preferredPools.join(', ')}
5. Be concise (3-5 sentences) and actionable - NO meta-discussion about "gathering data" or "analyzing"
6. Stay in character: ${agent.strategy === 'conservative' ? 'prioritize safety and capital preservation' : agent.strategy === 'aggressive' ? 'maximize returns with calculated risks' : 'balance risk and reward'}

IMPORTANT: Do NOT say things like "let me fetch data" or "I'll gather information". State your strategy directly.

Your response:
`.trim();
}

/**
 * Build a prompt for a debate follow-up response (counterpoint / critique).
 */
export function buildDebatePrompt(
  agent: AgentDiscussionContext,
  context: DiscussionContext
): string {
  const nowIso = new Date().toISOString();
  const recentMessagesText = context.recentMessages
    .slice(-5)
    .map((m) => `${m.agentEnsName}: ${m.content}`)
    .join('\n');

  return `
You are ${agent.name} (${agent.ensName}), providing a follow-up critique or alternative view.

Your Profile:
- Strategy: ${agent.strategy}
- Risk Tolerance: ${(agent.riskTolerance * 100).toFixed(0)}%
- Preferred Pools: ${agent.preferredPools.join(', ')}
${agent.rulesOfThumb?.length ? `- Rules of Thumb: ${agent.rulesOfThumb.join(' | ')}` : ''}
${agent.constraints ? `- Constraints: ${JSON.stringify(agent.constraints)}` : ''}

Forum Context:
- Title: ${context.forum.title}
- Goal: ${context.forum.goal}
- Pool Focus: ${context.forum.pool || 'General'}
- Current Time (UTC): ${nowIso}
${context.poolSnapshot ? `- Pool Data: ${JSON.stringify(context.poolSnapshot)}` : `- Pool Data: Not available (use your ${agent.preferredPools.join(', ')} expertise)`}

Recent Messages:
${recentMessagesText || '(No messages yet)'}

Instructions:
1. Challenge or refine the previous suggestions with specific reasoning
2. Provide concrete alternatives (different amounts, fee tiers, pool allocations, etc.)
3. Explain WHY your approach is better given your ${agent.strategy} strategy
4. Reference specific risks or opportunities based on your ${agent.preferredPools.join(', ')} experience
5. Be direct and concise (3-5 sentences) - NO meta-discussion

IMPORTANT: State your counterpoint directly. Do NOT say "let me analyze" or "I'll review".

Your response:
`.trim();
}

/**

* Determine if an agent should participate in a discussion.
 *
 * NOTE: This is only called for agents that are already explicit
 * forum_participants.  The pool-matching and mention checks therefore
 * serve as *priority hints*, NOT hard gates.  An agent that was
 * explicitly joined to a forum should always be allowed to speak;
 * the only hard gate is the rate-limiter.
 */
export function shouldParticipate(
  agent: AgentDiscussionContext,
  forum: Forum,
  recentMessages: ForumMessage[],
  options?: { minIntervalMs?: number; maxAutoMessages?: number }
): { should: boolean; reason: string } {
  // Always participate if no messages yet
  if (recentMessages.length === 0) {
    return { should: true, reason: 'Starting discussion' };
  }

  // Rate limit: don't respond too frequently.
  // Only count messages the agent *generated* autonomously (source === 'agent-service'),
  // not API-originated messages (e.g. a user-posted kickoff on behalf of the agent).
  // NOTE: recentMessages may arrive in any order (often desc by created_at),
  // so pick the *most recent* auto-message by timestamp rather than by array index.
  const agentAutoMessages = recentMessages.filter(
    (m) => m.agentEnsName === agent.ensName && (m.metadata as any)?.source === 'agent-service'
  );
  const agentLastAutoMessage = agentAutoMessages.reduce<ForumMessage | null>(
    (latest, m) =>
      !latest || new Date(m.createdAt).getTime() > new Date(latest.createdAt).getTime()
        ? m
        : latest,
    null
  );

  if (agentLastAutoMessage) {
    const timeSinceLastMessage = Date.now() - new Date(agentLastAutoMessage.createdAt).getTime();
    const minInterval = Math.max(250, options?.minIntervalMs ?? 30 * 1000);

    if (timeSinceLastMessage < minInterval) {
      return { should: false, reason: 'Too soon since last message' };
    }
  }

  // Limit total autonomous messages per agent to prevent infinite debate loops.
  // This is a hard cap checked before any other priority hints.
  const maxAutoMessages = options?.maxAutoMessages ?? 3;
  if (agentAutoMessages.length >= maxAutoMessages) {
    return { should: false, reason: `Reached max auto-messages (${maxAutoMessages})` };
  }

  // Check if forum topic matches agent's expertise (priority hint)
  const forumPool = forum.pool?.toLowerCase() || '';
  const matchesPool = agent.preferredPools.some(
    (p) => p.toLowerCase().includes(forumPool) || forumPool.includes(p.toLowerCase())
  );

  if (matchesPool) {
    return { should: true, reason: `Forum matches preferred pool: ${forum.pool}` };
  }

  // Check if agent was mentioned in recent messages
  const wasMentioned = recentMessages.some((m) =>
    m.content.toLowerCase().includes(agent.ensName.toLowerCase())
  );

  if (wasMentioned) {
    return { should: true, reason: 'Agent was mentioned in discussion' };
  }

  // Agent is an explicit forum participant — always allow them to speak
  return { should: true, reason: 'Active forum participant' };
}

/**
 * Build a prompt for generating a proposal
 */
export function buildProposalPrompt(
  agent: AgentDiscussionContext,
  context: DiscussionContext
): string {
  return `
You are ${agent.name} (${agent.ensName}), proposing a specific action for the forum.

Forum Goal: ${context.forum.goal}
Pool Focus: ${context.forum.pool || 'General'}
Your Strategy: ${agent.strategy}
${agent.rulesOfThumb?.length ? `Rules of Thumb: ${agent.rulesOfThumb.join(' | ')}` : ''}
${agent.constraints ? `Constraints: ${JSON.stringify(agent.constraints)}` : ''}
${context.poolSnapshot ? `Pool Snapshot: ${JSON.stringify(context.poolSnapshot)}` : ''}

Based on the discussion, create a concrete proposal with:
1. Action type: swap, addLiquidity, removeLiquidity, or limitOrder
2. Specific parameters (tokens, amounts, etc.)
3. Optional: hooks to enable (antiSandwich, dynamicFee, etc.)

Format your response as JSON:
{
  "action": "swap",
  "params": {
    "tokenIn": "ETH",
    "tokenOut": "USDC",
    "amount": "0.5",
    "slippage": 0.005
  },
  "hooks": {
    "antiSandwich": { "enabled": true }
  },
  "description": "Brief explanation of why this proposal"
}
`.trim();
}
