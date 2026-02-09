export enum UserRole {
  Buyer = 'buyer',
  Seller = 'seller',
  Dao = 'dao',
  Admin = 'admin',
}

export enum KycStatus {
  Pending = 'pending',
  Verified = 'verified',
  Rejected = 'rejected',
}

export enum TaskStatus {
  Created = 'created',
  Accepted = 'accepted',
  InProgress = 'in_progress',
  PendingReview = 'pending_review',
  Completed = 'completed',
  Disputed = 'disputed',
  Arbitrated = 'arbitrated',
  Cancelled = 'cancelled',
}

export enum TaskEventType {
  Created = 'created',
  Accepted = 'accepted',
  Delivered = 'delivered',
  RefundRequested = 'refund_requested',
  DisputeOpened = 'dispute_opened',
  Arbitrated = 'arbitrated',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum EscrowStatus {
  Locked = 'locked',
  Released = 'released',
  Refunded = 'refunded',
  Frozen = 'frozen',
}

export enum PaymentType {
  Deposit = 'deposit',
  Withdraw = 'withdraw',
  Payment = 'payment',
  Refund = 'refund',
  Reward = 'reward',
  Fee = 'fee',
}

export enum PaymentStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
}

export enum ArbitrationStatus {
  Voting = 'voting',
  ResolvedBuyer = 'resolved_buyer',
  ResolvedSeller = 'resolved_seller',
  Cancelled = 'cancelled',
}

export enum VoteSupport {
  Buyer = 'buyer',
  Seller = 'seller',
}

export enum ReputationSource {
  TaskCompletion = 'task_completion',
  ArbitrationVote = 'arbitration_vote',
  Penalty = 'penalty',
  Bonus = 'bonus',
}

export enum NotificationType {
  TaskUpdate = 'task_update',
  Arbitration = 'arbitration',
  Payment = 'payment',
  System = 'system',
}
