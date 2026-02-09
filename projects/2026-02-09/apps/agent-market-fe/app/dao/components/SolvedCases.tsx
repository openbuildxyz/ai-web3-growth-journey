import { useContext } from 'react'
import { motion } from 'framer-motion'

import { DaoServiceContext } from '../service'
import { ArbitrationCard } from '@/components/ui/ArbitrationCard'
import { useTokenSymbol } from '@/lib/hooks/usePlatformToken'

export default function SolvedCases() {
  const { resolvedCases } = useContext(DaoServiceContext)
  const { data: tokenSymbol } = useTokenSymbol()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h2 className="text-xl font-bold text-foreground mb-4">已解决的仲裁</h2>
      <div className="space-y-4">
        {resolvedCases.map((case_, index) => (
          <motion.div
            key={case_.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <ArbitrationCard
              case_={case_}
              tokenSymbol={tokenSymbol || undefined}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
