import { motion, AnimatePresence } from 'motion/react'
import { Check } from 'lucide-react'
import { useMemo, useState } from 'react'
import { WhatsAppIcon } from '@/components/BrandIcons'
import { Reveal } from '@/components/Reveal'
import { SplitText } from '@/components/motion/SplitText'
import { Button } from '@/components/ui/button'
import { LINKS, WHATSAPP_MESSAGE } from '@/config'
import { COPY } from '@/content'

const Q = COPY.quote
type Id = (typeof Q.items)[number]['id']

/** Precio de cada opción. `from` abierto = "desde". `quote` = se cotiza aparte. */
const RULES: Record<Id, { lo: number; hi: number; open?: boolean; quote?: boolean; needs?: Id }> = {
  qr: { lo: 20, hi: 20 },
  bio: { lo: 35, hi: 50 },
  site: { lo: 50, hi: 70 },
  agenda: { lo: 85, hi: 85, open: true, needs: 'site' },
  dominio: { lo: 100, hi: 100, open: true, needs: 'site' },
  recibos: { lo: 0, hi: 0, quote: true },
}

function money(n: number) {
  return '$' + n.toLocaleString('en-US')
}

export function Quote() {
  const [sel, setSel] = useState<Id[]>(['site'])

  function toggle(id: Id) {
    setSel((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id && RULES[x].needs !== id)
      const needs = RULES[id].needs
      return needs && !prev.includes(needs) ? [...prev, needs, id] : [...prev, id]
    })
  }

  const bill = useMemo(() => {
    const has = (id: Id) => sel.includes(id)
    const lines = Q.items
      .filter((it) => has(it.id))
      .map((it) => {
        const r = RULES[it.id]
        if (it.id === 'qr') {
          const price = has('site') ? 10 : has('bio') ? 15 : 20
          const note = has('site') ? Q.bundle.site : has('bio') ? Q.bundle.bio : ''
          return { id: it.id, name: it.name, note, lo: price, hi: price, open: false, quote: false }
        }
        return { id: it.id, name: it.name, note: '', lo: r.lo, hi: r.hi, open: !!r.open, quote: !!r.quote }
      })
    const lo = lines.reduce((s, l) => s + l.lo, 0)
    const hi = lines.reduce((s, l) => s + l.hi, 0)
    const open = lines.some((l) => l.open)
    const quote = lines.some((l) => l.quote)
    const total = !lines.length ? Q.empty : open || (quote && lo > 0) ? `${Q.from} ${money(lo)}` : lo === hi ? money(lo) : `${money(lo)} – ${money(hi)}`
    return { lines, total, onlyQuote: lines.length > 0 && lo === 0 }
  }, [sel])

  const message = bill.lines.length
    ? `${Q.waPrefix} ${bill.lines.map((l) => l.name).join(' + ')}. ${Q.waTotal} ${bill.onlyQuote ? Q.toQuote : bill.total}.`
    : WHATSAPP_MESSAGE
  const wa = LINKS.whatsapp.trim()
  const href = !wa ? '' : /^https?:\/\//i.test(wa) ? wa : `https://wa.me/${wa.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`

  return (
    <section id="cotiza" className="relative overflow-hidden bg-navy-3 py-28 sm:py-40">
      <div aria-hidden className="absolute -right-32 top-1/3 size-[32rem] rounded-full bg-sky/12 blur-[130px]" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <p className="eyebrow mb-5">{COPY.eyebrows.cotiza}</p>
        <SplitText as="h2" text={Q.title} className="display-lg" accent={['cuesta.']} />
        <Reveal delay={0.15}>
          <p className="mt-5 max-w-md text-white/70">{Q.sub}</p>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* Opciones */}
          <Reveal className="min-w-0">
            <ul className="flex flex-col gap-3">
              {Q.items.map((it) => {
                const on = sel.includes(it.id)
                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      onClick={() => toggle(it.id)}
                      aria-pressed={on}
                      className={`group flex w-full min-w-0 items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-[background-color,border-color,transform] duration-200 ${on ? 'border-sky/70 bg-sky/12' : 'border-white/14 bg-white/[0.04] hover:border-white/30 hover:bg-white/[0.07]'}`}
                    >
                      <span className={`grid size-6 shrink-0 place-items-center rounded-lg border-2 transition-colors ${on ? 'border-sky bg-sky text-navy' : 'border-white/35 text-transparent'}`} aria-hidden>
                        <Check className="size-4" strokeWidth={3.5} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{it.name}</span>
                        <span className="block text-sm text-white/60">{it.line}</span>
                      </span>
                      <span className="shrink-0 font-mono text-xs uppercase tracking-wider text-white/55">{it.tag}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </Reveal>

          {/* Cotización */}
          <Reveal delay={0.1} className="min-w-0">
            <div className="quote-slip relative overflow-hidden rounded-3xl bg-[#f6f4ee] p-7 text-navy shadow-[0_40px_90px_-30px_rgb(0_0_0/0.75)] sm:p-9">
              <div className="flex items-baseline justify-between gap-3 border-b border-navy/15 pb-4">
                <span className="font-display text-2xl">{Q.slip.title}</span>
                <span className="font-mono text-[11px] uppercase tracking-widest text-navy/55">{Q.slip.meta}</span>
              </div>

              <ul className="min-h-[7.5rem] py-5 font-mono text-[13px]">
                <AnimatePresence initial={false} mode="popLayout">
                  {bill.lines.map((l) => (
                    <motion.li
                      key={l.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-baseline gap-2 py-1.5"
                    >
                      <span className="shrink-0">{l.name}</span>
                      {l.note && <span className="shrink-0 text-navy/50">{l.note}</span>}
                      <span aria-hidden className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-navy/35" />
                      <span className="shrink-0 tabular-nums">{l.quote ? Q.toQuote : l.open ? `${Q.from} ${money(l.lo)}` : l.lo === l.hi ? money(l.lo) : `${money(l.lo)}–${money(l.hi)}`}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
                {!bill.lines.length && <li className="py-1.5 text-navy/45">{Q.slip.none}</li>}
              </ul>

              <div className="border-t border-navy/15 pt-5">
                <div className="flex items-end justify-between gap-4">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-navy/55">{Q.slip.total}</span>
                  <motion.span key={bill.total} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="text-right font-display text-[clamp(2.2rem,7vw,3.4rem)] leading-none tabular-nums">
                    {bill.onlyQuote ? Q.toQuote : bill.total}
                  </motion.span>
                </div>
                <p className="mt-3 font-mono text-[11px] leading-relaxed text-navy/55">{Q.slip.terms}</p>
              </div>

              <div className="mt-6">
                <Button
                  variant="primary"
                  size="lg"
                  href={href || undefined}
                  aria-disabled={href ? undefined : true}
                  target={href ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <WhatsAppIcon /> {Q.cta}
                  {!href && <span className="font-mono text-[10px] uppercase tracking-wider opacity-80">· {COPY.closing.soon}</span>}
                </Button>
                <p className="mt-3 text-center font-mono text-[11px] text-navy/50">{Q.slip.foot}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
