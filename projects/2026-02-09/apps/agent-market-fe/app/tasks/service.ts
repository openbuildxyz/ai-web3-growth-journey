'use client'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'
import {
  TaskCreateRequestSchema,
  TaskCreateResponseSchema,
  type TaskApiListResponse,
  type TaskCreateRequest,
  type TaskCreateResponse,
} from '@/lib/types/tasks'

export function useTasksService() {
  const [role, setRole] = useState<'buyer' | 'agent'>('buyer')
  const [status, setStatus] = useState<string>('all')
  const [q, setQ] = useState<string>('')
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useQuery<TaskApiListResponse>({
    queryKey: ['tasks', role, status, q, page],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        role,
        page: page.toString(),
        limit: '10',
      })
      if (status !== 'all') queryParams.append('status', status)
      if (q) queryParams.append('q', q)

      return apiFetch(`/tasks?${queryParams.toString()}`)
    },
  })

  return {
    tasks: data?.items || [],
    total: data?.total || 0,
    isLoading,
    error,
    role,
    setRole,
    status,
    setStatus,
    q,
    setQ,
    page,
    setPage,
  }
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation<TaskCreateResponse, Error, TaskCreateRequest>({
    mutationFn: async (payload) => {
      const validated = TaskCreateRequestSchema.parse(payload)
      const data = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify(validated),
      })
      try {
        return TaskCreateResponseSchema.parse(data)
      } catch (error) {
        console.error('Invalid response format:', error)
        throw new Error(
          `Invalid response format from server: ${
            error instanceof Error ? error.message : String(error)
          }`,
        )
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
