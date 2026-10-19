import { animate, motion, useInView, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'

/** Número que cuenta desde 0 al entrar en pantalla. */
export function CountUp({ to, prefix = '', suffix = '', duration = 1.8, className }: { to: number; prefix?: string; suffix?: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.8 })
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) => `${prefix}${Math.round(v)}${suffix}`)
  useEffect(() => {
    if (!inView) return
    const c = animate(mv, to, { duration, ease: [0.16, 1, 0.3, 1] })
    return () => c.stop()
  }, [inView, mv, to, duration])
  return (
    <motion.span ref={ref} className={className}>
      {text}
    </motion.span>
  )
}
