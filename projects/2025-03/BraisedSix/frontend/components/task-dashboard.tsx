"use client"

import { useEffect, useState } from "react"
import { useWallet } from "./wallet-provider"
import { useContracts } from "./contracts-provider"
import { TaskList } from "./task-list"
import { TaskStats } from "./task-stats"
import { TaskFilters } from "./task-filters"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2 } from "lucide-react"
import { useTaskModal } from "./task-modal-provider"
import { type Task, TaskStatus } from "@/lib/types"
import { GetUSDCButton } from "@/components/get-usdc-button"
import { AddUSDCToWallet } from "@/components/add-usdc-to-wallet"

export function TaskDashboard() {
  const { isConnected, address } = useWallet()
  const { taskManager, isLoading: contractsLoading, fetchAllTasks } = useContracts()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<string>("all")
  const { openCreateModal } = useTaskModal()

  // 获取任务
  const loadTasks = async () => {
    if (!taskManager) return

    setIsLoading(true)
    try {
      const fetchedTasks = await fetchAllTasks()
      setTasks(fetchedTasks)
      setFilteredTasks(fetchedTasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 应用过滤器
  useEffect(() => {
    if (!tasks.length) return

    let filtered = [...tasks]

    switch (filter) {
      case "open":
        filtered = tasks.filter((task) => task.status === TaskStatus.Open)
        break
      case "pending":
        filtered = tasks.filter((task) => task.status === TaskStatus.Pending)
        break
      case "finished":
        filtered = tasks.filter((task) => task.status === TaskStatus.Finish)
        break
      case "closed":
        filtered = tasks.filter((task) => task.status === TaskStatus.Close)
        break
      case "my-created":
        filtered = tasks.filter((task) => task.owner.toLowerCase() === address?.toLowerCase())
        break
      case "my-tasks":
        filtered = tasks.filter((task) => task.executor.toLowerCase() === address?.toLowerCase())
        break
      default:
        // "all" - no filtering needed
        break
    }

    setFilteredTasks(filtered)
  }, [filter, tasks, address])

  // 当合约加载完成后获取任务
  useEffect(() => {
    if (taskManager && !contractsLoading) {
      loadTasks()
    }
  }, [taskManager, contractsLoading])

  // 检查是否有从 TaskAgent 页面返回的标记
  useEffect(() => {
    const hasTaskPreview = localStorage.getItem("taskPreview")
    if (hasTaskPreview && taskManager && !contractsLoading) {
      // 如果有，打开创建模态框
      openCreateModal()
    }
  }, [taskManager, contractsLoading, openCreateModal])

  // 监听合约事件，当有新任务创建时刷新任务列表
  useEffect(() => {
    if (!taskManager) return

    const handlePublishTask = () => {
      console.log("New task published, refreshing tasks...")
      loadTasks()
    }

    const handleFinishTask = () => {
      console.log("Task finished, refreshing tasks...")
      loadTasks()
    }

    // 监听PublishTask事件
    taskManager.on("PublishTask", handlePublishTask)
    // 监听FinishTask事件
    taskManager.on("FinishTask", handleFinishTask)

    return () => {
      taskManager.off("PublishTask", handlePublishTask)
      taskManager.off("FinishTask", handleFinishTask)
    }
  }, [taskManager])

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome to TaskMarket</h1>
          <p className="text-muted-foreground max-w-md">
            Connect your wallet to start creating and completing tasks to earn USDC rewards.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Marketplace</h1>
          <p className="text-muted-foreground">Create, complete, and earn rewards for tasks</p>
        </div>
        <div className="flex gap-2">
          <GetUSDCButton />
          <AddUSDCToWallet />
          <Button onClick={openCreateModal} className="md:hidden">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </div>
      </div>

      <TaskStats tasks={tasks} />

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <TaskFilters currentFilter={filter} onFilterChange={setFilter} />

        <div className="flex-1 w-full">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <TaskList tasks={filteredTasks} />
          )}
        </div>
      </div>
    </div>
  )
}

