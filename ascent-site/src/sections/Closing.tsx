import type { ComponentType, SVGProps } from 'react'
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '@/components/BrandIcons'
import { Reveal } from '@/components/Reveal'
import { Button } from '@/components/ui/button'
import { linkFor, LINKS } from '@/config'
import { COPY } from '@/content'

const ITEMS: Array<{ key: keyof typeof LINKS; Icon: ComponentType<SVGProps<SVGSVGElement>>; primary?: boolean }> = [
  { key: 'whatsapp', Icon: WhatsAppIcon, primary: true },
  { key: 'instagram', Icon: InstagramIcon },
  { key: 'facebook', Icon: FacebookIcon },
]

export function Closing() {
  return (
    <section id="contacto" className="relative isolate overflow-hidden bg-navy-2 py-28 text-center sm:py-40">
      <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 size-[44rem] -translate-x-1/2 -translate-y-1/2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="absolute inset-0 rounded-full border border-sky/30 motion-safe:animate-[ripple_6s_ease-out_infinite]" style={{ animationDelay: `${i * 2}s` }} />
        ))}
        <span className="absolute inset-[22%] rounded-full bg-sky/25 blur-[90px]" />
      </div>
      <div className="mx-auto max-w-4xl px-5">
        <Reveal><h2 className="text-glow text-[clamp(3rem,10vw,7rem)]">{COPY.closing.title}</h2></Reveal>
        <Reveal delay={0.15}>
          <div className="mt-12 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            {ITEMS.map(({ key, Icon, primary }) => {
              const href = linkFor(key)
              const label = COPY.closing.buttons[key]
              return (
                <Button
                  key={key}
                  size="lg"
                  variant={primary ? 'primary' : 'glass'}
                  href={href || undefined}
                  aria-disabled={href ? undefined : true}
                  target={href ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  role={href ? undefined : 'link'}
                >
                  <Icon /> {label}
                  {!href && <span className="text-xs font-medium opacity-80">· {COPY.closing.soon}</span>}
                </Button>
              )
            })}
          </div>
        </Reveal>
        <img src="/logo-light.png" alt="" width={1000} height={751} className="mx-auto mt-20 h-10 w-auto opacity-80" />
        <p className="mt-4 text-sm text-white/60">{COPY.footer}</p>
      </div>
    </section>
  )
}
