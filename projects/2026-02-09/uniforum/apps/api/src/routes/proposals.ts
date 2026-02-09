import { Hono } from 'hono';
import { z } from 'zod';
import { getSupabase } from '../lib/supabase';
import { formatAgentEns, mapAgentIdsToEns, normalizeEnsInput } from '../lib/agents';
import { authMiddleware, AuthUser } from '../lib/auth';
import { enrichExecutionPayloadParams } from '../lib/enrichExecutionPayload';

export const proposalsRoutes = new Hono<{
  Variables: {
    user: AuthUser;
  };
}>();

const voteSchema = z.object({
  agentEns: z.string(),
  vote: z.enum(['agree', 'disagree']),
});

// GET /proposals/:proposalId - Get proposal details
proposalsRoutes.get('/:proposalId', async (c) => {
  const proposalId = c.req.param('proposalId');
  const supabase = getSupabase();

  const { data: proposal, error } = await supabase
    .from('proposals')
    .select(
      `
      *,
      votes:votes(
        id,
        agent_id,
        vote,
        created_at
      ),
      forum:forums(
        id,
        title,
        quorum_threshold
      )
    `
    )
    .eq('id', proposalId)
    .single();

  if (error || !proposal) {
    return c.json({ error: 'Proposal not found' }, 404);
  }

  // Calculate vote tallies
  const votes = proposal.votes || [];
  const agreeCount = votes.filter((v: { vote: string }) => v.vote === 'agree').length;
  const disagreeCount = votes.filter((v: { vote: string }) => v.vote === 'disagree').length;
  const totalVotes = votes.length;
  const { count: participantCount } = await supabase
    .from('forum_participants')
    .select('id', { count: 'exact', head: true })
    .eq('forum_id', proposal.forum_id)
    .eq('is_active', true);

  const proposerEnsById = await mapAgentIdsToEns(supabase, [proposal.creator_agent_id]);
  const voteAgentIds = votes.map((vote: { agent_id: string }) => vote.agent_id);
  const voteEnsById = await mapAgentIdsToEns(supabase, voteAgentIds);

  return c.json({
    id: proposal.id,
    forumId: proposal.forum_id,
    proposerEns: proposerEnsById.get(proposal.creator_agent_id) || '',
    action: proposal.action,
    params: proposal.params,
    hooks: proposal.hooks,
    status: proposal.status,
    createdAt: proposal.created_at,
    votes: votes.map((vote: { id: string; agent_id: string; vote: string; created_at: string }) => ({
      id: vote.id,
      proposalId: proposal.id,
      agentEns: voteEnsById.get(vote.agent_id) || '',
      vote: vote.vote,
      createdAt: vote.created_at,
    })),
    voteTally: {
      agree: agreeCount,
      disagree: disagreeCount,
      total: totalVotes,
      participantCount: participantCount || 0,
      percentage: totalVotes > 0 ? agreeCount / totalVotes : 0,
      quorumMet:
        totalVotes >= 3 &&
        agreeCount / totalVotes >= (proposal.forum?.quorum_threshold || 0.6),
    },
  });
});

const DEFAULT_EXECUTION_CHAIN_ID = 1301;

// GET /proposals/:proposalId/execution-payload - Get execution payload for an approved proposal
// Returns the data format the agent (or execution worker) needs to form and execute the tx.
proposalsRoutes.get('/:proposalId/execution-payload', async (c) => {
  const proposalId = c.req.param('proposalId');
  const supabase = getSupabase();

  const { data: proposal, error } = await supabase
    .from('proposals')
    .select(
      `
      id,
      forum_id,
      action,
      params,
      hooks,
      status,
      resolved_at,
      forum:forums(
        id,
        goal,
        creator_agent_id
      )
    `
    )
    .eq('id', proposalId)
    .single();

  if (error || !proposal) {
    return c.json({ error: 'Proposal not found' }, 404);
  }

  if (proposal.status !== 'approved' && proposal.status !== 'executing') {
    return c.json(
      { error: 'Proposal is not approved; only approved/executing proposals have an execution payload' },
      400
    );
  }

  const forum = proposal.forum as { goal?: string; creator_agent_id?: string } | null;
  const executorEnsById = forum?.creator_agent_id
    ? await mapAgentIdsToEns(supabase, [forum.creator_agent_id])
    : new Map<string, string>();
  const executorEnsName = forum?.creator_agent_id
    ? executorEnsById.get(forum.creator_agent_id)
    : undefined;
  if (!executorEnsName) {
    return c.json({ error: 'Forum creator could not be resolved' }, 500);
  }

  const chainId = parseInt(c.req.query('chainId') || String(DEFAULT_EXECUTION_CHAIN_ID), 10);

  const rawParams = (proposal.params as Record<string, unknown>) || {};
  const params = await enrichExecutionPayloadParams(
    proposal.action,
    rawParams,
    chainId,
    forum?.goal,
    {
      rpcUrl: process.env.UNICHAIN_SEPOLIA_RPC_URL ?? process.env[`RPC_URL_${chainId}`],
      tokenListUrl: process.env.TOKEN_LIST_URL,
      tokenListUrlByChain: [1301, 130].reduce(
        (acc, id) => {
          const u = process.env[`TOKEN_LIST_URL_${id}`];
          if (u) acc[id] = u;
          return acc;
        },
        {} as Record<number, string>
      ),
      graphApiKey: process.env.GRAPH_API_KEY,
      subgraphUrl: process.env.UNISWAP_V4_SUBGRAPH_URL,
    }
  );

  const payload = {
    proposalId: proposal.id,
    forumId: proposal.forum_id,
    executorEnsName,
    action: proposal.action,
    params,
    hooks: proposal.hooks ?? undefined,
    chainId,
    deadline:
      (params as { deadline?: number }).deadline ?? (rawParams as { deadline?: number }).deadline,
    forumGoal: forum?.goal ?? undefined,
    approvedAt: proposal.resolved_at ?? undefined,
  };

  return c.json(payload);
});

// POST /proposals/:proposalId/vote - Cast vote on proposal
proposalsRoutes.post('/:proposalId/vote', authMiddleware, async (c) => {
  const user = c.get('user');
  const proposalId = c.req.param('proposalId');
  const supabase = getSupabase();

  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      },
      400
    );
  }

  const { agentEns, vote } = parsed.data;
  const { subdomain: agentSubdomain, full: agentFullEns } = normalizeEnsInput(agentEns);

  // Verify agent ownership
  const { data: agent } = await supabase
    .from('agents')
    .select('id, owner_address, ens_name, full_ens_name')
    .eq('ens_name', agentSubdomain)
    .single();

  if (!agent) {
    return c.json({ error: 'Agent not found' }, 404);
  }

  if (agent.owner_address?.toLowerCase() !== user.walletAddress?.toLowerCase()) {
    return c.json({ error: 'You do not own this agent' }, 403);
  }

  // Get proposal with forum info
  const { data: proposal } = await supabase
    .from('proposals')
    .select(
      `
      *,
      forum:forums(
        id,
        quorum_threshold
      )
    `
    )
    .eq('id', proposalId)
    .single();

  if (!proposal) {
    return c.json({ error: 'Proposal not found' }, 404);
  }

  if (proposal.status !== 'voting') {
    return c.json({ error: 'Voting is closed for this proposal' }, 400);
  }

  const { data: activeParticipant } = await supabase
    .from('forum_participants')
    .select('id')
    .eq('forum_id', proposal.forum_id)
    .eq('agent_id', agent.id)
    .eq('is_active', true)
    .maybeSingle();

  if (!activeParticipant) {
    return c.json({ error: 'Agent is not a participant in this forum' }, 403);
  }

  // Check if already voted
  const { data: existingVote } = await supabase
    .from('votes')
    .select('id')
    .eq('proposal_id', proposalId)
    .eq('agent_id', agent.id)
    .single();

  if (existingVote) {
    return c.json({ error: 'Agent has already voted' }, 400);
  }

  // Cast vote
  const { data: newVote, error } = await supabase
    .from('votes')
    .insert({
      proposal_id: proposalId,
      agent_id: agent.id,
      vote,
    })
    .select()
    .single();

  if (error) {
    console.error('[proposals] Vote error:', error);
    return c.json({ error: 'Failed to cast vote' }, 500);
  }

  // Increment agent's vote count
  const { error: votesRpcError } = await supabase.rpc('increment_votes_cast', {
    agent_id_param: agent.id,
  });
  if (votesRpcError) {
    const { data: metrics, error: metricsError } = await supabase
      .from('agent_metrics')
      .select('votes_participated')
      .eq('agent_id', agent.id)
      .single();

    if (metricsError) {
      console.warn('[proposals] Failed to load agent metrics for vote increment:', metricsError);
    } else {
      const nextVotes = (metrics?.votes_participated ?? 0) + 1;
      const { error: updateError } = await supabase
        .from('agent_metrics')
        .update({ votes_participated: nextVotes })
        .eq('agent_id', agent.id);

      if (updateError) {
        console.warn('[proposals] Failed to update agent vote metrics:', updateError);
      }
    }
  }

  // Create message for the vote
  await supabase.from('messages').insert({
    forum_id: proposal.forum_id,
    agent_id: agent.id,
    content: `Voted: ${vote}`,
    type: 'vote',
    metadata: { proposalId, vote },
  });

  // Check if consensus reached
  const { data: allVotes } = await supabase
    .from('votes')
    .select('vote')
    .eq('proposal_id', proposalId);

  const totalVotes = allVotes?.length || 0;
  const agreeVotes = allVotes?.filter((v) => v.vote === 'agree').length || 0;
  const { count: participantCount } = await supabase
    .from('forum_participants')
    .select('id', { count: 'exact', head: true })
    .eq('forum_id', proposal.forum_id)
    .eq('is_active', true);
  const quorumThreshold = proposal.forum?.quorum_threshold || 0.6;

  const consensusReached = totalVotes >= 2 && agreeVotes / totalVotes >= quorumThreshold;

  if (consensusReached) {
    // Update proposal status
    await supabase.from('proposals').update({ status: 'approved' }).eq('id', proposalId);

    // Update forum status
    await supabase.from('forums').update({ status: 'consensus' }).eq('id', proposal.forum_id);

    // Create consensus message
    await supabase.from('messages').insert({
      forum_id: proposal.forum_id,
      agent_id: null,
      content: `Consensus reached! ${agreeVotes}/${totalVotes} agents agreed (${Math.round((agreeVotes / totalVotes) * 100)}%)`,
      type: 'result',
    });
  }

  return c.json({
    id: newVote.id,
    proposalId: newVote.proposal_id,
    agentEns: formatAgentEns(agent) || agentFullEns,
    vote: newVote.vote,
    createdAt: newVote.created_at,
    consensusReached,
    voteTally: {
      agree: agreeVotes,
      disagree: totalVotes - agreeVotes,
      total: totalVotes,
      participantCount: participantCount || 0,
      percentage: agreeVotes / totalVotes,
    },
  });
});
