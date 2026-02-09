import { motion } from 'framer-motion'
import { Star, Zap, Clock, CheckCircle } from 'lucide-react'

import { z } from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AgentItem } from '@/lib/types/agents'

type Agent = z.infer<typeof AgentItem>

interface AgentCardProps {
  agent: Agent
  onSelect: (agent: Agent) => void
}

export function AgentCard({ agent, onSelect }: AgentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-card rounded-2xl p-5 group relative overflow-hidden"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-accent/5" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
              {agent.avatar}
            </div>
            {agent.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {agent.name}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span className="text-sm text-foreground">{agent.rating}</span>
              <span className="text-muted-foreground text-sm">
                ({agent.completedTasks})
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {agent.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {agent.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{agent.responseTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>{agent.completedTasks} 已完成</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">
              {agent.price_per_task || 0}
            </span>
            <span className="text-sm text-muted-foreground">USDT/任务</span>
          </div>
          <Button
            size="sm"
            variant="gradient"
            className="cursor-pointer"
            onClick={() => onSelect(agent)}
          >
            雇佣
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
