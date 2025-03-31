"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@/components/wallet-provider"
import { useContracts } from "@/components/contracts-provider"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { TaskList } from "@/components/task-list"
import { type Task, TaskStatus } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { TaskDetailModal } from "@/components/task-detail-modal"
import { CreateTaskModal } from "@/components/create-task-modal"

export default function ProfilePage() {
  const { isConnected, address, connectWallet, isConnecting } = useWallet()
  const { taskManager, fetchUserCreatedTasks, fetchUserExecutingTasks, fetchAllTasks } = useContracts()

  const [isLoading, setIsLoading] = useState(true)
  const [createdTasks, setCreatedTasks] = useState<Task[]>([])
  const [executingTasks, setExecutingTasks] = useState<Task[]>([])
  const [completedTasks, setCompletedTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState("created")

  console.log("Profile page rendered, wallet state:", { isConnected, address })

  // 获取用户任务
  const loadUserTasks = async () => {
    if (!address || !taskManager) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      // 获取用户创建的任务
      const created = await fetchUserCreatedTasks(address)
      console.log("User created tasks:", created)
      setCreatedTasks(created)

      // 获取用户正在执行的任务
      const executing = await fetchUserExecutingTasks(address)
      console.log("User executing tasks:", executing)
      setExecutingTasks(executing)

      // 获取已完成的任务（用户创建或执行的已关闭任务）
      const allTasks = await fetchAllTasks()
      const completed = allTasks.filter(
        (task) =>
          (task.owner.toLowerCase() === address.toLowerCase() ||
            task.executor.toLowerCase() === address.toLowerCase()) &&
          task.status === TaskStatus.Close,
      )
      console.log("User completed tasks:", completed)
      setCompletedTasks(completed)
    } catch (error) {
      console.error("Error fetching user tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 当地址或合约变化时加载用户任务
  useEffect(() => {
    if (address && taskManager) {
      loadUserTasks()
    }
  }, [address, taskManager])

  // 监听合约事件，当有任务状态变化时刷新任务列表
  useEffect(() => {
    if (!taskManager) return

    const handleTaskEvent = () => {
      console.log("Task event detected, refreshing user tasks...")
      loadUserTasks()
    }

    // 监听相关事件
    taskManager.on("PublishTask", handleTaskEvent)
    taskManager.on("FinishTask", handleTaskEvent)

    return () => {
      taskManager.off("PublishTask", handleTaskEvent)
      taskManager.off("FinishTask", handleTaskEvent)
    }
  }, [taskManager, address])

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Connect Your Wallet</h1>
          <p className="text-muted-foreground max-w-md">Please connect your wallet to view your profile and tasks.</p>
          <Button
            onClick={() => {
              console.log("Connect wallet button clicked in profile page")
              connectWallet().catch((err) => {
                console.error("Error connecting wallet in profile page:", err)
              })
            }}
            disabled={isConnecting}
            className="mt-4"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <ProfileHeader />

      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        createdCount={createdTasks.length}
        executingCount={executingTasks.length}
        completedCount={completedTasks.length}
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div>
          {activeTab === "created" &&
            (createdTasks.length > 0 ? (
              <TaskList tasks={createdTasks} />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 border rounded-lg p-8 bg-muted/20">
                <p className="text-muted-foreground text-center">You haven't created any tasks yet</p>
              </div>
            ))}

          {activeTab === "executing" &&
            (executingTasks.length > 0 ? (
              <TaskList tasks={executingTasks} />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 border rounded-lg p-8 bg-muted/20">
                <p className="text-muted-foreground text-center">You aren't executing any tasks yet</p>
              </div>
            ))}

          {activeTab === "completed" &&
            (completedTasks.length > 0 ? (
              <TaskList tasks={completedTasks} />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 border rounded-lg p-8 bg-muted/20">
                <p className="text-muted-foreground text-center">You haven't completed any tasks yet</p>
              </div>
            ))}
        </div>
      )}

      {/* 在Profile页面也添加模态框组件 */}
      <TaskDetailModal />
      <CreateTaskModal />
    </div>
  )
}

