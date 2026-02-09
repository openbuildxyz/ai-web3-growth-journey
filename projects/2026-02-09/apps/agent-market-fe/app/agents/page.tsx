'use client'

import { z } from 'zod'
import { toast } from 'sonner'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Plus,
  Settings2,
  ExternalLink,
  Zap,
  Power,
  PowerOff,
} from 'lucide-react'

import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { AgentApiItem } from '@/lib/types/agents'
import AgentForm from '@/components/business/AgentForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function AgentManagePage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<z.infer<
    typeof AgentApiItem
  > | null>(null)

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['my-agents'],
    queryFn: () => apiFetch('/agents?view=mine'), // Fetch all agents - backend doesn't support role parameter
  })

  const agents = (data?.items || []) as z.infer<typeof AgentApiItem>[]

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isOnline }: { id: string; isOnline: boolean }) => {
      const endpoint = isOnline ? 'offline' : 'online'
      return apiFetch(`/agents/${id}/${endpoint}`, {
        method: 'PATCH',
      })
    },
    onSuccess: (_, variables) => {
      toast.success(variables.isOnline ? 'Agent 已下线' : 'Agent 已上线')
      refetch()
    },
    onError: () => {
      toast.error('操作失败，请重试')
    },
  })

  const handleEdit = (agent: z.infer<typeof AgentApiItem>) => {
    setEditingAgent(agent)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setEditingAgent(null)
    setIsFormOpen(true)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-16 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent 管理</h1>
          <p className="text-muted-foreground mt-1">
            发布、监控和优化您的 AI Agent
          </p>
        </div>
        <Button
          size="lg"
          variant="gradient"
          className="gap-2 cursor-pointer"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="w-5 h-5 cursor-pointer" />
          发布新 Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[200px] rounded-xl bg-secondary/20 animate-pulse"
            />
          ))
        ) : agents.length === 0 ? (
          <div className="col-span-full py-20 text-center glass-card rounded-2xl border-dashed">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium">尚未发布 Agent</h3>
            <p className="text-muted-foreground mt-2 mb-6">
              开始发布您的第一个 AI Agent，向全球用户提供服务
            </p>
            <Button
              onClick={handleCreate}
              variant="outline"
              className="cursor-pointer"
            >
              立即发布
            </Button>
          </div>
        ) : (
          agents.map((agent) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card group p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {agent.display_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">
                      {agent.display_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {agent.price_per_task || 0} tokens/task
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleEdit(agent)}
                >
                  <Settings2 className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-6 h-10">
                {agent.bio}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">任务数</div>
                    <div className="font-semibold">
                      {agent.completed_tasks || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">评分</div>
                    <div className="font-semibold">{agent.rating || 'N/A'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">状态</div>
                    <div
                      className={`font-semibold text-xs ${agent.is_online ? 'text-green-500' : 'text-gray-400'}`}
                    >
                      {agent.is_online ? '在线' : '离线'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(agent)}
                    className="h-8 gap-1 text-xs cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    查看
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 gap-1 text-xs cursor-pointer"
                    variant={agent.is_online ? 'destructive' : 'default'}
                    onClick={() =>
                      toggleStatusMutation.mutate({
                        id: agent.id,
                        isOnline: agent.is_online,
                      })
                    }
                    disabled={toggleStatusMutation.isPending}
                  >
                    {agent.is_online ? (
                      <>
                        <PowerOff className="w-3 h-3" />
                        下线
                      </>
                    ) : (
                      <>
                        <Power className="w-3 h-3" />
                        上线
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingAgent ? '编辑 Agent' : '发布新 Agent'}
            </DialogTitle>
            <DialogDescription>
              配置您的 AI Agent 信息、接口和认证方式。
            </DialogDescription>
          </DialogHeader>
          <AgentForm
            initialData={
              editingAgent
                ? {
                    id: editingAgent.id,
                    display_name: editingAgent.display_name,
                    bio: editingAgent.bio ?? undefined,
                    avatar: editingAgent.avatar ?? undefined,
                    price_per_task: editingAgent.price_per_task ?? undefined,
                    response_time: editingAgent.response_time ?? undefined,
                    base_url: editingAgent.base_url ?? undefined,
                    invoke_path: editingAgent.invoke_path ?? undefined,
                    auth_type: editingAgent.auth_type as
                      | 'platform_jwt'
                      | 'platform_hmac'
                      | undefined,
                    auth_secret_hash:
                      editingAgent.auth_secret_hash ?? undefined,
                    tags: editingAgent.tags ?? undefined,
                    timeout_ms: editingAgent.timeout_ms ?? undefined,
                    supports_callback:
                      editingAgent.supports_callback ?? undefined,
                  }
                : undefined
            }
            onSuccess={() => {
              setIsFormOpen(false)
              refetch()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
