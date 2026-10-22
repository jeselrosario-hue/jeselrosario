import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { Magnetic } from '@/components/motion/Magnetic'
import SculptureHero from '@/components/ui/liquid-sculpture-hero'
import { COPY } from '@/content'

/**
 * La flecha del logo sigue subiendo: una estela punteada que se dibuja con el scroll
 * y una punta que la recorre. Solo transform: la ventana (overflow oculto) se desliza
 * a la derecha y su contenido en sentido contrario, así la línea queda quieta y "aparece".
 */
function Trayectoria({ progress }: { progress: MotionValue<number> }) {
  const draw = useTransform(progress, [0, 0.6], [0.18, 1], { clamp: true })
  const outer = useTransform(draw, (d) => `${(d - 1) * 100}%`)
  const inner = useTransform(draw, (d) => `${(1 - d) * 100}%`)
  const headX = useTransform(draw, (d) => `${d * 100}%`)
  const headY = useTransform(draw, (d) => `${-d * 100}%`)
  return (
    <div aria-hidden className="pointer-events-none absolute right-[5%] top-[13%] hidden h-[30%] w-[22%] overflow-hidden md:block">
      {/* La punta se mueve dentro de este margen; el overflow de arriba evita que ensanche la página. */}
      <div className="absolute inset-3">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div className="absolute inset-0" style={{ x: outer }}>
            <motion.svg className="absolute inset-0 size-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ x: inner }}>
              <line x1="0" y1="100" x2="100" y2="0" stroke="#4ABDF0" strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </motion.svg>
          </motion.div>
        </div>
        <motion.div className="absolute inset-0" style={{ x: headX, y: headY }}>
          <svg className="absolute -bottom-2 -left-2 size-4 rotate-[-45deg] text-sky" viewBox="0 0 16 16" fill="none">
            <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </div>
    </div>
  )
}

/** Portada: "Liquid Sculpture Hero" (21st.dev) con el logo de Ascent como escultura. Se desvanece con parallax al hacer scroll. */
export function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.15])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94])
  return (
    <div ref={ref} id="inicio" className="ascent-hero relative">
      <motion.div style={{ y, opacity, scale }}>
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
          primaryCta={{ label: COPY.hero.cta, href: '#cotiza' }}
          ctaWrap={(cta) => <Magnetic strength={0.22}>{cta}</Magnetic>}
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
      <Trayectoria progress={scrollYProgress} />
    </div>
  )
}
