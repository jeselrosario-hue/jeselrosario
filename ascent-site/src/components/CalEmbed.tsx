import { useEffect, useRef, useState } from 'react'

/**
 * Reserva de citas con Cal.com (plan gratis), embebida en la página.
 *
 * Es la pieza del paquete "Agenda y citas": se pone en el sitio del cliente
 * con su propio enlace de Cal.com y queda reservando sin salir de la página.
 *
 * - `link` es el tramo que va después de cal.com (por ejemplo "fadelab/corte").
 * - Si `link` viene vacío no carga nada y se muestra `fallback`, así el sitio
 *   nunca queda roto mientras no haya cuenta.
 * - El script se carga solo cuando el bloque entra en pantalla.
 */
type Props = {
  link: string
  /** Colores de marca del cliente, en hex sin '#'. */
  brandColor?: string
  height?: number
  className?: string
  fallback?: React.ReactNode
}

declare global {
  interface Window {
    Cal?: ((...args: unknown[]) => void) & { ns?: Record<string, (...args: unknown[]) => void>; loaded?: boolean; q?: unknown[] }
  }
}

/**
 * Carga el script oficial (patrón de arranque de Cal.com): se crea una cola `Cal`,
 * y el script real la ejecuta al cargar. Una sola vez por página.
 */
function loadCal(): Promise<NonNullable<Window['Cal']>> {
  if (!window.Cal) {
    const cola: unknown[] = []
    const stub = ((...args: unknown[]) => {
      if (!stub.loaded) {
        stub.ns = {}
        stub.loaded = true
        const s = document.createElement('script')
        s.src = 'https://app.cal.com/embed/embed.js'
        s.async = true
        s.dataset.calEmbed = ''
        document.head.appendChild(s)
      }
      cola.push(args)
    }) as NonNullable<Window['Cal']>
    stub.q = cola
    window.Cal = stub
  }
  return Promise.resolve(window.Cal)
}

export function CalEmbed({ link, brandColor = '4ABDF0', height = 560, className = '', fallback = null }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'idle' | 'ready' | 'error'>('idle')

  useEffect(() => {
    const el = ref.current
    if (!link || !el) return
    let cancelled = false

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        io.disconnect()
        loadCal()
          .then((Cal) => {
            if (cancelled) return
            Cal('init', { origin: 'https://app.cal.com' })
            Cal('inline', { elementOrSelector: el, calLink: link, config: { theme: 'dark' } })
            Cal('ui', {
              theme: 'dark',
              cssVarsPerTheme: { dark: { 'cal-brand': `#${brandColor}` } },
              hideEventTypeDetails: false,
              layout: 'month_view',
            })
            setState('ready')
          })
          .catch(() => !cancelled && setState('error'))
      },
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => {
      cancelled = true
      io.disconnect()
    }
  }, [link, brandColor])

  if (!link || state === 'error') return <>{fallback}</>

  return (
    <div className={className}>
      <div
        ref={ref}
        style={{ minHeight: height }}
        className="overflow-hidden rounded-2xl bg-navy/70 ring-1 ring-white/10"
        aria-label="Reservar una cita"
      />
      {state === 'idle' && <p className="mt-3 text-center font-mono text-xs uppercase tracking-widest text-white/45">Cargando el calendario…</p>}
    </div>
  )
}
