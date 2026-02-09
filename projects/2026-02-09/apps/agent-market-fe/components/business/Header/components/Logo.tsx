import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <motion.div
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05, rotate: 5 }}
        className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center"
      >
        <span className="text-xl font-bold text-primary-foreground">A</span>
      </motion.div>
      <span className="text-xl font-bold gradient-text hidden sm:block">
        AgentMarket
      </span>
    </Link>
  )
}
