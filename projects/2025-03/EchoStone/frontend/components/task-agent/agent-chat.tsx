"use client"

import { useRef, useEffect } from "react"
import { useAgent } from "./agent-provider"
import { AgentMessage } from "./agent-message"
import { AgentInput } from "./agent-input"
import { AgentSuggestions } from "./agent-suggestions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Bot, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function AgentChat() {
  const { messages, isProcessing, selectedModel, credits } = useAgent()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center">
          <Bot className="h-5 w-5 mr-2 text-primary" />
          AI助手对话
        </CardTitle>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="font-medium">{selectedModel.name}</span>
                  <Info className="h-3.5 w-3.5 ml-1" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>每次对话消耗 {selectedModel.creditCost} 积分</p>
                <p>当前积分: {credits}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col h-full p-0">
        {/* 消息历史区域 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <AgentMessage key={index} message={message} />
          ))}

          {/* AI正在思考的指示器 */}
          {isProcessing && (
            <div className="flex items-center text-muted-foreground">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>AI正在思考...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 快捷建议 */}
        <AgentSuggestions />

        {/* 输入区域 */}
        <div className="border-t p-4">
          <AgentInput />
        </div>
      </CardContent>
    </Card>
  )
}

