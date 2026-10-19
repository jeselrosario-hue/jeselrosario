import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { whatsappUrl } from '@/config'
import { COPY } from '@/content'
import { Magnetic } from '@/components/motion/Magnetic'
import { WhatsAppIcon } from './BrandIcons'

export function Nav() {
  const [active, setActive] = useState('')
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()
  const wa = whatsappUrl()

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > 240 && y > prev && !open)
  })

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    COPY.nav.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    const hero = document.getElementById('inicio')
    if (hero) io.observe(hero)
    return () => io.disconnect()
  }, [])

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[70] flex justify-center px-4 pt-4"
        animate={{ y: hidden ? -110 : 0 }}
        initial={{ y: -110 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: hidden ? 0 : 0.1 }}
      >
        <nav aria-label="Principal" className="glass flex w-full max-w-5xl items-center justify-between rounded-full py-2 pl-5 pr-2">
          <a href="#inicio" className="flex min-h-11 items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-sky">
            <img src="/logo-light.png" alt="" width={1000} height={751} className="h-7 w-auto" />
            <span className="text-[17px] font-semibold tracking-tight">{COPY.brand}</span>
          </a>
          <ul className="hidden items-center gap-1 md:flex">
            {COPY.nav.map(({ id, label }) => (
              <li key={id}>
                <a href={`#${id}`} className="relative block rounded-full px-4 py-2.5 text-sm font-medium text-white/80 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-sky">
                  {active === id && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white/12 ring-1 ring-white/15" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                  <span className="relative">{label}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Magnetic strength={0.25}>
              <Button href={wa || '#contacto'} size="sm" target={wa ? '_blank' : undefined} rel="noopener noreferrer">
                <WhatsAppIcon /> <span className="hidden sm:inline">WhatsApp</span>
                <span className="sr-only sm:hidden">WhatsApp</span>
              </Button>
            </Magnetic>
            <button type="button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="grid size-11 cursor-pointer place-items-center rounded-full outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-sky md:hidden">
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[65] flex flex-col justify-center bg-navy/95 px-8 backdrop-blur-xl md:hidden"
            initial={{ clipPath: 'circle(0% at 90% 6%)' }}
            animate={{ clipPath: 'circle(150% at 90% 6%)' }}
            exit={{ clipPath: 'circle(0% at 90% 6%)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="space-y-2">
              {COPY.nav.map(({ id, label }, i) => (
                <li key={id} className="overflow-hidden">
                  <motion.a
                    href={`#${id}`}
                    onClick={() => setOpen(false)}
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '110%' }}
                    transition={{ delay: 0.15 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="block font-display text-6xl leading-tight"
                  >
                    <span className="mr-4 font-mono text-sm text-sky">0{i + 1}</span>
                    {label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
