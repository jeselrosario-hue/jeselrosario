import { motion, useMotionValue, useReducedMotionConfig, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'

/** Anillo que sigue al cursor y crece sobre lo clicable. Solo en dispositivos con puntero fino. */
export function Cursor() {
  const fine = useMediaQuery('(pointer: fine)')
  const reduce = useReducedMotionConfig()
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 420, damping: 38, mass: 0.45 })
  const sy = useSpring(y, { stiffness: 420, damping: 38, mass: 0.45 })
  const [state, setState] = useState<'idle' | 'link' | 'down'>('idle')
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    if (!fine || reduce) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setSeen(true)
      setState((s) => (s === 'down' ? s : (e.target as HTMLElement).closest('a,button,[data-cursor]') ? 'link' : 'idle'))
    }
    const down = () => setState('down')
    const up = () => setState('idle')
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [fine, reduce, x, y])

  if (!fine || reduce) return null
  return (
    <>
      <motion.div aria-hidden style={{ x: sx, y: sy }} className="pointer-events-none fixed left-0 top-0 z-[90]">
        <motion.div
          animate={{ scale: state === 'link' ? 1.9 : state === 'down' ? 0.7 : 1, opacity: seen ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="-ml-[18px] -mt-[18px] size-9 rounded-full border border-white/60 mix-blend-difference"
        />
      </motion.div>
      <motion.div aria-hidden style={{ x, y }} className="pointer-events-none fixed left-0 top-0 z-[90]">
        <span className={`-ml-[3px] -mt-[3px] block size-1.5 rounded-full bg-sky transition-opacity ${seen ? 'opacity-100' : 'opacity-0'}`} />
      </motion.div>
    </>
  )
}
