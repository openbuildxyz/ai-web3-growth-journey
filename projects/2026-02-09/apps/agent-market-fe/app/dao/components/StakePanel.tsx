'use client'

import { useState } from 'react'
import { parseUnits, formatUnits } from 'ethers'

import useWallet from '@/lib/hooks/useWallet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses'
import { useStakeInfo, useStake, useUnstake } from '@/lib/hooks/useArbitration'
import {
  useTokenDecimals,
  useTokenSymbol,
  useStakeApprovalNeeded,
  useApprove,
} from '@/lib/hooks/usePlatformToken'

export default function StakePanel() {
  const { account } = useWallet()
  const [amount, setAmount] = useState('')

  const { data: decimals } = useTokenDecimals()
  const { data: symbol } = useTokenSymbol()
  const { data: staked } = useStakeInfo(account)

  const stakeMutation = useStake()
  const unstakeMutation = useUnstake()
  const approveMutation = useApprove()

  const amountWei =
    decimals != null && amount ? parseUnits(amount, decimals) : null

  const { needsApproval } = useStakeApprovalNeeded(amountWei)

  const handleStake = async () => {
    if (!amountWei) return
    if (needsApproval) {
      await approveMutation.mutateAsync({
        spender: CONTRACT_ADDRESSES.Arbitration,
        amount: amountWei,
      })
    }
    await stakeMutation.mutateAsync(amountWei)
  }

  const handleUnstake = async () => {
    if (!amountWei) return
    await unstakeMutation.mutateAsync(amountWei)
  }

  return (
    <div className="glass-card rounded-xl p-4 border border-border/50 mb-8">
      <div className="text-sm text-muted-foreground mb-2">
        已质押：
        <span className="ml-2 text-foreground font-semibold">
          {staked && decimals != null ? formatUnits(staked, decimals) : '0'}{' '}
          {symbol || 'Q'}
        </span>
      </div>

      <div className="flex gap-2">
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`数量 (${symbol || 'Q'})`}
        />
        <Button
          onClick={handleStake}
          className="cursor-pointer"
          disabled={
            !amountWei || stakeMutation.isPending || approveMutation.isPending
          }
        >
          {approveMutation.isPending
            ? '授权中...'
            : stakeMutation.isPending
              ? '质押中...'
              : needsApproval
                ? '授权并质押'
                : '质押'}
        </Button>
        <Button
          variant="outline"
          onClick={handleUnstake}
          className="cursor-pointer"
          disabled={!amountWei || unstakeMutation.isPending}
        >
          {unstakeMutation.isPending ? '解质押中...' : '解质押'}
        </Button>
      </div>
    </div>
  )
}
