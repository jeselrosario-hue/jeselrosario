import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react'
import { MessageCircle, PenTool, Rocket } from 'lucide-react'
import { useRef, useState } from 'react'
import { Reveal } from '@/components/Reveal'
import { CountUp } from '@/components/motion/CountUp'
import { SplitText } from '@/components/motion/SplitText'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { COPY } from '@/content'

const ICONS = [MessageCircle, PenTool, Rocket]
const ease = [0.22, 1, 0.36, 1] as const

/** Escritorio: la escena queda fija; el scroll cambia de paso con un número gigante. */
function PinnedSteps() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const fill = useSpring(p, { stiffness: 120, damping: 28 })
  const [i, setI] = useState(0)
  useMotionValueEvent(p, 'change', (v) => setI(Math.max(0, Math.min(2, Math.floor(v * 3)))))

  return (
    <div ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[1.15fr_1fr] items-center gap-10 px-8">
          <div className="relative h-[60vh]">
            <AnimatePresence mode="wait">
              <motion.span
                key={i}
                initial={{ y: 90, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -90, opacity: 0 }}
                transition={{ duration: 0.6, ease }}
                className="absolute inset-0 flex items-center font-display text-[min(34vw,32rem)] leading-none text-transparent [-webkit-text-stroke:2px_var(--color-sky)] [text-shadow:0_0_90px_rgb(74_189_240/0.35)]"
              >
                0{i + 1}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="relative pl-10">
            <div aria-hidden className="absolute bottom-2 left-0 top-2 w-px bg-white/10">
              <motion.div style={{ scaleY: fill }} className="size-full origin-top bg-sky shadow-[0_0_20px_var(--color-sky)]" />
            </div>
            <ol className="space-y-12">
              {COPY.process.steps.map((s, idx) => {
                const Icon = ICONS[idx]
                const on = idx === i
                return (
                  <motion.li key={s} animate={{ opacity: on ? 1 : 0.35, x: on ? 14 : 0 }} transition={{ duration: 0.5, ease }} className="flex items-center gap-6">
                    <motion.span animate={{ scale: on ? 1 : 0.85, backgroundColor: on ? '#4ABDF0' : 'rgba(255,255,255,0.08)', color: on ? '#0B1E3C' : '#ffffff' }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} className="grid size-16 shrink-0 place-items-center rounded-full border border-white/20 [&_svg]:size-7">
                      <Icon aria-hidden />
                    </motion.span>
                    <h3 className="text-[clamp(2.6rem,4.4vw,4.4rem)]">{s}</h3>
                  </motion.li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

function StackedSteps() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const grow = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })
  return (
    <div ref={ref} className="relative mx-auto max-w-2xl px-5">
      <div aria-hidden className="absolute bottom-10 left-[3.25rem] top-10 w-px bg-white/10">
        <motion.div className="size-full origin-top bg-sky shadow-[0_0_20px_var(--color-sky)]" style={{ scaleY: grow }} />
      </div>
      <ol className="relative space-y-12">
        {COPY.process.steps.map((s, i) => {
          const Icon = ICONS[i]
          return (
            <li key={s} className="flex items-center gap-6">
              <motion.span initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true, amount: 0.8 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }} className="relative z-10 grid size-[4.5rem] shrink-0 place-items-center rounded-full border border-white/25 bg-[#143564] text-sky shadow-[0_0_40px_-6px_rgb(74_189_240/0.7)] [&_svg]:size-8">
                <Icon aria-hidden />
              </motion.span>
              <div>
                <span className="eyebrow">0{i + 1}</span>
                <h3 className="text-5xl">{s}</h3>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function Process() {
  const wide = useMediaQuery('(min-width: 1024px) and (min-height: 640px)')
  return (
    <section id="proceso" className="relative bg-navy pt-28 sm:pt-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="eyebrow mb-5">{COPY.eyebrows.proceso}</p>
        <SplitText as="h2" text={COPY.process.title} className="display-lg" accent={['pasos']} />
      </div>
      <div className={wide ? 'mt-4' : 'mt-14'}>{wide ? <PinnedSteps /> : <StackedSteps />}</div>
      <div className="mx-auto grid max-w-7xl gap-4 px-5 pb-28 pt-8 sm:grid-cols-3 sm:px-8 sm:pb-40">
        {COPY.process.terms.map((t, i) => (
          <Reveal key={t.small + i} delay={i * 0.1}>
            <div className="glass flex items-baseline gap-4 rounded-3xl px-7 py-6">
              <span className="text-glow font-display text-7xl leading-none text-sky"><CountUp to={parseInt(t.big, 10)} suffix={t.big.includes('%') ? '%' : ''} /></span>
              <span className="text-base font-medium text-white/85">{t.small}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
