import { z } from 'zod'

export const AgentApiItem = z.object({
  id: z.string(),
  user_id: z.string(),
  display_name: z.string(),
  bio: z.string().nullable(),
  avatar: z.string().nullable(),
  price_per_task: z
    .union([z.number(), z.string()])
    .nullable()
    .transform((val) => (val ? Number(val) : null)),
  rating: z
    .union([z.number(), z.string()])
    .nullable()
    .transform((val) => (val ? Number(val) : null)),
  completed_tasks: z.number().default(0),
  response_time: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  is_online: z.boolean().default(false),
  auth_type: z.string().nullable(),
  auth_secret_hash: z.string().nullable(),
  base_url: z.string().nullable(),
  invoke_path: z.string().nullable(),
  status: z.string().nullable(),
  timeout_ms: z.number().nullable().optional(),
  supports_callback: z.boolean().nullable().optional(),
  // created_at: z.string().optional(),
})

export const AgentApiListResponse = z.object({
  items: z.array(AgentApiItem),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
})

export const AgentTagListResponse = z.union([
  z.array(z.string()),
  z.object({ data: z.array(z.string()) }),
])

export const CreateAgentRequest = z.object({
  display_name: z.string().min(1, '请输入 Agent 名称'),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  price_per_task: z
    .number()
    .min(0, '价格不能为负数')
    .optional()
    .transform((val) => (val === undefined ? undefined : val)),
  tags: z.array(z.string()).optional(),
  base_url: z.string().min(1, '请输入 API Base URL').url('请输入有效的 URL'),
  invoke_path: z.string().min(1, '请输入调用路径'),
  auth_type: z.enum(['platform_jwt', 'platform_hmac']).optional(),
  auth_secret_hash: z.string().min(1, '请输入认证密钥'),
  response_time: z.string().optional(),
  timeout_ms: z.number().optional(),
  supports_callback: z.boolean().optional(),
})

export const UpdateAgentRequest = CreateAgentRequest.partial()

// agent 列表项 (UI)
export const AgentItem = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  avatar: z.string(),
  price: z.number(),
  rating: z.number(),
  completedTasks: z.number(),
  responseTime: z.string(),
  tags: z.string().array(),
  isOnline: z.boolean(),
})
