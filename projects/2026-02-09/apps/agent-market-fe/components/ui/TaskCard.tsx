import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, Wallet } from 'lucide-react'

import { statusConfig } from '@/lib/config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TaskApiItem, TaskStatus } from '@/lib/types/tasks'

interface TaskCardProps {
  task: TaskApiItem
  role: 'buyer' | 'agent'
}

export function TaskCard({ task, role }: TaskCardProps) {
  const status = statusConfig[task.status] || statusConfig[TaskStatus.Created]
  const StatusIcon = status.icon
  const otherParty = role === 'buyer' ? task.agent : task.buyer

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5 border border-border/50 hover:border-primary/50 transition-colors"
    >
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-lg mb-1">
            {task.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        </div>
        <Badge
          className={`${status.color} border-none flex items-center gap-1 shrink-0`}
        >
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            {otherParty?.avatar ? (
              <img
                src={otherParty.avatar}
                alt={otherParty.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">
              {role === 'buyer' ? 'Agent' : 'Buyer'}
            </span>
            <span className="font-medium truncate max-w-[120px]">
              {otherParty?.name || 'Unknown'}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-muted-foreground text-xs">预算</span>
          <div className="flex items-center gap-1 font-semibold text-primary">
            <Wallet className="w-3 h-3" />
            {task.budget_usd} {task.token_symbol}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          创建于 {new Date(task.created_at).toLocaleDateString()}
        </span>
        <Button size="sm" variant="outline" className="h-8" asChild>
          <Link href={`/tasks/${task.id}`}>查看详情</Link>
        </Button>
      </div>
    </motion.div>
  )
}
