'use client'
import { useEffect } from 'react'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { redirect } from 'next/navigation'

import { useTasksService } from './service'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { TaskCard } from '@/components/ui/TaskCard'
import { TaskFilter } from '@/components/business/TaskFilter'
// import { TaskPublishForm } from '@/components/business/TaskPublishForm'

export default function TasksPage() {
  const {
    tasks,
    total,
    isLoading,
    error,
    role,
    setRole,
    status,
    setStatus,
    q,
    setQ,
    page,
    setPage,
  } = useTasksService()

  const { isAuthenticated } = useAuthStore()
  // const [createdTxHash, setCreatedTxHash] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      redirect('/')
    }
  }, [isAuthenticated])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-16 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">我的任务</h1>
          <p className="text-muted-foreground">追踪您的任务进度和历史记录</p>
        </div>

        <div className="flex bg-secondary/30 p-1 rounded-xl border border-border/50">
          <button
            type="button"
            onClick={() => setRole('buyer')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              role === 'buyer'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            买家视角 (Buying)
          </button>
          <button
            type="button"
            onClick={() => setRole('agent')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              role === 'agent'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Agent 视角 (Working)
          </button>
        </div>
      </div>

      <TaskFilter
        q={q}
        status={status}
        onQueryChange={setQ}
        onStatusChange={setStatus}
      />

      {/* <div className="glass-card rounded-2xl border border-border/50 p-6">
        <div className="mb-6 flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-foreground">发布新任务</h2>
          <p className="text-sm text-muted-foreground">
            填写任务需求，提交后将生成任务并进入托管流程。
          </p>
        </div>
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
              <Button variant="outline" onClick={() => setCreatedTxHash(null)}>
                继续发布
              </Button>
            </div>
          </div>
        ) : (
          <TaskPublishForm
            onCreated={({ txHash }) => txHash && setCreatedTxHash(txHash)}
          />
        )}
      </div> */}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] glass-card rounded-2xl p-10 text-center">
          <p className="text-red-500 mb-4">
            加载失败: {(error as Error).message}
          </p>
          <Button onClick={() => window.location.reload()}>重试</Button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] glass-card rounded-2xl p-10 text-center">
          <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">未找到任务</h3>
          <p className="text-muted-foreground max-w-sm">
            {q || status !== 'all'
              ? '尝试调整筛选条件或搜索关键词'
              : '您目前还没有任何任务'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <TaskCard task={task} role={role} />
            </motion.div>
          ))}
        </div>
      )}

      {total > 10 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            上一页
          </Button>
          <span className="text-sm text-muted-foreground">
            第 {page} 页 / 共 {Math.ceil(total / 10)} 页
          </span>
          <Button
            variant="outline"
            disabled={page >= Math.ceil(total / 10)}
            onClick={() => setPage((p) => p + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  )
}
