/**
 * Mapping functions from contract structs to UI models
 */
import type { ArbitrationCaseStruct } from './types'
import { ArbitrationDecision } from './types'
import type { ArbitrationCase } from '../types/dao'

/**
 * Format token amount with decimals
 */
export function formatTokenAmount(amount: bigint, decimals: number): number {
  const divisor = BigInt(10 ** decimals)
  const wholePart = amount / divisor
  const fractionalPart = amount % divisor
  const fractional = Number(fractionalPart) / Number(divisor)
  return Number(wholePart) + fractional
}

/**
 * Format deadline timestamp to display string
 */
export function formatDeadline(deadline: bigint): string {
  const deadlineMs = Number(deadline) * 1000
  const now = Date.now()
  const remaining = deadlineMs - now

  if (remaining <= 0) {
    return '已超时'
  }

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor(
    (remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  )
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `剩余 ${days} 天 ${hours} 小时`
  }
  if (hours > 0) {
    return `剩余 ${hours} 小时 ${minutes} 分钟`
  }
  return `剩余 ${minutes} 分钟`
}

/**
 * Compute case status from contract state
 */
export function computeCaseStatus(
  finalized: boolean,
  result: number,
): 'voting' | 'resolved_buyer' | 'resolved_seller' {
  if (!finalized) {
    return 'voting'
  }
  if (result === ArbitrationDecision.BuyerWins) {
    return 'resolved_buyer'
  }
  return 'resolved_seller'
}

/**
 * Map Arbitration.Case struct to UI ArbitrationCase model
 */
export function mapCaseToUI(
  case_: ArbitrationCaseStruct,
  taskId: string,
  taskTitle: string,
  tokenDecimals: number,
  tokenSymbol: string,
): ArbitrationCase {
  const status = computeCaseStatus(case_.finalized, case_.result)
  const formattedAmount = formatTokenAmount(case_.amount, tokenDecimals)
  const deadlineDisplay = formatDeadline(case_.deadline)

  return {
    id: taskId,
    taskId,
    taskTitle,
    buyerAddress: case_.buyer,
    sellerAddress: case_.agent,
    amount: formattedAmount,
    amountRaw: case_.amount,
    reason: undefined, // Will be filled from off-chain if available
    status,
    votesForBuyer: case_.buyerVotes,
    votesForSeller: case_.agentVotes,
    quorum: case_.quorum,
    deadline: Number(case_.deadline),
    deadlineDisplay,
    finalized: case_.finalized,
    result: case_.result,
    evidence: [],
  }
}

/**
 * Format amount with token symbol for display
 */
export function formatAmountWithSymbol(amount: number, symbol: string): string {
  return `${amount.toFixed(2)} ${symbol}`
}
