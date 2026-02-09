import { z } from 'zod'

export enum TaskStatus {
  Created = 'created',
  Accepted = 'accepted',
  InProgress = 'in_progress',
  PendingReview = 'pending_review',
  Completed = 'completed',
  Disputed = 'disputed',
  Arbitrated = 'arbitrated',
  Cancelled = 'cancelled',
}

export const TaskStatusSchema = z.enum(TaskStatus)

export const TaskApiItem = z.object({
  id: z.string(),
  buyer_id: z.string(),
  agent_id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  budget_usd: z.number(),
  platform_fee: z.number().optional(),
  token_symbol: z.string(),
  chain_id: z.number().optional(),
  chain_task_id: z.number().optional(),
  create_tx_hash: z.string().optional(),
  buyer_wallet_address: z.string().optional(),
  agent_wallet_address: z.string().optional(),
  status: TaskStatusSchema,
  progress: z.number().optional(),
  created_at: z.string(),
  accepted_at: z.string().optional(),
  delivered_at: z.string().optional(),
  review_deadline: z.string().optional(),
  arbitration_deadline: z.string().optional(),
  // Extended fields for UI
  buyer: z
    .object({
      name: z.string(),
      avatar: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
  agent: z
    .object({
      name: z.string(),
      avatar: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
})

export type TaskApiItem = z.infer<typeof TaskApiItem>

export const CreateTaskRequest = z.object({
  agent_id: z.string(),
  title: z.string(),
  description: z.string(),
  budget_usd: z.number(),
  token_symbol: z.string().default('USDT'),
})

export type CreateTaskRequest = z.infer<typeof CreateTaskRequest>

export const TaskApiListResponse = z.object({
  items: z.array(TaskApiItem),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
})

export type TaskApiListResponse = z.infer<typeof TaskApiListResponse>

export interface ListTasksQuery {
  role: 'buyer' | 'agent'
  status?: TaskStatus
  q?: string
  page?: number
  limit?: number
}

export const TaskCreateRequestSchema = z.object({
  tx_hash: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  budget_usd: z.number().positive(),
  agent_id: z.string().min(1).optional(),
  review_deadline: z.string().optional(),
  platform_fee: z.number().nonnegative().optional(),
  token_symbol: z.string().optional(),
  auto_assign: z.boolean().optional(),
  chain_id: z.number().int().positive().optional(),
  chain_task_id: z.number().int().positive().optional(),
  buyer_wallet_address: z.string().min(1).optional(),
})

export type TaskCreateRequest = z.infer<typeof TaskCreateRequestSchema>

export const TaskCreateResponseSchema = z.object({
  id: z.string(),
  buyer_id: z.string(),
  agent_id: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  budget_usd: z.union([z.number(), z.string()]).transform((val) => Number(val)),
  platform_fee: z
    .union([z.number(), z.string()])
    .nullable()
    .transform((val) => (val ? Number(val) : null)),
  token_symbol: z.string(),
  chain_id: z
    .union([z.number(), z.string(), z.bigint()])
    .nullable()
    .transform((val) => (val ? Number(val) : null)),
  chain_task_id: z
    .union([z.number(), z.string(), z.bigint()])
    .nullable()
    .transform((val) => (val ? Number(val) : null)),
  create_tx_hash: z.string().nullable(),
  buyer_wallet_address: z.string().nullable(),
  agent_wallet_address: z.string().nullable(),
  status: z.string(),
  progress: z.number().nullable(),
  created_at: z
    .union([z.string(), z.date()])
    .transform((val) => (val instanceof Date ? val.toISOString() : val)),
  accepted_at: z
    .union([z.string(), z.date()])
    .nullable()
    .transform((val) => (val instanceof Date ? val.toISOString() : val)),
  delivered_at: z
    .union([z.string(), z.date()])
    .nullable()
    .transform((val) => (val instanceof Date ? val.toISOString() : val)),
  review_deadline: z
    .union([z.string(), z.date()])
    .nullable()
    .transform((val) => (val instanceof Date ? val.toISOString() : val)),
  arbitration_deadline: z
    .union([z.string(), z.date()])
    .nullable()
    .transform((val) => (val instanceof Date ? val.toISOString() : val)),
})

export type TaskCreateResponse = z.infer<typeof TaskCreateResponseSchema>

export const RankedAgentItem = z.object({
  id: z.string(),
  display_name: z.string(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  price_per_task: z.number().optional(),
  rating: z.number().optional(),
  completed_tasks: z.number().optional(),
  response_time: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_online: z.boolean().optional(),
  score: z.number().optional(),
  rank: z.number().optional(),
})

export const RankedAgentsResponse = z.object({
  items: z.array(RankedAgentItem),
  total: z.number().optional(),
})

export const TaskExecutionResponse = z.object({
  output: z.any(),
  agent: z
    .object({
      id: z.string(),
      display_name: z.string(),
      rank: z.number().optional(),
    })
    .optional(),
})

export type RankedAgentsResponse = z.infer<typeof RankedAgentsResponse>
export type TaskExecutionResponse = z.infer<typeof TaskExecutionResponse>
