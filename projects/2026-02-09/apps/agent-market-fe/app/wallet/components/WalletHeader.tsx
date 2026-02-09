'use client'
import { motion } from 'framer-motion'

export default function WalletHeader() {
  return (
    <motion.div
      className="mb-8"
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
    >
      <h1 className="text-3xl font-bold text-foreground">钱包</h1>
      <p className="text-muted-foreground mt-1">管理您的资产与交易</p>
    </motion.div>
  )
}
