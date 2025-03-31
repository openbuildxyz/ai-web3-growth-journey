"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAgent } from "./agent-provider"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { SendHorizonal, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function AgentInput() {
  const [input, setInput] = useState("")
  const { sendMessage, isProcessing, credits, selectedModel } = useAgent()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const insufficientCredits = credits < selectedModel.creditCost

  // 自动调整文本框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSend = () => {
    if (input.trim() && !isProcessing && !insufficientCredits) {
      sendMessage(input.trim())
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-2">
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入消息..."
        className="min-h-[40px] max-h-[200px] resize-none"
        disabled={isProcessing}
      />
      <TooltipProvider>
        <Tooltip open={insufficientCredits ? undefined : false}>
          <TooltipTrigger asChild>
            <div>
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isProcessing || insufficientCredits}
                className={insufficientCredits ? "bg-destructive hover:bg-destructive" : ""}
              >
                {insufficientCredits ? <AlertCircle className="h-4 w-4" /> : <SendHorizonal className="h-4 w-4" />}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>积分不足，请购买更多积分</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

