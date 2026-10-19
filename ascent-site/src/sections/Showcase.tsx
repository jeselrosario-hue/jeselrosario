import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { BrowserSite } from '@/components/mockups/BrowserSite'
import { PhoneBio } from '@/components/mockups/PhoneBio'
import { QrCard } from '@/components/mockups/QrCard'
import { Reveal } from '@/components/Reveal'
import { COPY } from '@/content'

function Label({ children }: { children: string }) {
  return <span className="glass mt-4 inline-block rounded-full px-4 py-1.5 text-sm font-semibold">{children}</span>
}

export function Showcase() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const k = reduce ? 0 : 1
  const yPhone = useTransform(scrollYProgress, [0, 1], [90 * k, -90 * k])
  const yQr = useTransform(scrollYProgress, [0, 1], [-60 * k, 80 * k])
  const yBrowser = useTransform(scrollYProgress, [0, 1], [30 * k, -30 * k])
  const rot = useTransform(scrollYProgress, [0, 0.5, 1], [10 * k, 0, -10 * k])

  return (
    <section ref={ref} id="ejemplos" className="relative overflow-hidden bg-navy-2 py-24 sm:py-32">
      <div aria-hidden className="absolute left-1/2 top-1/2 -z-0 size-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky/15 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <h2 className="text-[clamp(2.4rem,6vw,4.5rem)]">{COPY.showcase.title}</h2>
        </Reveal>
        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_1.55fr_1fr] lg:gap-6">
          <motion.div style={{ y: yPhone, rotateY: rot }} className="mx-auto w-[min(62vw,270px)] [perspective:1000px] lg:order-1">
            <PhoneBio />
            <div className="text-center"><Label>{COPY.showcase.labels.phone}</Label></div>
          </motion.div>
          <motion.div style={{ y: yBrowser }} className="order-first lg:order-2">
            <Reveal>
              <BrowserSite />
              <div className="text-center"><Label>{COPY.showcase.labels.site}</Label></div>
            </Reveal>
          </motion.div>
          <motion.div style={{ y: yQr }} className="mx-auto w-[min(80vw,340px)] lg:order-3">
            <QrCard />
            <div className="text-center"><Label>{COPY.showcase.labels.qr}</Label></div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
