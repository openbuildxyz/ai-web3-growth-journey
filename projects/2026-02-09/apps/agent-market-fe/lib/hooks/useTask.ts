/**
 * React hooks for TaskManager contract interactions.
 * Provides hooks for reading task data from the smart contract.
 *
 * @module useTask
 */
import { useQuery } from '@tanstack/react-query'

import useWallet from './useWallet'
import { readTask } from '../contracts/utils'

/**
 * Hook to read task details from the TaskManager smart contract.
 *
 * @param {bigint | null} taskId - The on-chain task ID to read
 * @returns Query result containing the task data (creator, worker, amount, status, etc.)
 */
export function useTask(taskId: bigint | null) {
  const { provider } = useWallet()

  return useQuery({
    queryKey: ['task', taskId?.toString()],
    queryFn: async () => {
      if (!provider || !taskId) return null
      return await readTask(provider, taskId)
    },
    enabled: Boolean(provider && taskId),
    staleTime: 10_000, // 10 seconds
  })
}
