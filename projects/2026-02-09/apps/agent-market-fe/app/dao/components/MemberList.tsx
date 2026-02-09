// import { useContext } from 'react'
import { Users } from 'lucide-react'
import { motion } from 'framer-motion'

// import { DaoServiceContext } from '../service'

export default function MemberList() {
  // const { daoMembers } = useContext(DaoServiceContext)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-6"
    >
      <div className="glass-card rounded-2xl p-6 sticky top-24">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          仲裁委员会
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          持有治理代币的用户可参与仲裁投票，投票权重与持有量相关。
        </p>
        <div className="space-y-3">
          {/* {daoMembers.map((member, index) => (
            <motion.div
              key={member.address}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50"
            >
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg">
                {member.avatar || '👤'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-foreground truncate">
                  {member.address}
                </p>
                <p className="text-xs text-muted-foreground">
                  {member.votingPower.toLocaleString()} 票权
                </p>
              </div>
            </motion.div>
          ))} */}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-sm text-foreground font-medium mb-1">
            参与仲裁奖励
          </p>
          <p className="text-xs text-muted-foreground">
            正确投票可获得案件金额 1% 的奖励，错误投票将扣除质押代币。
          </p>
        </div>
      </div>
    </motion.div>
  )
}
