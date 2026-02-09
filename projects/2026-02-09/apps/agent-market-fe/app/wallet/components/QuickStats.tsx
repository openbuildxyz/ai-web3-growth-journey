'use client'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { useMonthlyIncome } from '@/lib/hooks/useMonthlyIncome'

type WalletStatsResponse = {
  completed_tasks: number
  in_progress_tasks: number
}

export default function QuickStats() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { data: stats, isLoading } = useQuery<WalletStatsResponse>({
    queryKey: ['wallet', 'stats'],
    enabled: isAuthenticated(),
    queryFn: () => apiFetch('/wallet/stats'),
  })
  const { data: monthlyIncome, isLoading: isIncomeLoading } = useMonthlyIncome()

  // 默认值
  const completedTasks = stats?.completed_tasks ?? 0
  const inProgressTasks = stats?.in_progress_tasks ?? 0

  return (
    <motion.div
      transition={{ delay: 0.2 }}
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
    >
      <div className="glass-card rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-foreground font-mono">
          {isLoading ? '...' : completedTasks}
        </p>
        <p className="text-sm text-muted-foreground">已完成任务</p>
      </div>
      <div className="glass-card rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-success font-mono">
          {isIncomeLoading
            ? '...'
            : `+$${(monthlyIncome ?? 0).toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`}
        </p>
        <p className="text-sm text-muted-foreground">本月收入</p>
      </div>
      <div className="glass-card rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-primary font-mono">
          {isLoading ? '...' : inProgressTasks}
        </p>
        <p className="text-sm text-muted-foreground">进行中</p>
      </div>
    </motion.div>
  )
}
