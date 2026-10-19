import { motion } from 'motion/react'
import { ArrowRight, Check, Mail, Receipt } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { WhatsAppIcon } from '@/components/BrandIcons'
import { Reveal } from '@/components/Reveal'
import { SplitText } from '@/components/motion/SplitText'
import { SpotlightCard } from '@/components/motion/Spotlight'
import { COPY } from '@/content'

function Calendar() {
  const days = Array.from({ length: 14 }, (_, i) => i + 1)
  const [on, setOn] = useState(9)
  useEffect(() => {
    const id = window.setInterval(() => setOn((d) => (d >= 13 ? 3 : d + 2)), 1800)
    return () => window.clearInterval(id)
  }, [])
  return (
    <div className="relative w-full max-w-[15rem]">
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => (
          <motion.span key={d} animate={{ backgroundColor: d === on ? '#4ABDF0' : 'rgba(255,255,255,0.14)', color: d === on ? '#0B1E3C' : 'rgba(255,255,255,0.8)', scale: d === on ? 1.15 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }} className="grid aspect-square place-items-center rounded-lg font-mono text-[10px] font-semibold">{d}</motion.span>
        ))}
      </div>
      <motion.div key={on} initial={{ opacity: 0, y: 12, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="absolute -bottom-4 right-0 flex items-center gap-1.5 rounded-xl rounded-br-sm bg-white px-2.5 py-1.5 text-[11px] font-bold text-navy shadow-xl">
        <WhatsAppIcon className="size-3.5 text-[#1aa05a]" /> <Check className="size-3.5 text-[#1aa05a]" aria-hidden /> Cita confirmada
      </motion.div>
    </div>
  )
}

function Domain() {
  return (
    <div className="w-full max-w-[16rem] space-y-2.5 font-mono text-xs sm:text-[13px]">
      <div className="rounded-xl bg-white/5 px-3 py-2 text-white/45 line-through decoration-white/40">tunegocio.netlify.app</div>
      <div className="flex justify-center text-sky"><ArrowRight className="size-5 rotate-90" aria-hidden /></div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.6 }} className="flex items-center justify-between rounded-xl bg-sky px-3 py-2 font-bold text-navy shadow-[0_0_28px_rgb(74_189_240/0.6)]">
        tunegocio.com <span className="flex gap-1.5"><Mail className="size-4" aria-hidden /><WhatsAppIcon className="size-4" /></span>
      </motion.div>
    </div>
  )
}

function ReceiptCard() {
  return (
    <div className="relative mx-auto w-40 -rotate-2 rounded-lg bg-white p-3 text-navy shadow-xl">
      <div className="flex items-center justify-between"><Receipt className="size-4 text-sky" aria-hidden /><span className="h-1.5 w-10 rounded-full bg-navy/30" /></div>
      {[70, 90, 55].map((w, i) => (
        <motion.div key={w} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }} className="mt-2 flex origin-left justify-between"><span className="h-1.5 rounded-full bg-navy/25" style={{ width: `${w}%` }} /><span className="h-1.5 w-5 rounded-full bg-navy/40" /></motion.div>
      ))}
      <div className="mt-3 flex items-center justify-between border-t border-navy/15 pt-2"><span className="h-2 w-8 rounded-full bg-navy/60" /><span className="h-2 w-10 rounded-full bg-sky" /></div>
      <motion.span initial={{ opacity: 0, scale: 1.8, rotate: -20 }} whileInView={{ opacity: 1, scale: 1, rotate: -12 }} viewport={{ once: true }} transition={{ delay: 0.9, duration: 0.45, type: 'spring', stiffness: 260, damping: 14 }} className="absolute -right-3 bottom-1 rounded-md border-2 border-[#1aa05a] px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-[#1aa05a]">Pagado</motion.span>
    </div>
  )
}

const VISUALS: Record<string, ReactNode> = { agenda: <Calendar />, dominio: <Domain />, recibos: <ReceiptCard /> }

export function Extras() {
  return (
    <section id="extras" className="relative overflow-hidden bg-navy-2 py-28 sm:py-40">
      <div aria-hidden className="absolute -right-40 top-10 size-[34rem] rounded-full bg-sky/15 blur-[130px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <p className="eyebrow mb-5">{COPY.eyebrows.extras}</p>
        <SplitText as="h2" text={COPY.extras.title} className="display-lg" accent={['extras']} />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {COPY.extras.items.map((it, i) => (
            <Reveal key={it.id} delay={i * 0.12}>
              <SpotlightCard className="h-full transition-transform duration-500 hover:-translate-y-2">
                <div className="p-6">
                  <div className="grid h-48 place-items-center rounded-2xl bg-navy/70 p-5 ring-1 ring-white/10">{VISUALS[it.id]}</div>
                  <h3 className="mt-7 text-[1.9rem] leading-[1.05]">{it.title}</h3>
                  <span className="mt-5 inline-flex w-fit rounded-full bg-sky/15 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-wider text-sky ring-1 ring-sky/40">{it.price}</span>
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
