import { motion, type Variants } from 'motion/react'
import { DrawLine } from '@/components/motion/DrawLine'
import { SplitText } from '@/components/motion/SplitText'
import { COPY } from '@/content'

interface Trabajo {
  nombre: string
  linea: string
  paquete: string
  demo: boolean
  url: string
  urlTexto?: string
  desktop: string
  movil: string
  alt: string
}

const ease = [0.22, 1, 0.36, 1] as const

/** Texto de la tarjeta: entra en un solo bloque cuando la ventana ya está en su sitio. */
const texto: Variants = { hidden: { opacity: 0, transform: 'translateY(18px)' }, shown: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.6, delay: 0.25, ease } } }
/** El teléfono sube y se apoya sobre la ventana, un poco después. */
const telefono: Variants = { hidden: { opacity: 0, transform: 'translateY(48px)' }, shown: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.6, delay: 0.35, ease } } }
/**
 * La ventana llega desde su lado (izquierda o derecha, alternando) y el teléfono sube después.
 * Se anima `transform` entero (no x/y sueltos) para que Motion lo pase al compositor.
 */
const ventana = (side: number): Variants => ({
  hidden: { opacity: 0, transform: `translateX(${side * 12}%)` },
  shown: { opacity: 1, transform: 'translateX(0%)', transition: { duration: 0.8, ease } },
})

function Ventana({ t }: { t: Trabajo }) {
  return (
    <div className="relative">
      <div data-ui className="overflow-hidden rounded-2xl border border-white/15 bg-[#050d1c] shadow-[0_30px_80px_-24px_rgb(0_0_0/0.8)]">
        <div className="flex items-center gap-1.5 bg-[#0a1a36] px-3 py-2">
          <span className="size-2 rounded-full bg-white/25" /><span className="size-2 rounded-full bg-white/25" /><span className="size-2 rounded-full bg-white/25" />
          {(t.urlTexto ?? t.url) && <span className="mx-auto w-3/5 truncate rounded-full bg-white/10 px-3 py-0.5 text-center text-[10px] text-white/70">{t.urlTexto ?? t.url}</span>}
        </div>
        <img src={t.desktop} alt={t.alt} width={960} height={600} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover object-top" />
      </div>
      {t.movil && (
        <motion.div variants={telefono} data-ui className="absolute -bottom-6 right-4 w-[26%] min-w-24 overflow-hidden rounded-[1.4rem] border-[5px] border-[#0a1a36] bg-[#050d1c] shadow-[0_24px_60px_-16px_rgb(0_0_0/0.85)] sm:right-6">
          <img src={t.movil} alt="" width={320} height={693} loading="lazy" decoding="async" className="w-full" />
        </motion.div>
      )}
    </div>
  )
}

function Tarjeta({ t, flip }: { t: Trabajo; flip: boolean }) {
  const body = (
    <motion.div variants={texto} className={`flex flex-col justify-center ${flip ? 'lg:order-first' : ''}`}>
      <h3 className="font-display text-4xl leading-tight sm:text-5xl">{t.nombre}</h3>
      <p className="mt-4 max-w-md text-lg text-white/75">{t.linea}</p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium">{t.paquete}</span>
        {t.demo && <span className="rounded-full bg-sky px-3 py-1 text-sm font-semibold text-navy">{COPY.trabajos.demo}</span>}
      </div>
      {t.url && (
        <a href={`https://${t.url}`} target="_blank" rel="noopener noreferrer" aria-label={`${COPY.trabajos.ver}: ${t.nombre}`} className="mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-semibold transition-[transform,background-color] duration-150 ease-out hover:bg-white/15 active:scale-[0.97]">
          {COPY.trabajos.ver} <span aria-hidden>↗</span>
        </a>
      )}
    </motion.div>
  )
  return (
    <motion.article initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.3 }} className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <motion.div variants={ventana(flip ? 1 : -1)} className="pb-8"><Ventana t={t} /></motion.div>
      {body}
    </motion.article>
  )
}

export function Trabajos() {
  return (
    <section id="trabajos" className="relative overflow-hidden bg-navy py-28 sm:py-40">
      <div aria-hidden className="absolute -left-40 top-1/3 size-[40rem] rounded-full bg-sky/10 blur-[140px]" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <p className="eyebrow mb-5">{COPY.eyebrows.trabajos}</p>{/* taste-skill-ignore: numeración 01–08 del sitio entero; quitarla solo aquí dejaría un hueco */}
        <SplitText as="h2" text={COPY.trabajos.title} className="display-lg" accent={['Trabajos']} />
        <DrawLine className="mt-4 w-44 text-sky sm:w-64" delay={0.5} />
        <p className="mt-6 max-w-xl text-lg text-white/70">{COPY.trabajos.sub}</p>
        <div className="mt-20 flex flex-col gap-28 sm:gap-36">
          {(COPY.trabajos.items as ReadonlyArray<Trabajo>).map((t, i) => <Tarjeta key={t.nombre} t={t} flip={i % 2 === 1} />)}
        </div>
      </div>
    </section>
  )
}
