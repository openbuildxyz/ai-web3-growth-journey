import { useContext } from 'react'
import { motion } from 'framer-motion'
import { Award, CheckCircle, Scale, Users } from 'lucide-react'

import { DaoServiceContext } from '../service'

export default function DaoStats() {
  const { totalStaked, tokenSymbol, activeCases, resolvedCases, totalMembers } =
    useContext(DaoServiceContext)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 cursor-default"
    >
      <div className="glass-card rounded-xl p-4 text-center">
        <Scale className="w-6 h-6 mx-auto mb-2 text-primary" />
        <p className="text-2xl font-bold text-foreground">
          {activeCases.length}
        </p>
        <p className="text-sm text-muted-foreground">进行中</p>
      </div>
      <div className="glass-card rounded-xl p-4 text-center">
        <CheckCircle className="w-6 h-6 mx-auto mb-2 text-success" />
        <p className="text-2xl font-bold text-foreground">
          {resolvedCases.length}
        </p>
        <p className="text-sm text-muted-foreground">已解决</p>
      </div>
      <div className="glass-card rounded-xl p-4 text-center">
        <Users className="w-6 h-6 mx-auto mb-2 text-accent" />
        <p className="text-2xl font-bold text-foreground">{totalMembers}</p>
        <p className="text-sm text-muted-foreground">委员会成员</p>
      </div>
      <div className="glass-card rounded-xl p-4 text-center">
        <Award className="w-6 h-6 mx-auto mb-2 text-warning" />
        <p className="text-2xl font-bold text-foreground">
          {totalStaked} {tokenSymbol}
        </p>
        <p className="text-sm text-muted-foreground">总质押量</p>
      </div>
    </motion.div>
  )
}
