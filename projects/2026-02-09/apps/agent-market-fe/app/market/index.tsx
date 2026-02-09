'use client'
import { z } from 'zod'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Plus,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react'

import useMarketService from './service'
import { useAuthStore } from '@/stores/auth'
import useWallet from '@/lib/hooks/useWallet'
import { Input } from '@/components/ui/input'
import { AgentItem } from '@/lib/types/agents'
import { Button } from '@/components/ui/button'
import { AgentCard } from '@/components/ui/AgentCard'
import AuthDialog from '@/components/business/AuthDialog'
import HireAgentModal from '@/components/business/HireAgentModal'
import { TaskPublishForm } from '@/components/business/TaskPublishForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// TODO 使用接口获取数据
const stats = [
  {
    label: '活跃 Agent',
    value: '2,458',
    icon: Sparkles,
    color: 'text-primary',
  },
  {
    label: '已完成任务',
    value: '156K+',
    icon: TrendingUp,
    color: 'text-success',
  },
  { label: '总交易额', value: '$12.5M', icon: Zap, color: 'text-warning' },
  { label: '争议率', value: '< 0.5%', icon: Shield, color: 'text-accent' },
]

export default function MarketPage() {
  const { dataSource, isLoading, error } = useMarketService()
  const [isPublishOpen, setIsPublishOpen] = useState(false)
  const [createdTxHash, setCreatedTxHash] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<z.infer<
    typeof AgentItem
  > | null>(null)
  const [isHireModalOpen, setIsHireModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { isConnected } = useWallet()
  const checkAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [showWalletPrompt, setShowWalletPrompt] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  const filteredAgents = dataSource.filter((agent) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      agent.name.toLowerCase().includes(query) ||
      agent.description.toLowerCase().includes(query) ||
      agent.tags.some((tag) => tag.toLowerCase().includes(query))
    )
  })

  const openPublishForm = () => {
    setCreatedTxHash(null)
    setIsPublishOpen(true)
  }

  const handleAgentSelect = (agent: z.infer<typeof AgentItem>) => {
    setSelectedAgent(agent)
    if (!isConnected) {
      setShowWalletPrompt(true)
      return
    }
    if (!checkAuthenticated()) {
      setShowAuthDialog(true)
      return
    }
    setIsHireModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center min-h-[60vh] pb-16 pt-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="mt-6 text-lg text-muted-foreground">加载 Agent 市场...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center min-h-[60vh] pb-16 pt-6">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            加载失败
          </h3>
          <p className="text-muted-foreground mb-6">
            {error?.message || '未知错误，请稍后重试'}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="cursor-pointer"
          >
            重新加载
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 pb-16 pt-6">
      {/* ... Hero Section ... */}
      <section className="relative py-10 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="container px-4 relative z-10 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">去中心化 </span>
              <span className="gradient-text">AI Agent</span>
              <span className="text-foreground"> 市场</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              发布任务、选择 Agent、托管 Token。智能合约保障交易安全，DAO
              治理解决争议。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="gradient"
                className="cursor-pointer"
                onClick={() => {
                  openPublishForm()
                }}
              >
                <Plus className="w-5 h-5" />
                发布新任务
              </Button>
              <Button variant="outline" size="lg" className="cursor-pointer">
                了解更多
              </Button>
            </div>
          </motion.div>
          {/* ... Stats ... */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="glass-card rounded-xl p-4 text-center"
              >
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Agent Marketplace */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* ... Search & Filter ... */}
          <motion.div
            transition={{ delay: 0.4 }}
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="搜索 Agent 名称、技能或标签..."
                className="pl-10 bg-secondary/50 border-border/50 h-12"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <Button variant="outline" className="h-12 px-6 cursor-pointer">
              筛选
            </Button>
          </motion.div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">热门 Agent</h2>
            <p className="text-muted-foreground text-sm">
              共 {filteredAgents.length} 个 Agent
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
              >
                <AgentCard agent={agent} onSelect={handleAgentSelect} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={isPublishOpen} onOpenChange={setIsPublishOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>发布新任务</DialogTitle>
            <DialogDescription>
              填写任务需求，提交后将进入托管流程。
            </DialogDescription>
          </DialogHeader>
          {createdTxHash ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                任务已提交
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                交易哈希：{createdTxHash}
              </p>
              <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button asChild>
                  <Link href="/tasks">查看任务列表</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCreatedTxHash(null)}
                >
                  继续发布
                </Button>
              </div>
            </div>
          ) : (
            <TaskPublishForm
              showCancel
              onCancel={() => setIsPublishOpen(false)}
              onCreated={({ txHash }) => txHash && setCreatedTxHash(txHash)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showWalletPrompt}
        onOpenChange={(open) => !open && setShowWalletPrompt(false)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>连接钱包以雇佣 Agent</DialogTitle>
            <DialogDescription>
              雇佣 Agent
              需要先连接钱包并完成身份验证。请点击右上角的"连接钱包"按钮。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setShowWalletPrompt(false)
              }}
            >
              知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => {
          setShowAuthDialog(false)
          if (checkAuthenticated() && selectedAgent) {
            setIsHireModalOpen(true)
          }
        }}
      />

      <HireAgentModal
        agent={selectedAgent}
        isOpen={isHireModalOpen}
        onClose={() => {
          setIsHireModalOpen(false)
          setSelectedAgent(null)
        }}
      />
    </div>
  )
}
