import { motion } from 'motion/react'
import { Reveal } from '@/components/Reveal'
import { SplitText } from '@/components/motion/SplitText'
import { COPY } from '@/content'

/**
 * Galería en columnas que suben y bajan (patrón "Testimonials Columns").
 * Si hay reseñas reales en COPY.testimonials se muestran como citas;
 * si no, la galería muestra solo trabajos visuales (no se inventan reseñas).
 */
type Card = { kind: 'img'; src: string; alt: string } | { kind: 'quote'; name: string; role: string; quote: string }

const IMAGES: Card[] = [
  { kind: 'img', src: '/mockups/site.webp', alt: 'Sitio web de ejemplo' },
  { kind: 'img', src: '/mockups/phone.webp', alt: 'Página de presentación en un teléfono' },
  { kind: 'img', src: '/mockups/qr20.webp', alt: 'Tarjeta con QR' },
  { kind: 'img', src: '/mockups/fotos.webp', alt: 'Galería de fotos' },
  { kind: 'img', src: '/mockups/chat.webp', alt: 'Mensaje de WhatsApp listo' },
  { kind: 'img', src: '/mockups/links.webp', alt: 'Enlaces de contacto' },
  { kind: 'img', src: '/mockups/qr10.webp', alt: 'Tarjeta QR con sitio web' },
  { kind: 'img', src: '/mockups/qr15.webp', alt: 'Tarjeta QR con presentación' },
  { kind: 'img', src: '/mockups/site.webp', alt: 'Sitio web de ejemplo' },
]

function QuoteCard({ c }: { c: Extract<Card, { kind: 'quote' }> }) {
  return (
    <figure className="glass rounded-3xl p-6">
      <blockquote className="font-display text-2xl leading-tight">“{c.quote}”</blockquote>
      <figcaption className="mt-4 text-sm text-white/70"><span className="font-semibold text-white">{c.name}</span> · {c.role}</figcaption>
    </figure>
  )
}

function Column({ cards, duration, reverse = false, className = '' }: { cards: Card[]; duration: number; reverse?: boolean; className?: string }) {
  const loop = [...cards, ...cards]
  return (
    <div className={className}>
      <motion.ul
        animate={{ y: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
        className="flex flex-col gap-5 pb-5"
      >
        {loop.map((c, i) => (
          <li key={i} aria-hidden={i >= cards.length}>
            {c.kind === 'img' ? (
              <img src={c.src} alt={i >= cards.length ? '' : c.alt} width={1088} height={736} loading="lazy" className="w-full rounded-3xl border border-white/10 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.7)]" />
            ) : (
              <QuoteCard c={c} />
            )}
          </li>
        ))}
      </motion.ul>
    </div>
  )
}

export function Gallery() {
  const quotes: Card[] = COPY.testimonials.map((t) => ({ kind: 'quote', ...t }))
  const pool = quotes.length ? [...quotes, ...IMAGES] : IMAGES
  const cols: Card[][] = [[], [], []]
  pool.forEach((c, i) => cols[i % 3].push(c))
  return (
    <section id="galeria" className="relative overflow-hidden bg-navy py-28 sm:py-40">
      <div aria-hidden className="absolute left-1/2 top-1/2 size-[50rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky/12 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <p className="eyebrow mb-5">{COPY.eyebrows.galeria}</p>
        <SplitText as="h2" text={COPY.gallery.title} className="display-lg" accent={['galería']} />
        <Reveal>
          <div className="mt-14 grid h-[min(78vh,46rem)] grid-cols-2 gap-5 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)] md:grid-cols-3">
            <Column cards={cols[0]} duration={46} />
            <Column cards={cols[1]} duration={58} reverse />
            <Column cards={cols[2]} duration={50} className="hidden md:block" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
