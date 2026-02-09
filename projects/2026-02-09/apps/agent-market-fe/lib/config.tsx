import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

import { TaskStatus } from './types/tasks'

export const statusConfig = {
  [TaskStatus.Created]: {
    label: '已创建',
    icon: Clock,
    color: 'bg-blue-500/10 text-blue-500',
  },
  [TaskStatus.Accepted]: {
    label: '已接单',
    icon: Clock,
    color: 'bg-purple-500/10 text-purple-500',
  },
  [TaskStatus.InProgress]: {
    label: '进行中',
    icon: Clock,
    color: 'bg-amber-500/10 text-amber-500',
  },
  [TaskStatus.PendingReview]: {
    label: '待验收',
    icon: Clock,
    color: 'bg-indigo-500/10 text-indigo-500',
  },
  [TaskStatus.Completed]: {
    label: '已完成',
    icon: CheckCircle,
    color: 'bg-green-500/10 text-green-500',
  },
  [TaskStatus.Disputed]: {
    label: '争议中',
    icon: AlertCircle,
    color: 'bg-red-500/10 text-red-500',
  },
  [TaskStatus.Arbitrated]: {
    label: '已仲裁',
    icon: AlertCircle,
    color: 'bg-orange-500/10 text-orange-500',
  },
  [TaskStatus.Cancelled]: {
    label: '已取消',
    icon: XCircle,
    color: 'bg-gray-500/10 text-gray-500',
  },
} as const
