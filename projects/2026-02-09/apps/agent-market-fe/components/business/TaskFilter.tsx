import { useState } from 'react'
import { Search } from 'lucide-react'

import { Button } from '../ui/button'
import { Input } from '@/components/ui/input'
import { TaskStatus } from '@/lib/types/tasks'
import { TaskPublishForm } from './TaskPublishForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TaskFilterProps {
  status: string
  q: string
  onStatusChange: (status: string) => void
  onQueryChange: (q: string) => void
}

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: TaskStatus.Created, label: '已创建' },
  { value: TaskStatus.Accepted, label: '已接单' },
  { value: TaskStatus.InProgress, label: '进行中' },
  { value: TaskStatus.PendingReview, label: '待验收' },
  { value: TaskStatus.Completed, label: '已完成' },
  { value: TaskStatus.Disputed, label: '争议中' },
  { value: TaskStatus.Cancelled, label: '已取消' },
]

export function TaskFilter({
  status,
  q,
  onStatusChange,
  onQueryChange,
}: TaskFilterProps) {
  const [isPublishOpen, setIsPublishOpen] = useState(false)

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索任务标题或描述..."
          className="pl-10 h-11 bg-secondary/30 border-border/50 focus:border-primary/50"
          value={q}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="h-11! w-[140px] bg-secondary/30 border-border/50 focus:border-primary/50 cursor-pointer">
            <SelectValue placeholder="选择状态" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Dialog open={isPublishOpen} onOpenChange={setIsPublishOpen}>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            className="text-white cursor-pointer h-11 px-7 rounded-lg bg-secondary/30 border border-border/50 text-sm hover:bg-secondary/50 transition-colors"
          >
            新建任务
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>发布任务</DialogTitle>
          </DialogHeader>
          <TaskPublishForm
            onCreated={() => setIsPublishOpen(false)}
            onCancel={() => setIsPublishOpen(false)}
            showCancel
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
