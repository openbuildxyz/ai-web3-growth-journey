/**
 * 从链上统计本月收入（Released + Refunded）。
 *
 * 逻辑：
 * 1. 读取 EscrowVault.Released / Refunded 事件（to 为当前账户）。
 * 2. 通过区块时间过滤当月数据。
 * 3. 汇总金额并按 token decimals 格式化。
 */
import { useQuery } from '@tanstack/react-query'
import { formatUnits } from 'ethers'

import useWallet from './useWallet'
import { getEscrowVaultContract } from '@/lib/contracts/utils'
import { useTokenDecimals } from './usePlatformToken'

const REFRESH_INTERVAL_MS = 60 * 60 * 1000

export function useMonthlyIncome() {
  const { provider, account } = useWallet()
  const { data: decimals } = useTokenDecimals()

  return useQuery({
    queryKey: ['wallet', 'monthly-income', account],
    enabled: Boolean(provider && account && decimals != null),
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: true,
    queryFn: async () => {
      if (!provider || !account || decimals == null) {
        return 0
      }

      const escrowContract = getEscrowVaultContract(provider)
      let releasedLogs: Array<any> = []
      let refundedLogs: Array<any> = []

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

      const logs = [...releasedLogs, ...refundedLogs]
      if (logs.length === 0) {
        return 0
      }

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startTimestamp = Math.floor(startOfMonth.getTime() / 1000)

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

      let totalRaw = BigInt(0)
      for (const log of logs) {
        const timestamp = blockTimeByNumber.get(log.blockNumber) ?? 0
        if (timestamp < startTimestamp) {
          continue
        }
        const amount = log.args?.amount
        if (amount == null) {
          console.warn('Missing amount in escrow log:', log.transactionHash)
          continue
        }
        const normalized =
          typeof amount === 'bigint' ? amount : BigInt(amount.toString())
        totalRaw += normalized
      }

      const formatted = formatUnits(totalRaw, decimals)
      return Number.parseFloat(formatted) || 0
    },
  })
}
