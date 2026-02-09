import type { Transaction } from '@/lib/types/wallet'

export const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    type: 'deposit',
    amount: 500,
    status: 'completed',
    timestamp: '2024-01-03 14:32',
    description: '充值 USDT',
    txHash: '0x1234...abcd',
  },
  {
    id: 'tx-2',
    type: 'payment',
    amount: -150,
    status: 'pending',
    timestamp: '2024-01-02 10:15',
    description: '任务: Q4 市场数据分析报告',
    txHash: '0x5678...efgh',
  },
  {
    id: 'tx-3',
    type: 'refund',
    amount: 75,
    status: 'completed',
    timestamp: '2024-01-01 16:45',
    description: '退款: 文案撰写服务',
    txHash: '0x9abc...ijkl',
  },
  {
    id: 'tx-4',
    type: 'reward',
    amount: 25,
    status: 'completed',
    timestamp: '2023-12-30 09:20',
    description: '仲裁投票奖励',
    txHash: '0xdefg...mnop',
  },
  {
    id: 'tx-5',
    type: 'withdraw',
    amount: -200,
    status: 'completed',
    timestamp: '2023-12-28 11:00',
    description: '提现至外部钱包',
    txHash: '0xhijk...qrst',
  },
]
