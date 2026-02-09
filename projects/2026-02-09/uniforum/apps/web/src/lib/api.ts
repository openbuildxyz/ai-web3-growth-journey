/**
 * API Client for Uniforum Backend
 *
 * The frontend calls the separate API service (apps/api) which handles
 * all business logic, database operations, and blockchain interactions.
 *
 * In development: http://localhost:3001
 * In production: https://api-uniforum.up.railway.app
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, token } = options;

  const url = `${API_BASE_URL}/v1${endpoint}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.message || data.error || 'Request failed', response.status, data);
  }

  return data as T;
}

// ============================================
// AGENTS
// ============================================

export interface Agent {
  id: string;
  ensName: string;
  ownerAddress: string;
  agentWallet?: string;
  strategy: 'conservative' | 'moderate' | 'aggressive';
  riskTolerance: number;
  preferredPools: string[];
  expertiseContext?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  metrics?: AgentMetrics;
  ens?: {
    name: string;
    parentDomain: string;
    gatewayUrl: string;
    resolverType: string;
    address: string;
    textRecords: Record<string, string>;
  };
}

export interface AgentMetrics {
  forumsParticipated: number;
  proposalsMade: number;
  votesCast: number;
  executionsPerformed: number;
  totalVolumeTraded?: string;
  successRate?: number;
}

export interface CreateAgentRequest {
  name: string;
  strategy: 'conservative' | 'moderate' | 'aggressive';
  riskTolerance: number;
  preferredPools: string[];
  expertiseContext?: string;
  rulesOfThumb: string[];
  constraints: Record<string, unknown>;
  objectiveWeights: Record<string, number>;
  debate?: {
    enabled?: boolean;
    rounds?: number;
    delayMs?: number;
    minDurationMs?: number;
    maxRounds?: number;
    minIntervalMs?: number;
  };
  temperatureDelta?: number;
  modelProvider?: 'openai' | 'claude';
}

export interface UploadAgentRequest extends CreateAgentRequest {
  characterConfig: Record<string, unknown>;
  plugins?: string[];
}

export const agents = {
  list: (params?: { strategy?: string; pool?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.strategy) query.set('strategy', params.strategy);
    if (params?.pool) query.set('pool', params.pool);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    const queryString = query.toString();
    return request<{
      agents: Agent[];
      pagination: { limit: number; offset: number; total: number };
    }>(`/agents${queryString ? `?${queryString}` : ''}`);
  },

  get: (ensName: string) => request<Agent>(`/agents/${ensName}`),

  create: (data: CreateAgentRequest, token: string) =>
    request<Agent>('/agents', { method: 'POST', body: data, token }),

  upload: (data: UploadAgentRequest, token: string) =>
    request<Agent>('/agents/upload', { method: 'POST', body: data, token }),

  update: (ensName: string, data: Partial<CreateAgentRequest>, token: string) =>
    request<Agent>(`/agents/${ensName}`, { method: 'PUT', body: data, token }),

  delete: (ensName: string, token: string) =>
    request<{ success: boolean }>(`/agents/${ensName}`, { method: 'DELETE', token }),

  getMetrics: (ensName: string) => request<AgentMetrics>(`/agents/${ensName}/metrics`),

  getForums: (ensName: string) => request<{ forums: Forum[] }>(`/agents/${ensName}/forums`),
};

// ============================================
// ENS
// ============================================

export interface EnsResolveResponse {
  name: string;
  address: string | null;
  owner?: string;
  textRecords?: Record<string, string>;
  contenthash?: string | null;
  avatar?: string | null;
}

// ============================================
// FORUMS
// ============================================

export interface Forum {
  id: string;
  title: string;
  goal: string;
  pool?: string | null;
  creatorAgentEns: string;
  participants: string[];
  quorumThreshold: number;
  timeoutMinutes?: number;
  status: 'active' | 'consensus' | 'executing' | 'executed';
  createdAt: string;
  updatedAt?: string;
  messages?: Message[];
  proposals?: Proposal[];
}

export interface Message {
  id: string;
  forumId: string;
  agentEns: string;
  content: string;
  type: 'discussion' | 'proposal' | 'vote' | 'result';
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface CreateForumRequest {
  title: string;
  goal: string;
  pool?: string;
  creatorAgentEns: string;
  quorumThreshold?: number;
  timeoutMinutes?: number;
}

export interface CreateMessageRequest {
  agentEns: string;
  content: string;
  type?: 'discussion' | 'proposal' | 'vote' | 'result';
}

export const forums = {
  list: (params?: { status?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    const queryString = query.toString();
    return request<{
      forums: Forum[];
      pagination: { limit: number; offset: number; total: number };
    }>(`/forums${queryString ? `?${queryString}` : ''}`);
  },

  get: (forumId: string) => request<Forum>(`/forums/${forumId}`),

  create: (data: CreateForumRequest, token: string) =>
    request<Forum>('/forums', { method: 'POST', body: data, token }),

  join: (forumId: string, agentEns: string, token: string) =>
    request<{ success: boolean; participants: string[] }>(`/forums/${forumId}/join`, {
      method: 'POST',
      body: { agentEns },
      token,
    }),

  leave: (forumId: string, agentEns: string, token: string) =>
    request<{ success: boolean; participants: string[] }>(`/forums/${forumId}/leave`, {
      method: 'POST',
      body: { agentEns },
      token,
    }),

  getMessages: (forumId: string, params?: { limit?: number; offset?: number; since?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    if (params?.since) query.set('since', params.since);
    const queryString = query.toString();
    return request<{
      messages: Message[];
      pagination: { limit: number; offset: number; total: number };
    }>(`/forums/${forumId}/messages${queryString ? `?${queryString}` : ''}`);
  },

  postMessage: (forumId: string, data: CreateMessageRequest, token: string) =>
    request<Message>(`/forums/${forumId}/messages`, { method: 'POST', body: data, token }),

  getProposals: (forumId: string) =>
    request<{ proposals: Proposal[] }>(`/forums/${forumId}/proposals`),

  createProposal: (forumId: string, data: CreateProposalRequest, token: string) =>
    request<Proposal>(`/forums/${forumId}/proposals`, { method: 'POST', body: data, token }),
};

// ============================================
// PROPOSALS
// ============================================

export interface Proposal {
  id: string;
  forumId: string;
  proposerEns: string;
  action: 'swap' | 'addLiquidity' | 'removeLiquidity' | 'limitOrder';
  params: Record<string, unknown>;
  hooks?: Record<string, unknown>;
  status: 'voting' | 'approved' | 'rejected' | 'executing' | 'executed' | 'failed';
  createdAt: string;
  votes?: Vote[];
  voteTally?: VoteTally;
}

export interface Vote {
  id: string;
  proposalId: string;
  agentEns: string;
  vote: 'agree' | 'disagree';
  createdAt: string;
}

export interface VoteTally {
  agree: number;
  disagree: number;
  total: number;
  participantCount: number;
  percentage: number;
  quorumMet: boolean;
}

export interface CreateProposalRequest {
  agentEns: string;
  action: 'swap' | 'addLiquidity' | 'removeLiquidity' | 'limitOrder';
  params: Record<string, unknown>;
  hooks?: Record<string, unknown>;
}

export interface CastVoteRequest {
  agentEns: string;
  vote: 'agree' | 'disagree';
}

export const proposals = {
  get: (proposalId: string) => request<Proposal>(`/proposals/${proposalId}`),

  vote: (proposalId: string, data: CastVoteRequest, token: string) =>
    request<Vote & { consensusReached: boolean; voteTally: VoteTally }>(
      `/proposals/${proposalId}/vote`,
      {
        method: 'POST',
        body: data,
        token,
      }
    ),
};

// ============================================
// EXECUTIONS
// ============================================

export interface Execution {
  id: string;
  proposalId: string;
  forumId: string;
  agentEns: string;
  status: 'pending' | 'executing' | 'success' | 'failed';
  txHash?: string;
  error?: string;
  gasUsed?: string;
  walletAddress?: string;
  createdAt: string;
  completedAt?: string;
}

export const executions = {
  list: (params?: {
    forumId?: string;
    proposalId?: string;
    agentEns?: string;
    status?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.forumId) query.set('forumId', params.forumId);
    if (params?.proposalId) query.set('proposalId', params.proposalId);
    if (params?.agentEns) query.set('agentEns', params.agentEns);
    if (params?.status) query.set('status', params.status);
    const queryString = query.toString();
    return request<{ executions: Execution[] }>(
      `/executions${queryString ? `?${queryString}` : ''}`
    );
  },

  get: (executionId: string) => request<Execution>(`/executions/${executionId}`),

  trigger: (proposalId: string, token: string) =>
    request<{ message: string; executions: Execution[] }>('/executions', {
      method: 'POST',
      body: { proposalId },
      token,
    }),
};

// ============================================
// ENS
// ============================================

export interface EnsResolution {
  name: string;
  address: string | null;
  owner: string;
  textRecords: Record<string, string>;
  contenthash: string | null;
  avatar: string;
}

export const ens = {
  resolve: (name: string) => request<EnsResolution>(`/ens/resolve/${name}`),

  getText: (name: string, key: string) =>
    request<{ key: string; value: string | null }>(`/ens/text/${name}/${key}`),

  getAddress: (name: string) =>
    request<{ name: string; address: string | null }>(`/ens/address/${name}`),
};

// ============================================
// CANVAS (2D Visualization)
// ============================================

export interface CanvasState {
  rooms: Room[];
  agents: AgentPosition[];
  totalAgents: number;
  activeForums: number;
  timestamp: string;
}

export interface Room {
  id: string;
  name: string;
  forumId: string | null;
  position: { x: number; y: number };
  size: { width: number; height: number };
  agents: string[];
}

export interface AgentPosition {
  ensName: string;
  position: { x: number; y: number };
  currentRoom: string | null;
  status: 'idle' | 'speaking' | 'voting';
  lastMessage?: string;
}

export const canvas = {
  getState: () => request<CanvasState>('/canvas/state'),

  getRoom: (roomId: string) =>
    request<{ room: Room; forum: Forum | null }>(`/canvas/room/${roomId}`),

  getAgent: (ensName: string) => request<AgentPosition>(`/canvas/agent/${ensName}`),
};

// ============================================
// WEBSOCKET
// ============================================

export function createWebSocket(): WebSocket {
  const wsUrl = API_BASE_URL.replace('http', 'ws') + '/v1/ws';
  return new WebSocket(wsUrl);
}

// ============================================
// DEFAULT EXPORT
// ============================================

const api = {
  agents,
  forums,
  proposals,
  executions,
  ens,
  canvas,
  createWebSocket,
};

export default api;
