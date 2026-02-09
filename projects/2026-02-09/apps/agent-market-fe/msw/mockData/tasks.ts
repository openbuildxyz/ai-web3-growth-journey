import type { TaskApiItem } from '../../lib/types/tasks'
import { TaskStatus } from '../../lib/types/tasks'

export const mockTasks: TaskApiItem[] = [
  {
    id: 't1',
    buyer_id: 'u1',
    agent_id: 'a1',
    title: 'Design a professional logo for a Web3 project',
    description:
      'I need a modern, minimalist logo for my new decentralized finance platform. The logo should represent trust and innovation.',
    budget_usd: 500,
    token_symbol: 'USDT',
    status: TaskStatus.InProgress,
    created_at: '2026-01-10T10:00:00Z',
    buyer: {
      name: 'Alice',
      address: '0x123...abc',
    },
    agent: {
      name: 'CreativeAgent',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=a1',
      address: '0x456...def',
    },
  },
  {
    id: 't2',
    buyer_id: 'u2',
    agent_id: 'a1',
    title: 'Write a smart contract for an NFT marketplace',
    description:
      'Looking for an experienced Solidity developer to write a secure smart contract for an NFT marketplace with royalty support.',
    budget_usd: 2000,
    token_symbol: 'USDC',
    status: TaskStatus.Completed,
    created_at: '2026-01-05T14:30:00Z',
    buyer: {
      name: 'Bob',
      address: '0x789...ghi',
    },
    agent: {
      name: 'CreativeAgent',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=a1',
      address: '0x456...def',
    },
  },
  {
    id: 't3',
    buyer_id: 'u1',
    agent_id: 'a2',
    title: 'Market research for AI-powered trading bots',
    description:
      'Need a comprehensive report on the current landscape of AI trading bots, including key players and technology trends.',
    budget_usd: 300,
    token_symbol: 'USDT',
    status: TaskStatus.Created,
    created_at: '2026-01-15T09:00:00Z',
    buyer: {
      name: 'Alice',
      address: '0x123...abc',
    },
    agent: {
      name: 'AnalystBot',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=a2',
      address: '0xdef...789',
    },
  },
  {
    id: 't4',
    buyer_id: 'u3',
    agent_id: 'a3',
    title: 'Telegram bot for community management',
    description:
      'Develop a Telegram bot that can handle auto-moderation, member verification, and basic analytics for a crypto community.',
    budget_usd: 800,
    token_symbol: 'DAI',
    status: TaskStatus.Cancelled,
    created_at: '2026-01-08T16:00:00Z',
    buyer: {
      name: 'Charlie',
      address: '0xabc...123',
    },
    agent: {
      name: 'DevBot',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=a3',
      address: '0xghi...456',
    },
  },
]
