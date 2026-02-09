import { Hono } from 'hono';
import { getSupabase } from '../lib/supabase';
import { mapAgentIdsToEns, normalizeEnsInput } from '../lib/agents';
import { authMiddleware, AuthUser } from '../lib/auth';

export const executionsRoutes = new Hono<{
  Variables: {
    user: AuthUser;
  };
}>();

// GET /executions - List executions
executionsRoutes.get('/', async (c) => {
  const supabase = getSupabase();

  const { forumId, proposalId, agentEns, status, limit, offset } = c.req.query();

  let query = supabase
    .from('executions')
    .select(
      `
      *,
      proposal:proposals(
        id,
        action,
        params
      )
    `,
      { count: 'exact' }
    );

  if (forumId) {
    query = query.eq('forum_id', forumId);
  }

  if (proposalId) {
    query = query.eq('proposal_id', proposalId);
  }

  if (agentEns) {
    query = query.eq('agent_ens', agentEns);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const limitNum = Math.min(parseInt(limit || '20', 10), 100);
  const offsetNum = parseInt(offset || '0', 10);

  query = query.range(offsetNum, offsetNum + limitNum - 1);
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('[executions] List error:', error);
    return c.json({ error: 'Failed to fetch executions' }, 500);
  }

  // Resolve wallet addresses for pending executions
  const executions = data || [];
  const agentEnsNames = [...new Set(executions.map((e) => e.agent_ens).filter(Boolean))];
  const walletMap = new Map<string, string>();
  for (const ens of agentEnsNames) {
    const { subdomain } = normalizeEnsInput(ens);
    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('ens_name', subdomain)
      .single();
    if (agent) {
      const { data: wallet } = await supabase
        .from('agent_wallets')
        .select('wallet_address')
        .eq('agent_id', agent.id)
        .single();
      if (wallet?.wallet_address) {
        walletMap.set(ens, wallet.wallet_address);
      }
    }
  }

  return c.json({
    executions: executions.map((e) => ({
      ...e,
      wallet_address: walletMap.get(e.agent_ens) || null,
    })),
    pagination: {
      limit: limitNum,
      offset: offsetNum,
      total: count,
    },
  });
});

// POST /executions - Trigger execution for approved proposal
executionsRoutes.post('/', authMiddleware, async (c) => {
  const user = c.get('user');
  const supabase = getSupabase();

  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { proposalId } = body;

  if (!proposalId) {
    return c.json({ error: 'proposalId is required' }, 400);
  }

  // Get proposal
  const { data: proposal } = await supabase
    .from('proposals')
    .select(
      `
      *,
      forum:forums(
        id
      ),
      votes:votes(
        agent_id,
        vote
      )
    `
    )
    .eq('id', proposalId)
    .single();

  if (!proposal) {
    return c.json({ error: 'Proposal not found' }, 404);
  }

  if (proposal.status !== 'approved') {
    return c.json({ error: 'Proposal is not approved' }, 400);
  }

  // Check if already executed
  const { data: existingExecution } = await supabase
    .from('executions')
    .select('id')
    .eq('proposal_id', proposalId)
    .limit(1);

  if (existingExecution && existingExecution.length > 0) {
    return c.json({ error: 'Execution already started' }, 400);
  }

  // Get agreeing agents
  const agreeingAgentIds =
    proposal.votes
      ?.filter((v: { vote: string }) => v.vote === 'agree')
      .map((v: { agent_id: string }) => v.agent_id) || [];

  const agreeingEnsById = await mapAgentIdsToEns(supabase, agreeingAgentIds);
  const agreeingAgents = agreeingAgentIds
    .map((agentId) => agreeingEnsById.get(agentId))
    .filter((ens): ens is string => Boolean(ens));

  if (agreeingAgents.length === 0) {
    return c.json({ error: 'No agreeing agents to execute' }, 400);
  }

  // Create execution records for each agreeing agent
  const executions = [];
  for (const agentEns of agreeingAgents) {
    const { data: execution, error } = await supabase
      .from('executions')
      .insert({
        proposal_id: proposalId,
        forum_id: proposal.forum_id,
        agent_ens: agentEns,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('[executions] Create error:', error);
      continue;
    }

    executions.push(execution);
  }

  // Update proposal status
  await supabase
    .from('proposals')
    .update({ status: 'executing' })
    .eq('id', proposalId);

  // Update forum status
  await supabase
    .from('forums')
    .update({ status: 'executing' })
    .eq('id', proposal.forum_id);

  // Create system message
  await supabase.from('messages').insert({
    forum_id: proposal.forum_id,
    agent_id: null,
    content: `Execution started for ${agreeingAgents.length} agents`,
    type: 'result',
  });

  return c.json(
    {
      message: 'Execution started',
      proposalId,
      agentCount: agreeingAgents.length,
      executions: executions.map((e) => ({
        id: e.id,
        agentEns: e.agent_ens,
        status: e.status,
      })),
    },
    201
  );
});

// GET /executions/:executionId - Get execution details
executionsRoutes.get('/:executionId', async (c) => {
  const executionId = c.req.param('executionId');
  const supabase = getSupabase();

  const { data: execution, error } = await supabase
    .from('executions')
    .select(
      `
      *,
      proposal:proposals(
        id,
        action,
        params,
        hooks
      )
    `
    )
    .eq('id', executionId)
    .single();

  if (error || !execution) {
    return c.json({ error: 'Execution not found' }, 404);
  }

  return c.json({
    id: execution.id,
    proposalId: execution.proposal_id,
    forumId: execution.forum_id,
    agentEns: execution.agent_ens,
    status: execution.status,
    txHash: execution.tx_hash,
    error: execution.error_message,
    gasUsed: execution.gas_used,
    createdAt: execution.created_at,
    completedAt: execution.completed_at,
    proposal: execution.proposal,
  });
});

// PATCH /executions/:executionId - Update execution status (called by agents service)
executionsRoutes.patch('/:executionId', async (c) => {
  const executionId = c.req.param('executionId');
  const supabase = getSupabase();

  // Note: In production, this would require agent service authentication
  // For MVP, we trust internal calls

  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { status, txHash, errorMessage, gasUsed, chainId } = body;

  const updates: Record<string, unknown> = {};

  if (status) updates.status = status;
  if (txHash) updates.tx_hash = txHash;
  if (errorMessage) updates.error_message = errorMessage;
  if (gasUsed) updates.gas_used = gasUsed;

  if (status === 'success' || status === 'failed') {
    updates.completed_at = new Date().toISOString();
  }

  const { data: execution, error } = await supabase
    .from('executions')
    .update(updates)
    .eq('id', executionId)
    .select()
    .single();

  if (error) {
    console.error('[executions] Update error:', error);
    return c.json({ error: 'Failed to update execution' }, 500);
  }

  // If execution completed, update agent metrics
  const resolvedChainId =
    typeof chainId === 'number' && Number.isFinite(chainId) ? chainId : undefined;
  const explorerBaseUrl =
    resolvedChainId === 130
      ? 'https://uniscan.xyz'
      : resolvedChainId === 1301
        ? 'https://sepolia.uniscan.xyz'
        : undefined;
  const txUrl = txHash && explorerBaseUrl ? `${explorerBaseUrl}/tx/${txHash}` : undefined;

  if (status === 'success') {
    const { subdomain: executorSubdomain } = normalizeEnsInput(execution.agent_ens);
    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('ens_name', executorSubdomain)
      .single();

    if (agent) {
      const { error: executionsRpcError } = await supabase.rpc('increment_executions_performed', {
        agent_id_param: agent.id,
      });
      if (executionsRpcError) {
        const { data: metrics, error: metricsError } = await supabase
          .from('agent_metrics')
          .select('successful_executions')
          .eq('agent_id', agent.id)
          .single();

        if (metricsError) {
          console.warn(
            '[executions] Failed to load agent metrics for success increment:',
            metricsError
          );
        } else {
          const nextSuccesses = (metrics?.successful_executions ?? 0) + 1;
          const { error: updateError } = await supabase
            .from('agent_metrics')
            .update({ successful_executions: nextSuccesses })
            .eq('agent_id', agent.id);

          if (updateError) {
            console.warn('[executions] Failed to update agent success metrics:', updateError);
          }
        }
      }
    }

    // Create success message
    await supabase.from('messages').insert({
      forum_id: execution.forum_id,
      agent_id: agent?.id ?? null,
      content: `Execution successful! TX: ${txHash}${txUrl ? ` (${txUrl})` : ''}`,
      type: 'result',
      metadata: { txHash, txUrl, chainId: resolvedChainId },
    });
  } else if (status === 'failed') {
    const { subdomain: executorSubdomain } = normalizeEnsInput(execution.agent_ens);
    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('ens_name', executorSubdomain)
      .single();

    if (agent) {
      const { data: metrics, error: metricsError } = await supabase
        .from('agent_metrics')
        .select('failed_executions')
        .eq('agent_id', agent.id)
        .single();

      if (metricsError) {
        console.warn(
          '[executions] Failed to load agent metrics for failure increment:',
          metricsError
        );
      } else {
        const nextFailures = (metrics?.failed_executions ?? 0) + 1;
        const { error: updateError } = await supabase
          .from('agent_metrics')
          .update({ failed_executions: nextFailures })
          .eq('agent_id', agent.id);

        if (updateError) {
          console.warn('[executions] Failed to update agent failure metrics:', updateError);
        }
      }
    }

    // Create failure message
    await supabase.from('messages').insert({
      forum_id: execution.forum_id,
      agent_id: agent?.id ?? null,
      content: `Execution failed: ${errorMessage}`,
      type: 'result',
      metadata: { error: errorMessage },
    });
  }

  // Check if all executions for this proposal are complete
  const { data: allExecutions } = await supabase
    .from('executions')
    .select('status')
    .eq('proposal_id', execution.proposal_id);

  const allComplete = allExecutions?.every(
    (e) => e.status === 'success' || e.status === 'failed'
  );

  if (allComplete) {
    const allSuccess = allExecutions?.every((e) => e.status === 'success');

    // Update proposal status
    await supabase
      .from('proposals')
      .update({ status: allSuccess ? 'executed' : 'failed' })
      .eq('id', execution.proposal_id);

    // Update forum status
    await supabase
      .from('forums')
      .update({ status: 'executed' })
      .eq('id', execution.forum_id);
  }

  return c.json({
    id: execution.id,
    status: execution.status,
    txHash: execution.tx_hash,
    completedAt: execution.completed_at,
  });
});
