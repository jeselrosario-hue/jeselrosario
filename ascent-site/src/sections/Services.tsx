import { Globe, Image as ImageIcon, MessageSquareText, QrCode, Smartphone, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { InstagramIcon, WhatsAppIcon } from '@/components/BrandIcons'
import { GlassFolder } from '@/components/GlassFolder'
import { BrowserSite } from '@/components/mockups/BrowserSite'
import { QrCard } from '@/components/mockups/QrCard'
import { Reveal } from '@/components/Reveal'
import { COPY } from '@/content'

const S = COPY.services

function Chip({ icon, children }: { icon: ReactNode; children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15 [&_svg]:size-3.5 [&_svg]:text-sky">
      {icon} {children}
    </span>
  )
}

function Price({ value, line }: { value: string; line: string }) {
  return (
    <>
      <span className="text-glow block text-[2.6rem] font-extrabold leading-none tracking-tighter text-sky sm:text-5xl">{value}</span>
      <span className="mt-1.5 block text-sm text-white/80">{line}</span>
    </>
  )
}

function MiniBio() {
  return (
    <div className="glass w-[62%] max-w-[15rem] rounded-3xl p-4 shadow-2xl">
      <div className="mx-auto size-14 rounded-full border-2 border-sky bg-cover bg-center" style={{ backgroundImage: 'url(/examples/lowfade.webp)' }} />
      <div className="mx-auto mt-2 h-2 w-20 rounded-full bg-white/80" />
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-center gap-1.5 rounded-full bg-sky py-1.5 text-[10px] font-bold text-navy"><WhatsAppIcon className="size-3.5" /> WhatsApp</div>
        <div className="flex items-center justify-center gap-1.5 rounded-full bg-white/15 py-1.5 text-[10px] font-semibold"><InstagramIcon className="size-3.5" /> Instagram</div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {['navaja', 'estudio', 'taper'].map((n) => (
          <div key={n} className="aspect-square rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(/examples/${n}.webp)` }} />
        ))}
      </div>
    </div>
  )
}

export function Services() {
  return (
    <section id="servicios" className="relative overflow-hidden bg-navy py-24 sm:py-32">
      <div aria-hidden className="absolute -left-40 top-20 size-[34rem] rounded-full bg-sky/15 blur-[130px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[clamp(2.4rem,6vw,4.5rem)]">{S.title}</h2>
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"><Sparkles className="size-4 text-sky" aria-hidden /> {S.sub}</span>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-3 lg:gap-8">
          <GlassFolder index={0} title={S.bio.name} art={<MiniBio />}>
            <Price value={S.bio.price} line={S.bio.line} />
            <span className="mt-3 flex flex-wrap gap-2">
              <Chip icon={<WhatsAppIcon />}>{S.bio.chips[0]}</Chip>
              <Chip icon={<InstagramIcon />}>{S.bio.chips[1]}</Chip>
              <Chip icon={<ImageIcon />}>{S.bio.chips[2]}</Chip>
            </span>
          </GlassFolder>

          <GlassFolder index={1} title={S.site.name} featured badge={S.featured} art={<div className="w-full max-w-[22rem] -rotate-2"><BrowserSite bubble url="tuservicio.netlify.app" /></div>}>
            <Price value={S.site.price} line={S.site.line} />
            <span className="mt-3 flex flex-wrap gap-2">
              <Chip icon={<WhatsAppIcon />}>{S.site.chips[0]}</Chip>
              <Chip icon={<InstagramIcon />}>{S.site.chips[1]}</Chip>
              <Chip icon={<MessageSquareText />}>{S.site.chips[2]}</Chip>
            </span>
          </GlassFolder>

          <GlassFolder index={2} title={S.qr.name} art={<div className="w-[78%] max-w-[17rem] rotate-3"><QrCard interactive={false} /></div>}>
            <span className="block text-sm text-white/80">{S.qr.line}</span>
            <span className="mt-3 grid grid-cols-3 gap-2">
              {S.qr.tiers.map((t, i) => (
                <span key={t.price} className="rounded-2xl bg-white/10 px-2 py-2.5 text-center ring-1 ring-white/15">
                  <span className="mx-auto mb-1 block w-fit text-sky [&_svg]:size-4">{[<QrCode key="a" />, <Smartphone key="b" />, <Globe key="c" />][i]}</span>
                  <span className="text-glow block text-2xl font-extrabold leading-none tracking-tighter text-sky">{t.price}</span>
                  <span className="mt-1 block text-[10px] font-semibold leading-tight text-white/80">{t.label}</span>
                </span>
              ))}
            </span>
          </GlassFolder>
        </div>
      </div>
    </section>
  )
}
