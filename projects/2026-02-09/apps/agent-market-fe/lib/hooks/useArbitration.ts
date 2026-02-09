import { toast } from 'sonner'
import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import useWallet from './useWallet'
import { ArbitrationDecision } from '../contracts/types'
import {
  readCase,
  readMinStake,
  readVoteDuration,
  readDefaultQuorum,
  readStaked,
  readHasVoted,
  writeStake,
  writeUnstake,
  writeVote,
  writeFinalize,
} from '../contracts/utils'

/**
 * Hook to read arbitration case details from the smart contract.
 *
 * @param {bigint | null} taskId - The task ID to read the case for
 * @returns Query result containing the arbitration case data
 */
export function useCase(taskId: bigint | null) {
  const { provider } = useWallet()

  return useQuery({
    queryKey: ['arbitration', 'case', taskId?.toString()],
    queryFn: async () => {
      if (!provider || !taskId) return null
      return await readCase(provider, taskId)
    },
    enabled: Boolean(provider && taskId),
    staleTime: 10_000, // 10 seconds
  })
}

/**
 * Hook to read arbitration system parameters (minimum stake, vote duration, quorum).
 *
 * @returns Query result containing arbitration parameters
 */
export function useArbitrationParams() {
  const { provider } = useWallet()

  return useQuery({
    queryKey: ['arbitration', 'params'],
    queryFn: async () => {
      if (!provider) return null
      const [minStake, voteDuration, defaultQuorum] = await Promise.all([
        readMinStake(provider),
        readVoteDuration(provider),
        readDefaultQuorum(provider),
      ])
      return {
        minStake,
        voteDuration,
        defaultQuorum,
      }
    },
    enabled: Boolean(provider),
    staleTime: 60_000, // 1 minute - params don't change often
  })
}

/**
 * Hook to read the amount of tokens a user has staked in the arbitration system.
 *
 * @param {string | null | undefined} address - The wallet address to check stake for
 * @returns Query result containing the staked amount
 */
export function useStakeInfo(address: string | null | undefined) {
  const { provider } = useWallet()

  return useQuery({
    queryKey: ['arbitration', 'stake', address],
    queryFn: async () => {
      if (!provider || !address) return null
      return await readStaked(provider, address)
    },
    enabled: Boolean(provider && address),
    staleTime: 10_000,
  })
}

/**
 * Hook to check if a user has already voted on a specific arbitration case.
 *
 * @param {bigint | null} taskId - The task ID to check voting status for
 * @param {string | null | undefined} address - The wallet address to check
 * @returns Query result containing boolean indicating if user has voted
 */
export function useHasVoted(
  taskId: bigint | null,
  address: string | null | undefined,
) {
  const { provider } = useWallet()

  return useQuery({
    queryKey: ['arbitration', 'hasVoted', taskId?.toString(), address],
    queryFn: async () => {
      if (!provider || !taskId || !address) return false
      return await readHasVoted(provider, taskId, address)
    },
    enabled: Boolean(provider && taskId && address),
    staleTime: 10_000,
  })
}

/**
 * Hook to check if a user is eligible to vote on an arbitration case.
 * Checks stake amount, voting status, deadline, and case finalization.
 *
 * @param {bigint | null} taskId - The task ID to check eligibility for
 * @param {string | null | undefined} address - The wallet address to check
 * @returns Object containing eligibility status and reasons for ineligibility
 */
export function useVotingEligibility(
  taskId: bigint | null,
  address: string | null | undefined,
) {
  const { provider } = useWallet()
  const { data: params } = useArbitrationParams()
  const { data: staked } = useStakeInfo(address)
  const { data: hasVoted } = useHasVoted(taskId, address)
  const { data: case_ } = useCase(taskId)

  return useMemo(() => {
    if (!provider || !taskId || !address || !params || !case_) {
      return {
        eligible: false,
        reasons: [],
      }
    }

    const reasons: string[] = []

    // Check stake
    if (!staked || staked < params.minStake) {
      reasons.push('质押不足')
    }

    // Check if already voted
    if (hasVoted) {
      reasons.push('已投票')
    }

    // Check deadline
    const now = BigInt(Math.floor(Date.now() / 1000))
    if (case_.deadline < now) {
      reasons.push('投票已截止')
    }

    // Check if finalized
    if (case_.finalized) {
      reasons.push('案件已结案')
    }

    return {
      eligible: reasons.length === 0,
      reasons,
    }
  }, [provider, taskId, address, params, staked, hasVoted, case_])
}

/**
 * Hook to stake tokens in the arbitration system.
 * Staking is required to participate in arbitration voting.
 *
 * @returns Mutation hook for staking tokens
 */
export function useStake() {
  const { signer, account } = useWallet()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!signer) throw new Error('Wallet not connected')
      return await writeStake(signer, amount)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arbitration', 'stake'] })
      toast.success('质押成功')
    },
    onError: (error: Error) => {
      toast.error(`质押失败: ${error.message}`)
    },
  })
}

/**
 * Hook to unstake tokens from the arbitration system.
 * Allows users to withdraw their staked tokens.
 *
 * @returns Mutation hook for unstaking tokens
 */
export function useUnstake() {
  const { signer } = useWallet()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!signer) throw new Error('Wallet not connected')
      return await writeUnstake(signer, amount)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arbitration', 'stake'] })
      toast.success('解除质押成功')
    },
    onError: (error: Error) => {
      toast.error(`解除质押失败: ${error.message}`)
    },
  })
}

/**
 * Hook to submit a vote on an arbitration case.
 * Requires sufficient stake and eligibility to vote.
 *
 * @returns Mutation hook for voting on cases
 */
export function useVote() {
  const { signer } = useWallet()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      decision,
    }: {
      taskId: bigint
      decision: ArbitrationDecision
    }) => {
      if (!signer) throw new Error('Wallet not connected')
      return await writeVote(signer, taskId, decision)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['arbitration', 'case', variables.taskId.toString()],
      })
      queryClient.invalidateQueries({
        queryKey: ['arbitration', 'hasVoted'],
      })
      toast.success('投票成功')
    },
    onError: (error: Error) => {
      toast.error(`投票失败: ${error.message}`)
    },
  })
}

/**
 * Hook to finalize an arbitration case after voting period ends.
 * Executes the final decision based on vote results.
 *
 * @returns Mutation hook for finalizing cases
 */
export function useFinalize() {
  const { signer, account } = useWallet()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!signer) throw new Error('Wallet not connected')
      return await writeFinalize(signer, taskId)
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({
        queryKey: ['arbitration', 'case', taskId.toString()],
      })
      if (account) {
        // 仲裁结案可能触发资金释放/退款，刷新钱包相关数据
        queryClient.invalidateQueries({
          queryKey: ['escrow', 'balance', account],
        })
        queryClient.invalidateQueries({
          queryKey: ['wallet', 'monthly-income', account],
        })
        queryClient.invalidateQueries({
          queryKey: ['wallet', 'transactions', account],
        })
      }
      toast.success('结案成功')
    },
    onError: (error: Error) => {
      toast.error(`结案失败: ${error.message}`)
    },
  })
}
