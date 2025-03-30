"use client"

import { useState, useEffect } from "react"
import { useWallet } from "./wallet-provider"
import { useContracts } from "./contracts-provider"
import { useTaskModal } from "./task-modal-provider"
import { useToast } from "@/components/ui/use-toast"
import { TaskStatus } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, DollarSign, Loader2, Target, User } from "lucide-react"

export function TaskDetailModal() {
  const { isDetailModalOpen, closeDetailModal, selectedTask } = useTaskModal()
  const { address, isConnected, connectWallet } = useWallet()
  const { taskManager } = useContracts()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 添加调试日志
  useEffect(() => {
    console.log("TaskDetailModal rendered, state:", {
      isDetailModalOpen,
      selectedTask: selectedTask ? `Task #${selectedTask.index}` : "none",
    })
  }, [isDetailModalOpen, selectedTask])

  if (!selectedTask) return null

  const isOwner = selectedTask.owner.toLowerCase() === address?.toLowerCase()
  const isExecutor = selectedTask.executor.toLowerCase() === address?.toLowerCase()
  const isOpen = selectedTask.status === TaskStatus.Open
  const isPending = selectedTask.status === TaskStatus.Pending
  const isFinished = selectedTask.status === TaskStatus.Finish
  const isClosed = selectedTask.status === TaskStatus.Close

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const handleTakeTask = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to take this task",
      })
      await connectWallet()
      return
    }

    if (!taskManager || !address) {
      toast({
        title: "Error",
        description: "Wallet not connected or contract not initialized",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      console.log(`Taking task #${selectedTask.index}...`)
      const tx = await taskManager.overTake(selectedTask.index)

      toast({
        title: "Transaction Submitted",
        description: "Please confirm the transaction in your wallet",
      })

      console.log("Transaction submitted:", tx.hash)
      await tx.wait()

      toast({
        title: "Task Accepted",
        description: "You have successfully taken this task",
      })

      closeDetailModal()
    } catch (error: any) {
      console.error("Error taking task:", error)
      toast({
        title: "Error Taking Task",
        description: error.message || "Failed to take task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompleteTask = async () => {
    if (!taskManager || !address) return

    setIsSubmitting(true)
    try {
      console.log(`Completing task #${selectedTask.index}...`)
      const tx = await taskManager.finishTask(selectedTask.index)

      toast({
        title: "Transaction Submitted",
        description: "Please confirm the transaction in your wallet",
      })

      await tx.wait()

      toast({
        title: "Task Completed",
        description: "You have marked this task as completed",
      })

      closeDetailModal()
    } catch (error: any) {
      console.error("Error completing task:", error)
      toast({
        title: "Error Completing Task",
        description: error.message || "Failed to complete task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAcceptTask = async () => {
    if (!taskManager || !address) return

    setIsSubmitting(true)
    try {
      console.log(`Accepting task #${selectedTask.index}...`)
      const tx = await taskManager.acceptanceTask(selectedTask.index, true)

      toast({
        title: "Transaction Submitted",
        description: "Please confirm the transaction in your wallet",
      })

      await tx.wait()

      toast({
        title: "Task Accepted",
        description: "You have accepted the task completion and released the bounty",
      })

      closeDetailModal()
    } catch (error: any) {
      console.error("Error accepting task:", error)
      toast({
        title: "Error Accepting Task",
        description: error.message || "Failed to accept task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseTask = async () => {
    if (!taskManager || !address) return

    setIsSubmitting(true)
    try {
      console.log(`Closing task #${selectedTask.index}...`)
      const tx = await taskManager.closeTask(selectedTask.index)

      toast({
        title: "Transaction Submitted",
        description: "Please confirm the transaction in your wallet",
      })

      await tx.wait()

      toast({
        title: "Task Closed",
        description: "You have closed this task",
      })

      closeDetailModal()
    } catch (error: any) {
      console.error("Error closing task:", error)
      toast({
        title: "Error Closing Task",
        description: error.message || "Failed to close task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={isDetailModalOpen}
      onOpenChange={(open) => {
        console.log("Dialog onOpenChange:", open)
        if (!open) closeDetailModal()
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{selectedTask.title}</span>
            <TaskStatusBadge status={selectedTask.status} />
          </DialogTitle>
          <DialogDescription>Task #{selectedTask.index}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Bounty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-lg font-bold">{selectedTask.bountyFormatted} USDC</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Time Limit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-lg font-bold">{selectedTask.limitTime / (24 * 60 * 60)} days</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{selectedTask.desc}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Target</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start">
                <Target className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                <p>{selectedTask.target}</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Owner: </span>
              <span className="text-sm ml-1">{formatAddress(selectedTask.owner)}</span>
            </div>

            {selectedTask.executor !== ethers.ZeroAddress && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Executor: </span>
                <span className="text-sm ml-1">{formatAddress(selectedTask.executor)}</span>
              </div>
            )}

            {selectedTask.startTime > 0 && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Started: </span>
                <span className="text-sm ml-1">
                  {formatDistanceToNow(new Date(selectedTask.startTime * 1000), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:space-x-2">
          {isOpen && !isOwner && (
            <Button onClick={handleTakeTask} disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Take This Task"
              )}
            </Button>
          )}

          {isPending && isExecutor && (
            <Button onClick={handleCompleteTask} disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Mark as Completed"
              )}
            </Button>
          )}

          {isFinished && isOwner && (
            <Button onClick={handleAcceptTask} disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Accept & Release Bounty"
              )}
            </Button>
          )}

          {(isOpen || isPending) && isOwner && (
            <Button
              onClick={handleCloseTask}
              variant="destructive"
              disabled={isSubmitting}
              className="w-full mt-2 sm:mt-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Close Task"
              )}
            </Button>
          )}

          {(isClosed ||
            (!isOpen && !isPending && !isFinished) ||
            (isFinished && !isOwner) ||
            (isPending && !isExecutor) ||
            (isOpen && isOwner)) && (
            <Button variant="outline" onClick={closeDetailModal} className="w-full">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

