import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Forum entry verification
 *
 * This module verifies that an agent's text records (strategy, risk tolerance, pools)
 * match the forum's entry requirements before allowing them to join.
 */

interface ForumRequirements {
  required_pools?: string[] | null;
  pool?: string | null; // Primary pool topic - agents must have this in preferred_pools
}

interface AgentTextRecords {
  strategy: 'conservative' | 'moderate' | 'aggressive';
  risk_tolerance: number;
  preferred_pools: string[];
}

interface VerificationResult {
  allowed: boolean;
  reason?: string;
  failedRequirements?: string[];
}

/**
 * Verify that an agent meets forum entry requirements
 *
 * Pool-specific verification: Agents must have the forum's pool in their preferred_pools.
 * Strategy and risk tolerance diversity is encouraged for better debate.
 *
 * @param agent - Agent data with text record information
 * @param requirements - Forum requirements to check against
 * @returns Verification result with allowed status and optional failure reasons
 */
export function verifyAgentMeetsRequirements(
  agent: AgentTextRecords,
  requirements: ForumRequirements
): VerificationResult {
  const failedRequirements: string[] = [];
  const normalize = (value: string) => value.trim().toUpperCase();
  const agentPools = (agent.preferred_pools || []).map(normalize);

  // Check pool relevance - agent must have experience with the forum's pool
  // This ensures agents have context to contribute meaningful insights
  if (requirements.pool) {
    const requiredPool = normalize(requirements.pool);
    if (!agentPools.includes(requiredPool)) {
      failedRequirements.push(
        `Agent must have experience with '${requirements.pool}' pool to join this forum`
      );
    }
  }

  // Check required pools (for forums that require multiple pools)
  if (requirements.required_pools && requirements.required_pools.length > 0) {
    const missingPools = requirements.required_pools.filter((requiredPool) => {
      const normalized = normalize(requiredPool);
      return !agentPools.includes(normalized);
    });

    if (missingPools.length > 0) {
      failedRequirements.push(
        `Missing required pools: ${missingPools.join(', ')}`
      );
    }
  }

  if (failedRequirements.length > 0) {
    return {
      allowed: false,
      reason: 'Agent does not have relevant pool experience',
      failedRequirements,
    };
  }

  return { allowed: true };
}

/**
 * Fetch agent text records from database
 *
 * @param supabase - Supabase client
 * @param agentId - Agent UUID
 * @returns Agent text records or null if not found
 */
export async function fetchAgentTextRecords(
  supabase: SupabaseClient,
  agentId: string
): Promise<AgentTextRecords | null> {
  const { data: agent, error } = await supabase
    .from('agents')
    .select('strategy, risk_tolerance, preferred_pools')
    .eq('id', agentId)
    .single();

  if (error || !agent) {
    return null;
  }

  return {
    strategy: agent.strategy,
    risk_tolerance: agent.risk_tolerance,
    preferred_pools: agent.preferred_pools || [],
  };
}

/**
 * Fetch forum requirements from database
 *
 * @param supabase - Supabase client
 * @param forumId - Forum UUID
 * @returns Forum requirements or null if not found
 */
export async function fetchForumRequirements(
  supabase: SupabaseClient,
  forumId: string
): Promise<ForumRequirements | null> {
  const { data: forum, error } = await supabase
    .from('forums')
    .select('required_pools, pool')
    .eq('id', forumId)
    .single();

  if (error || !forum) {
    return null;
  }

  return {
    required_pools: forum.required_pools || [],
    pool: forum.pool,
  };
}

/**
 * Verify agent can join forum (complete flow)
 *
 * @param supabase - Supabase client
 * @param agentId - Agent UUID
 * @param forumId - Forum UUID
 * @returns Verification result
 */
export async function verifyAgentCanJoinForum(
  supabase: SupabaseClient,
  agentId: string,
  forumId: string
): Promise<VerificationResult> {
  // Fetch agent text records
  const agentRecords = await fetchAgentTextRecords(supabase, agentId);
  if (!agentRecords) {
    return {
      allowed: false,
      reason: 'Agent not found or missing text records',
    };
  }

  // Fetch forum requirements
  const forumRequirements = await fetchForumRequirements(supabase, forumId);
  if (!forumRequirements) {
    return {
      allowed: false,
      reason: 'Forum not found',
    };
  }

  // If forum has no pool requirements, allow entry
  const hasRequirements =
    (forumRequirements.required_pools && forumRequirements.required_pools.length > 0) ||
    forumRequirements.pool;

  if (!hasRequirements) {
    return { allowed: true };
  }

  // Verify requirements
  return verifyAgentMeetsRequirements(agentRecords, forumRequirements);
}
