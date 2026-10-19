import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'
import { useRef } from 'react'

const wrap = (min: number, max: number, v: number) => {
  const r = max - min
  return ((((v - min) % r) + r) % r) + min
}

/** Cinta infinita cuya velocidad (y sentido) reacciona a la velocidad del scroll. */
export function Marquee({ items, base = -1.6 }: { items: readonly string[]; base?: number }) {
  const reduce = useReducedMotion()
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const smooth = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const boost = useTransform(smooth, [0, 1000], [0, 5], { clamp: false })
  const dir = useRef(1)
  useAnimationFrame((_, delta) => {
    if (reduce) return
    let move = dir.current * base * (delta / 1000)
    if (boost.get() < 0) dir.current = -1
    else if (boost.get() > 0) dir.current = 1
    move += dir.current * move * boost.get()
    baseX.set(baseX.get() + move)
  })
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`)
  const row = items.map((t, i) => (
    <span key={i} className="flex shrink-0 items-center gap-8 pr-8 sm:gap-14 sm:pr-14">
      <span className={i % 2 ? 'font-display italic text-sky' : 'font-display text-white'}>{t}</span>
      <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-sky sm:size-7" aria-hidden><path d="M12 1 14 10 23 12 14 14 12 23 10 14 1 12 10 10Z" fill="currentColor" /></svg>
    </span>
  ))
  return (
    <div className="overflow-hidden py-6 sm:py-8" aria-hidden>
      <motion.div style={{ x }} className="flex w-max whitespace-nowrap text-[clamp(2.4rem,6vw,5rem)] leading-none">
        {row}{row}{row}{row}
      </motion.div>
    </div>
  )
}
