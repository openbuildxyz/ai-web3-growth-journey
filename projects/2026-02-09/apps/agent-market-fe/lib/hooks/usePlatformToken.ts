/**
 * React hooks for PlatformToken contract interactions.
 * Provides hooks for reading token information and managing token approvals.
 *
 * @module usePlatformToken
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import useWallet from './useWallet'
import {
  readTokenSymbol,
  readTokenDecimals,
  readTokenBalance,
  readTokenAllowance,
  writeApprove,
  // CONTRACT_ADDRESSES,
} from '../contracts/utils'
import { CONTRACT_ADDRESSES } from '../contracts/addresses'

/**
 * Hook to read the platform token symbol (e.g., "USDT").
 *
 * @returns Query result containing the token symbol
 */
export function useTokenSymbol() {
  const { provider } = useWallet()

  return useQuery({
    queryKey: ['token', 'symbol'],
    queryFn: async () => {
      if (!provider) return null
      return await readTokenSymbol(provider)
    },
    enabled: Boolean(provider),
    staleTime: 300_000, // 5 minutes - symbol doesn't change
  })
}

/**
 * Hook to read the platform token decimals (typically 18 for ERC20 tokens).
 *
 * @returns Query result containing the token decimals
 */
export function useTokenDecimals() {
  const { provider } = useWallet()

  return useQuery({
    queryKey: ['token', 'decimals'],
    queryFn: async () => {
      if (!provider) return null
      return await readTokenDecimals(provider)
    },
    enabled: Boolean(provider),
    staleTime: 300_000, // 5 minutes - decimals don't change
  })
}

/**
 * Hook to read the token balance for a specific address.
 *
 * @param {string | null | undefined} address - The wallet address to check balance for
 * @returns Query result containing the token balance in wei
 */
export function useTokenBalance(address: string | null | undefined) {
  const { provider } = useWallet()

  return useQuery({
    queryKey: ['token', 'balance', address],
    queryFn: async () => {
      if (!provider || !address) return null
      return await readTokenBalance(provider, address)
    },
    enabled: Boolean(provider && address),
    staleTime: 10_000,
  })
}

/**
 * Hook to read the token allowance granted by an owner to a spender.
 * Used to check if a contract has permission to spend tokens on behalf of a user.
 *
 * @param {string | null | undefined} owner - The wallet address that owns the tokens
 * @param {string | null | undefined} spender - The contract address that can spend the tokens
 * @returns Query result containing the allowance amount in wei
 */
export function useTokenAllowance(
  owner: string | null | undefined,
  spender: string | null | undefined,
) {
  const { provider } = useWallet()

  return useQuery({
    queryKey: ['token', 'allowance', owner, spender],
    queryFn: async () => {
      if (!provider || !owner || !spender) return null
      return await readTokenAllowance(provider, owner, spender)
    },
    enabled: Boolean(provider && owner && spender),
    staleTime: 10_000,
  })
}

/**
 * Hook to approve a spender to spend tokens on behalf of the user.
 * Required before interacting with contracts that need to transfer tokens.
 *
 * @returns Mutation hook for approving token spending
 */
export function useApprove() {
  const { signer } = useWallet()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      spender,
      amount,
    }: {
      spender: string
      amount: bigint
    }) => {
      if (!signer) throw new Error('Wallet not connected')
      return await writeApprove(signer, spender, amount)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['token', 'allowance'],
      })
      toast.success('授权成功')
    },
    onError: (error: Error) => {
      toast.error(`授权失败: ${error.message}`)
    },
  })
}

/**
 * Hook to check if user needs to approve tokens for Arbitration staking.
 * Compares current allowance with the amount needed for staking.
 *
 * @param {bigint | null} amount - The amount of tokens to stake
 * @returns Object containing current allowance and whether approval is needed
 */
export function useStakeApprovalNeeded(amount: bigint | null) {
  const { account } = useWallet()
  const { data: allowance } = useTokenAllowance(
    account,
    CONTRACT_ADDRESSES.Arbitration,
  )

  const safeAllowance = allowance ?? BigInt(0)

  return {
    allowance,
    needsApproval: amount !== null && safeAllowance < amount,
  }
}
