"use client"

import { useToast } from "@/components/ui/use-toast"
import TaskManager from "@/lib/abis/TaskManager.json"
import USDC from "@/lib/abis/USDC.json"
import { TASK_MANAGER_ADDRESS, USDC_ADDRESS, USDC_DECIMALS } from "@/lib/constants"
import { type Task, TaskStatus } from "@/lib/types"
import { ethers } from "ethers"
import type React from "react"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useWallet } from "./wallet-provider"

const USDC_abi = USDC.abi;
const TaskManager_abi = TaskManager.abi;

type ContractsContextType = {
  taskManager: ethers.Contract | null
  usdc: ethers.Contract | null
  isLoading: boolean
  error: string | null
  fetchAllTasks: () => Promise<Task[]>
  fetchUserCreatedTasks: (address: string) => Promise<Task[]>
  fetchUserExecutingTasks: (address: string) => Promise<Task[]>
  fetchTaskById: (taskId: number) => Promise<Task | null>
  fetchUSDCBalance: (address: string) => Promise<string>
}

const ContractsContext = createContext<ContractsContextType>({
  taskManager: null,
  usdc: null,
  isLoading: false,
  error: null,
  fetchAllTasks: async () => [],
  fetchUserCreatedTasks: async () => [],
  fetchUserExecutingTasks: async () => [],
  fetchTaskById: async () => null,
  fetchUSDCBalance: async () => "0",
})

export const useContracts = () => useContext(ContractsContext)

export function ContractsProvider({ children }: { children: React.ReactNode }) {
  const { provider, signer, isConnected } = useWallet()
  const [taskManager, setTaskManager] = useState<ethers.Contract | null>(null)
  const [usdc, setUsdc] = useState<ethers.Contract | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const initContracts = async () => {
      if (!isConnected || !provider || !signer) return

      setIsLoading(true)
      setError(null)

      try {
        // Initialize contracts with signer to allow write operations
        const taskManagerContract = new ethers.Contract(TASK_MANAGER_ADDRESS, TaskManager_abi, signer)

        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_abi, signer)

        setTaskManager(taskManagerContract)
        setUsdc(usdcContract)
      } catch (err) {
        console.error("Failed to initialize contracts:", err)
        setError("Failed to initialize contracts. Please check your network connection.")
        toast({
          title: "Contract Error",
          description: "Failed to initialize contracts. Please check your network connection.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    initContracts()
  }, [isConnected, provider, signer, toast])

  // 获取所有任务
  const fetchAllTasks = useCallback(async (): Promise<Task[]> => {
    if (!taskManager || !provider) return []

    try {
      // 获取当前任务索引
      const currentIndex = await taskManager.currentIndex()
      console.log("Current task index:", currentIndex.toString())

      // 获取所有任务
      const tasks: Task[] = []
      for (let i = 0; i < currentIndex; i++) {
        try {
          // 这里假设合约有一个getTask方法，如果没有，您可能需要使用事件来获取任务信息
          // 或者修改您的合约添加这个方法
          const taskData = await taskManager.tasks(i)

          // 将合约数据转换为我们的Task类型
          const task: Task = {
            index: i,
            title: taskData.title,
            desc: taskData.desc,
            target: taskData.target,
            limitTime: Number(taskData.limitTime),
            startTime: Number(taskData.startTime),
            bounty: taskData.bounty,
            bountyFormatted: ethers.formatUnits(taskData.bounty, USDC_DECIMALS), // 使用USDC_DECIMALS
            status: Number(taskData.status),
            owner: taskData.owner,
            executor: taskData.executor,
            finish: taskData.finish,
          }

          tasks.push(task)
        } catch (err) {
          console.error(`Error fetching task ${i}:`, err)
        }
      }

      console.log("Fetched tasks:", tasks)
      return tasks
    } catch (err) {
      console.error("Error fetching all tasks:", err)
      return []
    }
  }, [taskManager, provider])

  // 获取用户创建的任务
  const fetchUserCreatedTasks = useCallback(
    async (address: string): Promise<Task[]> => {
      if (!address) return []

      const allTasks = await fetchAllTasks()
      return allTasks.filter((task) => task.owner.toLowerCase() === address.toLowerCase())
    },
    [fetchAllTasks],
  )

  // 获取用户正在执行的任务
  const fetchUserExecutingTasks = useCallback(
    async (address: string): Promise<Task[]> => {
      if (!address) return []

      const allTasks = await fetchAllTasks()
      return allTasks.filter(
        (task) =>
          task.executor.toLowerCase() === address.toLowerCase() &&
          (task.status === TaskStatus.Pending || task.status === TaskStatus.Finish),
      )
    },
    [fetchAllTasks],
  )

  // 通过ID获取任务
  const fetchTaskById = useCallback(
    async (taskId: number): Promise<Task | null> => {
      if (!taskManager || !provider || taskId < 0) return null

      try {
        const taskData = await taskManager.tasks(taskId)

        return {
          index: taskId,
          title: taskData.title,
          desc: taskData.desc,
          target: taskData.target,
          limitTime: Number(taskData.limitTime),
          startTime: Number(taskData.startTime),
          bounty: taskData.bounty,
          bountyFormatted: ethers.formatUnits(taskData.bounty, USDC_DECIMALS), // 使用USDC_DECIMALS
          status: Number(taskData.status),
          owner: taskData.owner,
          executor: taskData.executor,
          finish: taskData.finish,
        }
      } catch (err) {
        console.error(`Error fetching task ${taskId}:`, err)
        return null
      }
    },
    [taskManager, provider],
  )

  // 获取USDC余额
  const fetchUSDCBalance = useCallback(
    async (address: string): Promise<string> => {
      if (!usdc || !address) return "0"

      try {
        const balance = await usdc.balanceOf(address)
        return ethers.formatUnits(balance, USDC_DECIMALS) // 使用USDC_DECIMALS
      } catch (err) {
        console.error("Error fetching USDC balance:", err)
        return "0"
      }
    },
    [usdc],
  )

  return (
    <ContractsContext.Provider
      value={{
        taskManager,
        usdc,
        isLoading,
        error,
        fetchAllTasks,
        fetchUserCreatedTasks,
        fetchUserExecutingTasks,
        fetchTaskById,
        fetchUSDCBalance,
      }}
    >
      {children}
    </ContractsContext.Provider>
  )
}

