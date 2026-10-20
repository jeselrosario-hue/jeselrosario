import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { reducirMovimiento } from '@/lib/motion'

/** Cortina de entrada: el logo aparece, una línea se llena y la cortina sube. */
export function Intro() {
  const [show, setShow] = useState(() => !reducirMovimiento())
  useEffect(() => {
    if (!show) return
    const t = window.setTimeout(() => setShow(false), 1500)
    return () => window.clearTimeout(t)
  }, [show])
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-[100] grid place-items-center bg-navy"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex flex-col items-center gap-6">
            <motion.img
              src="/logo-light.png"
              alt=""
              width={1000}
              height={751}
              className="h-20 w-auto"
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(12px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
            <div className="h-px w-40 overflow-hidden bg-white/15">
              <motion.div className="h-full bg-sky" initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
