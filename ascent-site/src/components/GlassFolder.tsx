import { motion, useInView } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { COPY } from '@/content'

type Props = {
  index: number
  title: string
  art: ReactNode
  children: ReactNode // contenido del frente (precio, línea, chips)
  badge?: string
  featured?: boolean
}

/**
 * Carpeta de vidrio: el arte (mockup) vive dentro y sube al abrirla;
 * el frente se inclina hacia adelante. Se abre sola al entrar en pantalla,
 * y se puede abrir / cerrar con clic, toque o teclado.
 */
export function GlassFolder({ index, title, art, children, badge, featured }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.45 })
  const [open, setOpen] = useState(false)
  const id = useId()

  useEffect(() => {
    if (!inView) return
    const t = window.setTimeout(() => setOpen(true), 250 + index * 280)
    return () => window.clearTimeout(t)
  }, [inView, index])

  const ease = [0.22, 1, 0.36, 1] as const
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.1, ease }}
      className={cn('relative [perspective:1100px]', featured && 'lg:-translate-y-6')}
    >
      <div className="relative h-[34rem] sm:h-[36rem]" onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}>
        {/* pestaña + fondo de la carpeta */}
        <div className="absolute inset-x-0 bottom-0 top-8 rounded-[2rem] rounded-tl-none glass bg-sky/5" />
        <div className="absolute left-0 top-0 h-10 w-[42%] rounded-t-2xl glass border-b-0" />
        {badge && (
          <span className="absolute right-3 top-0 z-30 inline-flex items-center gap-1.5 rounded-full bg-sky px-3.5 py-1.5 text-xs font-bold text-navy shadow-[0_0_30px_rgb(74_189_240/0.7)]">{badge}</span>
        )}
        {featured && <div aria-hidden className="absolute inset-x-6 bottom-0 top-8 -z-10 rounded-[2rem] bg-sky/30 blur-3xl" />}

        {/* arte dentro de la carpeta */}
        <motion.div
          id={id}
          className="absolute inset-x-5 top-[11%] z-10 h-[52%]"
          initial={false}
          animate={{ y: open ? '0%' : '42%', scale: open ? 1 : 0.94, rotate: open ? 0 : -2, opacity: open ? 1 : 0.9 }}
          transition={{ duration: 0.8, ease }}
        >
          <div className="flex size-full items-center justify-center">{art}</div>
        </motion.div>

        {/* frente de vidrio (botón) */}
        <motion.button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          aria-label={`${open ? COPY.services.closeLabel : COPY.services.openLabel}: ${title}`}
          onClick={() => setOpen((o) => !o)}
          initial={false}
          animate={{ rotateX: open ? -16 : 0, y: open ? 10 : 0 }}
          transition={{ duration: 0.7, ease }}
          style={{ transformOrigin: '50% 100%' }}
          className="glass group absolute inset-x-0 bottom-0 z-20 flex h-[46%] cursor-pointer flex-col justify-between rounded-[2rem] bg-gradient-to-br from-[#2a5aa0]/70 via-[#11294d]/90 to-[#0b1e3c]/95 p-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-sky sm:p-7"
        >
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
            <span className="absolute -inset-y-4 -left-1/2 w-1/3 -skew-x-12 bg-white/15 blur-md motion-safe:animate-[shine_5s_ease-in-out_infinite]" />
          </span>
          <span className="relative flex items-start justify-between gap-3">
            <span className="text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">{title}</span>
            <ChevronDown className={cn('mt-1 size-6 shrink-0 text-sky transition-transform duration-500', open && 'rotate-180')} aria-hidden />
          </span>
          <span className="relative block">{children}</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
