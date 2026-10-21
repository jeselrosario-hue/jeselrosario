import { motion, useScroll, useTransform } from 'motion/react'
import { useRef, type ComponentType, type SVGProps } from 'react'
import { Mail } from 'lucide-react'
import { FacebookIcon, InstagramIcon } from '@/components/BrandIcons'
import { DrawLine } from '@/components/motion/DrawLine'
import { Magnetic } from '@/components/motion/Magnetic'
import { SplitText } from '@/components/motion/SplitText'
import { Button } from '@/components/ui/button'
import { linkFor, LINKS } from '@/config'
import { COPY } from '@/content'

const ITEMS: Array<{ key: keyof typeof LINKS; Icon: ComponentType<SVGProps<SVGSVGElement>>; primary?: boolean }> = [
  { key: 'instagram', Icon: InstagramIcon, primary: true },
  { key: 'facebook', Icon: FacebookIcon },
  { key: 'email', Icon: Mail },
]

export function Closing() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const wy = useTransform(scrollYProgress, [0, 1], ['25%', '0%'])
  const wo = useTransform(scrollYProgress, [0.3, 1], [0, 1])
  return (
    <section ref={ref} id="contacto" className="relative isolate overflow-hidden bg-navy-2 pt-32 text-center sm:pt-48">
      <div aria-hidden className="absolute left-1/2 top-[38%] -z-10 size-[48rem] -translate-x-1/2 -translate-y-1/2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="absolute inset-0 rounded-full border border-sky/30 animate-[ripple_6s_ease-out_infinite]" style={{ animationDelay: `${i * 2}s` }} />
        ))}
        <span className="absolute inset-[24%] rounded-full bg-sky/25 blur-[100px]" />
      </div>
      <div className="mx-auto max-w-5xl px-5">
        <p className="eyebrow mb-6">{COPY.eyebrows.contacto}</p>
        <SplitText as="h2" text={COPY.closing.title} className="display-xl" accent={['arrancamos']} />
        <DrawLine className="mx-auto mt-5 w-48 text-sky sm:w-72" delay={0.5} />
        <div className="mt-14 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
          {ITEMS.map(({ key, Icon, primary }) => {
            const href = linkFor(key)
            return (
              <Magnetic key={key} strength={0.28} className="sm:inline-block">
                <Button size="lg" variant={primary ? 'primary' : 'glass'} href={href || undefined} aria-disabled={href ? undefined : true} target={href ? '_blank' : undefined} rel="noopener noreferrer" role={href ? undefined : 'link'} className="w-full sm:w-auto">
                  <Icon /> {COPY.closing.buttons[key]}
                  {!href && <span className="font-mono text-[10px] uppercase tracking-wider opacity-80">· {COPY.closing.soon}</span>}
                </Button>
              </Magnetic>
            )
          })}
        </div>
      </div>
      <motion.p aria-hidden style={{ y: wy, opacity: wo }} className="mt-24 select-none bg-gradient-to-b from-white/35 to-transparent bg-clip-text text-center font-display text-[clamp(6rem,24vw,22rem)] leading-[0.78] text-transparent">
        Ascent Co.
      </motion.p>
      <footer className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/10 px-6 py-6 font-mono text-xs uppercase tracking-widest text-white/60 sm:px-10">
        <span>{COPY.footer}</span>
        <span className="flex items-center gap-2">
          <a href="/terminos/" className="rounded-full px-3 py-2 outline-none hover:text-sky focus-visible:ring-2 focus-visible:ring-sky">Términos</a>
          <a href="/privacidad/" className="rounded-full px-3 py-2 outline-none hover:text-sky focus-visible:ring-2 focus-visible:ring-sky">Privacidad</a>
          <a href="#inicio" className="rounded-full px-3 py-2 outline-none hover:text-sky focus-visible:ring-2 focus-visible:ring-sky">Subir ↑</a>
        </span>
      </footer>
    </section>
  )
}
