import { Hono } from 'hono';
import { z } from 'zod';
import { getSupabase } from '../lib/supabase';
import { mapAgentIdsToEns } from '../lib/agents';
import { ENS_CONFIG } from '@uniforum/shared';
import { buildEnsTextRecords, encryptPrivateKey } from '@uniforum/contracts';
import { AGENT_PLUGIN_ALLOWLIST } from '@uniforum/shared/constants';
import { authMiddleware, optionalAuthMiddleware, AuthUser } from '../lib/auth';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

export const agentsRoutes = new Hono<{
  Variables: {
    user: AuthUser;
  };
}>();

const ENS_SUFFIX = `.${ENS_CONFIG.PARENT_DOMAIN}`;

function normalizeEnsInput(input: string) {
  const trimmed = input.trim().toLowerCase();
  if (trimmed.endsWith(ENS_SUFFIX)) {
    return {
      subdomain: trimmed.slice(0, -ENS_SUFFIX.length),
      full: trimmed,
    };
  }
  return {
    subdomain: trimmed,
    full: `${trimmed}${ENS_SUFFIX}`,
  };
}

function normalizeAgentMetrics(metrics?: Record<string, any>) {
  if (!metrics) return undefined;

  const successful = Number(metrics.successful_executions ?? 0);
  const failed = Number(metrics.failed_executions ?? 0);
  const executionsPerformed = Number(metrics.executions_performed ?? successful + failed);
  const votesCast = Number(metrics.votes_cast ?? metrics.votes_participated ?? 0);

  return {
    forumsParticipated: Number(metrics.forums_participated ?? 0),
    proposalsMade: Number(metrics.proposals_made ?? 0),
    votesCast,
    executionsPerformed,
    totalVolumeTraded: metrics.total_volume_traded ?? undefined,
    successRate:
      metrics.success_rate ?? (executionsPerformed > 0 ? successful / executionsPerformed : 0),
  };
}

// Validation schemas
const createAgentSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9-]+$/, 'Name must be lowercase alphanumeric with hyphens'),
  strategy: z.enum(['conservative', 'moderate', 'aggressive']),
  riskTolerance: z.number().min(0).max(1),
  preferredPools: z.array(z.string()).min(1),
  expertiseContext: z.string().max(2000).optional(),
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

const updateAgentSchema = z.object({
  strategy: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
  riskTolerance: z.number().min(0).max(1).optional(),
  preferredPools: z.array(z.string()).min(1).optional(),
  expertiseContext: z.string().max(2000).optional(),
});

const uploadAgentSchema = createAgentSchema.extend({
  characterConfig: z.record(z.any()),
  plugins: z.array(z.string()).optional(),
});

const DEFAULT_PLUGIN_SET = new Set(AGENT_PLUGIN_ALLOWLIST);

function sanitizeCharacterConfig(input: Record<string, any>) {
  const sanitized: Record<string, any> = {};

  const pickStringArray = (value: unknown) =>
    Array.isArray(value) ? value.filter((item) => typeof item === 'string') : undefined;

  if (typeof input.bio === 'string' || Array.isArray(input.bio)) {
    const bio = Array.isArray(input.bio) ? pickStringArray(input.bio) : input.bio;
    if (bio && (Array.isArray(bio) ? bio.length > 0 : bio.trim().length > 0)) {
      sanitized.bio = bio;
    }
  }

  const adjectives = pickStringArray(input.adjectives);
  if (adjectives && adjectives.length > 0) sanitized.adjectives = adjectives;

  const topics = pickStringArray(input.topics);
  if (topics && topics.length > 0) sanitized.topics = topics;

  const knowledge = pickStringArray(input.knowledge);
  if (knowledge && knowledge.length > 0) sanitized.knowledge = knowledge;

  if (typeof input.system === 'string' && input.system.trim().length > 0) {
    sanitized.system = input.system.trim();
  }

  if (input.templates && typeof input.templates === 'object' && !Array.isArray(input.templates)) {
    const templates: Record<string, string> = {};
    for (const [key, value] of Object.entries(input.templates)) {
      if (typeof value === 'string') templates[key] = value;
    }
    if (Object.keys(templates).length > 0) sanitized.templates = templates;
  }

  if (Array.isArray(input.messageExamples)) sanitized.messageExamples = input.messageExamples;
  if (Array.isArray(input.postExamples)) sanitized.postExamples = pickStringArray(input.postExamples);

  if (input.style && typeof input.style === 'object' && !Array.isArray(input.style)) {
    const style: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(input.style)) {
      const arr = pickStringArray(value);
      if (arr && arr.length > 0) style[key] = arr;
    }
    if (Object.keys(style).length > 0) sanitized.style = style;
  }

  if (input.settings && typeof input.settings === 'object' && !Array.isArray(input.settings)) {
    const settings = input.settings as Record<string, any>;
    const allowedSettings: Record<string, any> = {};
    if (typeof settings.model === 'string') allowedSettings.model = settings.model;
    if (typeof settings.temperature === 'number') allowedSettings.temperature = settings.temperature;
    if (typeof settings.maxTokens === 'number') allowedSettings.maxTokens = settings.maxTokens;
    if (typeof settings.memoryLimit === 'number') allowedSettings.memoryLimit = settings.memoryLimit;
    if (typeof settings.conversationLength === 'number')
      allowedSettings.conversationLength = settings.conversationLength;
    if (typeof settings.responseTimeout === 'number')
      allowedSettings.responseTimeout = settings.responseTimeout;
    if (Object.keys(allowedSettings).length > 0) sanitized.settings = allowedSettings;
  }

  if (Array.isArray((input as any).rulesOfThumb)) {
    const rules = (input as any).rulesOfThumb.filter((item: unknown) => typeof item === 'string');
    if (rules.length > 0) sanitized.rulesOfThumb = rules;
  }

  if ((input as any).constraints && typeof (input as any).constraints === 'object') {
    sanitized.constraints = (input as any).constraints;
  }

  if ((input as any).objectiveWeights && typeof (input as any).objectiveWeights === 'object') {
    const weights: Record<string, number> = {};
    for (const [key, value] of Object.entries((input as any).objectiveWeights)) {
      if (typeof value === 'number') weights[key] = value;
    }
    if (Object.keys(weights).length > 0) sanitized.objectiveWeights = weights;
  }

  if ((input as any).debate && typeof (input as any).debate === 'object') {
    const debate = (input as any).debate as Record<string, unknown>;
    const sanitizedDebate: Record<string, unknown> = {};
    if (typeof debate.enabled === 'boolean') sanitizedDebate.enabled = debate.enabled;
    if (typeof debate.rounds === 'number') sanitizedDebate.rounds = Math.max(1, debate.rounds);
    if (typeof debate.delayMs === 'number') sanitizedDebate.delayMs = Math.max(250, debate.delayMs);
    if (typeof debate.minDurationMs === 'number')
      sanitizedDebate.minDurationMs = Math.max(0, debate.minDurationMs);
    if (typeof debate.maxRounds === 'number')
      sanitizedDebate.maxRounds = Math.max(1, debate.maxRounds);
    if (typeof debate.minIntervalMs === 'number')
      sanitizedDebate.minIntervalMs = Math.max(250, debate.minIntervalMs);
    if (Object.keys(sanitizedDebate).length > 0) sanitized.debate = sanitizedDebate;
  }

  if (typeof (input as any).temperatureDelta === 'number') {
    sanitized.temperatureDelta = (input as any).temperatureDelta;
  }

  if (typeof (input as any).modelProvider === 'string') {
    const validProviders = ['openai', 'claude'];
    if (validProviders.includes((input as any).modelProvider)) {
      sanitized.modelProvider = (input as any).modelProvider;
    }
  }

  return sanitized;
}

function normalizePlugins(plugins: string[] | undefined) {
  const filtered =
    plugins?.filter((plugin) => DEFAULT_PLUGIN_SET.has(plugin as (typeof AGENT_PLUGIN_ALLOWLIST)[number])) ||
    [];

  const required = new Set(filtered);
  required.add('@elizaos/plugin-node');
  // Add Anthropic plugin when Claude key is available (preferred)
  if (process.env.CLAUDE_API_KEY) {
    required.add('@elizaos/plugin-anthropic');
  }
  // Add OpenAI plugin only when Claude is NOT available
  if (process.env.OPENAI_API_KEY && !process.env.CLAUDE_API_KEY) {
    required.add('@elizaos/plugin-openai');
  }

  return Array.from(required);
}

function createEncryptedAgentWallet() {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY must be set to encrypt agent private keys');
  }

  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const encryptedPrivateKey = encryptPrivateKey(privateKey, encryptionKey);

  return {
    privateKey,
    address: account.address,
    encryptedPrivateKey,
  };
}

// GET /agents - List all agents
agentsRoutes.get('/', optionalAuthMiddleware, async (c) => {
  const supabase = getSupabase();

  const { strategy, pool, limit, offset } = c.req.query();

  let query = supabase
    .from('agents')
    .select(
      `
      id,
      ens_name,
      full_ens_name,
      owner_address,
      strategy,
      risk_tolerance,
      preferred_pools,
      status,
      created_at,
      agent_metrics (
        forums_participated,
        proposals_made,
        votes_participated,
        successful_executions,
        failed_executions,
        total_volume_traded
      )
    `
    )
    .eq('status', 'active');

  if (strategy) {
    query = query.eq('strategy', strategy);
  }

  if (pool) {
    query = query.contains('preferred_pools', [pool]);
  }

  const limitNum = Math.min(parseInt(limit || '20', 10), 100);
  const offsetNum = parseInt(offset || '0', 10);

  query = query.range(offsetNum, offsetNum + limitNum - 1);
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('[agents] List error:', error);
    return c.json({ error: 'Failed to fetch agents', message: error.message }, 500);
  }

  const agentsList =
    data?.map((agent) => ({
      id: agent.id,
      ensName: agent.full_ens_name || normalizeEnsInput(agent.ens_name).full,
      ownerAddress: agent.owner_address,
      strategy: agent.strategy,
      riskTolerance: agent.risk_tolerance,
      preferredPools: agent.preferred_pools,
      status: agent.status,
      createdAt: agent.created_at,
      metrics: normalizeAgentMetrics(agent.agent_metrics?.[0]),
    })) || [];

  return c.json({
    agents: agentsList,
    pagination: {
      limit: limitNum,
      offset: offsetNum,
      total: count,
    },
  });
});

// POST /agents - Create new agent
agentsRoutes.post('/', authMiddleware, async (c) => {
  const user = c.get('user');
  const supabase = getSupabase();

  // Parse and validate body
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = createAgentSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      },
      400
    );
  }

  const {
    name,
    strategy,
    riskTolerance,
    preferredPools,
    expertiseContext,
    rulesOfThumb,
    constraints,
    objectiveWeights,
    debate,
    temperatureDelta,
  } = parsed.data;
  const { subdomain, full: fullEnsName } = normalizeEnsInput(name);

  // Check if agent name already exists
  const { data: existing } = await supabase
    .from('agents')
    .select('id')
    .eq('ens_name', subdomain)
    .single();

  if (existing) {
    return c.json({ error: 'Agent name already taken' }, 409);
  }

  const { address: agentWalletAddress, encryptedPrivateKey } = createEncryptedAgentWallet();
  const characterConfig = sanitizeCharacterConfig({
    rulesOfThumb,
    constraints,
    objectiveWeights,
    debate,
    temperatureDelta,
  });
  const sanitizedPlugins = normalizePlugins(undefined);

  // Insert agent
  const { data: agent, error: insertError } = await supabase
    .from('agents')
    .insert({
      ens_name: subdomain,
      owner_address: user.walletAddress,
      strategy,
      risk_tolerance: riskTolerance,
      preferred_pools: preferredPools,
      expertise_context: expertiseContext || '',
      status: 'active',
      config_source: 'template',
      character_config: characterConfig,
      character_plugins: sanitizedPlugins,
    })
    .select()
    .single();

  if (insertError) {
    console.error('[agents] Create error:', insertError);
    return c.json({ error: 'Failed to create agent', message: insertError.message }, 500);
  }

  // Create agent wallet record
  await supabase.from('agent_wallets').insert({
    agent_id: agent.id,
    wallet_address: agentWalletAddress,
    encrypted_private_key: encryptedPrivateKey,
  });

  // Initialize metrics
  await supabase.from('agent_metrics').insert({
    agent_id: agent.id,
  });

  const ensTextRecords = buildEnsTextRecords({
    strategy: agent.strategy,
    riskTolerance: agent.risk_tolerance,
    preferredPools: agent.preferred_pools,
    expertiseContext: agent.expertise_context || '',
    agentWallet: agentWalletAddress,
    createdAt: new Date(agent.created_at),
    characterConfig,
    characterPlugins: sanitizedPlugins,
  });

  return c.json(
    {
      id: agent.id,
      ensName: (agent as any).full_ens_name || fullEnsName,
      ownerAddress: agent.owner_address,
      agentWallet: agentWalletAddress,
      strategy: agent.strategy,
      riskTolerance: agent.risk_tolerance,
      preferredPools: agent.preferred_pools,
      status: agent.status,
      createdAt: agent.created_at,
      ens: {
        name: (agent as any).full_ens_name || fullEnsName,
        parentDomain: ENS_CONFIG.PARENT_DOMAIN,
        gatewayUrl: ENS_CONFIG.GATEWAY_URL,
        resolverType: 'offchain-ccip-read',
        address: agentWalletAddress,
        textRecords: {
          ...ensTextRecords,
          'eth.uniforum.owner': agent.owner_address,
        },
      },
    },
    201
  );
});

// POST /agents/upload - Create agent with uploaded character config
agentsRoutes.post('/upload', authMiddleware, async (c) => {
  const user = c.get('user');
  const supabase = getSupabase();

  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = uploadAgentSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      },
      400
    );
  }

  const {
    name,
    strategy,
    riskTolerance,
    preferredPools,
    expertiseContext,
    characterConfig,
    plugins,
    rulesOfThumb,
    constraints,
    objectiveWeights,
    debate,
    temperatureDelta,
  } = parsed.data;
  const { subdomain, full: fullEnsName } = normalizeEnsInput(name);

  const { data: existing } = await supabase
    .from('agents')
    .select('id')
    .eq('ens_name', subdomain)
    .single();

  if (existing) {
    return c.json({ error: 'Agent name already taken' }, 409);
  }

  const sanitizedConfig = sanitizeCharacterConfig({
    ...characterConfig,
    rulesOfThumb,
    constraints,
    objectiveWeights,
    debate,
    temperatureDelta,
  });
  if (
    !sanitizedConfig.rulesOfThumb ||
    !sanitizedConfig.constraints ||
    !sanitizedConfig.objectiveWeights
  ) {
    return c.json(
      { error: 'characterConfig must include rulesOfThumb, constraints, and objectiveWeights' },
      400
    );
  }
  const sanitizedPlugins = normalizePlugins(plugins);

  const serialized = JSON.stringify(sanitizedConfig);
  if (serialized.length > 50_000) {
    return c.json({ error: 'characterConfig is too large (max 50KB)' }, 400);
  }

  const { address: agentWalletAddress, encryptedPrivateKey } = createEncryptedAgentWallet();

  const { data: agent, error: insertError } = await supabase
    .from('agents')
    .insert({
      ens_name: subdomain,
      owner_address: user.walletAddress,
      strategy,
      risk_tolerance: riskTolerance,
      preferred_pools: preferredPools,
      expertise_context: expertiseContext || '',
      status: 'active',
      config_source: 'upload',
      character_config: sanitizedConfig,
      character_plugins: sanitizedPlugins,
    })
    .select()
    .single();

  if (insertError) {
    console.error('[agents] Upload create error:', insertError);
    return c.json({ error: 'Failed to create agent', message: insertError.message }, 500);
  }

  await supabase.from('agent_wallets').insert({
    agent_id: agent.id,
    wallet_address: agentWalletAddress,
    encrypted_private_key: encryptedPrivateKey,
  });

  await supabase.from('agent_metrics').insert({
    agent_id: agent.id,
  });

  const ensTextRecords = buildEnsTextRecords({
    strategy: agent.strategy,
    riskTolerance: agent.risk_tolerance,
    preferredPools: agent.preferred_pools,
    expertiseContext: agent.expertise_context || '',
    agentWallet: agentWalletAddress,
    createdAt: new Date(agent.created_at),
    characterConfig: sanitizedConfig,
    characterPlugins: sanitizedPlugins,
  });

  return c.json(
    {
      id: agent.id,
      ensName: (agent as any).full_ens_name || fullEnsName,
      ownerAddress: agent.owner_address,
      agentWallet: agentWalletAddress,
      strategy: agent.strategy,
      riskTolerance: agent.risk_tolerance,
      preferredPools: agent.preferred_pools,
      status: agent.status,
      createdAt: agent.created_at,
      configSource: 'upload',
      characterPlugins: sanitizedPlugins,
      ens: {
        name: (agent as any).full_ens_name || fullEnsName,
        parentDomain: ENS_CONFIG.PARENT_DOMAIN,
        gatewayUrl: ENS_CONFIG.GATEWAY_URL,
        resolverType: 'offchain-ccip-read',
        address: agentWalletAddress,
        textRecords: {
          ...ensTextRecords,
          'eth.uniforum.owner': agent.owner_address,
        },
      },
    },
    201
  );
});

// GET /agents/:ensName - Get agent by ENS name
agentsRoutes.get('/:ensName', optionalAuthMiddleware, async (c) => {
  const ensName = c.req.param('ensName');
  const supabase = getSupabase();

  const { subdomain } = normalizeEnsInput(ensName);

  const { data: agent, error } = await supabase
    .from('agents')
    .select(
      `
      *,
      agent_wallets (wallet_address, balance_eth, balance_usdc),
      agent_metrics (*)
    `
    )
    .eq('ens_name', subdomain)
    .single();

  if (error || !agent) {
    return c.json({ error: 'Agent not found' }, 404);
  }

  return c.json({
    id: agent.id,
    ensName: (agent as any).full_ens_name || fullEnsName,
    ownerAddress: agent.owner_address,
    agentWallet: agent.agent_wallets?.[0]?.wallet_address,
    strategy: agent.strategy,
    riskTolerance: agent.risk_tolerance,
    preferredPools: agent.preferred_pools,
    expertiseContext: agent.expertise_context,
    status: agent.status,
    createdAt: agent.created_at,
    updatedAt: agent.updated_at,
    metrics: normalizeAgentMetrics(agent.agent_metrics?.[0]),
    wallet: agent.agent_wallets?.[0],
  });
});

// PUT /agents/:ensName - Update agent
agentsRoutes.put('/:ensName', authMiddleware, async (c) => {
  const user = c.get('user');
  const ensName = c.req.param('ensName');
  const supabase = getSupabase();

  const { subdomain } = normalizeEnsInput(ensName);

  // Check ownership
  const { data: agent } = await supabase
    .from('agents')
    .select('id, owner_address')
    .eq('ens_name', subdomain)
    .single();

  if (!agent) {
    return c.json({ error: 'Agent not found' }, 404);
  }

  if (agent.owner_address?.toLowerCase() !== user.walletAddress?.toLowerCase()) {
    return c.json({ error: 'Not authorized to update this agent' }, 403);
  }

  // Parse and validate body
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = updateAgentSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      },
      400
    );
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.strategy) updates.strategy = parsed.data.strategy;
  if (parsed.data.riskTolerance !== undefined) updates.risk_tolerance = parsed.data.riskTolerance;
  if (parsed.data.preferredPools) updates.preferred_pools = parsed.data.preferredPools;
  if (parsed.data.expertiseContext !== undefined)
    updates.expertise_context = parsed.data.expertiseContext;

  const { data: updated, error } = await supabase
    .from('agents')
    .update(updates)
    .eq('id', agent.id)
    .select()
    .single();

  if (error) {
    console.error('[agents] Update error:', error);
    return c.json({ error: 'Failed to update agent' }, 500);
  }

  return c.json({
    id: updated.id,
    ensName: (updated as any).full_ens_name || normalizeEnsInput(updated.ens_name).full,
    strategy: updated.strategy,
    riskTolerance: updated.risk_tolerance,
    preferredPools: updated.preferred_pools,
    updatedAt: updated.updated_at,
  });
});

// DELETE /agents/:ensName - Deactivate agent
agentsRoutes.delete('/:ensName', authMiddleware, async (c) => {
  const user = c.get('user');
  const ensName = c.req.param('ensName');
  const supabase = getSupabase();

  const { subdomain } = normalizeEnsInput(ensName);

  // Check ownership
  const { data: agent } = await supabase
    .from('agents')
    .select('id, owner_address')
    .eq('ens_name', subdomain)
    .single();

  if (!agent) {
    return c.json({ error: 'Agent not found' }, 404);
  }

  if (agent.owner_address?.toLowerCase() !== user.walletAddress?.toLowerCase()) {
    return c.json({ error: 'Not authorized to delete this agent' }, 403);
  }

  // Soft delete - set status to inactive
  await supabase.from('agents').update({ status: 'inactive' }).eq('id', agent.id);

  return c.json({ success: true, message: 'Agent deactivated' });
});

// GET /agents/:ensName/metrics - Get agent metrics
agentsRoutes.get('/:ensName/metrics', async (c) => {
  const ensName = c.req.param('ensName');
  const supabase = getSupabase();

  const { subdomain } = normalizeEnsInput(ensName);

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('ens_name', subdomain)
    .single();

  if (!agent) {
    return c.json({ error: 'Agent not found' }, 404);
  }

  const { data: metrics, error } = await supabase
    .from('agent_metrics')
    .select('*')
    .eq('agent_id', agent.id)
    .single();

  if (error) {
    return c.json({ error: 'Metrics not found' }, 404);
  }

  const normalizedMetrics = normalizeAgentMetrics(metrics);

  return c.json({
    ...(normalizedMetrics ?? {
      forumsParticipated: 0,
      proposalsMade: 0,
      votesCast: 0,
      executionsPerformed: 0,
      totalVolumeTraded: '0',
      successRate: 0,
    }),
    updatedAt: metrics.updated_at,
  });
});

// GET /agents/:ensName/forums - Get forums agent is participating in
agentsRoutes.get('/:ensName/forums', async (c) => {
  const ensName = c.req.param('ensName');
  const supabase = getSupabase();

  const { subdomain, full: fullEnsName } = normalizeEnsInput(ensName);

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('ens_name', subdomain)
    .single();

  if (!agent) {
    return c.json({ error: 'Agent not found' }, 404);
  }

  // Get forums where this agent is a participant
  const { data: participantRows, error: participantsError } = await supabase
    .from('forum_participants')
    .select('forum_id')
    .eq('agent_id', agent.id)
    .eq('is_active', true);

  if (participantsError) {
    console.error('[agents] Forums error:', participantsError);
    return c.json({ error: 'Failed to fetch forums' }, 500);
  }

  const forumIds = (participantRows || []).map((row) => row.forum_id);
  if (forumIds.length === 0) {
    return c.json({ forums: [] });
  }

  const { data: forums, error } = await supabase
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
    `
    )
    .in('id', forumIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[agents] Forums error:', error);
    return c.json({ error: 'Failed to fetch forums' }, 500);
  }

  const participantsByForum = new Map<string, string[]>();
  const { data: forumParticipants } = await supabase
    .from('forum_participants')
    .select('forum_id, agent_id')
    .in('forum_id', forumIds)
    .eq('is_active', true);

  const participantAgentIds = (forumParticipants || []).map((row) => row.agent_id);
  const ensById = await mapAgentIdsToEns(supabase, participantAgentIds);

  for (const row of forumParticipants || []) {
    const ens = ensById.get(row.agent_id);
    if (!ens) continue;
    const list = participantsByForum.get(row.forum_id) || [];
    list.push(ens);
    participantsByForum.set(row.forum_id, list);
  }

  const creatorEnsById = await mapAgentIdsToEns(
    supabase,
    (forums || []).map((forum) => forum.creator_agent_id)
  );

  return c.json({
    forums:
      forums?.map((forum) => ({
        id: forum.id,
        title: forum.title,
        goal: forum.goal,
        pool: forum.pool,
        creatorAgentEns: creatorEnsById.get(forum.creator_agent_id) || '',
        participants: participantsByForum.get(forum.id) || [],
        quorumThreshold: forum.quorum_threshold,
        status: forum.status,
        createdAt: forum.created_at,
        updatedAt: forum.updated_at,
      })) || [],
  });
});
