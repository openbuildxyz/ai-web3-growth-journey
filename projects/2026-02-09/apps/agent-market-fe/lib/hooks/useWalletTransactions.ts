/**
 * 从链上读取交易记录（托管相关 + 兑换充值）。
 *
 * 事件映射：
 * - EscrowVault.Deposited(from=account) -> payment（支出，负数）
 * - EscrowVault.Released(to=account) -> reward（收入，正数）
 * - EscrowVault.Refunded(to=account) -> refund（收入，正数）
 * - TokenExchange.TokensPurchased(buyer=account) -> deposit（收入，正数）
 */
import { useQuery } from '@tanstack/react-query'
import { formatUnits } from 'ethers'

import useWallet from './useWallet'
import {
  getEscrowVaultContract,
  getTokenExchangeContract,
} from '@/lib/contracts/utils'
import { useTokenDecimals } from './usePlatformToken'
import type { Transaction } from '@/lib/types/wallet'

const REFRESH_INTERVAL_MS = 60 * 60 * 1000

function toNumber(value: unknown, decimals: number) {
  if (value == null) return 0
  const raw = typeof value === 'bigint' ? value : BigInt(value.toString())
  const formatted = formatUnits(raw, decimals)
  return Number.parseFloat(formatted) || 0
}

export function useWalletTransactions() {
  const { provider, account } = useWallet()
  const { data: decimals } = useTokenDecimals()

  return useQuery<Transaction[]>({
    queryKey: ['wallet', 'transactions', account],
    enabled: Boolean(provider && account && decimals != null),
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: true,
    queryFn: async () => {
      if (!provider || !account || decimals == null) {
        return []
      }

      const escrowContract = getEscrowVaultContract(provider)
      const exchangeContract = getTokenExchangeContract(provider)

      let depositedLogs: Array<any> = []
      let releasedLogs: Array<any> = []
      let refundedLogs: Array<any> = []
      let purchasedLogs: Array<any> = []

      try {
        depositedLogs = await escrowContract.queryFilter(
          escrowContract.filters.Deposited(null, account),
        )
      } catch (error) {
        console.warn('Failed to query Deposited logs:', error)
      }

      try {
        releasedLogs = await escrowContract.queryFilter(
          escrowContract.filters.Released(null, account),
        )
      } catch (error) {
        console.warn('Failed to query Released logs:', error)
      }

      try {
        refundedLogs = await escrowContract.queryFilter(
          escrowContract.filters.Refunded(null, account),
        )
      } catch (error) {
        console.warn('Failed to query Refunded logs:', error)
      }

      try {
        purchasedLogs = await exchangeContract.queryFilter(
          exchangeContract.filters.TokensPurchased(account),
        )
      } catch (error) {
        console.warn('Failed to query TokensPurchased logs:', error)
      }

      const logs = [
        ...depositedLogs,
        ...releasedLogs,
        ...refundedLogs,
        ...purchasedLogs,
      ]

      if (logs.length === 0) {
        return []
      }

      const blockNumbers = Array.from(
        new Set(logs.map((log) => log.blockNumber)),
      )
      const blocks = await Promise.all(
        blockNumbers.map((blockNumber) =>
          provider.getBlock(blockNumber).catch((error) => {
            console.warn(`Failed to read block ${blockNumber}:`, error)
            return null
          }),
        ),
      )
      const blockTimeByNumber = new Map(
        blockNumbers.map((blockNumber, index) => [
          blockNumber,
          blocks[index]?.timestamp ?? 0,
        ]),
      )

      const transactions: Transaction[] = []

      for (const log of depositedLogs) {
        const amount = toNumber(log.args?.amount, decimals)
        transactions.push({
          id: log.transactionHash,
          type: 'payment',
          amount: -Math.abs(amount),
          status: 'completed',
          timestamp: new Date(
            (blockTimeByNumber.get(log.blockNumber) ?? 0) * 1000,
          ).toLocaleString(),
          description: '任务托管',
          txHash: log.transactionHash,
        })
      }

      for (const log of releasedLogs) {
        const amount = toNumber(log.args?.amount, decimals)
        transactions.push({
          id: log.transactionHash,
          type: 'reward',
          amount: Math.abs(amount),
          status: 'completed',
          timestamp: new Date(
            (blockTimeByNumber.get(log.blockNumber) ?? 0) * 1000,
          ).toLocaleString(),
          description: '任务完成奖励',
          txHash: log.transactionHash,
        })
      }

      for (const log of refundedLogs) {
        const amount = toNumber(log.args?.amount, decimals)
        transactions.push({
          id: log.transactionHash,
          type: 'refund',
          amount: Math.abs(amount),
          status: 'completed',
          timestamp: new Date(
            (blockTimeByNumber.get(log.blockNumber) ?? 0) * 1000,
          ).toLocaleString(),
          description: '任务退款',
          txHash: log.transactionHash,
        })
      }

      for (const log of purchasedLogs) {
        const amount = toNumber(log.args?.tokensOut, decimals)
        transactions.push({
          id: log.transactionHash,
          type: 'deposit',
          amount: Math.abs(amount),
          status: 'completed',
          timestamp: new Date(
            (blockTimeByNumber.get(log.blockNumber) ?? 0) * 1000,
          ).toLocaleString(),
          description: '链上兑换',
          txHash: log.transactionHash,
        })
      }

      transactions.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime()
        const timeB = new Date(b.timestamp).getTime()
        return timeB - timeA
      })

      return transactions
    },
  })
}
