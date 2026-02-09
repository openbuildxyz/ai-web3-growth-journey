'use client'

import { toast } from 'sonner'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  ExternalLink,
  RefreshCw,
  WalletIcon,
} from 'lucide-react'

import useWallet from '@/lib/hooks/useWallet'
import { Button } from '@/components/ui/button'
import ExchangeQCard from './ExchangeQCard'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { formatUnits } from 'ethers'
import {
  useTokenBalance,
  useTokenDecimals,
  useTokenSymbol,
} from '@/lib/hooks/usePlatformToken'
import { useEscrowBalanceFormatted } from '@/lib/hooks/useEscrowBalance'

export default function BalanceCard() {
  const { account = '', chainId, switchNetwork } = useWallet()
  const { data: qBalanceRaw, refetch: refetchBalance } =
    useTokenBalance(account)
  const { data: decimals } = useTokenDecimals()
  const { data: tokenSymbol } = useTokenSymbol()

  const qBalance =
    qBalanceRaw && decimals != null ? formatUnits(qBalanceRaw, decimals) : '0'
  const displaySymbol = tokenSymbol || 'Q'

  // 从链上获取托管余额（累加所有进行中任务的托管金额）
  const lockedBalanceStr = useEscrowBalanceFormatted()
  const lockedBalance = Number.parseFloat(lockedBalanceStr) || 0

  const [isExchangeOpen, setIsExchangeOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const networkName =
    chainId === 11155111 ? 'Sepolia' : chainId ? `Chain ${chainId}` : 'Unknown'

  const handleSwitchToSepolia = async () => {
    setIsSwitching(true)
    try {
      await switchNetwork(11155111)
    } finally {
      setIsSwitching(false)
    }
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(account)
    toast.success('钱包地址已复制')
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetchBalance()
      toast.success('余额已刷新')
    } catch (error) {
      toast.error('刷新失败，请重试')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExchangeSuccess = async () => {
    // Wait a bit for blockchain confirmation
    setTimeout(async () => {
      await refetchBalance()
      setIsExchangeOpen(false)
    }, 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card rounded-2xl p-6 mb-6 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-primary/10 to-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Wallet Address */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center">
            <WalletIcon className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                Network: {networkName}
              </p>
              {chainId !== 11155111 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-[10px]"
                  onClick={handleSwitchToSepolia}
                  disabled={isSwitching}
                >
                  {isSwitching ? 'Switching' : 'Switch to Sepolia'}
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">钱包地址</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm text-foreground truncate">
                {account.slice(0, 10)}...{account.slice(-8)}
              </p>
              <button
                onClick={handleCopyAddress}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Q 余额</p>
            <p className="text-2xl font-semibold text-foreground font-mono">
              {qBalance}{' '}
              <span className="text-sm text-muted-foreground ml-2">
                {displaySymbol}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">托管中</p>
            <p className="text-2xl font-semibold text-warning font-mono">
              {lockedBalance.toLocaleString()}
              <span className="text-sm text-muted-foreground ml-2">Qian</span>
            </p>
            <p className="text-xs text-muted-foreground">用于进行中的任务</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Dialog open={isExchangeOpen} onOpenChange={setIsExchangeOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" className="cursor-pointer">
                <ArrowDownLeft className="w-4 h-4" />
                充值
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>兑换 Q（Qian）</DialogTitle>
                <DialogDescription>
                  使用 Sepolia ETH 兑换平台代币 Q。
                </DialogDescription>
              </DialogHeader>
              <ExchangeQCard onSuccess={handleExchangeSuccess} />
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="cursor-pointer">
            <ArrowUpRight className="w-4 h-4" />
            提现
          </Button>
          <Button
            variant="ghost"
            className="cursor-pointer"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            刷新
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
