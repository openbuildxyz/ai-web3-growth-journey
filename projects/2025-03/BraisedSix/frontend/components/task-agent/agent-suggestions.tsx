"use client"

import { useAgent } from "./agent-provider"
import { Button } from "@/components/ui/button"

const suggestions = [
  "帮我创建一个前端开发任务",
  "我需要一个智能合约审计任务",
  "创建一个DApp集成任务",
  "帮我设计一个NFT项目任务",
]

export function AgentSuggestions() {
  const { sendMessage, isProcessing, messages } = useAgent()

  // 只在初始状态显示建议
  if (messages.length > 1 || isProcessing) {
    return null
  }

  return (
    <div className="px-4 py-2 flex flex-wrap gap-2">
      {suggestions.map((suggestion, index) => (
        <Button key={index} variant="outline" size="sm" onClick={() => sendMessage(suggestion)} disabled={isProcessing}>
          {suggestion}
        </Button>
      ))}
    </div>
  )
}

