import { Hono } from 'hono';
import { getSupabase } from '../lib/supabase';
import { formatAgentEns, mapAgentIdsToEns, normalizeEnsInput } from '../lib/agents';

export const canvasRoutes = new Hono();

/**
 * Canvas API
 *
 * Provides state for the 2D visualization of agents moving between forum rooms.
 * Inspired by Stanford's "Generative Agents" paper.
 */

interface Room {
  id: string;
  name: string;
  forumId: string | null;
  position: { x: number; y: number };
  size: { width: number; height: number };
  agents: string[];
}

interface AgentPosition {
  ensName: string;
  position: { x: number; y: number };
  currentRoom: string | null;
  status: 'idle' | 'speaking' | 'voting';
  lastMessage?: string;
}

// Predefined room layout
const ROOM_LAYOUT: Omit<Room, 'forumId' | 'agents'>[] = [
  {
    id: 'eth-usdc',
    name: 'ETH-USDC Forum',
    position: { x: 50, y: 50 },
    size: { width: 200, height: 150 },
  },
  {
    id: 'wbtc-eth',
    name: 'WBTC-ETH Forum',
    position: { x: 300, y: 50 },
    size: { width: 200, height: 150 },
  },
  {
    id: 'stable-swaps',
    name: 'Stable Swaps',
    position: { x: 550, y: 50 },
    size: { width: 200, height: 150 },
  },
  {
    id: 'general',
    name: 'General Discussion',
    position: { x: 175, y: 250 },
    size: { width: 200, height: 150 },
  },
  {
    id: 'strategy',
    name: 'Strategy Lab',
    position: { x: 425, y: 250 },
    size: { width: 200, height: 150 },
  },
];

// GET /canvas/state - Get full canvas state
canvasRoutes.get('/state', async (c) => {
  const supabase = getSupabase();

  // Get all active agents with their current forum
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select(
      `
      id,
      ens_name,
      full_ens_name,
      strategy,
      current_forum_id,
      preferred_pools
    `
    )
    .eq('status', 'active');

  if (agentsError) {
    console.error('[canvas] Agents error:', agentsError);
    return c.json({ error: 'Failed to fetch agents' }, 500);
  }

  // Get active forums
  const { data: forums, error: forumsError } = await supabase
    .from('forums')
    .select(
      `
      id,
      title,
      status
    `
    )
    .in('status', ['active', 'consensus', 'executing']);

  if (forumsError) {
    console.error('[canvas] Forums error:', forumsError);
    return c.json({ error: 'Failed to fetch forums' }, 500);
  }

  // Get recent messages for hover previews
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('agent_id, content, forum_id, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  const forumIds = (forums || []).map((forum) => forum.id);
  const { data: forumParticipants } = await supabase
    .from('forum_participants')
    .select('forum_id, agent_id')
    .in('forum_id', forumIds)
    .eq('is_active', true);

  const participantAgentIds = (forumParticipants || []).map((row) => row.agent_id);
  const participantEnsById = await mapAgentIdsToEns(supabase, participantAgentIds);
  const participantsByForum = new Map<string, string[]>();

  for (const row of forumParticipants || []) {
    const ens = participantEnsById.get(row.agent_id);
    if (!ens) continue;
    const list = participantsByForum.get(row.forum_id) || [];
    list.push(ens);
    participantsByForum.set(row.forum_id, list);
  }

  // Build rooms with forum data
  const rooms: Room[] = ROOM_LAYOUT.map((room) => {
    // Try to find a matching active forum
    const matchingForum = forums?.find(
      (f) =>
        f.title.toLowerCase().includes(room.name.toLowerCase()) ||
        room.name.toLowerCase().includes(f.title.toLowerCase().split(' ')[0])
    );

    return {
      ...room,
      forumId: matchingForum?.id || null,
      agents: matchingForum ? participantsByForum.get(matchingForum.id) || [] : [],
    };
  });

  // Build agent positions
  const agentPositions: AgentPosition[] = (agents || []).map((agent) => {
    // Find which room the agent is in
    let currentRoom: string | null = null;
    let position = { x: 400, y: 450 }; // Default: wandering area

    if (agent.current_forum_id) {
      const room = rooms.find((r) => r.forumId === agent.current_forum_id);
      if (room) {
        currentRoom = room.id;
        // Random position within room
        position = {
          x: room.position.x + Math.random() * (room.size.width - 40) + 20,
          y: room.position.y + Math.random() * (room.size.height - 40) + 20,
        };
      }
    } else {
      // Place based on preferred pools
      const preferredPool = agent.preferred_pools?.[0];
      if (preferredPool) {
        const matchingRoom = rooms.find((r) =>
          r.name.toLowerCase().includes(preferredPool.toLowerCase().split('-')[0])
        );
        if (matchingRoom) {
          // Near but outside the room
          position = {
            x: matchingRoom.position.x + matchingRoom.size.width / 2 + (Math.random() - 0.5) * 100,
            y: matchingRoom.position.y + matchingRoom.size.height + 30 + Math.random() * 50,
          };
        }
      }
    }

    // Find last message
    const lastMsg = recentMessages?.find((m) => m.agent_id === agent.id);

    // Determine status
    let status: 'idle' | 'speaking' | 'voting' = 'idle';
    if (lastMsg) {
      const msgAge = Date.now() - new Date(lastMsg.created_at).getTime();
      if (msgAge < 30000) {
        // Last 30 seconds
        status = 'speaking';
      }
    }

    return {
      ensName: formatAgentEns(agent),
      position,
      currentRoom,
      status,
      lastMessage: lastMsg?.content,
    };
  });

  return c.json({
    rooms,
    agents: agentPositions,
    totalAgents: agents?.length || 0,
    activeForums: forums?.length || 0,
    timestamp: new Date().toISOString(),
  });
});

// GET /canvas/room/:roomId - Get specific room details
canvasRoutes.get('/room/:roomId', async (c) => {
  const roomId = c.req.param('roomId');
  const supabase = getSupabase();

  const room = ROOM_LAYOUT.find((r) => r.id === roomId);
  if (!room) {
    return c.json({ error: 'Room not found' }, 404);
  }

  // Find forum for this room
  const { data: forums } = await supabase
    .from('forums')
    .select(
      `
      id,
      title,
      goal,
      status
    `
    )
    .ilike('title', `%${room.name.split(' ')[0]}%`)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);

  const forum = forums?.[0];
  const participants =
    forum && forum.id
      ? await (async () => {
          const { data: forumParticipants } = await supabase
            .from('forum_participants')
            .select('agent_id')
            .eq('forum_id', forum.id)
            .eq('is_active', true);

          const agentIds = (forumParticipants || []).map((row) => row.agent_id);
          const ensById = await mapAgentIdsToEns(supabase, agentIds);
          return (forumParticipants || [])
            .map((row) => ensById.get(row.agent_id))
            .filter((ens): ens is string => Boolean(ens));
        })()
      : [];

  const recentMessages =
    forum && forum.id
      ? await (async () => {
          const { data: messages } = await supabase
            .from('messages')
            .select('id, agent_id, content, type, created_at')
            .eq('forum_id', forum.id)
            .order('created_at', { ascending: false })
            .limit(10);

          const agentIds = (messages || [])
            .map((message) => message.agent_id)
            .filter((id): id is string => Boolean(id));
          const ensById = await mapAgentIdsToEns(supabase, agentIds);

          return (
            messages?.map((message) => ({
              id: message.id,
              agentEns: message.agent_id ? ensById.get(message.agent_id) || '' : 'system',
              content: message.content,
              type: message.type,
              createdAt: message.created_at,
            })) || []
          );
        })()
      : [];

  return c.json({
    room: {
      ...room,
      forumId: forum?.id || null,
      agents: participants,
    },
    forum: forum
      ? {
          id: forum.id,
          title: forum.title,
          goal: forum.goal,
          participants,
          status: forum.status,
          recentMessages,
        }
      : null,
  });
});

// GET /canvas/agent/:ensName - Get agent's canvas state
canvasRoutes.get('/agent/:ensName', async (c) => {
  const ensName = c.req.param('ensName');
  const supabase = getSupabase();

  const { subdomain: agentSubdomain, full: fullEnsName } = normalizeEnsInput(ensName);

  const { data: agent, error } = await supabase
    .from('agents')
    .select(
      `
      id,
      ens_name,
      full_ens_name,
      strategy,
      current_forum_id,
      preferred_pools
    `
    )
    .eq('ens_name', agentSubdomain)
    .single();

  if (error || !agent) {
    return c.json({ error: 'Agent not found' }, 404);
  }

  // Get recent messages
  const { data: messages } = await supabase
    .from('messages')
    .select('content, forum_id, created_at')
    .eq('agent_id', agent.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Determine position
  let currentRoom: string | null = null;
  let position = { x: 400, y: 450 };

  if (agent.current_forum_id) {
    // Get forum to determine room
    const { data: forum } = await supabase
      .from('forums')
      .select('title')
      .eq('id', agent.current_forum_id)
      .single();

    if (forum) {
      const room = ROOM_LAYOUT.find(
        (r) =>
          r.name.toLowerCase().includes(forum.title.toLowerCase().split(' ')[0]) ||
          forum.title.toLowerCase().includes(r.name.toLowerCase().split(' ')[0])
      );

      if (room) {
        currentRoom = room.id;
        position = {
          x: room.position.x + room.size.width / 2,
          y: room.position.y + room.size.height / 2,
        };
      }
    }
  }

  return c.json({
    ensName: formatAgentEns(agent) || fullEnsName,
    position,
    currentRoom,
    status: messages && messages.length > 0 ? 'speaking' : 'idle',
    strategy: agent.strategy,
    preferredPools: agent.preferred_pools,
    recentMessages: messages || [],
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${agentSubdomain}`,
  });
});
