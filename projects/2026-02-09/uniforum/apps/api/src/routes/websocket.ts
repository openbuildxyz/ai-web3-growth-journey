import { Context } from 'hono';
import { getSupabase } from '../lib/supabase';
import { mapAgentIdsToEns } from '../lib/agents';

/**
 * WebSocket Handler for Real-time Updates
 *
 * Events:
 * - agent_joined / agent_left
 * - message (new forum message)
 * - proposal_created / vote_cast
 * - consensus_reached
 * - execution_started / execution_result
 * - agent_moved (canvas position updates)
 */

// Store active connections
const connections = new Map<string, WebSocket>();
const subscriptions = new Map<string, Set<string>>(); // connectionId -> Set<forumId>

export function wsHandler(c: Context) {
  // Check if this is a WebSocket upgrade request
  const upgradeHeader = c.req.header('Upgrade');

  if (upgradeHeader !== 'websocket') {
    return c.json(
      {
        error: 'WebSocket upgrade required',
        message: 'This endpoint requires a WebSocket connection',
      },
      426
    );
  }

  // For Bun's native WebSocket support
  const server = (globalThis as any).Bun?.serve;

  if (!server) {
    // Fallback for non-Bun environments
    return c.json(
      {
        error: 'WebSocket not supported',
        message: 'WebSocket connections require Bun runtime',
      },
      501
    );
  }

  // The actual WebSocket handling is done through Bun's server
  // This endpoint just validates the request

  return c.json({
    message: 'WebSocket endpoint',
    hint: 'Connect using WebSocket protocol',
  });
}

/**
 * Broadcast event to all connected clients
 */
export function broadcast(event: Record<string, unknown>) {
  const message = JSON.stringify(event);

  for (const [, ws] of connections) {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    } catch (error) {
      console.error('[ws] Broadcast error:', error);
    }
  }
}

/**
 * Broadcast event to specific forum subscribers
 */
export function broadcastToForum(forumId: string, event: Record<string, unknown>) {
  const message = JSON.stringify(event);

  for (const [connectionId, forums] of subscriptions) {
    if (forums.has(forumId)) {
      const ws = connections.get(connectionId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message);
        } catch (error) {
          console.error('[ws] Forum broadcast error:', error);
        }
      }
    }
  }
}

/**
 * Setup Supabase realtime subscriptions
 * Call this on server startup to relay database changes to WebSocket clients
 */
export function setupRealtimeSubscriptions() {
  const supabase = getSupabase();

  // Subscribe to messages table
  supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        const message = payload.new;
        const resolveAgentEns = async () => {
          if (message.agent_ens) return message.agent_ens;
          if (!message.agent_id) return 'system';
          const ensById = await mapAgentIdsToEns(supabase, [message.agent_id]);
          return ensById.get(message.agent_id) || '';
        };
        resolveAgentEns()
          .then((agentEns) => {
            broadcastToForum(message.forum_id, {
              type: 'message',
              data: {
                id: message.id,
                forumId: message.forum_id,
                agentEns,
                content: message.content,
                messageType: message.type,
                createdAt: message.created_at,
              },
            });
          })
          .catch((error) => {
            console.warn('[ws] Failed to resolve agent ENS for message:', error);
          });
      }
    )
    .subscribe();

  // Subscribe to proposals table
  supabase
    .channel('proposals')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'proposals',
      },
      (payload) => {
        const proposal = payload.new;
        const resolveProposerEns = async () => {
          if (proposal.proposer_ens) return proposal.proposer_ens;
          if (!proposal.creator_agent_id) return '';
          const ensById = await mapAgentIdsToEns(supabase, [proposal.creator_agent_id]);
          return ensById.get(proposal.creator_agent_id) || '';
        };
        resolveProposerEns()
          .then((proposerEns) => {
            broadcastToForum(proposal.forum_id, {
              type: 'proposal_created',
              data: {
                id: proposal.id,
                forumId: proposal.forum_id,
                proposerEns,
                action: proposal.action,
                params: proposal.params,
              },
            });
          })
          .catch((error) => {
            console.warn('[ws] Failed to resolve proposer ENS:', error);
          });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'proposals',
      },
      (payload) => {
        const proposal = payload.new;
        const oldProposal = payload.old;

        if (proposal.status === 'approved' && oldProposal.status !== 'approved') {
          broadcastToForum(proposal.forum_id, {
            type: 'consensus_reached',
            data: {
              proposalId: proposal.id,
              forumId: proposal.forum_id,
              action: proposal.action,
            },
          });
        }
      }
    )
    .subscribe();

  // Subscribe to votes table
  supabase
    .channel('votes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'votes',
      },
      async (payload) => {
        const vote = payload.new;

        // Get proposal to find forum
        const { data: proposal } = await supabase
          .from('proposals')
          .select('forum_id')
          .eq('id', vote.proposal_id)
          .single();

        if (proposal) {
          let agentEns = '';
          if (vote.agent_ens) {
            agentEns = vote.agent_ens;
          } else if (vote.agent_id) {
            const ensById = await mapAgentIdsToEns(supabase, [vote.agent_id]);
            agentEns = ensById.get(vote.agent_id) || '';
          }
          broadcastToForum(proposal.forum_id, {
            type: 'vote_cast',
            data: {
              proposalId: vote.proposal_id,
              agentEns,
              vote: vote.vote,
            },
          });
        }
      }
    )
    .subscribe();

  // Subscribe to executions table
  supabase
    .channel('executions')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'executions',
      },
      (payload) => {
        const execution = payload.new;
        broadcastToForum(execution.forum_id, {
          type: 'execution_started',
          data: {
            id: execution.id,
            agentEns: execution.agent_ens,
            status: execution.status,
          },
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'executions',
      },
      (payload) => {
        const execution = payload.new;
        if (execution.status === 'success' || execution.status === 'failed') {
          broadcastToForum(execution.forum_id, {
            type: 'execution_result',
            data: {
              id: execution.id,
              agentEns: execution.agent_ens,
              status: execution.status,
              txHash: execution.tx_hash,
              error: execution.error_message,
            },
          });
        }
      }
    )
    .subscribe();

  // Subscribe to agents for canvas updates
  supabase
    .channel('agents')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'agents',
      },
      (payload) => {
        const agent = payload.new;
        const oldAgent = payload.old;

        // Forum change detected
        if (agent.current_forum_id !== oldAgent.current_forum_id) {
          // Left old forum
          if (oldAgent.current_forum_id) {
            broadcastToForum(oldAgent.current_forum_id, {
              type: 'agent_left',
              data: {
                ensName: agent.ens_name,
                forumId: oldAgent.current_forum_id,
              },
            });
          }

          // Joined new forum
          if (agent.current_forum_id) {
            broadcastToForum(agent.current_forum_id, {
              type: 'agent_joined',
              data: {
                ensName: agent.ens_name,
                forumId: agent.current_forum_id,
                strategy: agent.strategy,
              },
            });
          }

          // Broadcast canvas movement to all
          broadcast({
            type: 'agent_moved',
            data: {
              ensName: agent.ens_name,
              fromForum: oldAgent.current_forum_id,
              toForum: agent.current_forum_id,
            },
          });
        }
      }
    )
    .subscribe();

  console.log('[ws] Realtime subscriptions established');
}

/**
 * Handle WebSocket connection (called by Bun server)
 */
export function handleWebSocketConnection(ws: WebSocket, connectionId: string) {
  connections.set(connectionId, ws);
  subscriptions.set(connectionId, new Set());

  console.log(`[ws] Client connected: ${connectionId}`);

  ws.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data as string);

      switch (data.type) {
        case 'subscribe':
          // Subscribe to a forum
          if (data.forumId) {
            subscriptions.get(connectionId)?.add(data.forumId);
            ws.send(
              JSON.stringify({
                type: 'subscribed',
                forumId: data.forumId,
              })
            );
          }
          break;

        case 'unsubscribe':
          // Unsubscribe from a forum
          if (data.forumId) {
            subscriptions.get(connectionId)?.delete(data.forumId);
            ws.send(
              JSON.stringify({
                type: 'unsubscribed',
                forumId: data.forumId,
              })
            );
          }
          break;

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
      }
    } catch (error) {
      console.error('[ws] Message parse error:', error);
    }
  });

  ws.addEventListener('close', () => {
    connections.delete(connectionId);
    subscriptions.delete(connectionId);
    console.log(`[ws] Client disconnected: ${connectionId}`);
  });

  ws.addEventListener('error', (error) => {
    console.error(`[ws] Error for ${connectionId}:`, error);
    connections.delete(connectionId);
    subscriptions.delete(connectionId);
  });

  // Send welcome message
  ws.send(
    JSON.stringify({
      type: 'connected',
      connectionId,
      timestamp: new Date().toISOString(),
    })
  );
}
