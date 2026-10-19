import { motion, useScroll, useSpring } from 'motion/react'
import { MessageCircle, PenTool, Rocket } from 'lucide-react'
import { useRef } from 'react'
import { Reveal } from '@/components/Reveal'
import { COPY } from '@/content'

const ICONS = [MessageCircle, PenTool, Rocket]

export function Process() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const grow = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })

  return (
    <section id="proceso" className="relative overflow-hidden bg-navy py-24 sm:py-32">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal><h2 className="text-[clamp(2.4rem,6vw,4.5rem)]">{COPY.process.title}</h2></Reveal>

        <div ref={ref} className="relative mt-16">
          {/* línea que se dibuja con el scroll */}
          <div aria-hidden className="absolute bottom-10 left-9 top-10 w-0.5 bg-white/10 lg:bottom-auto lg:left-[16.6%] lg:right-[16.6%] lg:top-9 lg:h-0.5 lg:w-auto">
            <motion.div className="size-full origin-top bg-sky shadow-[0_0_20px_var(--color-sky)] lg:origin-left" style={{ scaleY: grow }} />
          </div>
          <ol className="relative grid gap-12 lg:grid-cols-3 lg:gap-6">
            {COPY.process.steps.map((s, i) => {
              const Icon = ICONS[i]
              return (
                <li key={s} className="flex items-center gap-6 lg:flex-col lg:text-center">
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 16, delay: i * 0.1 }}
                    className="relative z-10 grid size-[4.5rem] shrink-0 place-items-center rounded-full border border-white/25 bg-[#143564] text-sky shadow-[0_0_40px_-6px_rgb(74_189_240/0.7)] [&_svg]:size-8"
                  >
                    <Icon aria-hidden />
                  </motion.span>
                  <div>
                    <span className="text-sm font-bold tracking-widest text-sky">0{i + 1}</span>
                    <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">{s}</h3>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        <div className="mt-20 grid gap-4 sm:grid-cols-3">
          {COPY.process.terms.map((t, i) => (
            <Reveal key={t.small + i} delay={i * 0.1}>
              <div className="glass flex items-baseline gap-3 rounded-3xl px-6 py-5">
                <span className="text-glow text-5xl font-extrabold tracking-tighter text-sky sm:text-6xl">{t.big}</span>
                <span className="text-base font-semibold text-white/85">{t.small}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
