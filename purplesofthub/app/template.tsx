'use client'

import { motion } from 'framer-motion'

export default function Template({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.22,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
      style={{ willChange: "opacity" }}
    >
      {children}
    </motion.div>
  )
}
