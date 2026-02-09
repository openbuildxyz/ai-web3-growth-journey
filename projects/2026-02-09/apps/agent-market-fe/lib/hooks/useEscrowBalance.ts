/**
 * 从链上汇总用户托管余额（仅统计买家身份的任务）。
 *
 * 逻辑：
 * 1. 通过 TaskCreated 事件定位用户创建的任务（buyer 为当前账户）。
 * 2. 读取 TaskManager.getTask(taskId) 获取任务状态与买家地址。
 * 3. 只统计资金仍锁定的状态（Created/Accepted/InProgress/PendingReview/Disputed）。
 * 4. 累加 EscrowVault.getEscrowBalance(taskId)。
 *
 * 说明：
 * - 托管余额属于买家，不计入代理（agent）接受的任务。
 * - 这里不依赖后端认证，链上数据刷新即更新。
 */
import { useQuery } from '@tanstack/react-query'
import { formatUnits } from 'ethers'

import useWallet from './useWallet'
import {
  getEscrowVaultContract,
  getTaskManagerContract,
  readTask,
} from '@/lib/contracts/utils'
import { useTokenDecimals } from './usePlatformToken'

const IN_PROGRESS_STATUSES = new Set([0, 1, 2, 3, 5])
const REFRESH_INTERVAL_MS = 60 * 60 * 1000

function normalizeTaskId(taskId: unknown): bigint | null {
  if (taskId == null) return null
  if (typeof taskId === 'bigint') return taskId
  if (typeof taskId === 'string' || typeof taskId === 'number') {
    try {
      return BigInt(taskId)
    } catch {
      return null
    }
  }
  return null
}

export function useEscrowBalance() {
  const { provider, account } = useWallet()

  return useQuery({
    queryKey: ['escrow', 'balance', account],
    enabled: Boolean(provider && account),
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: true,
    queryFn: async () => {
      if (!provider || !account) {
        return BigInt(0)
      }

      // 1) 读取用户作为买家的 TaskCreated 事件，定位任务列表
      const taskManager = getTaskManagerContract(provider)
      let createdLogs: Array<any> = []
      try {
        createdLogs = await taskManager.queryFilter(
          taskManager.filters.TaskCreated(null, account),
        )
      } catch (error) {
        console.warn('Failed to query TaskCreated logs:', error)
        // 降级处理：链上查询失败时继续走空数据，避免抛错导致页面崩溃。
      }

      const taskIdSet = new Set<bigint>()
      for (const log of createdLogs) {
        const taskId = normalizeTaskId(log.args?.taskId)
        if (taskId != null) {
          taskIdSet.add(taskId)
        }
      }
      const taskIds = Array.from(taskIdSet)

      if (taskIds.length === 0) {
        return BigInt(0)
      }

      // 2) 读取任务状态并做防御性校验（确保 buyer 为当前用户）
      const tasks = await Promise.all(
        taskIds.map((taskId) =>
          readTask(provider, taskId).catch((error) => {
            console.warn(`Failed to read task ${taskId.toString()}:`, error)
            return null
          }),
        ),
      )
      const accountLower = account.toLowerCase()
      const inProgressTaskIds = tasks
        .map((task, index) => ({ task, taskId: taskIds[index] }))
        .filter((item) => {
          if (!item.task) {
            console.warn(`Missing task data for ${item.taskId.toString()}`)
            return false
          }
          if (item.task.buyer.toLowerCase() !== accountLower) {
            console.warn(
              `Buyer mismatch for task ${item.taskId.toString()}:`,
              item.task.buyer,
            )
            return false
          }
          return IN_PROGRESS_STATUSES.has(item.task.status)
        })
        .map((item) => item.taskId)

      if (inProgressTaskIds.length === 0) {
        return BigInt(0)
      }

      // 3) 累加托管余额
      const escrowContract = getEscrowVaultContract(provider)
      const balances = await Promise.all(
        inProgressTaskIds.map((taskId) =>
          escrowContract.getEscrowBalance(taskId).catch((error) => {
            console.warn(
              `Failed to read escrow balance for ${taskId.toString()}:`,
              error,
            )
            return BigInt(0)
          }),
        ),
      )

      return balances.reduce((sum, balance) => {
        const normalized =
          typeof balance === 'bigint' ? balance : BigInt(balance.toString())
        return sum + normalized
      }, BigInt(0))
    },
  })
}

/**
 * 格式化后的托管余额（带 token decimals）。
 */
export function useEscrowBalanceFormatted() {
  const { data: balanceRaw } = useEscrowBalance()
  const { data: decimals } = useTokenDecimals()

  if (!balanceRaw || decimals == null) {
    return '0'
  }

  return formatUnits(balanceRaw, decimals)
}
