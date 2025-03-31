"use client"

import { type Task, TaskStatus } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, DollarSign, Users } from "lucide-react"

export function TaskStats({ tasks }: { tasks: Task[] }) {
  // Calculate statistics
  const totalTasks = tasks.length
  const activeTasks = tasks.filter(
    (task) => task.status === TaskStatus.Open || task.status === TaskStatus.Pending,
  ).length
  const completedTasks = tasks.filter(
    (task) => task.status === TaskStatus.Finish || task.status === TaskStatus.Close,
  ).length

  // Calculate total bounty value
  const totalBounty = tasks.reduce((sum, task) => {
    return sum + (Number(task.bountyFormatted) || 0)
  }, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTasks}</div>
          <p className="text-xs text-muted-foreground">Tasks on the marketplace</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeTasks}</div>
          <p className="text-xs text-muted-foreground">Open or in progress</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedTasks}</div>
          <p className="text-xs text-muted-foreground">Successfully completed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bounty</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBounty.toFixed(2)} USDC</div>
          <p className="text-xs text-muted-foreground">Available rewards</p>
        </CardContent>
      </Card>
    </div>
  )
}

