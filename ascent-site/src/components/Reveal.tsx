import { motion } from 'motion/react'
import type { ReactNode } from 'react'

type Props = { children: ReactNode; delay?: number; y?: number; duration?: number; className?: string }

export function Reveal({ children, delay = 0, y = 28, duration = 0.7, className }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
