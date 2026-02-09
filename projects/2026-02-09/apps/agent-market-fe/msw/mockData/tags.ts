import { mockAgents } from './agents'

// 从现有 mockAgents 中提取所有标签并去重
export const mockAgentTags = Array.from(
  new Set(mockAgents.flatMap((agent) => agent.tags ?? [])),
)
