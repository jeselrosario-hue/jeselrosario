import SculptureHero from '@/components/ui/liquid-sculpture-hero'
import { whatsappUrl } from '@/config'
import { COPY } from '@/content'

/** Portada: "Liquid Sculpture Hero" (21st.dev) con el logo de Ascent como escultura. */
export function Hero() {
  return (
    <div id="inicio" className="ascent-hero">
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
        headingFont="'Sora Variable', 'Sora', system-ui, sans-serif"
        accentFont="'Sora Variable', 'Sora', system-ui, sans-serif"
        bodyFont="'Sora Variable', 'Sora', system-ui, sans-serif"
        loadFonts={false}
        backdropText=""
        showCredit={false}
        sculptureScale={0.88}
        sculptureY={4}
        particleDensity={1}
        strength={1.1}
      />
    </div>
  )
}
