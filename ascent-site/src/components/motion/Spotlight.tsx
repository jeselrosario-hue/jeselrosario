import { motion, useMotionTemplate, useMotionValue } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Tarjeta con foco de luz celeste que sigue al cursor. */
export function SpotlightCard({ children, className }: { children: ReactNode; className?: string }) {
  const mx = useMotionValue(-300)
  const my = useMotionValue(-300)
  const bg = useMotionTemplate`radial-gradient(380px circle at ${mx}px ${my}px, rgb(74 189 240 / 0.22), transparent 65%)`
  const ring = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, rgb(74 189 240 / 0.9), transparent 70%)`
  return (
    <motion.div
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set(e.clientX - r.left)
        my.set(e.clientY - r.top)
      }}
      onPointerLeave={() => {
        mx.set(-300)
        my.set(-300)
      }}
      className={cn('group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl', className)}
    >
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: bg }} />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] p-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: ring, mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)', WebkitMask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)' }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  )
}
