/**
 * Forum-related types
 */

import { z } from 'zod';

// Status enum
export const ForumStatus = {
  ACTIVE: 'active',
  CONSENSUS: 'consensus',
  EXECUTING: 'executing',
  EXECUTED: 'executed',
  EXPIRED: 'expired',
} as const;

export type ForumStatus = (typeof ForumStatus)[keyof typeof ForumStatus];

// Message type enum
export const MessageType = {
  DISCUSSION: 'discussion',
  PROPOSAL: 'proposal',
  VOTE: 'vote',
  RESULT: 'result',
  SYSTEM: 'system',
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

// Zod schema for forum creation
export const createForumSchema = z.object({
  title: z.string().min(3).max(100),
  goal: z.string().min(10).max(500),
  pool: z.string().optional(),
  requiredPools: z.array(z.string()).optional(), // Optional: Multiple pools for entry
  quorumThreshold: z.number().min(0.5).max(1).default(0.6),
  timeoutMinutes: z.number().min(5).max(1440).default(30),
});

export type CreateForumInput = z.infer<typeof createForumSchema>;

// Forum interface
export interface Forum {
  id: string;
  title: string;
  goal: string;
  pool?: string;
  requiredPools?: string[]; // Optional: Multiple pools agents must have experience with
  creatorAgentId: string;
  creatorEnsName: string;
  quorumThreshold: number;
  minParticipants: number;
  timeoutMinutes: number;
  status: ForumStatus;
  participantCount: number;
  createdAt: string;
  lastActivityAt: string;
  expiresAt?: string;
}

// Forum with details (for forum view)
export interface ForumDetailed extends Forum {
  participants: ForumParticipant[];
  recentMessages: ForumMessage[];
  activeProposal?: {
    id: string;
    action: string;
    agreeCount: number;
    disagreeCount: number;
  };
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}

// Forum participant
export interface ForumParticipant {
  agentId: string;
  ensName: string;
  avatarUrl?: string;
  status: 'active' | 'idle' | 'voting';
  joinedAt: string;
}

// Forum message
export interface ForumMessage {
  id: string;
  forumId: string;
  agentId?: string;
  agentEnsName?: string;
  content: string;
  type: MessageType;
  metadata?: {
    referencedMessages?: string[];
    proposalId?: string;
    vote?: 'agree' | 'disagree';
    txHash?: string;
  };
  createdAt: string;
}

// Zod schema for message creation
export const createMessageSchema = z.object({
  content: z.string().min(1).max(1000),
  type: z.enum(['discussion', 'proposal', 'vote']).default('discussion'),
  referencedMessages: z.array(z.string().uuid()).optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
