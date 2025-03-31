"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { useWallet } from "../wallet-provider"
import { useToast } from "@/components/ui/use-toast"
import {
  DEFAULT_SYSTEM_PROMPT,
  AI_MODELS,
  INITIAL_CREDITS,
  DEFAULT_API_CONFIG,
  type APIConfig,
  type AIModelConfig,
} from "@/lib/agent-config"

type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

type TaskPreview = {
  title: string
  description: string
  target: string
  limitTime: number
  bounty: number
}

type AgentContextType = {
  messages: Message[]
  isProcessing: boolean
  taskPreview: TaskPreview
  credits: number
  selectedModel: AIModelConfig
  apiConfig: APIConfig
  sendMessage: (content: string) => Promise<void>
  updateTaskPreview: (updates: Partial<TaskPreview>) => void
  resetAgent: () => void
  setSelectedModel: (model: AIModelConfig) => void
  updateApiConfig: (config: Partial<APIConfig>) => void
  purchaseCredits: (amount: number) => Promise<boolean>
}

const AgentContext = createContext<AgentContextType | null>(null)

const AgentProvider = ({ children }: { children: ReactNode }) => {
  const { address, signer } = useWallet()
  const { toast } = useToast()

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "你好！我是TaskAgent，可以帮助你创建更好的任务。请告诉我你想创建什么样的任务？",
    },
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  const [taskPreview, setTaskPreview] = useState<TaskPreview>({
    title: "",
    description: "",
    target: "",
    limitTime: 7,
    bounty: 100,
  })
  const [credits, setCredits] = useState(INITIAL_CREDITS)
  // 设置deepseek为默认模型
  const [selectedModel, setSelectedModel] = useState<AIModelConfig>(
    AI_MODELS.find((m) => m.id === "deepseek-r1:7b") || AI_MODELS[0],
  )
  const [apiConfig, setApiConfig] = useState<APIConfig>(DEFAULT_API_CONFIG)

  // 从localStorage加载积分
  useEffect(() => {
    if (address) {
      const savedCredits = localStorage.getItem(`${address.toLowerCase()}_credits`)
      if (savedCredits) {
        setCredits(Number.parseInt(savedCredits))
      } else {
        // 新用户赠送初始积分
        setCredits(INITIAL_CREDITS)
        localStorage.setItem(`${address.toLowerCase()}_credits`, INITIAL_CREDITS.toString())
      }
    }
  }, [address])

  // 保存积分到localStorage
  useEffect(() => {
    if (address) {
      localStorage.setItem(`${address.toLowerCase()}_credits`, credits.toString())
    }
  }, [credits, address])

  const updateApiConfig = useCallback((config: Partial<APIConfig>) => {
    setApiConfig((prev) => ({ ...prev, ...config }))
  }, [])

  const purchaseCredits = useCallback(
    async (amount: number): Promise<boolean> => {
      // 这里应该实现与智能合约的交互，购买积分
      // 目前只是模拟购买成功
      try {
        setCredits((prev) => prev + amount)
        toast({
          title: "购买成功",
          description: `已成功购买 ${amount} 积分`,
        })
        return true
      } catch (error) {
        console.error("购买积分失败:", error)
        toast({
          title: "购买失败",
          description: "购买积分时出现错误",
          variant: "destructive",
        })
        return false
      }
    },
    [toast],
  )

  // 添加一个新函数来处理AI响应
  const processAIResponse = useCallback(
    (text: string) => {
      // 扣除积分
      setCredits((prev) => prev - selectedModel.creditCost)

      // 解析AI响应
      const newMessage = { role: "assistant" as const, content: text }
      setMessages((prev) => [...prev, newMessage])

      // 尝试从响应中提取任务信息
      const taskInfoMatch = text.match(/###TaskInfo###\s*({[\s\S]*?})\s*###EndTaskInfo###/)
      if (taskInfoMatch && taskInfoMatch[1]) {
        try {
          const taskInfo = JSON.parse(taskInfoMatch[1])
          setTaskPreview((prev) => ({
            ...prev,
            ...taskInfo,
          }))
        } catch (e) {
          console.error("Failed to parse task info:", e)
        }
      }
    },
    [selectedModel.creditCost, setCredits, setMessages, setTaskPreview],
  )

  const sendMessage = useCallback(
    async (content: string) => {
      // 检查积分是否足够
      if (credits < selectedModel.creditCost) {
        toast({
          title: "积分不足",
          description: `使用 ${selectedModel.name} 需要 ${selectedModel.creditCost} 积分，您当前只有 ${credits} 积分`,
          variant: "destructive",
        })
        return
      }

      // 添加用户消息
      setMessages((prev) => [...prev, { role: "user", content }])
      setIsProcessing(true)

      try {
        // 准备发送给AI的消息历史
        const aiMessages = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))

        aiMessages.push({ role: "user", content })

        // 调用AI API，根据apiConfig.type决定使用哪种API
        if (apiConfig.type === "openai") {
          // 使用OpenAI官方API
          const { text } = await generateText({
            model: openai(selectedModel.apiIdName),
            messages: aiMessages,
            system: DEFAULT_SYSTEM_PROMPT,
          })

          // 解析响应
          processAIResponse(text)
        } else {
          // 使用自定义API
          const response = await fetch(apiConfig.endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiConfig.apiKey}`,
            },
            body: JSON.stringify({
              model: selectedModel.apiIdName,
              messages: [{ role: "system", content: DEFAULT_SYSTEM_PROMPT }, ...aiMessages],
            }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(`API请求失败: ${response.status} ${errorData.error?.message || response.statusText}`)
          }

          const data = await response.json()
          const text = data.choices[0]?.message?.content || ""

          // 解析响应
          processAIResponse(text)
        }
      } catch (error) {
        console.error("Error sending message to AI:", error)
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `抱歉，与AI通信时出现了错误: ${error.message || "未知错误"}。请检查API设置后重试。`,
          },
        ])

        toast({
          title: "AI通信错误",
          description: `与AI服务通信失败: ${error.message || "未知错误"}`,
          variant: "destructive",
        })
      } finally {
        setIsProcessing(false)
      }
    },
    [messages, credits, selectedModel, apiConfig, toast, processAIResponse],
  )

  const updateTaskPreview = useCallback((updates: Partial<TaskPreview>) => {
    setTaskPreview((prev) => ({
      ...prev,
      ...updates,
    }))
  }, [])

  const resetAgent = useCallback(() => {
    setMessages([
      {
        role: "assistant",
        content: "你好！我是TaskAgent，可以帮助你创建更好的任务。请告诉我你想创建什么样的任务？",
      },
    ])
    setTaskPreview({
      title: "",
      description: "",
      target: "",
      limitTime: 7,
      bounty: 100,
    })
  }, [])

  return (
    <AgentContext.Provider
      value={{
        messages,
        isProcessing,
        taskPreview,
        credits,
        selectedModel,
        apiConfig,
        sendMessage,
        updateTaskPreview,
        resetAgent,
        setSelectedModel,
        updateApiConfig,
        purchaseCredits,
      }}
    >
      {children}
    </AgentContext.Provider>
  )
}

export const useAgent = () => {
  const context = useContext(AgentContext)
  if (!context) {
    throw new Error("useAgent must be used within an AgentProvider")
  }
  return context
}

export { AgentProvider }

