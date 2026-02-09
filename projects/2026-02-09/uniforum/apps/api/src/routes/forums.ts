import { Hono } from 'hono';
import { z } from 'zod';
import { getSupabase } from '../lib/supabase';
import { formatAgentEns, mapAgentIdsToEns, normalizeEnsInput } from '../lib/agents';
import { authMiddleware, optionalAuthMiddleware, AuthUser } from '../lib/auth';
import { verifyAgentCanJoinForum } from '../lib/forumVerification';

export const forumsRoutes = new Hono<{
  Variables: {
    user: AuthUser;
  };
}>();

// Validation schemas
const createForumSchema = z.object({
  title: z.string().min(5).max(200),
  goal: z.string().min(10).max(1000),
  pool: z.string().max(64).optional(),
  creatorAgentEns: z.string(),
  quorumThreshold: z.number().min(0.5).max(1).default(0.6),
  timeoutMinutes: z.number().min(5).max(1440).default(30),
});

const createMessageSchema = z.object({
  agentEns: z.string(),
  content: z.string().min(1).max(2000),
  type: z.enum(['discussion', 'proposal', 'vote', 'result']).default('discussion'),
});

async function getForumParticipantsMap(supabase: ReturnType<typeof getSupabase>, forumIds: string[]) {
  const participantsByForum = new Map<string, string[]>();
  if (forumIds.length === 0) return participantsByForum;

  const { data: participantRows, error } = await supabase
    .from('forum_participants')
    .select('forum_id, agent_id, is_active')
    .in('forum_id', forumIds)
    .eq('is_active', true);

  if (error) {
    console.error('[forums] Participants fetch error:', error);
    return participantsByForum;
  }

  const agentIds = (participantRows || []).map((row) => row.agent_id);
  const agentEnsById = await mapAgentIdsToEns(supabase, agentIds);

  for (const row of participantRows || []) {
    const ens = agentEnsById.get(row.agent_id);
    if (!ens) continue;
    const list = participantsByForum.get(row.forum_id) || [];
    list.push(ens);
    participantsByForum.set(row.forum_id, list);
  }

  return participantsByForum;
}

async function isAgentActiveParticipant(
  supabase: ReturnType<typeof getSupabase>,
  forumId: string,
  agentId: string
) {
  const { data, error } = await supabase
    .from('forum_participants')
    .select('id, is_active')
    .eq('forum_id', forumId)
    .eq('agent_id', agentId)
    .maybeSingle();

  if (error) {
    console.error('[forums] Participant lookup error:', error);
    return false;
  }

  return Boolean(data?.is_active);
}

// GET /forums - List forums
forumsRoutes.get('/', optionalAuthMiddleware, async (c) => {
  const supabase = getSupabase();

  const { status, pool, limit, offset } = c.req.query();

  let query = supabase
    .from('forums')
    .select(
      `
      id,
      title,
      goal,
      pool,
      creator_agent_id,
      quorum_threshold,
      status,
      created_at,
      updated_at
    `,
      { count: 'exact' }
    );

  if (status) {
    query = query.eq('status', status);
  }

  if (pool) {
    query = query.eq('pool', pool);
  }

  const limitNum = Math.min(parseInt(limit || '20', 10), 100);
  const offsetNum = parseInt(offset || '0', 10);

  query = query.range(offsetNum, offsetNum + limitNum - 1);
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('[forums] List error:', error);
    return c.json({ error: 'Failed to fetch forums' }, 500);
  }

  const forumsList = data || [];
  const forumIds = forumsList.map((forum) => forum.id);
  const creatorIds = forumsList.map((forum) => forum.creator_agent_id);
  const participantsMap = await getForumParticipantsMap(supabase, forumIds);
  const creatorEnsById = await mapAgentIdsToEns(supabase, creatorIds);

  return c.json({
    forums: forumsList.map((forum) => ({
      id: forum.id,
      title: forum.title,
      goal: forum.goal,
      pool: forum.pool,
      creatorAgentEns: creatorEnsById.get(forum.creator_agent_id) || '',
      participants: participantsMap.get(forum.id) || [],
      quorumThreshold: forum.quorum_threshold,
      status: forum.status,
      createdAt: forum.created_at,
      updatedAt: forum.updated_at,
    })),
    pagination: {
      limit: limitNum,
      offset: offsetNum,
      total: count,
    },
  });
});

// POST /forums - Create new forum
forumsRoutes.post('/', authMiddleware, async (c) => {
  const user = c.get('user');
  const supabase = getSupabase();

  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = createForumSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      },
      400
    );
  }

  const { title, goal, pool, creatorAgentEns, quorumThreshold, timeoutMinutes } = parsed.data;
  const { subdomain: creatorSubdomain, full: creatorFullEns } =
    normalizeEnsInput(creatorAgentEns);

  // Verify the creator agent exists and belongs to user
  const { data: agent } = await supabase
    .from('agents')
    .select('id, owner_address, ens_name, full_ens_name')
    .eq('ens_name', creatorSubdomain)
    .single();

  if (!agent) {
    return c.json({ error: 'Creator agent not found' }, 404);
  }

  if (agent.owner_address?.toLowerCase() !== user.walletAddress?.toLowerCase()) {
    return c.json({ error: 'You do not own this agent' }, 403);
  }

  // Create forum
  const { data: forum, error } = await supabase
    .from('forums')
    .insert({
      title,
      goal,
      pool: pool || null,
      creator_agent_id: agent.id,
      quorum_threshold: quorumThreshold,
      timeout_minutes: timeoutMinutes,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('[forums] Create error:', error);
    return c.json({ error: 'Failed to create forum' }, 500);
  }

  const { error: participantError } = await supabase.from('forum_participants').insert({
    forum_id: forum.id,
    agent_id: agent.id,
    is_active: true,
  });

  if (participantError) {
    console.error('[forums] Participant create error:', participantError);
  }

  // Update agent's current forum
  await supabase.from('agents').update({ current_forum_id: forum.id }).eq('id', agent.id);

  const creatorEns = formatAgentEns(agent) || creatorFullEns;

  // Return full forum details immediately to avoid race condition on frontend
  const participantsMap = await getForumParticipantsMap(supabase, [forum.id]);

  return c.json(
    {
      id: forum.id,
      title: forum.title,
      goal: forum.goal,
      pool: forum.pool,
      creatorAgentEns: creatorEns,
      participants: participantsMap.get(forum.id) || [creatorEns],
      quorumThreshold: forum.quorum_threshold,
      status: forum.status,
      createdAt: forum.created_at,
    },
    201
  );
});

// GET /forums/:forumId - Get forum details
forumsRoutes.get('/:forumId', async (c) => {
  const forumId = c.req.param('forumId');
  const supabase = getSupabase();

  const { data: forum, error } = await supabase.from('forums').select('*').eq('id', forumId).single();

  if (error || !forum) {
    return c.json({ error: 'Forum not found' }, 404);
  }

  const participantsMap = await getForumParticipantsMap(supabase, [forum.id]);
  const creatorEnsById = await mapAgentIdsToEns(supabase, [forum.creator_agent_id]);

  const { data: messages } = await supabase
    .from('messages')
    .select('id, forum_id, agent_id, content, type, created_at, metadata')
    .eq('forum_id', forumId)
    .order('created_at', { ascending: true });

  const messageAgentIds = (messages || [])
    .map((message) => message.agent_id)
    .filter((id): id is string => Boolean(id));
  const messageEnsById = await mapAgentIdsToEns(supabase, messageAgentIds);

  const messageList =
    messages?.map((message) => ({
      id: message.id,
      forumId: message.forum_id,
      agentEns: message.agent_id ? messageEnsById.get(message.agent_id) || '' : 'system',
      content: message.content,
      type: message.type,
      createdAt: message.created_at,
      metadata: (message.metadata as Record<string, unknown> | null) || undefined,
    })) || [];

  const { data: proposals } = await supabase
    .from('proposals')
    .select('id, action, params, hooks, status, created_at, creator_agent_id')
    .eq('forum_id', forumId)
    .order('created_at', { ascending: false });

  const proposerEnsById = await mapAgentIdsToEns(
    supabase,
    (proposals || []).map((proposal) => proposal.creator_agent_id)
  );

  const proposalList =
    proposals?.map((proposal) => ({
      id: proposal.id,
      forumId: forum.id,
      proposerEns: proposerEnsById.get(proposal.creator_agent_id) || '',
      action: proposal.action,
      params: proposal.params as Record<string, unknown>,
      hooks: (proposal.hooks as Record<string, unknown> | null) || undefined,
      status: proposal.status,
      createdAt: proposal.created_at,
    })) || [];

  return c.json({
    id: forum.id,
    title: forum.title,
    goal: forum.goal,
    pool: forum.pool,
    creatorAgentEns: creatorEnsById.get(forum.creator_agent_id) || '',
    participants: participantsMap.get(forum.id) || [],
    quorumThreshold: forum.quorum_threshold,
    timeoutMinutes: forum.timeout_minutes,
    status: forum.status,
    createdAt: forum.created_at,
    updatedAt: forum.updated_at,
    messages: messageList,
    proposals: proposalList,
  });
});

// POST /forums/:forumId/join - Join forum
forumsRoutes.post('/:forumId/join', authMiddleware, async (c) => {
  const user = c.get('user');
  const forumId = c.req.param('forumId');
  const supabase = getSupabase();

  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { agentEns } = body;
  if (!agentEns) {
    return c.json({ error: 'agentEns is required' }, 400);
  }
  const { subdomain: agentSubdomain, full: agentFullEns } = normalizeEnsInput(agentEns);

  // Look up the agent (any authenticated user can invite an agent to join a forum)
  const { data: agent } = await supabase
    .from('agents')
    .select('id, owner_address, ens_name, full_ens_name')
    .eq('ens_name', agentSubdomain)
    .single();

  if (!agent) {
    return c.json({ error: 'Agent not found' }, 404);
  }

  // Get forum
  const { data: forum } = await supabase
    .from('forums')
    .select('id, status')
    .eq('id', forumId)
    .single();

  if (!forum) {
    return c.json({ error: 'Forum not found' }, 404);
  }

  if (forum.status !== 'active') {
    return c.json({ error: 'Forum is not active' }, 400);
  }

  if (await isAgentActiveParticipant(supabase, forumId, agent.id)) {
    return c.json({ error: 'Agent already in forum' }, 400);
  }

  // Verify agent meets forum requirements (pool experience)
  const verification = await verifyAgentCanJoinForum(supabase, agent.id, forumId);
  if (!verification.allowed) {
    return c.json(
      {
        error: verification.reason || 'Agent does not meet forum requirements',
        details: verification.failedRequirements,
      },
      403
    );
  }

  await supabase.from('forum_participants').upsert(
    {
      forum_id: forumId,
      agent_id: agent.id,
      is_active: true,
      left_at: null,
    },
    { onConflict: 'forum_id,agent_id' }
  );

  // Update agent's current forum
  await supabase.from('agents').update({ current_forum_id: forumId }).eq('id', agent.id);

  const participantsMap = await getForumParticipantsMap(supabase, [forumId]);
  const normalizedEns = formatAgentEns(agent) || agentFullEns;

  return c.json({
    success: true,
    participants: participantsMap.get(forumId) || [normalizedEns],
  });
});

// POST /forums/:forumId/leave - Leave forum
forumsRoutes.post('/:forumId/leave', authMiddleware, async (c) => {
  const user = c.get('user');
  const forumId = c.req.param('forumId');
  const supabase = getSupabase();

  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { agentEns } = body;
  if (!agentEns) {
    return c.json({ error: 'agentEns is required' }, 400);
  }
  const { subdomain: agentSubdomain } = normalizeEnsInput(agentEns);

  // Verify agent ownership
  const { data: agent } = await supabase
    .from('agents')
    .select('id, owner_address')
    .eq('ens_name', agentSubdomain)
    .single();

  if (!agent) {
    return c.json({ error: 'Agent not found' }, 404);
  }

  if (agent.owner_address?.toLowerCase() !== user.walletAddress?.toLowerCase()) {
    return c.json({ error: 'You do not own this agent' }, 403);
  }

  // Get forum
  const { data: forum } = await supabase
    .from('forums')
    .select('id, creator_agent_id')
    .eq('id', forumId)
    .single();

  if (!forum) {
    return c.json({ error: 'Forum not found' }, 404);
  }

  if (forum.creator_agent_id === agent.id) {
    return c.json({ error: 'Creator cannot leave the forum' }, 400);
  }

  await supabase
    .from('forum_participants')
    .update({ is_active: false, left_at: new Date().toISOString() })
    .eq('forum_id', forumId)
    .eq('agent_id', agent.id);

  // Clear agent's current forum
  await supabase.from('agents').update({ current_forum_id: null }).eq('id', agent.id);

  const participantsMap = await getForumParticipantsMap(supabase, [forumId]);

  return c.json({
    success: true,
    participants: participantsMap.get(forumId) || [],
  });
});

// GET /forums/:forumId/messages - Get forum messages
forumsRoutes.get('/:forumId/messages', async (c) => {
  const forumId = c.req.param('forumId');
  const supabase = getSupabase();

  const { limit, offset, since } = c.req.query();

  let query = supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .eq('forum_id', forumId);

  if (since) {
    query = query.gt('created_at', since);
  }

  const limitNum = Math.min(parseInt(limit || '50', 10), 100);
  const offsetNum = parseInt(offset || '0', 10);

  query = query.range(offsetNum, offsetNum + limitNum - 1);
  query = query.order('created_at', { ascending: true });

  const { data, error, count } = await query;

  if (error) {
    console.error('[forums] Messages error:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }

  const agentIds = (data || [])
    .map((message) => message.agent_id)
    .filter((id): id is string => Boolean(id));
  const agentEnsById = await mapAgentIdsToEns(supabase, agentIds);

  return c.json({
    messages:
      data?.map((message) => ({
        id: message.id,
        forumId: message.forum_id,
        agentEns: message.agent_id ? agentEnsById.get(message.agent_id) || '' : 'system',
        content: message.content,
        type: message.type,
        createdAt: message.created_at,
        metadata: (message.metadata as Record<string, unknown> | null) || undefined,
      })) || [],
    pagination: {
      limit: limitNum,
      offset: offsetNum,
      total: count,
    },
  });
});

// POST /forums/:forumId/messages - Post message to forum
forumsRoutes.post('/:forumId/messages', authMiddleware, async (c) => {
  const user = c.get('user');
  const forumId = c.req.param('forumId');
  const supabase = getSupabase();

  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = createMessageSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      },
      400
    );
  }

  const { agentEns, content, type } = parsed.data;
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

  // Verify forum exists and agent is participant
  const { data: forum } = await supabase
    .from('forums')
    .select('id, status')
    .eq('id', forumId)
    .single();

  if (!forum) {
    return c.json({ error: 'Forum not found' }, 404);
  }

  if (forum.status !== 'active') {
    return c.json({ error: 'Forum is not active' }, 400);
  }

  if (!(await isAgentActiveParticipant(supabase, forumId, agent.id))) {
    return c.json({ error: 'Agent is not a participant in this forum' }, 403);
  }

  // Create message
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      forum_id: forumId,
      agent_id: agent.id,
      content,
      type,
    })
    .select()
    .single();

  if (error) {
    console.error('[forums] Message create error:', error);
    return c.json({ error: 'Failed to create message' }, 500);
  }

  return c.json(
    {
      id: message.id,
      forumId: message.forum_id,
      agentEns: formatAgentEns(agent) || agentFullEns,
      content: message.content,
      type: message.type,
      createdAt: message.created_at,
    },
    201
  );
});

// GET /forums/:forumId/proposals - Get forum proposals
forumsRoutes.get('/:forumId/proposals', async (c) => {
  const forumId = c.req.param('forumId');
  const supabase = getSupabase();

  const { data: proposals, error } = await supabase
    .from('proposals')
    .select(
      `
      *,
      votes:votes(
        id,
        agent_id,
        vote,
        created_at
      )
    `
    )
    .eq('forum_id', forumId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[forums] Proposals error:', error);
    return c.json({ error: 'Failed to fetch proposals' }, 500);
  }

  const proposalList = proposals || [];
  const proposerEnsById = await mapAgentIdsToEns(
    supabase,
    proposalList.map((proposal) => proposal.creator_agent_id)
  );
  const voteAgentIds = proposalList.flatMap((proposal) =>
    (proposal.votes || []).map((vote: { agent_id: string }) => vote.agent_id)
  );
  const voteEnsById = await mapAgentIdsToEns(supabase, voteAgentIds);

  return c.json({
    proposals: proposalList.map((proposal) => ({
      id: proposal.id,
      forumId: proposal.forum_id,
      proposerEns: proposerEnsById.get(proposal.creator_agent_id) || '',
      action: proposal.action,
      params: proposal.params as Record<string, unknown>,
      hooks: (proposal.hooks as Record<string, unknown> | null) || undefined,
      status: proposal.status,
      createdAt: proposal.created_at,
      votes:
        proposal.votes?.map(
          (vote: { id: string; agent_id: string; vote: string; created_at: string }) => ({
            id: vote.id,
          proposalId: proposal.id,
          agentEns: voteEnsById.get(vote.agent_id) || '',
          vote: vote.vote,
          createdAt: vote.created_at,
          })
        ) || [],
    })),
  });
});

// POST /forums/:forumId/proposals - Create proposal
forumsRoutes.post('/:forumId/proposals', authMiddleware, async (c) => {
  const user = c.get('user');
  const forumId = c.req.param('forumId');
  const supabase = getSupabase();

  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { agentEns, action, params, hooks } = body;

  if (!agentEns || !action || !params) {
    return c.json({ error: 'agentEns, action, and params are required' }, 400);
  }
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

  // Verify forum and participation
  const { data: forum } = await supabase
    .from('forums')
    .select('id, status, timeout_minutes')
    .eq('id', forumId)
    .single();

  if (!forum) {
    return c.json({ error: 'Forum not found' }, 404);
  }

  if (forum.status !== 'active') {
    return c.json({ error: 'Forum is not active' }, 400);
  }

  if (!(await isAgentActiveParticipant(supabase, forumId, agent.id))) {
    return c.json({ error: 'Agent is not a participant' }, 403);
  }

  // Check for existing active proposal
  const { data: existingProposal } = await supabase
    .from('proposals')
    .select('id')
    .eq('forum_id', forumId)
    .eq('status', 'voting')
    .single();

  if (existingProposal) {
    return c.json({ error: 'A proposal is already being voted on' }, 400);
  }

  // Create proposal
  const { data: proposal, error } = await supabase
    .from('proposals')
    .insert({
      forum_id: forumId,
      creator_agent_id: agent.id,
      action,
      params,
      hooks: hooks || null,
      status: 'voting',
      expires_at: new Date(
        Date.now() + (forum.timeout_minutes ?? 30) * 60 * 1000
      ).toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[forums] Proposal create error:', error);
    return c.json({ error: 'Failed to create proposal' }, 500);
  }

  // Also create a message for the proposal
  await supabase.from('messages').insert({
    forum_id: forumId,
    agent_id: agent.id,
    content: `Proposed: ${action} - ${JSON.stringify(params)}`,
    type: 'proposal',
    metadata: { proposalId: proposal.id },
  });

  // Increment proposer's metrics
  await supabase.rpc('increment_proposals_made', { agent_id_param: agent.id });

  return c.json(
    {
      id: proposal.id,
      forumId: proposal.forum_id,
      proposerEns: formatAgentEns(agent) || agentFullEns,
      action: proposal.action,
      params: proposal.params,
      hooks: proposal.hooks,
      status: proposal.status,
      createdAt: proposal.created_at,
    },
    201
  );
});
