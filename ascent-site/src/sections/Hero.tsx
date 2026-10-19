import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import SculptureHero from '@/components/ui/liquid-sculpture-hero'
import { whatsappUrl } from '@/config'
import { COPY } from '@/content'

/** Portada: "Liquid Sculpture Hero" (21st.dev) con el logo de Ascent como escultura. Se desvanece con parallax al hacer scroll. */
export function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.15])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94])
  const blur = useTransform(scrollYProgress, [0, 1], ['blur(0px)', 'blur(8px)'])
  return (
    <div ref={ref} id="inicio" className="ascent-hero relative">
      <motion.div style={{ y, opacity, scale, filter: blur }}>
        <SculptureHero
          src="/hero/logo-wide.webp"
          darkSrc="/hero/logo-wide.webp"
          mobileSrc="/hero/logo-tall.webp"
          mobileDarkSrc="/hero/logo-tall.webp"
          imageAlt="Logo de Ascent Co.: una A con una flecha"
          brand={COPY.brand}
          showNav={false}
          eyebrow=""
          body=""
          headline={`${COPY.hero.line1}\n${COPY.hero.line2}`}
          headlineAccent={COPY.hero.line2}
          primaryCta={{ label: COPY.hero.cta, href: whatsappUrl() || '#contacto' }}
          secondaryCta={{ label: COPY.hero.secondary, href: '#servicios' }}
          hint="Mueve el cursor sobre el logo"
          hintTouch="Toca el logo"
          theme="dark"
          themeToggle={false}
          background="#0B1E3C"
          darkBackground="#0B1E3C"
          textColor="#FFFFFF"
          accentColor="#4ABDF0"
          headingFont="'Instrument Serif', 'Times New Roman', serif"
          accentFont="'Instrument Serif', 'Times New Roman', serif"
          bodyFont="'Geist Variable', 'Geist', system-ui, sans-serif"
          loadFonts={false}
          backdropText=""
          showCredit={false}
          sculptureScale={0.88}
          sculptureY={4}
          particleDensity={1}
          strength={1.1}
        />
      </motion.div>
      <div aria-hidden className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
        <span className="eyebrow !text-white/50">Scroll</span>
        <span className="h-10 w-px overflow-hidden bg-white/15"><span className="block h-full w-full bg-sky motion-safe:animate-[line-pulse_2.2s_ease-in-out_infinite]" /></span>
      </div>
    </div>
  )
}
