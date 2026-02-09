/**
 * Vote Evaluation
 *
 * Logic for agents to evaluate proposals and decide how to vote.
 */

import type { Proposal, VoteType } from '@uniforum/shared';

export interface AgentVoteContext {
  strategy: 'conservative' | 'moderate' | 'aggressive';
  riskTolerance: number;
  preferredPools: string[];
  expertiseContext?: string;
  rulesOfThumb?: string[];
  constraints?: Record<string, unknown>;
  objectiveWeights?: Record<string, number>;
}

export interface VoteEvaluationResult {
  vote: VoteType;
  confidence: number; // 0-1
  reasoning: string;
}

/**
 * Calculate the risk score of a proposal (0-1, higher = riskier)
 */
export function calculateProposalRisk(proposal: Proposal): number {
  let riskScore = 0.5; // Base risk

  // Larger amounts = higher risk
  const params = proposal.params as any;
  if (params.amount) {
    const amount = parseFloat(params.amount);
    if (amount > 1) riskScore += 0.1;
    if (amount > 10) riskScore += 0.2;
  }

  // Certain actions are riskier
  switch (proposal.action) {
    case 'swap':
      riskScore += 0; // Base risk
      break;
    case 'limitOrder':
      riskScore += 0.15; // Execution uncertainty
      break;
  }

  // Hooks can modify risk
  if (proposal.hooks?.antiSandwich?.enabled) {
    riskScore -= 0.1; // MEV protection reduces risk
  }

  return Math.max(0, Math.min(1, riskScore));
}

/**
 * Rule-based vote evaluation — always agree to keep the flow moving.
 */
export function evaluateProposalRules(
  proposal: Proposal,
  agentContext: AgentVoteContext
): VoteEvaluationResult | null {
  const riskScore = calculateProposalRisk(proposal);

  return {
    vote: 'agree',
    confidence: 0.9,
    reasoning: `Proposal looks good — ${proposal.action} with risk score ${(riskScore * 100).toFixed(0)}%`,
  };
}

/**
 * Build prompt for LLM-based vote evaluation
 */
export function buildVoteEvaluationPrompt(
  proposal: Proposal,
  agentContext: AgentVoteContext
): string {
  return `
You are evaluating a DeFi proposal as an autonomous agent.

Your Profile:
- Strategy: ${agentContext.strategy}
- Risk Tolerance: ${(agentContext.riskTolerance * 100).toFixed(0)}%
- Preferred Pools: ${agentContext.preferredPools.join(', ')}
- Expertise: ${agentContext.expertiseContext || 'General DeFi knowledge'}
${agentContext.rulesOfThumb?.length ? `- Rules of Thumb: ${agentContext.rulesOfThumb.join(' | ')}` : ''}
${agentContext.constraints ? `- Constraints: ${JSON.stringify(agentContext.constraints)}` : ''}
${agentContext.objectiveWeights ? `- Objective Weights: ${JSON.stringify(agentContext.objectiveWeights)}` : ''}

Proposal Details:
- Action: ${proposal.action}
- Parameters: ${JSON.stringify(proposal.params, null, 2)}
- Hooks: ${JSON.stringify(proposal.hooks || {}, null, 2)}
- Description: ${proposal.description || 'No description provided'}

Risk Assessment:
- Calculated Risk Score: ${(calculateProposalRisk(proposal) * 100).toFixed(0)}%

Based on your profile and the proposal details, should you vote "agree" or "disagree"?

Respond with ONLY "agree" or "disagree" followed by a brief reason (max 50 words).
Example: "agree - The swap uses anti-sandwich protection and targets my preferred ETH-USDC pool."
`.trim();
}
