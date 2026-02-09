/**
 * Agent Manager
 *
 * Manages the lifecycle of all Eliza agent instances.
 * Handles loading, creating, and orchestrating agents.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { ElizaOS, type IAgentRuntime } from '@elizaos/core';
import type { Database } from '@uniforum/shared/types/database';
import type { Forum, ForumMessage } from '@uniforum/shared/types/forum';
import type { ExecutionPayload, Proposal } from '@uniforum/shared/types/proposal';
import {
  buildDiscussionPrompt,
  buildProposalPrompt,
  buildDebatePrompt,
  shouldParticipate,
  buildVoteEvaluationPrompt,
  evaluateProposalRules,
  executeForAgent,
  checkConsensus,
} from '@uniforum/forum';
import { decryptPrivateKey, formatPrivateKey, getEthBalance } from '@uniforum/contracts';
import { privateKeyToAccount } from 'viem/accounts';
import { formatEther } from 'viem';
import { createAgentCharacter, mergeUploadedCharacter } from './characters/template';
import type { AgentInstance } from './types';
import { getPoolSnapshot } from './lib/poolSnapshot';

export class AgentManager {
  private agents: Map<string, AgentInstance> = new Map();
  private supabase: SupabaseClient<Database>;
  private eliza: ElizaOS;
  private agentsStarted = false;
  private executingProposals: Set<string> = new Set();
  private debateState: Map<
    string,
    {
      rootMessageId: string;
      roundsUsed: number;
      lastAt: number;
      firstAt: number;
      active: boolean;
    }
  > = new Map();
  private proposalCooldown: Map<string, number> = new Map();
  /** Track recently processed message IDs to prevent duplicate Realtime events */
  private processedMessageIds: Set<string> = new Set();
  /**
   * Prevent concurrent Eliza handleMessage calls for the same agent+forum pair.
   * Eliza uses a per-room responseId that gets overwritten by concurrent calls,
   * causing both to return didRespond: false.
   */
  private agentForumLocks: Set<string> = new Set();

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
    this.eliza = new ElizaOS();
  }

  private readIntEnv(name: string, fallback: number): number {
    const raw = process.env[name];
    if (!raw) return fallback;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  /**
   * Get the Eliza runtime for an agent, enabling direct generateText calls
   * that bypass the handleMessage/shouldRespond pipeline.
   */
  private getAgentRuntime(agent: AgentInstance): IAgentRuntime | null {
    if (!agent.agentId) return null;
    return this.eliza.getAgent(agent.agentId) ?? null;
  }

  private getDebateTiming(debateConfig?: {
    enabled?: boolean;
    rounds?: number;
    delayMs?: number;
    minDurationMs?: number;
    maxRounds?: number;
    minIntervalMs?: number;
  }): { maxRounds: number; delayMs: number; minIntervalMs: number } {
    const configuredDelay = typeof debateConfig?.delayMs === 'number' ? debateConfig.delayMs : 1200;
    const configuredRounds =
      typeof debateConfig?.rounds === 'number' ? debateConfig.rounds : 2;

    const defaultMinDuration = this.readIntEnv('DEBATE_MIN_DURATION_MS', 0);
    const defaultMaxRounds = this.readIntEnv('DEBATE_MAX_ROUNDS', 2);

    const minDurationMs =
      typeof debateConfig?.minDurationMs === 'number'
        ? debateConfig.minDurationMs
        : defaultMinDuration;
    const hardMaxRounds =
      typeof debateConfig?.maxRounds === 'number' ? debateConfig.maxRounds : defaultMaxRounds;

    const safeMaxRounds = Math.max(1, hardMaxRounds);
    const enforceDuration = minDurationMs > 0;
    const minDelayForDuration = enforceDuration
      ? Math.ceil(minDurationMs / safeMaxRounds)
      : 0;

    const delayMs = Math.max(configuredDelay, minDelayForDuration, 250);
    const minRounds = enforceDuration ? Math.max(1, Math.ceil(minDurationMs / delayMs)) : 1;
    const maxRounds = Math.min(Math.max(configuredRounds, minRounds), safeMaxRounds);

    const configuredMinInterval =
      typeof debateConfig?.minIntervalMs === 'number'
        ? debateConfig.minIntervalMs
        : this.readIntEnv('DEBATE_MIN_INTERVAL_MS', 0);
    const derivedMinInterval = Math.max(5000, Math.min(30_000, delayMs));
    const minIntervalMs =
      configuredMinInterval > 0 ? configuredMinInterval : derivedMinInterval;

    return { maxRounds, delayMs, minIntervalMs };
  }

  private extractResponseText(
    result: Awaited<ReturnType<ElizaOS['handleMessage']>> | null | undefined,
    agentLabel?: string
  ): string | null {
    // 1. Direct text in responseContent
    const direct = result?.processing?.responseContent?.text;
    if (typeof direct === 'string' && direct.trim()) {
      return direct.trim();
    }

    // 2. From responseMessages array
    const fromMessages = result?.processing?.responseMessages?.find(
      (message) => typeof message?.content?.text === 'string' && message.content.text.trim()
    )?.content?.text;

    if (typeof fromMessages === 'string' && fromMessages.trim()) {
      return fromMessages.trim();
    }

    // 3. Try extracting text from XML <text> tags in the raw response
    // Eliza sometimes wraps responses in XML tags: <response><text>...</text></response>
    const rawResponse = result?.processing?.responseContent?.text
      || result?.processing?.responseMessages?.[0]?.content?.text
      || result?.processing?.responseMessages?.[0]?.content?.body;
    if (typeof rawResponse === 'string') {
      const xmlTextMatch = rawResponse.match(/<text>([\s\S]*?)<\/text>/);
      if (xmlTextMatch?.[1]?.trim()) {
        return xmlTextMatch[1].trim();
      }
    }

    // 4. Check for text at the top level of the result (some Eliza versions)
    const topLevel = (result as any)?.text || (result as any)?.content?.text;
    if (typeof topLevel === 'string' && topLevel.trim()) {
      return topLevel.trim();
    }

    // Log the structure for debugging
    if (agentLabel) {
      const keys = result ? Object.keys(result) : [];
      const processingKeys = result?.processing ? Object.keys(result.processing) : [];
      console.log(`[agents] ${agentLabel} response structure: top=[${keys}] processing=[${processingKeys}]`);
      if (result?.processing?.responseMessages?.length) {
        const firstMsg = result.processing.responseMessages[0];
        console.log(`[agents] ${agentLabel} first responseMessage keys: [${firstMsg ? Object.keys(firstMsg) : 'none'}], content keys: [${firstMsg?.content ? Object.keys(firstMsg.content) : 'none'}]`);
      }
    }

    return null;
  }

  private async insertForumMessage(payload: {
    forum_id: string;
    agent_id: string;
    content: string;
    type: 'discussion' | 'proposal' | 'vote' | 'result';
    metadata?: Record<string, unknown> | null;
  }): Promise<boolean> {
    // Tag all agent-service-generated messages so we can distinguish them
    // from user-initiated messages in the Realtime handler.
    const metadata = { ...payload.metadata, source: 'agent-service' };
    const { error } = await this.supabase.from('messages').insert({ ...payload, metadata });
    if (error) {
      console.error('[agents] Failed to save message:', error);
      return false;
    }

    return true;
  }

  /**
   * Load all active agents from the database
   */
  async loadAgents(): Promise<void> {
    console.log('[agents] Loading agents from database...');

    const { data: agents, error } = await this.supabase
      .from('agents')
      .select('*, agent_wallets(*)')
      .in('status', ['active', 'idle']);

    if (error) {
      throw new Error(`Failed to load agents: ${error.message}`);
    }

    if (!agents || agents.length === 0) {
      console.log('[agents] No agents found in database');
      return;
    }

    for (const agent of agents) {
      await this.createAgentInstance(agent);
    }

    if (!this.agentsStarted && this.agents.size > 0) {
      await this.eliza.startAgents();
      this.agentsStarted = true;
    }

    console.log(`[agents] Loaded ${agents.length} agents`);
  }

  /**
   * Create an Eliza agent instance from database record
   */
  async createAgentInstance(agentData: any): Promise<void> {
    const ensName = agentData.full_ens_name;

    if (this.agents.has(ensName)) {
      console.log(`[agents] Agent ${ensName} already exists, skipping`);
      return;
    }

    console.log(`[agents] Creating agent instance: ${ensName}`);

    // Create character config from database data
    const baseCharacter = createAgentCharacter({
      name: agentData.ens_name,
      ownerAddress: agentData.owner_address,
      agentWallet: agentData.agent_wallets?.wallet_address || '',
      strategy: agentData.strategy,
      riskTolerance: parseFloat(agentData.risk_tolerance),
      preferredPools: agentData.preferred_pools || [],
      expertiseContext: agentData.expertise_context || '',
      uniswapHistory: agentData.uniswap_history,
      characterConfig: agentData.character_config || undefined,
      characterPlugins: agentData.character_plugins || undefined,
      configSource: agentData.config_source || 'template',
    });

    const character =
      agentData.config_source === 'upload' && agentData.character_config
        ? mergeUploadedCharacter(
            baseCharacter,
            agentData.character_config as Partial<typeof baseCharacter>,
            agentData.character_plugins || undefined
          )
        : baseCharacter;

    const pluginList = character.plugins ?? [];
    const disableNodePlugin =
      process.env.ELIZA_DISABLE_NODE_PLUGIN === '1' ||
      process.env.ELIZA_DISABLE_NODE_PLUGIN === 'true';
    const resolvedPlugins = disableNodePlugin
      ? pluginList.filter((plugin) => plugin !== '@elizaos/plugin-node')
      : pluginList;
    if (!process.env.OPENAI_API_KEY && !process.env.CLAUDE_API_KEY) {
      console.warn(
        `[agents] No AI provider API key set (OPENAI_API_KEY or CLAUDE_API_KEY). Agent ${ensName} will not be able to generate responses.`
      );
    }

    // Log key character config for debugging shouldRespond / provider issues
    console.log(`[agents] ${ensName} config: ALWAYS_RESPOND_SOURCES=${character.settings?.ALWAYS_RESPOND_SOURCES}, templates=${Object.keys(character.templates || {}).join(',') || 'none'}, model=${character.settings?.model}`);

    const agentIds = await this.eliza.addAgents(
      [
        {
          character,
          plugins: resolvedPlugins,
        },
      ],
      { autoStart: this.agentsStarted }
    );

    const agentId = Array.isArray(agentIds) ? agentIds[0] : undefined;

    if (this.agentsStarted) {
      await this.eliza.startAgents();
    }

    const instance: AgentInstance = {
      id: agentData.id,
      ensName,
      character,
      agentId,
      runtime: null,
      status: agentData.status,
      configSource: agentData.config_source || 'template',
    };

    this.agents.set(ensName, instance);
    console.log(`[agents] Agent ${ensName} created`);
  }

  /**
   * Subscribe to new agent registrations via Supabase realtime
   */
  subscribeToNewAgents(): void {
    console.log('[agents] Subscribing to new agent registrations...');

    this.supabase
      .channel('agents-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agents',
        },
        async (payload) => {
          console.log(`[agents] New agent registered: ${payload.new.ens_name}`);
          // Fetch full agent data with wallet
          const { data: agent } = await this.supabase
            .from('agents')
            .select('*, agent_wallets(*)')
            .eq('id', payload.new.id)
            .single();

          if (agent) {
            await this.createAgentInstance(agent);
          }
        }
      )
      .subscribe((status) => {
        console.log(`[agents] Realtime agents-changes: ${status}`);
      });
  }

  /**
   * Subscribe to forum events for agent participation
   */
  subscribeToForumEvents(): void {
    console.log('[agents] Subscribing to forum events...');

    // Subscribe to new messages in forums
    this.supabase
      .channel('forum-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          await this.handleNewMessage(payload.new);
        }
      )
      .subscribe((status) => {
        console.log(`[agents] Realtime forum-messages: ${status}`);
      });

    // Subscribe to new proposals
    this.supabase
      .channel('proposals')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'proposals',
        },
        async (payload) => {
          await this.handleNewProposal(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'proposals',
        },
        async (payload) => {
          const proposal = payload.new as any;
          const oldProposal = payload.old as any;

          if (proposal.status === 'approved' && oldProposal?.status !== 'approved') {
            await this.handleApprovedProposal(proposal);
          }
        }
      )
      .subscribe((status) => {
        console.log(`[agents] Realtime proposals: ${status}`);
      });
  }

  /**
   * Scan for approved proposals at startup (in case events were missed).
   */
  async scanApprovedProposals(): Promise<void> {
    const { data: proposals, error } = await this.supabase
      .from('proposals')
      .select('*')
      .in('status', ['approved', 'executing'])
      .limit(50);

    if (error) {
      console.error('[agents] Failed to scan approved proposals:', error);
      return;
    }

    if (!proposals || proposals.length === 0) return;

    for (const proposal of proposals as any[]) {
      await this.handleApprovedProposal(proposal);
    }
  }

  /**
   * Handle new message in a forum
   */
  private async handleNewMessage(message: any): Promise<void> {
    const msgId = message.id;
    const meta = message.metadata;

    // Deduplicate: Supabase Realtime can deliver the same event multiple times
    if (msgId && this.processedMessageIds.has(msgId)) {
      return;
    }
    if (msgId) {
      this.processedMessageIds.add(msgId);
      // Evict old IDs after 60 s to avoid unbounded memory growth
      setTimeout(() => this.processedMessageIds.delete(msgId), 60_000);
    }

    // Skip debate follow-up messages — they are part of an ongoing debate loop
    // and should NOT start new discussion chains for other agents.
    if (meta && typeof meta === 'object' && typeof meta.debateRound === 'number') {
      console.log(`[agents] Skipping debate follow-up (round ${meta.debateRound}) in forum ${message.forum_id}`);
      return;
    }

    // Skip messages inserted by Eliza internally (e.g. chain continuations).
    // These are duplicates of messages we already handle via handleMessage().
    if (meta && typeof meta === 'object' && meta.chain === true) {
      console.log(`[agents] Skipping Eliza-internal chain message in forum ${message.forum_id}`);
      return;
    }

    console.log(`[agents] Processing message in forum ${message.forum_id} (agent_id=${message.agent_id}, source=${meta?.source || 'user'}, metadata=${JSON.stringify(meta)})`);

    // Get agents participating in this forum
    const { data: participants } = await this.supabase
      .from('forum_participants')
      .select('agent_id, agents(full_ens_name)')
      .eq('forum_id', message.forum_id)
      .eq('is_active', true);

    if (!participants) {
      console.log(`[agents] No participants found for forum ${message.forum_id}`);
      return;
    }

    console.log(`[agents] Forum ${message.forum_id} has ${participants.length} active participants: ${participants.map((p) => (p.agents as any)?.full_ens_name).join(', ')}`);

    const tasks: Promise<void>[] = [];

    for (const participant of participants) {
      const ensName = (participant.agents as any)?.full_ens_name;
      if (!ensName) continue;

      // Don't respond to own messages
      if (message.agent_id === participant.agent_id) {
        console.log(`[agents] ${ensName} skipped: own message`);
        continue;
      }

      const agent = this.agents.get(ensName);
      if (!agent) {
        console.log(`[agents] ${ensName} skipped: not in agents map`);
        continue;
      }

      console.log(`[agents] Dispatching discussion to ${ensName}`);
      tasks.push(this.handleForumDiscussion(agent, message));
    }

    if (tasks.length > 0) {
      const results = await Promise.allSettled(tasks);
      const failures = results.filter((result) => result.status === 'rejected');
      if (failures.length > 0) {
        console.warn(`[agents] Discussion processing had ${failures.length} failures`);
        for (const f of failures) {
          if (f.status === 'rejected') console.error('[agents] Failure:', f.reason);
        }
      }
    }
  }

  /**
   * Handle new proposal for voting
   */
  private async handleNewProposal(proposal: any): Promise<void> {
    // Get agents participating in this forum
    const { data: participants } = await this.supabase
      .from('forum_participants')
      .select('agent_id, agents(full_ens_name)')
      .eq('forum_id', proposal.forum_id)
      .eq('is_active', true);

    if (!participants) return;

    const tasks: Promise<void>[] = [];

    for (const participant of participants) {
      const ensName = (participant.agents as any)?.full_ens_name;
      if (!ensName) continue;

      const agent = this.agents.get(ensName);
      if (!agent) continue;

      tasks.push(this.handleForumProposal(agent, proposal));
    }

    if (tasks.length > 0) {
      const results = await Promise.allSettled(tasks);
      const failures = results.filter((result) => result.status === 'rejected');
      if (failures.length > 0) {
        console.warn(`[agents] Proposal processing had ${failures.length} failures`);
      }
    }
  }

  /**
   * Get the number of managed agents
   */
  getAgentCount(): number {
    return this.agents.size;
  }

  /**
   * Get an agent by ENS name
   */
  getAgent(ensName: string): AgentInstance | undefined {
    return this.agents.get(ensName);
  }

  /**
   * Shutdown all agents gracefully
   */
  async shutdown(): Promise<void> {
    console.log('[agents] Shutting down all agents...');

    for (const [ensName, agent] of this.agents) {
      console.log(`[agents] Stopping ${ensName}...`);
      // TODO: Gracefully stop Eliza runtime
      // if (agent.runtime) {
      //   await agent.runtime.stop();
      // }
    }

    this.agents.clear();
    console.log('[agents] All agents stopped');
  }

  private async handleForumDiscussion(agent: AgentInstance, message: any): Promise<void> {
    const runtime = this.getAgentRuntime(agent);
    if (!runtime) {
      console.warn(`[agents] Agent ${agent.ensName} missing Eliza runtime, skipping response.`);
      return;
    }

    // Prevent concurrent calls for the same agent+forum.
    const lockKey = `${agent.id}:${message.forum_id}`;
    if (this.agentForumLocks.has(lockKey)) {
      console.log(`[agents] ${agent.ensName} already processing forum ${message.forum_id}, skipping duplicate`);
      return;
    }
    this.agentForumLocks.add(lockKey);

    try {
    const forum = await this.fetchForum(message.forum_id);
    if (!forum) {
      console.log(`[agents] ${agent.ensName}: forum not found for ${message.forum_id}`);
      return;
    }

    const recentMessages = await this.fetchRecentMessages(message.forum_id);
    const agentContext = this.buildAgentDiscussionContext(agent);

    const debateTiming = this.getDebateTiming(agentContext.debate);
    const participation = shouldParticipate(agentContext, forum, recentMessages, {
      minIntervalMs: agentContext.debate?.enabled ? debateTiming.minIntervalMs : undefined,
      maxAutoMessages: debateTiming.maxRounds + 1, // 1 initial reply + maxRounds debate messages
    });
    if (!participation.should) {
      console.log(`[agents] ${agent.ensName} skipped discussion: ${participation.reason}`);
      return;
    }

    console.log(`[agents] ${agent.ensName} participating: ${participation.reason}`);

    const poolSnapshot = await getPoolSnapshot(forum.pool);
    const prompt = buildDiscussionPrompt(agentContext, {
      forum,
      recentMessages,
      poolSnapshot,
    });

    let text: string | null = null;
    try {
      console.log(`[agents] ${agent.ensName} generating discussion response (agentId=${agent.agentId})...`);
      const result = await runtime.generateText(prompt, { includeCharacter: true });
      text = result.text?.trim() || null;
      console.log(`[agents] ${agent.ensName} generateText returned: ${text ? 'text (' + text.length + ' chars)' : 'empty'}`);
    } catch (err) {
      console.error(`[agents] ${agent.ensName} generateText FAILED:`, err);
      return;
    }

    if (!text) {
      console.log(`[agents] ${agent.ensName}: no text generated`);
      return;
    }

    const saved = await this.insertForumMessage({
      forum_id: message.forum_id,
      agent_id: agent.id,
      content: text,
      type: 'discussion',
      metadata: {
        referencedMessages: [message.id],
      },
    });

    if (saved) {
      console.log(`[agents] ${agent.ensName} posted a discussion reply`);
    }

    await this.maybeAutoPropose(agent, forum, agentContext, recentMessages, poolSnapshot);

    // NOTE: We intentionally do NOT call handleDebateFollowUp here.
    // Cross-agent debate happens naturally: when this agent's reply is inserted,
    // the Supabase Realtime subscription fires handleNewMessage for OTHER agents,
    // creating an organic back-and-forth debate without self-monologuing.
    } finally {
      this.agentForumLocks.delete(lockKey);
    }
  }

  private async handleForumProposal(agent: AgentInstance, proposal: any): Promise<void> {
    const voteRuntime = this.getAgentRuntime(agent);
    if (!voteRuntime) {
      console.warn(`[agents] Agent ${agent.ensName} missing Eliza runtime, skipping vote.`);
      return;
    }

    if (proposal.status && proposal.status !== 'voting') return;

    const existingVote = await this.supabase
      .from('votes')
      .select('id')
      .eq('proposal_id', proposal.id)
      .eq('agent_id', agent.id)
      .maybeSingle();

    if (existingVote.data) return;

    const normalizedProposal = this.normalizeProposal(proposal);
    const agentContext = this.buildAgentVoteContext(agent);

    const ruleDecision = evaluateProposalRules(normalizedProposal, agentContext);

    let vote = ruleDecision?.vote;
    let reason = ruleDecision?.reasoning;

    if (!vote) {
      const prompt = buildVoteEvaluationPrompt(normalizedProposal, agentContext);
      const result = await voteRuntime.generateText(prompt, { includeCharacter: true });

      const text = result.text?.trim() || '';
      const lowered = text.toLowerCase();
      if (lowered.startsWith('agree')) {
        vote = 'agree';
        reason = text.replace(/^agree\s*-\s*/i, '').trim();
      } else if (lowered.startsWith('disagree')) {
        vote = 'disagree';
        reason = text.replace(/^disagree\s*-\s*/i, '').trim();
      } else {
        vote = 'disagree';
        reason = 'Insufficient clarity to approve proposal.';
      }
    }

    if (!vote) return;

    await this.supabase.from('votes').insert({
      proposal_id: proposal.id,
      agent_id: agent.id,
      vote,
      reason,
    });

    const saved = await this.insertForumMessage({
      forum_id: proposal.forum_id,
      agent_id: agent.id,
      content: `${vote.toUpperCase()}: ${reason || 'No reason provided.'}`,
      type: 'vote',
      metadata: {
        proposalId: proposal.id,
        vote,
      },
    });

    if (saved) {
      console.log(`[agents] ${agent.ensName} voted ${vote} on proposal ${proposal.id}`);
    }

    // Check if consensus has been reached after this vote
    await this.checkAndResolveConsensus(proposal);
  }

  /**
   * Check if consensus has been reached after an agent auto-vote.
   * If so, update proposal and forum status to trigger execution.
   */
  private async checkAndResolveConsensus(proposal: any): Promise<void> {
    const proposalId = proposal.id;
    const forumId = proposal.forum_id;

    // Fetch all votes for this proposal
    const { data: allVotes, error: votesError } = await this.supabase
      .from('votes')
      .select('vote')
      .eq('proposal_id', proposalId);

    if (votesError || !allVotes) {
      console.error('[agents] Failed to fetch votes for consensus check:', votesError);
      return;
    }

    const agreeCount = allVotes.filter((v) => v.vote === 'agree').length;
    const disagreeCount = allVotes.filter((v) => v.vote === 'disagree').length;
    const totalVotesNow = agreeCount + disagreeCount;

    // Fetch forum config
    const { data: forum } = await this.supabase
      .from('forums')
      .select('quorum_threshold, min_participants, timeout_minutes')
      .eq('id', forumId)
      .single();

    const quorumThreshold = forum?.quorum_threshold ?? 0.6;
    const timeoutMinutes = forum?.timeout_minutes ?? 30;

    // Use actual vote count as minParticipants — if all voters agreed, that's consensus
    // This allows consensus with any number of agents (2, 3, etc.)
    const minParticipants = Math.max(totalVotesNow, 2);

    const result = checkConsensus(agreeCount, disagreeCount, {
      quorumThreshold,
      minParticipants,
      timeoutMinutes,
    });

    if (!result.reached) return;

    const totalVotes = agreeCount + disagreeCount;

    if (result.result === 'approved') {
      await this.supabase
        .from('proposals')
        .update({ status: 'approved', resolved_at: new Date().toISOString() })
        .eq('id', proposalId)
        .eq('status', 'voting');

      await this.supabase
        .from('forums')
        .update({ status: 'consensus' })
        .eq('id', forumId);

      await this.insertForumMessage({
        forum_id: forumId,
        agent_id: null as any,
        content: `Consensus reached! ${agreeCount}/${totalVotes} agents agreed (${Math.round((agreeCount / totalVotes) * 100)}%)`,
        type: 'result',
      });

      // Directly trigger execution instead of relying on Supabase Realtime
      const approvedProposal = { ...proposal, status: 'approved', resolved_at: new Date().toISOString() };
      this.handleApprovedProposal(approvedProposal).catch((err) => {
        console.error(`[agents] Direct execution trigger failed for proposal ${proposalId}:`, err);
      });
    } else if (result.result === 'rejected') {
      await this.supabase
        .from('proposals')
        .update({ status: 'rejected', resolved_at: new Date().toISOString() })
        .eq('id', proposalId)
        .eq('status', 'voting');

      await this.insertForumMessage({
        forum_id: forumId,
        agent_id: null as any,
        content: `Proposal rejected. ${disagreeCount}/${totalVotes} agents disagreed — consensus is not possible.`,
        type: 'result',
      });

    }
  }

  private async handleDebateFollowUp(
    agent: AgentInstance,
    message: any,
    forum: Forum,
    agentContext: ReturnType<AgentManager['buildAgentDiscussionContext']>,
    recentMessages: ForumMessage[],
    poolSnapshot?: Record<string, unknown> | null
  ): Promise<void> {
    const debateConfig = agentContext.debate;
    if (!debateConfig?.enabled) return;

    const { maxRounds, delayMs } = this.getDebateTiming(debateConfig);

    const key = `${agent.id}:${forum.id}`;
    const existing = this.debateState.get(key);
    const now = Date.now();

    if (existing?.active && existing.rootMessageId !== message.id) {
      return;
    }

    const rootMessageId = existing?.active ? existing.rootMessageId : message.id;
    let roundsUsed = existing?.active ? existing.roundsUsed : 0;
    const firstAt = existing?.active ? existing.firstAt : now;

    this.debateState.set(key, {
      rootMessageId,
      roundsUsed,
      lastAt: existing?.lastAt ?? now,
      firstAt,
      active: true,
    });

    while (roundsUsed < maxRounds) {
      const state = this.debateState.get(key);
      if (!state?.active) break;

      const elapsedSinceLast = Date.now() - state.lastAt;
      const waitMs = Math.max(0, delayMs - elapsedSinceLast);
      if (waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }

      roundsUsed += 1;
      this.debateState.set(key, {
        rootMessageId,
        roundsUsed,
        lastAt: Date.now(),
        firstAt,
        active: true,
      });

      const latestMessages = await this.fetchRecentMessages(forum.id);
      const latestPoolSnapshot = await getPoolSnapshot(forum.pool);

      const debatePrompt = buildDebatePrompt(agentContext, {
        forum,
        recentMessages: latestMessages.length ? latestMessages : recentMessages,
        poolSnapshot: latestPoolSnapshot ?? poolSnapshot,
      });

      const debateRuntime = this.getAgentRuntime(agent);
      if (!debateRuntime) continue;
      const debateResult = await debateRuntime.generateText(debatePrompt, { includeCharacter: true });
      const text = debateResult.text?.trim() || null;
      if (!text) continue;

      const saved = await this.insertForumMessage({
        forum_id: message.forum_id,
        agent_id: agent.id,
        content: text,
        type: 'discussion',
        metadata: {
          referencedMessages: [rootMessageId],
          debateRound: roundsUsed,
        },
      });

      if (saved) {
        console.log(`[agents] ${agent.ensName} posted a debate follow-up`);
      }
    }

    this.debateState.set(key, {
      rootMessageId,
      roundsUsed,
      lastAt: Date.now(),
      firstAt,
      active: false,
    });
  }

  private async maybeAutoPropose(
    agent: AgentInstance,
    forum: Forum,
    agentContext: ReturnType<AgentManager['buildAgentDiscussionContext']>,
    recentMessages: ForumMessage[],
    poolSnapshot?: Record<string, unknown> | null
  ): Promise<void> {
    const proposalRuntime = this.getAgentRuntime(agent);
    if (!proposalRuntime) return;

    const creatorEns = forum.creatorEnsName || '';
    if (!creatorEns || creatorEns.toLowerCase() !== agent.ensName.toLowerCase()) {
      return;
    }

    if (forum.status !== 'active') return;

    const minMessages = parseInt(process.env.AUTO_PROPOSAL_MIN_MESSAGES || '3', 10) || 3;
    if (recentMessages.length < minMessages) return;

    const cooldownMs = parseInt(process.env.AUTO_PROPOSAL_COOLDOWN_MS || '120000', 10) || 120000;
    const lastAt = this.proposalCooldown.get(forum.id) || 0;
    if (Date.now() - lastAt < cooldownMs) return;

    // Only allow one proposal per forum — skip if any non-rejected proposal exists
    const { data: existingProposals } = await this.supabase
      .from('proposals')
      .select('id, status')
      .eq('forum_id', forum.id)
      .not('status', 'in', '("rejected")');

    if (existingProposals && existingProposals.length > 0) return;

    const prompt = buildProposalPrompt(agentContext, {
      forum,
      recentMessages,
      poolSnapshot,
    });

    const result = await proposalRuntime.generateText(prompt, { includeCharacter: true });
    const text = result.text?.trim() || null;
    if (!text) return;

    const proposalPayload = parseProposalJson(text);
    if (!proposalPayload) return;

    const { action, hooks, description } = proposalPayload;
    let params = proposalPayload.params;
    const allowedActions = new Set(['swap', 'limitOrder']);
    if (!action || !allowedActions.has(action)) return;
    if (!params || typeof params !== 'object') return;

    // Cap ETH amount to 0.01 for safety
    if (params.tokenIn?.toUpperCase() === 'ETH' || (!params.tokenIn && action === 'swap')) {
      params = { ...params, amount: '0.01' };
    }

    const { data: proposal, error } = await (this.supabase as any)
      .from('proposals')
      .insert({
        forum_id: forum.id,
        creator_agent_id: agent.id,
        action,
        params,
        hooks: hooks || null,
        description: description || null,
        status: 'voting',
        expires_at: new Date(
          Date.now() + (forum.timeout_minutes ?? 30) * 60 * 1000
        ).toISOString(),
      })
      .select()
      .single();

    if (error || !proposal) {
      console.error('[agents] Failed to create auto proposal:', error);
      return;
    }

    const saved = await this.insertForumMessage({
      forum_id: forum.id,
      agent_id: agent.id,
      content: `Proposed: ${action} - ${JSON.stringify(params)}`,
      type: 'proposal',
      metadata: { proposalId: proposal.id },
    });

    if (saved) {
      this.proposalCooldown.set(forum.id, Date.now());
      console.log(`[agents] ${agent.ensName} auto-proposed action ${action}`);
    }
  }

  private async handleApprovedProposal(proposal: any): Promise<void> {
    const proposalId = proposal?.id;
    if (!proposalId) return;

    if (this.executingProposals.has(proposalId)) return;
    this.executingProposals.add(proposalId);

    try {
      const executorEns = await this.resolveExecutorEns(proposal);
      if (!executorEns) {
        console.warn(`[agents] Proposal ${proposalId} missing executor ENS`);
        return;
      }

      const lockAcquired = await this.acquireExecutionLock(proposalId, proposal.status);
      if (!lockAcquired) {
        const { data: existingExecs } = await (this.supabase as any)
          .from('executions')
          .select('id, status')
          .eq('proposal_id', proposalId);
        const completed = (existingExecs || []).some((e: any) => e.status === 'success' || e.status === 'failed');
        if (completed) return;
      }

      const executorAgent = this.getManagedAgentByEns(executorEns);
      if (!executorAgent) return;

      const executionRecord = await this.ensureExecutionRecord(proposal, executorEns);
      if (!executionRecord) return;

      const payload = await this.fetchExecutionPayload(proposalId);

      if (
        payload.executorEnsName &&
        payload.executorEnsName !== executorEns &&
        payload.executorEnsName !== this.normalizeEnsName(executorEns)
      ) {
        console.warn(`[agents] Payload executor mismatch for proposal ${proposalId}`);
        return;
      }

      const privateKey = await this.getAgentPrivateKey(executorAgent.id);
      if (!privateKey) {
        console.warn(`[agents] Missing private key for ${executorEns}`);
        await this.reportExecutionResult(executionRecord.id, {
          status: 'failed',
          error: 'Missing executor private key',
        }, payload.chainId);
        return;
      }

      // Check agent wallet balance before executing
      const account = privateKeyToAccount(privateKey);
      const walletAddress = account.address;
      const MIN_BALANCE = BigInt('20000000000000000'); // 0.02 ETH minimum
      let balance: bigint;
      try {
        balance = await getEthBalance(walletAddress);
      } catch (balErr) {
        console.error(`[agents] Failed to check balance for ${walletAddress}:`, balErr);
        balance = 0n;
      }
      const balanceFormatted = formatEther(balance);

      if (balance < MIN_BALANCE) {

        // Post a message with the wallet address so the user can fund it
        await this.insertForumMessage({
          forum_id: proposal.forum_id,
          agent_id: null as any,
          content: `Awaiting funds to execute. Agent wallet: ${walletAddress} (Balance: ${balanceFormatted} ETH). Please send ETH to this address to proceed with execution.`,
          type: 'result',
          metadata: {
            walletAddress,
            balance: balanceFormatted,
            requiredMin: '0.02',
            executionId: executionRecord.id,
            proposalId,
          },
        });

        // Start polling for funds
        this.pollForFunds(walletAddress, MIN_BALANCE, proposal, executionRecord, payload, executorEns, privateKey);
        return;
      }

      // Step 8: Execute the transaction
      await this.executeAndReport(proposal, executionRecord, payload, executorEns, privateKey);
    } catch (error) {
      console.error(`[agents] Execution error for proposal ${proposalId}:`, error);
    } finally {
      this.executingProposals.delete(proposalId);
    }
  }

  /** Execute the on-chain transaction and report the result */
  private async executeAndReport(
    proposal: any,
    executionRecord: { id: string },
    payload: any,
    executorEns: string,
    privateKey: `0x${string}`
  ): Promise<void> {
    const proposalId = proposal.id;
    const executionProposal = this.buildProposalFromPayload(payload);
    const result = await executeForAgent({
      proposal: executionProposal,
      agentEnsName: executorEns,
      agentPrivateKey: privateKey,
      chainId: payload.chainId,
    });
    await this.reportExecutionResult(executionRecord.id, result, payload.chainId);
  }

  /** Poll for funds arriving in the agent wallet, then execute */
  private pollForFunds(
    walletAddress: `0x${string}`,
    minBalance: bigint,
    proposal: any,
    executionRecord: { id: string },
    payload: any,
    executorEns: string,
    privateKey: `0x${string}`
  ): void {
    const proposalId = proposal.id;
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes (5s intervals)
    const interval = setInterval(async () => {
      attempts++;
      try {
        const balance = await getEthBalance(walletAddress);
        if (balance >= minBalance) {
          clearInterval(interval);
          const balStr = formatEther(balance);
          await this.insertForumMessage({
            forum_id: proposal.forum_id,
            agent_id: null as any,
            content: `Funds received (${balStr} ETH). Executing transaction now...`,
            type: 'result',
          });

          await this.executeAndReport(proposal, executionRecord, payload, executorEns, privateKey);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          await this.reportExecutionResult(executionRecord.id, {
            status: 'failed',
            error: `Agent wallet not funded within 10 minutes. Wallet: ${walletAddress}`,
          }, payload.chainId);
        }
      } catch (err) {
        console.error(`[agents] Error polling balance for ${walletAddress}:`, err);
      }
    }, 5000);
  }

  private async acquireExecutionLock(proposalId: string, status?: string): Promise<boolean> {
    if (status && status === 'executing') {
      return false;
    }

    const { data, error } = await (this.supabase as any)
      .from('proposals')
      .update({ status: 'executing' })
      .eq('id', proposalId)
      .eq('status', 'approved')
      .select('id')
      .limit(1);

    if (error) {
      console.error('[agents] Failed to acquire execution lock:', error);
      return false;
    }

    return Array.isArray(data) && data.length > 0;
  }

  private async getPendingExecution(
    proposalId: string,
    executorEns: string
  ): Promise<{ id: string } | null> {
    const { data } = await (this.supabase as any)
      .from('executions')
      .select('id, status')
      .eq('proposal_id', proposalId)
      .eq('agent_ens', executorEns)
      .maybeSingle();

    if (!data?.id) return null;
    if (data.status && data.status !== 'pending') return null;
    return data as { id: string };
  }

  private async hasAnyExecutionRecord(proposalId: string): Promise<boolean> {
    const { data } = await (this.supabase as any)
      .from('executions')
      .select('id')
      .eq('proposal_id', proposalId)
      .limit(1);
    return Array.isArray(data) && data.length > 0;
  }

  private async resolveExecutorEns(proposal: any): Promise<string | null> {
    // Resolve from creator_agent_id (the actual DB column)
    if (proposal.creator_agent_id) {
      const { data: agent } = await this.supabase
        .from('agents')
        .select('ens_name')
        .eq('id', proposal.creator_agent_id)
        .single();
      if (agent?.ens_name) return this.normalizeEnsName(agent.ens_name);
    }

    if (proposal.forum_id) {
      const { data: forum } = await this.supabase
        .from('forums')
        .select('creator_agent_id')
        .eq('id', proposal.forum_id)
        .single();

      const forumCreatorId = (forum as any)?.creator_agent_id;
      if (forumCreatorId) {
        const { data: agent } = await this.supabase
          .from('agents')
          .select('ens_name, full_ens_name')
          .eq('id', forumCreatorId)
          .single();
        const ensName = agent?.full_ens_name || agent?.ens_name;
        if (ensName) return this.normalizeEnsName(ensName);
      }
    }

    return null;
  }

  private getManagedAgentByEns(ensName: string): AgentInstance | undefined {
    return this.agents.get(ensName) || this.agents.get(this.normalizeEnsName(ensName));
  }

  private normalizeEnsName(ensName: string): string {
    if (ensName.includes('.')) return ensName;
    return `${ensName}.uniforum.eth`;
  }

  private async ensureExecutionRecord(
    proposal: any,
    executorEns: string
  ): Promise<{ id: string } | null> {
    const existing = await (this.supabase as any)
      .from('executions')
      .select('id, status')
      .eq('proposal_id', proposal.id)
      .eq('agent_ens', executorEns)
      .maybeSingle();

    if (existing?.data?.id) {
      const status = existing.data.status as string | undefined;
      if (status && status !== 'pending') {
        return null;
      }
      return existing.data as { id: string };
    }

    const { data: execution, error } = await (this.supabase as any)
      .from('executions')
      .insert({
        proposal_id: proposal.id,
        forum_id: proposal.forum_id,
        agent_ens: executorEns,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('[agents] Failed to create execution record:', error);
      return null;
    }

    return execution as { id: string };
  }

  private async fetchExecutionPayload(proposalId: string): Promise<ExecutionPayload> {
    const baseUrl = this.getApiBaseUrl();
    const chainId = process.env.EXECUTION_CHAIN_ID || process.env.CHAIN_ID;
    const url =
      chainId != null
        ? `${baseUrl}/v1/proposals/${proposalId}/execution-payload?chainId=${chainId}`
        : `${baseUrl}/v1/proposals/${proposalId}/execution-payload`;

    const response = await fetch(url);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Failed to fetch execution payload: ${response.status} ${body}`);
    }

    return (await response.json()) as ExecutionPayload;
  }

  private getApiBaseUrl(): string {
    const env =
      process.env.UNIFORUM_API_URL ||
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL;
    if (env) return env.replace(/\/$/, '');
    if (process.env.NODE_ENV === 'development') return 'http://localhost:3001';
    return 'https://api-uniforum.up.railway.app';
  }

  private buildProposalFromPayload(payload: ExecutionPayload): Proposal {
    return {
      id: payload.proposalId,
      forumId: payload.forumId,
      creatorAgentId: '',
      creatorEnsName: payload.executorEnsName,
      action: payload.action,
      params: payload.params,
      hooks: payload.hooks,
      status: 'approved',
      agreeCount: 0,
      disagreeCount: 0,
      createdAt: payload.approvedAt || new Date().toISOString(),
      expiresAt: payload.approvedAt || new Date().toISOString(),
      resolvedAt: payload.approvedAt,
    };
  }

  private async getAgentPrivateKey(agentId: string): Promise<`0x${string}` | null> {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      console.error('[agents] ENCRYPTION_KEY not set; cannot decrypt agent keys');
      return null;
    }

    const { data: wallet, error } = await this.supabase
      .from('agent_wallets')
      .select('encrypted_private_key')
      .eq('agent_id', agentId)
      .single();

    if (error || !wallet?.encrypted_private_key) {
      console.error('[agents] Failed to load encrypted private key:', error);
      return null;
    }

    const decrypted = decryptPrivateKey(wallet.encrypted_private_key, encryptionKey);
    return formatPrivateKey(decrypted);
  }

  private async reportExecutionResult(
    executionId: string,
    result: { status: 'success' | 'failed'; txHash?: string; error?: string },
    chainId?: number
  ) {
    const baseUrl = this.getApiBaseUrl();
    const response = await fetch(`${baseUrl}/v1/executions/${executionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: result.status,
        txHash: result.txHash,
        errorMessage: result.error,
        chainId,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('[agents] Failed to report execution result:', response.status, body);
    }
  }

  private async fetchForum(forumId: string): Promise<Forum | null> {
    const { data: forum } = await this.supabase
      .from('forums')
      .select('*')
      .eq('id', forumId)
      .single();
    if (!forum) return null;

    const creatorEnsName = await (async () => {
      if (!forum.creator_agent_id) return '';
      const { data: agent } = await this.supabase
        .from('agents')
        .select('ens_name, full_ens_name')
        .eq('id', forum.creator_agent_id)
        .single();
      const ensName = agent?.full_ens_name || agent?.ens_name || '';
      return ensName ? this.normalizeEnsName(ensName) : '';
    })();

    return {
      id: forum.id,
      title: forum.title,
      goal: forum.goal,
      pool: forum.pool ?? undefined,
      creatorAgentId: forum.creator_agent_id,
      creatorEnsName,
      quorumThreshold: forum.quorum_threshold,
      minParticipants: forum.min_participants,
      timeoutMinutes: forum.timeout_minutes,
      status: forum.status,
      participantCount: 0,
      createdAt: forum.created_at,
      lastActivityAt: forum.last_activity_at,
      expiresAt: forum.expires_at ?? undefined,
    };
  }

  private async fetchRecentMessages(forumId: string): Promise<ForumMessage[]> {
    const { data: messages } = await this.supabase
      .from('messages')
      .select('id, forum_id, agent_id, content, type, metadata, created_at, agents(full_ens_name)')
      .eq('forum_id', forumId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!messages) return [];

    return messages.map((message) => ({
      id: message.id,
      forumId: message.forum_id,
      agentId: message.agent_id ?? undefined,
      agentEnsName: (message.agents as any)?.full_ens_name ?? undefined,
      content: message.content,
      type: message.type,
      metadata: message.metadata as any,
      createdAt: message.created_at,
    }));
  }

  private buildAgentDiscussionContext(agent: AgentInstance) {
    return {
      name: agent.character.name,
      ensName: agent.ensName,
      strategy: agent.character.clientConfig.uniforum.strategy as
        | 'conservative'
        | 'moderate'
        | 'aggressive',
      riskTolerance: agent.character.clientConfig.uniforum.riskTolerance,
      preferredPools: agent.character.clientConfig.uniforum.preferredPools,
      expertiseContext: agent.character.clientConfig.uniforum.expertiseContext,
      rulesOfThumb: agent.character.clientConfig.uniforum.rulesOfThumb,
      constraints: agent.character.clientConfig.uniforum.constraints,
      objectiveWeights: agent.character.clientConfig.uniforum.objectiveWeights,
      debate: agent.character.clientConfig.uniforum.debate,
    };
  }

  private buildAgentVoteContext(agent: AgentInstance) {
    return {
      strategy: agent.character.clientConfig.uniforum.strategy as
        | 'conservative'
        | 'moderate'
        | 'aggressive',
      riskTolerance: agent.character.clientConfig.uniforum.riskTolerance,
      preferredPools: agent.character.clientConfig.uniforum.preferredPools,
      expertiseContext:
        agent.character.clientConfig.uniforum.expertiseContext ||
        agent.character.clientConfig.uniforum.preferredPools.join(', '),
      rulesOfThumb: agent.character.clientConfig.uniforum.rulesOfThumb,
      constraints: agent.character.clientConfig.uniforum.constraints,
      objectiveWeights: agent.character.clientConfig.uniforum.objectiveWeights,
    };
  }

  private normalizeProposal(proposal: any): Proposal {
    return {
      id: proposal.id,
      forumId: proposal.forum_id,
      creatorAgentId: proposal.creator_agent_id,
      creatorEnsName: proposal.creator_agent_ens || '',
      description: proposal.description ?? undefined,
      action: proposal.action,
      params: proposal.params,
      hooks: proposal.hooks ?? undefined,
      status: proposal.status,
      agreeCount: proposal.agree_count ?? 0,
      disagreeCount: proposal.disagree_count ?? 0,
      createdAt: proposal.created_at,
      expiresAt: proposal.expires_at,
      resolvedAt: proposal.resolved_at ?? undefined,
    };
  }
}

function parseProposalJson(text: string): {
  action?: string;
  params?: Record<string, unknown>;
  hooks?: Record<string, unknown>;
  description?: string;
} | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const direct = safeParseJson(trimmed);
  if (direct) return direct;

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match) {
    const parsed = safeParseJson(match[0]);
    if (parsed) return parsed;
  }

  return null;
}

function safeParseJson(raw: string): any | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
