"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"

type Message = {
  role: "user" | "assistant"
  content: string
}

interface AgentMessageProps {
  message: Message
}

export function AgentMessage({ message }: AgentMessageProps) {
  const isUser = message.role === "user"

  // 移除任务信息JSON部分，只显示对话内容
  const displayContent = message.content.replace(/###TaskInfo###[\s\S]*?###EndTaskInfo###/g, "")

  return (
    <div className={cn("flex items-start gap-3 group", isUser && "justify-end")}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn("rounded-lg px-3 py-2 max-w-[80%]", isUser ? "bg-primary text-primary-foreground" : "bg-muted")}
      >
        <p className="whitespace-pre-wrap text-sm">{displayContent}</p>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-muted">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

