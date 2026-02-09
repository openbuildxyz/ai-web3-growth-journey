import { useContext } from 'react'
import { Clock } from 'lucide-react'
import { motion } from 'framer-motion'

import { Badge } from '@/components/ui/badge'
import useWallet from '@/lib/hooks/useWallet'
import { DaoServiceContext } from '../service'
import { useStakeInfo } from '@/lib/hooks/useArbitration'
import { ArbitrationDecision } from '@/lib/contracts/types'
import { useTokenSymbol } from '@/lib/hooks/usePlatformToken'
import { useArbitrationParams } from '@/lib/hooks/useArbitration'
import { ArbitrationCard } from '@/components/ui/ArbitrationCard'
import {
  useVote,
  useFinalize,
  useHasVoted,
  useVotingEligibility,
} from '@/lib/hooks/useArbitration'

export default function ActiveCases() {
  const { activeCases } = useContext(DaoServiceContext)

  const voteMutation = useVote()
  const { account } = useWallet()
  const finalizeMutation = useFinalize()
  const { data: tokenSymbol } = useTokenSymbol()
  const { data: params } = useArbitrationParams()
  const { data: staked } = useStakeInfo(account)

  // Check if user is DAO member (can finalize)
  const isDaoMember = params && staked && staked >= params.minStake

  const handleVote = async (caseId: string, vote: 'buyer' | 'seller') => {
    if (!account) return
    const taskId = BigInt(caseId)
    const decision =
      vote === 'buyer'
        ? ArbitrationDecision.BuyerWins
        : ArbitrationDecision.AgentWins

    await voteMutation.mutateAsync({ taskId, decision })
  }

  const handleFinalize = async (caseId: string) => {
    const taskId = BigInt(caseId)
    await finalizeMutation.mutateAsync(taskId)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-foreground">进行中的仲裁</h2>
        <Badge className="bg-warning/20 text-warning">
          <Clock className="w-3 h-3 mr-1" />
          {activeCases.length}
        </Badge>
      </div>
      <div className="space-y-4">
        {activeCases.map((case_, index) => {
          const taskId = BigInt(case_.taskId)
          const { data: hasVoted } = useHasVoted(taskId, account)
          const { eligible: canVote } = useVotingEligibility(taskId, account)

          // Check if case can be finalized
          const now = BigInt(Math.floor(Date.now() / 1000))
          const deadlinePassed = BigInt(case_.deadline) < now
          const quorumReached =
            case_.votesForBuyer + case_.votesForSeller >= case_.quorum
          const canFinalize =
            isDaoMember && !case_.finalized && (deadlinePassed || quorumReached)

          return (
            <motion.div
              key={case_.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <ArbitrationCard
                case_={case_}
                canFinalize={!!canFinalize}
                hasVoted={hasVoted || false}
                tokenSymbol={tokenSymbol || undefined}
                onVote={canVote ? handleVote : undefined}
                onFinalize={canFinalize ? handleFinalize : undefined}
              />
            </motion.div>
          )
        })}
        {activeCases.length === 0 && (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-muted-foreground">暂无进行中的仲裁案件</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
