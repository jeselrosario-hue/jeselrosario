import { motion, useInView } from 'motion/react'
import { useRef, type ElementType } from 'react'
import { cn } from '@/lib/utils'

const ease = [0.22, 1, 0.36, 1] as const

type Props = {
  text: string
  as?: ElementType
  className?: string
  delay?: number
  /** Palabras que van en cursiva celeste. */
  accent?: string[]
  /** Si true, anima al montar en vez de al entrar en pantalla. */
  immediate?: boolean
}

/** Titular que se revela palabra por palabra, saliendo de una máscara. */
export function SplitText({ text, as: Tag = 'span', className, delay = 0, accent = [], immediate }: Props) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const words = text.split(' ')
  const clean = (w: string) => w.replace(/[.,¿?¡!]/g, '').toLowerCase()
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => {
        const isAccent = accent.map(clean).includes(clean(w))
        const anim = { y: 0, rotate: 0, opacity: 1 }
        return (
          <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.14em] align-bottom [margin-bottom:-0.14em]">
            <motion.span
              className={cn('inline-block', isAccent && 'italic text-sky text-glow')}
              initial={{ y: '115%', rotate: 5, opacity: 0 }}
              animate={immediate || inView ? anim : undefined}
              transition={{ duration: 1, delay: delay + i * 0.08, ease }}
            >
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        )
      })}
    </Tag>
  )
}
