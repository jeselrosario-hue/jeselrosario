import { motion, useScroll, useTransform } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { BrowserSite } from '@/components/mockups/BrowserSite'
import { PhoneBio } from '@/components/mockups/PhoneBio'
import { QrCard } from '@/components/mockups/QrCard'
import { Reveal } from '@/components/Reveal'
import { SplitText } from '@/components/motion/SplitText'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { COPY } from '@/content'

function Label({ children }: { children: string }) {
  return <span className="glass mt-4 inline-block rounded-full px-4 py-1.5 font-mono text-xs uppercase tracking-widest">{children}</span>
}

function Heading() {
  return (
    <div>
      <p className="eyebrow mb-5">{COPY.eyebrows.ejemplos}</p>
      <SplitText as="h2" text={COPY.showcase.title} className="display-lg" accent={['ve']} />
    </div>
  )
}

/** Escritorio: la escena queda fija y el scroll va armando sitio, teléfono y tarjeta. */
function Pinned() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const bOp = useTransform(p, [0, 0.1], [0, 1])
  const bScale = useTransform(p, [0, 0.22], [0.72, 1])
  const bRotX = useTransform(p, [0, 0.22], [22, 0])
  const bX = useTransform(p, [0.3, 0.62], ['0vw', '-15vw'])
  const bY = useTransform(p, [0.5, 0.85], ['0vh', '-3vh'])

  const pOp = useTransform(p, [0.28, 0.4], [0, 1])
  const pX = useTransform(p, [0.3, 0.62], ['58vw', '26vw'])
  const pY = useTransform(p, [0.3, 0.62], ['20vh', '-1vh'])
  const pRot = useTransform(p, [0.3, 0.62], [16, -4])

  const qOp = useTransform(p, [0.5, 0.62], [0, 1])
  const qX = useTransform(p, [0.5, 0.84], ['-16vw', '3vw'])
  const qY = useTransform(p, [0.5, 0.84], ['85vh', '29vh'])
  const qRot = useTransform(p, [0.5, 0.84], [-18, -5])

  const l1 = useTransform(p, [0.2, 0.3], [0, 1])
  const l2 = useTransform(p, [0.58, 0.66], [0, 1])
  const l3 = useTransform(p, [0.82, 0.9], [0, 1])
  const bar = useTransform(p, [0, 1], [0, 1])

  const item = 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [perspective:1400px]'
  return (
    <div ref={ref} className="relative h-[320vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute left-6 top-28 z-20 xl:left-16"><Heading /></div>
        <motion.div aria-hidden style={{ scaleY: bar }} className="absolute bottom-10 right-8 top-28 z-20 w-px origin-top bg-sky" />
        <motion.div style={{ opacity: bOp, scale: bScale, rotateX: bRotX, x: bX, y: bY }} className={`${item} w-[min(56vw,860px)]`}>
          <BrowserSite />
          <motion.div style={{ opacity: l1 }} className="text-center"><Label>{COPY.showcase.labels.site}</Label></motion.div>
        </motion.div>
        <motion.div style={{ opacity: pOp, x: pX, y: pY, rotate: pRot }} className={`${item} w-[min(16vw,270px)] min-w-[200px]`}>
          <PhoneBio />
          <motion.div style={{ opacity: l2 }} className="text-center"><Label>{COPY.showcase.labels.phone}</Label></motion.div>
        </motion.div>
        <motion.div style={{ opacity: qOp, x: qX, y: qY, rotate: qRot }} className={`${item} w-[min(24vw,380px)]`}>
          <QrCard />
          <motion.div style={{ opacity: l3 }} className="text-center"><Label>{COPY.showcase.labels.qr}</Label></motion.div>
        </motion.div>
      </div>
    </div>
  )
}

function Item({ children, w }: { children: ReactNode; w: string }) {
  return <Reveal className={`mx-auto ${w}`}>{children}</Reveal>
}

function Stacked() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-24">
      <Heading />
      <div className="mt-12 space-y-14">
        <Item w="w-full"><BrowserSite /><div className="text-center"><Label>{COPY.showcase.labels.site}</Label></div></Item>
        <Item w="w-[min(70vw,270px)]"><PhoneBio /><div className="text-center"><Label>{COPY.showcase.labels.phone}</Label></div></Item>
        <Item w="w-[min(86vw,360px)]"><QrCard /><div className="text-center"><Label>{COPY.showcase.labels.qr}</Label></div></Item>
      </div>
    </div>
  )
}

export function Showcase() {
  const wide = useMediaQuery('(min-width: 1024px) and (min-height: 640px)')
  return (
    <section id="ejemplos" className="relative bg-navy-2">
      <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-navy to-transparent" />
      <div aria-hidden className="absolute left-1/2 top-1/2 size-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky/15 blur-[140px]" />
      {wide ? <Pinned /> : <Stacked />}
    </section>
  )
}
