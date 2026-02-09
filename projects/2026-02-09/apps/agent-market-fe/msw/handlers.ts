import { http, HttpResponse, delay } from 'msw'
import { mockAgents } from './mockData/agents'
import { mockTasks } from './mockData/tasks'
import type { TaskDeliveryPayload, TaskMetaPayload } from '@/lib/tasks/offchain'
import { TaskStatus } from '@/lib/types/tasks'
import { mockArbitrationCases, mockDaoMembers } from './mockData/dao'
import { mockAuthChallenge, mockAuthLoginResponse } from './mockData/auth'
import { mockAgentTags } from './mockData/tags'

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN

const taskMetadataStore = new Map<
  string,
  { metaHash?: string; payload?: TaskMetaPayload }
>()
const taskDeliveryStore = new Map<
  string,
  { deliveryHash?: string; payload?: TaskDeliveryPayload }
>()

// Helper to check for auth
const isAuthorized = (request: Request, requiredRole?: string) => {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  // For mock purposes, we'll assume the token is valid if it's there
  // In a real mock we might decode it to check role
  return true
}

const buildDefaultMetadata = (task: (typeof mockTasks)[number]) => ({
  metaHash: `mock-meta-${task.id}`,
  payload: {
    version: '1',
    taskId: task.id,
    title: task.title,
    description: task.description ?? '',
    agentId: task.agent_id ?? undefined,
    createdAt: task.created_at,
    tokenSymbol: task.token_symbol,
  },
})

const buildDefaultDelivery = (task: (typeof mockTasks)[number]) => ({
  deliveryHash: `mock-delivery-${task.id}`,
  payload: {
    version: '1',
    taskId: task.id,
    deliveries: [],
    submittedAt: task.delivered_at ?? new Date().toISOString(),
  },
})

const getTaskFilters = (request: Request) => {
  const url = new URL(request.url)
  return {
    role: url.searchParams.get('role') || 'buyer',
    status: url.searchParams.get('status'),
    q: url.searchParams.get('q'),
  }
}

const filterTasks = ({
  role,
  status,
  q,
}: {
  role: string
  status: string | null
  q: string | null
}) => {
  let filtered = mockTasks.filter((t) => {
    // For demo purposes, we'll assume 'u1' is the buyer and 'a1' is the agent
    if (role === 'buyer') {
      return t.buyer_id === 'u1'
    }
    return t.agent_id === 'a1'
  })

  if (status) {
    filtered = filtered.filter((t) => t.status === status)
  }

  if (q) {
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q.toLowerCase()) ||
        t.description?.toLowerCase().includes(q.toLowerCase()),
    )
  }

  return filtered
}

export const handlers = [
  //* Auth
  http.post(`${BACKEND_DOMAIN}/auth/challenge`, async ({ request }) => {
    const { address } = (await request.json()) as { address: string }
    if (!address) {
      return new HttpResponse(
        JSON.stringify({ message: 'Address is required' }),
        { status: 400 },
      )
    }
    return HttpResponse.json(mockAuthChallenge)
  }),
  http.post(`${BACKEND_DOMAIN}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as any
    if (!body.signature || !body.address || !body.nonce) {
      return new HttpResponse(
        JSON.stringify({ message: 'Missing required fields' }),
        { status: 400 },
      )
    }
    // Return a token that includes the role for mock verification if needed
    return HttpResponse.json({
      ...mockAuthLoginResponse,
      access_token: `mock-jwt-for-${body.role || 'user'}`,
    })
  }),
  //* 市场页
  // 获取 Agent 列表
  http.get(`${BACKEND_DOMAIN}/agents`, () => {
    return HttpResponse.json({
      items: mockAgents,
      page: 0,
      limit: 10,
      total: mockAgents.length,
    })
  }),
  http.get(`${BACKEND_DOMAIN}/agents/tags`, () => {
    return HttpResponse.json(mockAgentTags)
  }),
  // 创建 Agent (Seller 权限)
  http.post(`${BACKEND_DOMAIN}/agents`, async ({ request }) => {
    if (!isAuthorized(request, 'seller')) {
      return new HttpResponse(
        JSON.stringify({ message: 'Unauthorized: Seller role required' }),
        { status: 401 },
      )
    }
    const body = await request.json()
    return HttpResponse.json(
      { message: 'Agent created successfully', data: body },
      { status: 201 },
    )
  }),
  // 更新 Agent (Seller 权限)
  http.patch(`${BACKEND_DOMAIN}/agents/:id`, async ({ params, request }) => {
    if (!isAuthorized(request, 'seller')) {
      return new HttpResponse(
        JSON.stringify({ message: 'Unauthorized: Seller role required' }),
        { status: 401 },
      )
    }
    const { id } = params
    if (typeof id !== 'string') {
      return new HttpResponse(JSON.stringify({ message: 'Invalid ID' }), {
        status: 400,
      })
    }
    const body = await request.json()
    return HttpResponse.json({
      message: 'Agent updated successfully',
      id,
      data: body,
    })
  }),
  //* DAO页
  // 获取所有仲裁案件
  http.get(`${BACKEND_DOMAIN}/dao/cases`, () => {
    return HttpResponse.json({
      data: mockArbitrationCases,
      total: mockArbitrationCases.length,
    })
  }),
  // 获取所有DAO成员
  http.get(`${BACKEND_DOMAIN}/dao/members`, () => {
    return HttpResponse.json({
      data: mockDaoMembers,
      total: mockDaoMembers.length,
    })
  }),
  //* 任务页
  http.get(`${BACKEND_DOMAIN}/tasks`, ({ request }) => {
    if (!isAuthorized(request)) {
      return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
      })
    }
    const { role, status, q } = getTaskFilters(request)
    const filtered = filterTasks({ role, status, q })

    return HttpResponse.json({
      items: filtered,
      page: 1,
      limit: 10,
      total: filtered.length,
    })
  }),
  // 获取聚合任务视图
  http.get(`${BACKEND_DOMAIN}/tasks/aggregated`, ({ request }) => {
    if (!isAuthorized(request)) {
      return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
      })
    }
    const { role, status, q } = getTaskFilters(request)
    const filtered = filterTasks({ role, status, q })
    const items = filtered.map((task) => ({
      task,
      metadata: taskMetadataStore.get(task.id) ?? buildDefaultMetadata(task),
      delivery: taskDeliveryStore.get(task.id) ?? buildDefaultDelivery(task),
    }))

    return HttpResponse.json({
      items,
      page: 1,
      limit: 10,
      total: filtered.length,
    })
  }),
  // 获取单个任务详情
  http.get(`${BACKEND_DOMAIN}/tasks/:id`, ({ params }) => {
    const { id } = params
    if (typeof id !== 'string') {
      return new HttpResponse(JSON.stringify({ message: 'Invalid ID' }), {
        status: 400,
      })
    }
    const task = mockTasks.find((t) => t.id === id) || mockTasks[0]
    return HttpResponse.json({
      ...task,
      // Add some mock data for UI
      buyer: { name: 'Demo Buyer', address: '0x123...456' },
      agent: task.agent_id
        ? { name: 'Demo Agent', address: '0xabc...def' }
        : undefined,
    })
  }),
  // 获取任务元数据
  http.get(`${BACKEND_DOMAIN}/tasks/:id/metadata`, ({ params }) => {
    const { id } = params
    if (typeof id !== 'string') {
      return new HttpResponse(JSON.stringify({ message: 'Invalid ID' }), {
        status: 400,
      })
    }
    const task = mockTasks.find((t) => t.id === id)
    if (!task) {
      return new HttpResponse(JSON.stringify({ message: 'Not found' }), {
        status: 404,
      })
    }
    const entry = taskMetadataStore.get(id) ?? buildDefaultMetadata(task)
    return HttpResponse.json({ task_id: id, ...entry })
  }),
  // 获取交付物
  http.get(`${BACKEND_DOMAIN}/tasks/:id/delivery`, ({ params }) => {
    const { id } = params
    if (typeof id !== 'string') {
      return new HttpResponse(JSON.stringify({ message: 'Invalid ID' }), {
        status: 400,
      })
    }
    const task = mockTasks.find((t) => t.id === id)
    if (!task) {
      return new HttpResponse(JSON.stringify({ message: 'Not found' }), {
        status: 404,
      })
    }
    const entry = taskDeliveryStore.get(id) ?? buildDefaultDelivery(task)
    return HttpResponse.json({ task_id: id, ...entry })
  }),
  // 创建任务 (Buyer 权限)
  http.post(`${BACKEND_DOMAIN}/tasks`, async ({ request }) => {
    if (!isAuthorized(request, 'buyer')) {
      return new HttpResponse(
        JSON.stringify({ message: 'Unauthorized: Buyer role required' }),
        { status: 401 },
      )
    }
    const body = (await request.json()) as Record<string, any>
    const now = new Date().toISOString()
    const newTask = {
      id: `t${Date.now()}`,
      buyer_id: 'u1',
      agent_id: body.agent_id || undefined,
      title: body.title ?? 'Untitled Task',
      description: body.description ?? '',
      budget_usd: Number(body.budget_usd) || 0,
      token_symbol: body.token_symbol ?? 'USDT',
      status: TaskStatus.Created,
      created_at: now,
      review_deadline: body.review_deadline ?? undefined,
    }
    mockTasks.unshift(newTask)
    return HttpResponse.json(newTask, { status: 201 })
  }),
  // 保存任务元数据
  http.post(
    `${BACKEND_DOMAIN}/tasks/:id/metadata`,
    async ({ params, request }) => {
      if (!isAuthorized(request, 'buyer')) {
        return new HttpResponse(
          JSON.stringify({ message: 'Unauthorized: Buyer role required' }),
          { status: 401 },
        )
      }
      const { id } = params
      if (typeof id !== 'string') {
        return new HttpResponse(JSON.stringify({ message: 'Invalid ID' }), {
          status: 400,
        })
      }
      const body = (await request.json()) as {
        metaHash?: string
        payload?: TaskMetaPayload
      }
      const entry = { metaHash: body.metaHash, payload: body.payload }
      taskMetadataStore.set(id, entry)
      return HttpResponse.json({ task_id: id, ...entry }, { status: 201 })
    },
  ),
  // 保存交付物
  http.post(
    `${BACKEND_DOMAIN}/tasks/:id/delivery`,
    async ({ params, request }) => {
      if (!isAuthorized(request, 'seller')) {
        return new HttpResponse(
          JSON.stringify({ message: 'Unauthorized: Seller role required' }),
          { status: 401 },
        )
      }
      const { id } = params
      if (typeof id !== 'string') {
        return new HttpResponse(JSON.stringify({ message: 'Invalid ID' }), {
          status: 400,
        })
      }
      const body = (await request.json()) as {
        deliveryHash?: string
        payload?: TaskDeliveryPayload
      }
      const entry = { deliveryHash: body.deliveryHash, payload: body.payload }
      taskDeliveryStore.set(id, entry)
      return HttpResponse.json({ task_id: id, ...entry }, { status: 201 })
    },
  ),
  // 更新任务状态
  http.patch(
    `${BACKEND_DOMAIN}/tasks/:id/status`,
    async ({ params, request }) => {
      if (!isAuthorized(request)) {
        return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
        })
      }
      const { id } = params
      if (typeof id !== 'string') {
        return new HttpResponse(JSON.stringify({ message: 'Invalid ID' }), {
          status: 400,
        })
      }
      const { status } = (await request.json()) as { status: string }

      return HttpResponse.json({
        id,
        status,
        message: `Task status updated to ${status}${status === 'completed' ? ' - Payment released' : ''}`,
      })
    },
  ),
]
