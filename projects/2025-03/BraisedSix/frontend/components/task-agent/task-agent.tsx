"use client"
import { useState } from "react"
import { AgentProvider, useAgent } from "./agent-provider"
import { AgentChat } from "./agent-chat"
import { AgentTaskPreview } from "./agent-task-preview"
import { AgentSettings } from "./agent-settings"
import { AgentPaymentModal } from "./agent-payment-modal"
import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"
import { Wallet, Sparkles, CreditCard } from "lucide-react"
import { motion } from "framer-motion"
import { AnimatedGradient } from "@/components/ui/animated-gradient"

function TaskAgentContent() {
  const { isConnected, connectWallet } = useWallet()
  const { credits, purchaseCredits } = useAgent()
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // 如果用户未连接钱包，显示连接钱包提示
  if (!isConnected) {
    return (
      <div className="relative flex flex-col items-center justify-center h-[70vh] space-y-4">
        <AnimatedGradient />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2 z-10"
        >
          <h1 className="text-3xl font-bold">连接钱包使用 TaskAgent</h1>
          <p className="text-muted-foreground max-w-md">请连接您的钱包以使用AI助手创建任务。</p>
          <Button onClick={connectWallet} className="mt-4">
            <Wallet className="mr-2 h-4 w-4" />
            连接钱包
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative space-y-6">
      <AnimatedGradient />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center z-10"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Task Agent</h1>
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-muted-foreground">与AI对话，创建更好的任务</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-primary/10 px-3 py-1 rounded-full flex items-center">
            <CreditCard className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm font-medium">{credits} 积分</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowPaymentModal(true)}>
            购买积分
          </Button>
          <AgentSettings />
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 z-10">
        {/* 左侧聊天区域 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1"
        >
          <AgentChat />
        </motion.div>

        {/* 右侧任务预览 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full lg:w-96 flex-shrink-0"
        >
          <AgentTaskPreview />
        </motion.div>
      </div>

      <AgentPaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPayment={purchaseCredits}
        currentCredits={credits}
      />
    </div>
  )
}

export function TaskAgent() {
  return (
    <AgentProvider>
      <TaskAgentContent />
    </AgentProvider>
  )
}

