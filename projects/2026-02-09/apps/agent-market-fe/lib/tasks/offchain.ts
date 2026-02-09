import { z } from 'zod'
import { apiFetch } from '@/lib/api'
import { hashPayload } from '@/lib/tasks/payload'

const PAYLOAD_VERSION = '1'

export type TaskMetaPayload = {
  version: string
  title: string
  description: string
  agentId?: string
  createdAt: string
  tokenSymbol: string
  taskId?: string
}

export type DeliveryItem = {
  type: string
  uri: string
  checksum?: string
}

export type TaskDeliveryPayload = {
  version: string
  taskId: string
  deliveries: DeliveryItem[]
  submittedAt: string
}

const TaskMetaPayloadSchema = z.object({
  version: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  agentId: z.string().min(1).optional(),
  createdAt: z.string().min(1),
  tokenSymbol: z.string().min(1),
  taskId: z.string().min(1).optional(),
})

const TaskDeliveryPayloadSchema = z.object({
  version: z.string().min(1),
  taskId: z.string().min(1),
  deliveries: z.array(
    z.object({
      type: z.string().min(1),
      uri: z.string().min(1),
      checksum: z.string().min(1).optional(),
    }),
  ),
  submittedAt: z.string().min(1),
})

export const createTaskMetaPayload = (
  input: Omit<TaskMetaPayload, 'version'>,
): TaskMetaPayload => ({
  version: PAYLOAD_VERSION,
  ...input,
})

export const createTaskDeliveryPayload = (
  input: Omit<TaskDeliveryPayload, 'version'>,
): TaskDeliveryPayload => ({
  version: PAYLOAD_VERSION,
  ...input,
})

const safeHashPayload = (
  payload: TaskMetaPayload | TaskDeliveryPayload,
  label: string,
) => {
  try {
    return hashPayload(payload)
  } catch (error) {
    throw new Error(`Invalid ${label} payload for hashing`, { cause: error })
  }
}

export const persistTaskMetadata = async (
  taskId: string,
  payload: TaskMetaPayload,
) => {
  const parsed = TaskMetaPayloadSchema.parse(payload)
  const metaHash = safeHashPayload(parsed, 'task metadata')
  const response = await apiFetch(`/tasks/${taskId}/metadata`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metaHash, payload: parsed }),
  })
  return { metaHash, response }
}

export const persistTaskDelivery = async (
  taskId: string,
  payload: TaskDeliveryPayload,
) => {
  const parsed = TaskDeliveryPayloadSchema.parse(payload)
  const deliveryHash = safeHashPayload(parsed, 'task delivery')
  const response = await apiFetch(`/tasks/${taskId}/delivery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deliveryHash, payload: parsed }),
  })
  return { deliveryHash, response }
}
