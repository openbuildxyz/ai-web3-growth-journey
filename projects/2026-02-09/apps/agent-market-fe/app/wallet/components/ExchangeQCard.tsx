'use client'

import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, useTransition } from 'react'
import { parseEther, formatEther, formatUnits } from 'ethers'

import { Input } from '@/components/ui/input'
import useWallet from '@/lib/hooks/useWallet'
import { Button } from '@/components/ui/button'
import { writeBuyQ } from '@/lib/contracts/utils'
import { useTokenDecimals } from '@/lib/hooks/usePlatformToken'

interface ExchangeQCardProps {
  onSuccess?: () => void
}

export default function ExchangeQCard({ onSuccess }: ExchangeQCardProps) {
  const [ethAmount, setEthAmount] = useState('')
  const [isLoading, startTransition] = useTransition()
  const { signer, provider, account } = useWallet()
  const { data: decimals } = useTokenDecimals()
  const [ethBalance, setEthBalance] = useState<bigint | null>(null)
  const queryClient = useQueryClient()

  const rate = 100

  const qOut =
    rate && decimals && ethAmount
      ? formatUnits(parseEther(ethAmount) * BigInt(rate), decimals)
      : '0'

  const maxQ =
    decimals && ethBalance != null
      ? formatUnits(ethBalance * BigInt(rate), decimals)
      : '0'

  useEffect(() => {
    if (!provider || !account) return
    provider
      .getBalance(account)
      .then(setEthBalance)
      .catch(() => setEthBalance(null))
  }, [provider, account])

  const handleBuy = async () => {
    if (!signer || !ethAmount) return
    await writeBuyQ(signer, parseEther(ethAmount))
    // 充值成功后刷新链上相关数据（托管余额 / 本月收入 / 交易记录）
    if (account) {
      queryClient.invalidateQueries({
        queryKey: ['escrow', 'balance', account],
      })
      queryClient.invalidateQueries({
        queryKey: ['wallet', 'monthly-income', account],
      })
      queryClient.invalidateQueries({
        queryKey: ['wallet', 'transactions', account],
      })

      startTransition(async () => {
        try {
          await writeBuyQ(signer, parseEther(ethAmount))
          toast.success('兑换成功！')
          setEthAmount('')
          onSuccess?.()
        } catch (error: any) {
          toast.error(error?.message || '兑换失败，请重试')
        }
      })
    }

    return (
      <div className="glass-card rounded-xl p-4 mb-6 border border-border/50">
        <div className="text-sm text-muted-foreground mb-2">兑换 Q（Qian）</div>
        <div className="flex gap-2 items-center">
          <Input
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            placeholder="ETH 数量"
            disabled={isLoading}
          />
          <div className="text-sm">ETH</div>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          预计获得：{qOut} Q
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          ETH 余额：{ethBalance != null ? formatEther(ethBalance) : '0'}
          ，最多可换：{maxQ} Q
        </div>
        <Button
          className="mt-4 w-full"
          onClick={handleBuy}
          disabled={!ethAmount || !signer || isLoading}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isLoading ? '兑换中...' : '兑换'}
        </Button>
      </div>
    )
  }
}
