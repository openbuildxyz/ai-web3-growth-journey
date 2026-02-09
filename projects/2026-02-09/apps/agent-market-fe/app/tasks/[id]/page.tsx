'use client'

import { use, useEffect, useRef } from 'react'
// import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import * as d3 from 'd3'
import {
  ArrowLeft,
  Calendar,
  Clock,
  ShieldCheck,
  User,
  Bot,
  CheckCircle2,
  Loader2,
} from 'lucide-react'

import { apiFetch } from '@/lib/api'
// import { useAuthStore } from '@/stores/auth'
import { statusConfig } from '@/lib/config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  RankedAgentsResponse,
  TaskApiItem,
  TaskStatus,
} from '@/lib/types/tasks'

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const svgRef = useRef<SVGSVGElement>(null)

  const { data, isLoading } = useQuery<{ task: TaskApiItem }>({
    queryKey: ['task', id],
    queryFn: () => apiFetch(`/tasks/${id}`),
  })

  const { data: rankingData, isLoading: isRankingLoading } =
    useQuery<RankedAgentsResponse>({
      queryKey: ['task', id, 'ranked-agents'],
      queryFn: () => apiFetch(`/tasks/${id}/agents`),
    })

  const { task } = data ?? { task: null }

  // const updateStatus = async (newStatus: TaskStatus) => {
  //   setIsUpdating(true)
  //   try {
  //     await apiFetch(`/tasks/${id}/status`, {
  //       method: 'PATCH',
  //       body: JSON.stringify({ status: newStatus }),
  //     })
  //     toast.success(`任务状态已更新为: ${newStatus}`)
  //     refetch()
  //   } catch (error: any) {
  //     toast.error(error.message || '更新失败')
  //   } finally {
  //     setIsUpdating(false)
  //   }
  // }

  const rankedAgents = rankingData?.items ?? []
  const topAgents = rankedAgents.slice(0, 10).map((agent, index) => ({
    id: agent.id,
    name: agent.display_name,
    rank: agent.rank ?? index + 1,
  }))

  const ringPositions = [
    { top: '8%', left: '50%' },
    { top: '18%', left: '78%' },
    { top: '40%', left: '92%' },
    { top: '65%', left: '82%' },
    { top: '86%', left: '55%' },
    { top: '86%', left: '45%' },
    { top: '65%', left: '18%' },
    { top: '40%', left: '8%' },
    { top: '18%', left: '22%' },
    { top: '8%', left: '50%' },
  ]

  const getRadiusByRank = (rank: number) => {
    if (rank === 1) return 7
    if (rank === 2) return 6
    if (rank === 3) return 5
    return 4
  }

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', '0 0 100 100')

    const root = svg.append('g')

    const center = root.append('g').attr('transform', 'translate(50,50)')
    center
      .append('circle')
      .attr('r', 10)
      .attr('fill', 'hsl(var(--primary))')
      .attr('fill-opacity', 0.15)
      .attr('stroke', 'hsl(var(--primary))')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 0.6)
    center
      .append('text')
      .text('My Task')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', 3.4)
      .attr('fill', 'hsl(var(--foreground))')

    const nodes = topAgents.slice(0, 10).map((agent, index) => {
      const pos = ringPositions[index] ?? { top: '50%', left: '50%' }
      const x = Number(pos.left.replace('%', ''))
      const y = Number(pos.top.replace('%', ''))
      return {
        ...agent,
        x,
        y,
        rank: agent.rank ?? index + 1,
      }
    })

    const nodeGroup = root
      .selectAll('g.agent-node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'agent-node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`)

    nodeGroup
      .append('circle')
      .attr('r', (d) => getRadiusByRank(d.rank))
      .attr('fill', (d) =>
        d.rank <= 3 ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
      )
      .attr('fill-opacity', (d) => (d.rank <= 3 ? 0.35 : 0.35))
      .attr('stroke', (d) =>
        d.rank <= 3 ? 'hsl(var(--primary))' : 'hsl(var(--border))',
      )
      .attr('stroke-opacity', (d) => (d.rank <= 3 ? 0.8 : 0.6))
      .attr('stroke-width', (d) => (d.rank <= 3 ? 0.7 : 0.5))

    nodeGroup
      .append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', (d) => (d.rank <= 3 ? 3.4 : 3.1))
      .attr('fill', (d) =>
        d.rank <= 3 ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
      )

    nodeGroup.append('title').text((d) => `#${d.rank} ${d.name}`)
  }, [topAgents, ringPositions])

  if (isLoading) {
    return (
      <div className="container mx-auto py-20 px-4 flex justify-center mt-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="container mx-auto py-20 px-4 text-center mt-16">
        <h2 className="text-2xl font-bold">未找到任务</h2>
        <Button onClick={() => router.back()} className="mt-4">
          返回
        </Button>
      </div>
    )
  }
  // Check if current user is the buyer or agent for this task
  // const isBuyer =
  //   address &&
  //   task.buyer_wallet_address &&
  //   task.buyer_wallet_address.toLowerCase() === address.toLowerCase()
  // const isAgent =
  //   address &&
  //   task.agent_wallet_address &&
  //   task.agent_wallet_address.toLowerCase() === address.toLowerCase()

  // Compute display properties from contract data
  const taskTitle = task.title || `Task #${id}`
  const taskBudget = task.budget_usd ?? 0
  const tokenSymbol = task.token_symbol || 'USDT'
  const taskDescription = task.description || '暂无任务描述'
  const taskProgress = task.progress ?? 0
  const buyerDisplay =
    task.buyer?.name || task.buyer_wallet_address || '匿名买家'
  const agentDisplay =
    task.agent?.name || task.agent_wallet_address || '等待接单'

  const currentStatus = statusConfig[task.status] || {
    label: String(task.status),
    color: 'bg-secondary',
    icon: Clock,
  }

  // 更改时间格式
  // const createdAt = task?.created_at ? new Date(task.created_at) : null

  return (
    <div className="container mx-auto px-4">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 gap-2 -ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-2xl border border-border/50"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h1 className="text-3xl font-bold tracking-tight">{taskTitle}</h1>
              <Badge
                className={`${currentStatus.color} px-3 py-1 text-sm flex gap-2 items-center`}
              >
                <currentStatus.icon className="w-3.5 h-3.5" />
                {currentStatus.label}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                创建于 {/* TODO 待后端解决时间戳问题 */}
                {/* {createdAt ? format(createdAt, 'yyyy-MM-dd HH:mm') : 'N/A'} */}
              </div>
              <div className="flex items-center gap-2">
                预算:{' '}
                <span className="text-foreground font-semibold">
                  {taskBudget} {tokenSymbol}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">任务描述</h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {taskDescription}
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-border/30">
              <h2 className="text-xl font-semibold mb-6">进度追踪</h2>
              <div className="space-y-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">当前进度</span>
                  <span className="font-medium">{taskProgress}%</span>
                </div>
                <Progress value={taskProgress} className="h-2" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`p-4 rounded-xl border ${task.status !== TaskStatus.Created ? 'bg-success/5 border-success/20' : 'bg-secondary/20 border-border/50'}`}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      资金托管
                    </div>
                    <div className="font-medium flex items-center gap-2">
                      {task.status !== TaskStatus.Created && (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      )}
                      已锁定
                    </div>
                  </div>
                  <div
                    className={`p-4 rounded-xl border ${[TaskStatus.Accepted, TaskStatus.InProgress, TaskStatus.PendingReview, TaskStatus.Completed].includes(task.status) ? 'bg-success/5 border-success/20' : 'bg-secondary/20 border-border/50'}`}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      Agent 接单
                    </div>
                    <div className="font-medium flex items-center gap-2">
                      {[
                        TaskStatus.Accepted,
                        TaskStatus.InProgress,
                        TaskStatus.PendingReview,
                        TaskStatus.Completed,
                      ].includes(task.status) && (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      )}
                      {agentDisplay}
                    </div>
                  </div>
                  <div
                    className={`p-4 rounded-xl border ${task.status === TaskStatus.Completed ? 'bg-success/5 border-success/20' : 'bg-secondary/20 border-border/50'}`}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      交付与结算
                    </div>
                    <div className="font-medium flex items-center gap-2">
                      {task.status === TaskStatus.Completed && (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      )}
                      {task.status === TaskStatus.Completed
                        ? '已结算'
                        : '待处理'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 rounded-2xl border border-border/50 sticky top-24"
          >
            <h3 className="font-bold text-lg mb-6">任务操作</h3>

            <div className="space-y-4">
              {/* Agent Actions */}
              {/* TODO: Implement contract-based task actions */}
              {/* {isAgent && (
                <>
                  {task.status === TaskStatus.Created && (
                    <Button
                      className="w-full"
                      variant="gradient"
                      onClick={() => updateStatus(TaskStatus.Accepted)}
                      disabled={isUpdating}
                    >
                      {isUpdating && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      接受任务
                    </Button>
                  )}
                  {task.status === TaskStatus.Accepted && (
                    <Button
                      className="w-full"
                      variant="gradient"
                      onClick={() => setDeliveryOpen(true)}
                      disabled={isUpdating || isDelivering}
                    >
                      {isUpdating && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      提交交付物
                    </Button>
                  )}
                </>
              )} */}

              {/* Buyer Actions */}
              {/* {isBuyer && (
                <>
                  {task.status === TaskStatus.PendingReview && (
                    <Button
                      className="w-full"
                      variant="gradient"
                      onClick={() => updateStatus(TaskStatus.Completed)}
                      disabled={isUpdating}
                    >
                      {isUpdating && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      确认完成并放款
                    </Button>
                  )}
                </>
              )} */}

              {/* Shared Actions */}
              {/* {[TaskStatus.Created, TaskStatus.Accepted].includes(
                task.status,
              ) && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => updateStatus(TaskStatus.Cancelled)}
                  disabled={isUpdating}
                >
                  取消任务
                </Button>
              )} */}

              {task.status === TaskStatus.Completed && (
                <div className="p-4 bg-success/10 rounded-xl border border-success/20 text-success text-center font-medium">
                  任务已顺利完成，资金已结算。
                </div>
              )}

              {task.status === TaskStatus.Cancelled && (
                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 text-red-500 text-center font-medium">
                  任务已取消，托管资金已退回。
                </div>
              )}
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">买家</div>
                  <div className="text-sm font-medium">{buyerDisplay}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Agent</div>
                  <div className="text-sm font-medium">{agentDisplay}</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 rounded-2xl border border-border/50 relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">Agent Match</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active Agent: {agentDisplay}
                  </p>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/30">
                  Top 10
                </span>
              </div>
              <div className="relative h-72 w-full">
                <svg
                  ref={svgRef}
                  className="h-72 w-full"
                  role="img"
                  aria-label="Agent match visualization"
                />
                {topAgents.length === 0 && (
                  <div className="absolute top-30 inset-0 flex items-center justify-center text-xs text-muted-foreground">
                    {isRankingLoading
                      ? 'Ranking agents...'
                      : 'No ranked agents available'}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
