/**
 * Quorum-Based Consensus
 *
 * Determines when agents have reached agreement on a proposal.
 */

import type { Proposal, Vote, ConsensusResult } from '@uniforum/shared';
import { CONSENSUS_CONFIG } from '@uniforum/shared';

export interface ConsensusConfig {
  quorumThreshold: number; // e.g., 0.6 = 60%
  minParticipants: number; // Minimum agents to vote
  timeoutMinutes: number; // Auto-close after timeout
}

export const DEFAULT_CONSENSUS_CONFIG: ConsensusConfig = {
  quorumThreshold: CONSENSUS_CONFIG.DEFAULT_QUORUM_THRESHOLD,
  minParticipants: CONSENSUS_CONFIG.MIN_PARTICIPANTS,
  timeoutMinutes: CONSENSUS_CONFIG.DEFAULT_TIMEOUT_MINUTES,
};

/**
 * Check if consensus has been reached on a proposal
 */
export function checkConsensus(
  agreeCount: number,
  disagreeCount: number,
  config: ConsensusConfig = DEFAULT_CONSENSUS_CONFIG
): ConsensusResult {
  const totalVotes = agreeCount + disagreeCount;

  // Check minimum participation
  if (totalVotes < config.minParticipants) {
    return {
      reached: false,
      reason: 'insufficient_participation',
    };
  }

  // Calculate agreement percentage
  const agreePercentage = agreeCount / totalVotes;

  // Check if quorum is met
  if (agreePercentage >= config.quorumThreshold) {
    return {
      reached: true,
      result: 'approved',
      percentage: agreePercentage,
    };
  }

  // Check if consensus is mathematically impossible
  // (too many disagrees to ever reach quorum)
  const remainingPossibleAgrees = totalVotes; // Assume everyone else agrees
  const maxPossiblePercentage = (agreeCount + remainingPossibleAgrees) / (totalVotes * 2);

  // This calculation isn't quite right for "remaining" votes
  // Simpler: if disagree is already > (1 - threshold), consensus is impossible
  const disagreePercentage = disagreeCount / totalVotes;
  if (disagreePercentage > 1 - config.quorumThreshold) {
    return {
      reached: true,
      result: 'rejected',
      reason: 'consensus_impossible',
      percentage: agreePercentage,
    };
  }

  // Voting still in progress
  return {
    reached: false,
    reason: 'voting_in_progress',
    percentage: agreePercentage,
  };
}

/**
 * Check if a proposal has expired
 */
export function isProposalExpired(expiresAt: string | Date): boolean {
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return new Date() > expiry;
}

/**
 * Calculate expiry time for a new proposal
 */
export function calculateProposalExpiry(timeoutMinutes: number = DEFAULT_CONSENSUS_CONFIG.timeoutMinutes): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + timeoutMinutes);
  return expiry;
}

/**
 * Get list of agents who agreed to a proposal
 */
export function getAgreeingAgents(votes: Vote[]): string[] {
  return votes.filter((v) => v.vote === 'agree').map((v) => v.agentEnsName);
}

/**
 * Get list of agents who disagreed with a proposal
 */
export function getDisagreeingAgents(votes: Vote[]): string[] {
  return votes.filter((v) => v.vote === 'disagree').map((v) => v.agentEnsName);
}

/**
 * Check if an agent has already voted on a proposal
 */
export function hasAgentVoted(votes: Vote[], agentId: string): boolean {
  return votes.some((v) => v.agentId === agentId);
}
