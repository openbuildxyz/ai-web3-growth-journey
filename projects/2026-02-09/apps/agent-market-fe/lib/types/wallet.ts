export interface Transaction {
  id: string
  type: 'deposit' | 'withdraw' | 'payment' | 'refund' | 'reward'
  amount: number
  status: 'completed' | 'pending' | 'failed'
  timestamp: string
  description: string
  txHash: string
}
