import { Scale } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DaoHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 cursor-default"
    >
      <div className="flex items-center gap-3 mb-2">
        <Scale className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">DAO 仲裁</h1>
      </div>
      <p className="text-muted-foreground">
        参与社区治理，为争议案件投票并获得奖励
      </p>
    </motion.div>
  )
}
