'use client'
import { motion } from 'framer-motion'
import {
  Plus,
  Minus,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Transaction } from '@/lib/types/wallet'
import { useWalletTransactions } from '@/lib/hooks/useWalletTransactions'
import useWallet from '@/lib/hooks/useWallet'

const transactionTypeConfig = {
  deposit: { label: '充值', icon: ArrowDownLeft, color: 'text-success' },
  withdraw: { label: '提现', icon: ArrowUpRight, color: 'text-destructive' },
  payment: { label: '支付', icon: Minus, color: 'text-destructive' },
  refund: { label: '退款', icon: Plus, color: 'text-success' },
  reward: { label: '奖励', icon: TrendingUp, color: 'text-warning' },
}

export default function Transactions() {
  const { account } = useWallet()
  const { data, isLoading, error } = useWalletTransactions()
  const transactions: Transaction[] = data ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <div className="p-6 border-b border-border/50">
        <h2 className="text-xl font-bold text-foreground">交易记录</h2>
      </div>

      <div className="divide-y divide-border/50">
        {!account ? (
          <div className="p-6 text-sm text-muted-foreground">
            请先连接钱包以查看交易记录。
          </div>
        ) : isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">加载中...</div>
        ) : error ? (
          <div className="p-6 text-sm text-destructive">
            交易记录加载失败，请稍后再试。
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            暂无交易记录。
          </div>
        ) : (
          transactions.map((tx, index) => {
            const config = transactionTypeConfig[tx.type]
            const Icon = config.icon

            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${config.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {config.label}
                      </p>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          tx.status === 'completed'
                            ? 'bg-success/20 text-success'
                            : tx.status === 'pending'
                              ? 'bg-warning/20 text-warning'
                              : 'bg-destructive/20 text-destructive'
                        }`}
                      >
                        {tx.status === 'completed'
                          ? '已完成'
                          : tx.status === 'pending'
                            ? '待处理'
                            : '失败'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {tx.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`font-mono font-semibold ${tx.amount > 0 ? 'text-success' : 'text-foreground'}`}
                    >
                      {tx.amount > 0 ? '+' : ''}
                      {tx.amount} USDT
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.timestamp}
                    </p>
                  </div>
                </div>
                <div className="mt-2 pl-14">
                  <p className="text-xs text-muted-foreground font-mono">
                    TX: {tx.txHash}
                  </p>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      <div className="p-4 border-t border-border/50 text-center">
        <Button variant="ghost" size="sm" className="cursor-pointer">
          查看全部交易
        </Button>
      </div>
    </motion.div>
  )
}
