import { useInView } from 'motion/react'
import { Globe, QrCode, Smartphone, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Reveal } from '@/components/Reveal'
import { CountUp } from '@/components/motion/CountUp'
import { SplitText } from '@/components/motion/SplitText'
import GlassFolder, { type ArtRecipe, type FolderFile } from '@/components/ui/glass-folder-cards'
import { COPY } from '@/content'

const S = COPY.services

/** Arte de cada carpeta, en los azules de la marca. */
const ART: Record<'bio' | 'site' | 'qr', ArtRecipe> = {
  bio: { style: 'marble', colors: ['#071530', '#0B1E3C', '#11294D', '#1B4B8C', '#2f8fd0', '#0B1E3C', '#071530'], scale: 0.65, warp: 2.4, angle: -0.5, gloss: 0.45, veins: 0.4 },
  site: { style: 'streak', colors: ['#071530', '#11294D', '#1B4B8C', '#3aa6e0', '#1B4B8C', '#11294D', '#071530'], scale: 0.7, warp: 1.4, angle: -0.62, gloss: 0.3, veins: 0 },
  qr: { style: 'marble', colors: ['#050d1c', '#0B1E3C', '#11294D', '#2a6fc0', '#0B1E3C', '#2f8fd0', '#050d1c'], scale: 0.6, warp: 3, angle: -0.4, gloss: 0.55, veins: 0.5 },
}

const FILES: Record<'bio' | 'site' | 'qr', FolderFile[]> = {
  bio: [
    { name: 'Quién eres', image: '/mockups/phone.webp', href: '#contacto' },
    { name: 'Fotos y enlaces', image: '/mockups/fotos.webp', href: '#contacto' },
  ],
  site: [
    { name: 'Tu servicio', image: '/mockups/site.webp', href: '#contacto' },
    { name: 'Mensaje listo', image: '/mockups/chat.webp', href: '#contacto' },
  ],
  qr: [
    { name: S.qr.tiers[0].label, meta: S.qr.tiers[0].price, image: '/mockups/qr20.webp', href: '#contacto' },
    { name: S.qr.tiers[2].label, meta: S.qr.tiers[2].price, image: '/mockups/qr10.webp', href: '#contacto' },
  ],
}

/** Se abre sola al llegar a la vista (escalonada) y también con clic, toque o teclado. */
function Folder({ index, width, ...props }: { index: number; width: number } & React.ComponentProps<typeof GlassFolder>) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!inView) return
    const t = window.setTimeout(() => setOpen(true), 900 + index * 350)
    return () => window.clearTimeout(t)
  }, [inView, index])
  return (
    <div ref={ref} className="flex justify-center">
      <GlassFolder {...props} width={width} open={open} onOpenChange={setOpen} appear appearDelay={index * 180} tone="dark" action="none" />
    </div>
  )
}

/**
 * Ancho de cada carpeta. La carpeta dibuja sombra y abanico fuera de su caja
 * (~5% extra), así que en móvil se deja ese margen o la página se va de lado.
 */
function useColumnWidth() {
  const [s, setS] = useState({ w: 340, featured: 367 })
  useEffect(() => {
    const calc = () => {
      const wide = window.innerWidth >= 1024
      const w = Math.max(250, Math.min(380, wide ? Math.floor((Math.min(window.innerWidth, 1280) - 128) / 3) : Math.floor((window.innerWidth - 40) / 1.09)))
      setS({ w, featured: wide ? Math.min(420, Math.round(w * 1.08)) : w })
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])
  return s
}

function Price({ from, to }: { from: number; to: number }) {
  return (
    <div className="text-center">
      <span className="text-glow block font-display text-[5.5rem] leading-none tracking-tight text-sky tabular-nums">
        $<CountUp to={from} />–<CountUp to={to} />
      </span>
    </div>
  )
}

export function Services() {
  const { w, featured } = useColumnWidth()
  const tierIcons: ReactNode[] = [<QrCode key="a" />, <Smartphone key="b" />, <Globe key="c" />]
  return (
    <section id="servicios" className="relative overflow-hidden bg-navy py-28 sm:py-40">
      <div aria-hidden className="absolute -left-40 top-20 size-[34rem] rounded-full bg-sky/15 blur-[130px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-5">{COPY.eyebrows.servicios}</p>
            <SplitText as="h2" text={S.title} className="display-lg" accent={['paquetes']} />
          </div>
          <Reveal delay={0.3}>
            <span className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"><Sparkles className="size-4 text-sky motion-safe:animate-[spin-slow_8s_linear_infinite]" aria-hidden /> {S.sub}</span>
          </Reveal>
        </div>

        <div className="mt-16 grid items-start gap-14 lg:grid-cols-3 lg:gap-6">
          <div className="space-y-8">
            <Folder index={0} width={w} label={S.bio.name} meta={S.bio.line} art={ART.bio} seed={3} files={FILES.bio} />
            <Price from={35} to={50} />
          </div>

          <div className="relative space-y-8 lg:-translate-y-6">
            <div aria-hidden className="absolute inset-x-6 top-10 h-72 rounded-full bg-sky/30 blur-3xl" />
            <span className="relative z-10 mx-auto flex w-fit items-center gap-1.5 rounded-full bg-sky px-4 py-1.5 text-sm font-bold text-navy shadow-[0_0_30px_rgb(74_189_240/0.7)]"><Sparkles className="size-4" aria-hidden /> {S.featured}</span>
            <Folder index={1} width={featured} label={S.site.name} meta={S.site.line} art={ART.site} seed={11} files={FILES.site} />
            <Price from={50} to={70} />
          </div>

          <div className="space-y-8">
            <Folder index={2} width={w} label={S.qr.name} meta={S.qr.line} art={ART.qr} seed={7} files={FILES.qr} />
            <div className="mx-auto grid max-w-sm grid-cols-3 gap-2">
              {S.qr.tiers.map((t, i) => (
                <div key={t.price} className="glass rounded-2xl px-2 py-3 text-center">
                  <span className="mx-auto mb-1 block w-fit text-sky [&_svg]:size-4">{tierIcons[i]}</span>
                  <span className="text-glow block font-display text-4xl leading-none text-sky"><CountUp to={parseInt(t.price.slice(1), 10)} prefix="$" /></span>
                  <span className="mt-1 block text-[11px] font-semibold leading-tight text-white/80">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
