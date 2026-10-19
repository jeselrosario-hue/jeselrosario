import { motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { WhatsAppIcon } from '@/components/BrandIcons'
import { LiquidHero } from '@/components/LiquidHero'
import { Button } from '@/components/ui/button'
import { whatsappUrl } from '@/config'
import { COPY } from '@/content'

const ease = [0.22, 1, 0.36, 1] as const

export function Hero() {
  const wa = whatsappUrl()
  return (
    <section id="inicio" className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-navy pb-16 pt-24 lg:justify-center lg:pb-0">
      <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(60%_50%_at_75%_45%,rgb(74_189_240/0.22),transparent_70%),radial-gradient(50%_40%_at_10%_90%,rgb(17_41_77/0.9),transparent_70%)]" />
      <LiquidHero className="-z-10" />
      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <h1 className="max-w-[6.6em] text-[clamp(2.9rem,6.6vw,6rem)] max-sm:text-[clamp(2.9rem,13vw,4rem)]">
          <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.15 }} className="block">
            {COPY.hero.line1}
          </motion.span>
          <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.35 }} className="text-glow block text-sky">
            {COPY.hero.line2}
          </motion.span>
        </h1>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.65 }} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" href={wa || '#contacto'} target={wa ? '_blank' : undefined} rel="noopener noreferrer">
            <WhatsAppIcon /> {COPY.hero.cta}
          </Button>
          <Button size="lg" variant="glass" href="#servicios">
            {COPY.hero.secondary}
          </Button>
        </motion.div>
      </div>
      <a href="#ejemplos" aria-label="Seguir bajando" className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 rounded-full p-2 text-white/60 outline-none hover:text-sky focus-visible:ring-2 focus-visible:ring-sky lg:block">
        <ChevronDown className="size-7 motion-safe:animate-[float_2.4s_ease-in-out_infinite]" />
      </a>
    </section>
  )
}
