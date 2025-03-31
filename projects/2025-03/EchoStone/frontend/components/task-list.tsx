"use client"

import { type Task, TaskStatus } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTaskModal } from "./task-modal-provider"
import { usePathname } from "next/navigation"

export function TaskList({ tasks }: { tasks: Task[] }) {
  const { openDetailModal } = useTaskModal()
  const pathname = usePathname()

  const handleViewDetails = (task: Task) => {
    console.log(`View details clicked for task #${task.index} on page ${pathname}`)
    openDetailModal(task)
  }

  if (!tasks.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-lg p-8 bg-muted/20">
        <p className="text-muted-foreground text-center">No tasks found matching your criteria</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <Card key={task.index} className="flex flex-col h-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg line-clamp-1">{task.title}</CardTitle>
              <TaskStatusBadge status={task.status} />
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{task.desc}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{task.bountyFormatted} USDC</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>
                  {task.startTime > 0
                    ? formatDistanceToNow(new Date(task.startTime * 1000), { addSuffix: true })
                    : "Not started"}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t">
            <Button variant="outline" className="w-full" onClick={() => handleViewDetails(task)}>
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function TaskStatusBadge({ status }: { status: TaskStatus }) {
  switch (status) {
    case TaskStatus.Open:
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
        >
          Open
        </Badge>
      )
    case TaskStatus.Pending:
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
        >
          In Progress
        </Badge>
      )
    case TaskStatus.Finish:
      return (
        <Badge
          variant="outline"
          className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800"
        >
          Completed
        </Badge>
      )
    case TaskStatus.Close:
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800"
        >
          Closed
        </Badge>
      )
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

