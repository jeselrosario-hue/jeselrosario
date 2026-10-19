import { motion } from 'motion/react'
import { ArrowRight, Check, Mail, Receipt } from 'lucide-react'
import type { ReactNode } from 'react'
import { WhatsAppIcon } from '@/components/BrandIcons'
import { Reveal } from '@/components/Reveal'
import { COPY } from '@/content'

function Calendar() {
  const days = Array.from({ length: 14 }, (_, i) => i + 1)
  return (
    <div className="relative w-full max-w-[15rem]">
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => (
          <span key={d} className={`grid aspect-square place-items-center rounded-lg text-[10px] font-semibold ${d === 9 ? 'bg-sky text-navy shadow-[0_0_20px_rgb(74_189_240/0.8)]' : 'bg-white/15 text-white/80'}`}>{d}</span>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="absolute -bottom-3 right-0 flex items-center gap-1.5 rounded-xl rounded-br-sm bg-white px-2.5 py-1.5 text-[11px] font-bold text-navy shadow-xl"
      >
        <WhatsAppIcon className="size-3.5 text-[#1aa05a]" /> <Check className="size-3.5 text-[#1aa05a]" aria-hidden /> Cita confirmada
      </motion.div>
    </div>
  )
}

function Domain() {
  return (
    <div className="w-full max-w-[16rem] space-y-2.5 font-mono text-xs sm:text-[13px]">
      <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-white/45 line-through decoration-white/40">tunegocio.netlify.app</div>
      <div className="flex justify-center text-sky"><ArrowRight className="size-5 rotate-90" aria-hidden /></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="flex items-center justify-between rounded-xl bg-sky px-3 py-2 font-bold text-navy shadow-[0_0_28px_rgb(74_189_240/0.6)]"
      >
        tunegocio.com <span className="flex gap-1.5"><Mail className="size-4" aria-hidden /><WhatsAppIcon className="size-4" /></span>
      </motion.div>
    </div>
  )
}

function Receipt_() {
  return (
    <div className="relative mx-auto w-40 -rotate-2 rounded-lg bg-white p-3 text-navy shadow-xl">
      <div className="flex items-center justify-between"><Receipt className="size-4 text-sky" aria-hidden /><span className="h-1.5 w-10 rounded-full bg-navy/30" /></div>
      {[70, 90, 55].map((w) => (
        <div key={w} className="mt-2 flex justify-between"><span className="h-1.5 rounded-full bg-navy/25" style={{ width: `${w}%` }} /><span className="h-1.5 w-5 rounded-full bg-navy/40" /></div>
      ))}
      <div className="mt-3 flex items-center justify-between border-t border-navy/15 pt-2"><span className="h-2 w-8 rounded-full bg-navy/60" /><span className="h-2 w-10 rounded-full bg-sky" /></div>
      <motion.span
        initial={{ opacity: 0, scale: 1.8, rotate: -20 }}
        whileInView={{ opacity: 1, scale: 1, rotate: -12 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.45, type: 'spring', stiffness: 260, damping: 14 }}
        className="absolute -right-3 bottom-1 rounded-md border-2 border-[#1aa05a] px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-[#1aa05a]"
      >Pagado</motion.span>
    </div>
  )
}

const VISUALS: Record<string, ReactNode> = { agenda: <Calendar />, dominio: <Domain />, recibos: <Receipt_ /> }

export function Extras() {
  return (
    <section id="extras" className="relative overflow-hidden bg-navy-2 py-24 sm:py-32">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal><h2 className="text-[clamp(2.4rem,6vw,4.5rem)]">{COPY.extras.title}</h2></Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {COPY.extras.items.map((it, i) => (
            <Reveal key={it.id} delay={i * 0.12}>
              <div className="glass group flex h-full flex-col rounded-[1.75rem] p-6 transition-transform duration-300 hover:-translate-y-1.5">
                <div className="grid h-44 place-items-center rounded-2xl bg-navy/60 p-5 ring-1 ring-white/10">{VISUALS[it.id]}</div>
                <h3 className="mt-6 text-xl font-bold leading-snug tracking-tight">{it.title}</h3>
                <span className="mt-4 inline-flex w-fit rounded-full bg-sky/15 px-4 py-1.5 text-sm font-bold text-sky ring-1 ring-sky/40">{it.price}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
