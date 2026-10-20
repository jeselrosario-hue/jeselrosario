import { Plus } from 'lucide-react'
import { Reveal } from '@/components/Reveal'
import { SplitText } from '@/components/motion/SplitText'
import { COPY } from '@/content'

/**
 * Preguntas frecuentes. Usa <details>, así que abre y cierra sin JavaScript
 * y Google puede leer las respuestas (el JSON-LD de index.html las repite).
 */
export function Faq() {
  return (
    <section id="preguntas" className="relative overflow-hidden bg-navy py-28 sm:py-40">
      <div aria-hidden className="absolute -left-32 bottom-0 size-[30rem] rounded-full bg-sky/10 blur-[130px]" />
      <div className="relative mx-auto max-w-4xl px-5 sm:px-8">
        <p className="eyebrow mb-5">{COPY.eyebrows.preguntas}</p>
        <SplitText as="h2" text={COPY.faq.title} className="display-lg" accent={['preguntas.']} />
        <ul className="mt-14 flex flex-col gap-3">
          {COPY.faq.items.map((it, i) => (
            <Reveal key={it.q} delay={i * 0.06}>
              <li>
                <details className="faq group rounded-2xl border border-white/14 bg-white/[0.04] transition-colors duration-200 open:border-sky/45 open:bg-sky/[0.07] hover:border-white/30">
                  <summary className="flex cursor-pointer list-none items-center gap-4 px-6 py-5 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2 focus-visible:ring-offset-navy">
                    <span className="flex-1">{it.q}</span>
                    <Plus aria-hidden className="size-5 shrink-0 text-sky transition-transform duration-300 group-open:rotate-45" />
                  </summary>
                  <p className="px-6 pb-6 pr-14 text-white/70">{it.a}</p>
                </details>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
