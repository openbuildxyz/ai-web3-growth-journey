import z from 'zod'
import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'
import {
  AgentApiItem,
  AgentApiListResponse,
  AgentItem,
  AgentTagListResponse,
} from '@/lib/types/agents'

export default function useMarketService() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await apiFetch('/agents?view=market')
      return AgentApiListResponse.parse(response)
    },
  })

  const {
    data: tagsData,
    isLoading: tagsLoading,
    error: tagsError,
  } = useQuery({
    queryKey: ['agents', 'tags'],
    queryFn: async () => {
      const response = await apiFetch('/agents/tags')
      return AgentTagListResponse.parse(response)
    },
  })

  const handleAgentSelect = (agent: z.infer<typeof AgentItem>) => {
    console.log('selected agent:', agent)
  }

  const tags: string[] =
    tagsData === undefined
      ? []
      : Array.isArray(tagsData)
        ? tagsData
        : (tagsData?.data ?? [])
  const total = data?.total ?? 0
  const page = data?.page ?? 0
  const limit = data?.limit ?? 0
  const dataSource = (data?.items ?? []).map(
    (agent: z.infer<typeof AgentApiItem>) => ({
      id: agent.id,
      name: agent.display_name,
      description: agent.bio ?? '',
      avatar: agent.avatar ?? agent.display_name.charAt(0),
      price: agent.price_per_task ?? 0,
      rating: agent.rating ?? 0,
      completedTasks: agent.completed_tasks ?? 0,
      responseTime: agent.response_time ?? 'N/A',
      tags: agent.tags ?? [],
      isOnline: agent.is_online ?? false,
    }),
  )

  return {
    dataSource,
    total,
    page,
    limit,
    tags,
    isLoading: isLoading || tagsLoading,
    error: error || tagsError,
    handleAgentSelect,
  }
}
