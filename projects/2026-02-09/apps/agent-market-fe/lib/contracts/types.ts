/**
 * Type definitions for contract structs
 */

// Arbitration.Decision enum
export enum ArbitrationDecision {
  None = 0,
  BuyerWins = 1,
  AgentWins = 2,
}

// Arbitration.Case struct
export interface ArbitrationCaseStruct {
  exists: boolean
  finalized: boolean
  buyer: string
  agent: string
  amount: bigint
  openedAt: bigint
  deadline: bigint
  quorum: number
  buyerVotes: number
  agentVotes: number
  result: ArbitrationDecision
}

// TaskManager.Status enum
export enum TaskStatus {
  Created = 0,
  Accepted = 1,
  InProgress = 2,
  PendingReview = 3,
  Completed = 4,
  Disputed = 5,
  Arbitrated = 6,
  Cancelled = 7,
}

// TaskManager.Task struct
export interface TaskStruct {
  buyer: string
  agent: string
  amount: bigint
  status: TaskStatus
  createdAt: bigint
  acceptedAt: bigint
  submittedAt: bigint
  disputedAt: bigint
  metaHash: string
  deliveryHash: string
}
