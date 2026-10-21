import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

const ease = [0.65, 0, 0.35, 1] as const

type Props = {
  className?: string
  delay?: number
}

/**
 * Trazo que sube de izquierda a derecha, como la flecha del logo. Se "dibuja" al entrar en
 * pantalla con solo transform: la ventana se desliza y el trazo va en sentido contrario.
 */
export function DrawLine({ className, delay = 0 }: Props) {
  const transition = { duration: 1.1, delay, ease }
  return (
    <motion.span
      aria-hidden
      className={cn('block h-4 overflow-hidden', className)}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 1 }}
    >
      <motion.span className="block size-full" variants={{ hidden: { transform: 'translateX(-101%)' }, shown: { transform: 'translateX(0%)', transition } }}>
        <motion.svg
          className="block size-full overflow-visible"
          viewBox="0 0 200 16"
          preserveAspectRatio="none"
          fill="none"
          variants={{ hidden: { transform: 'translateX(101%)' }, shown: { transform: 'translateX(0%)', transition } }}
        >
          <path d="M2 13 C 60 14, 120 11, 198 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </motion.svg>
      </motion.span>
    </motion.span>
  )
}
