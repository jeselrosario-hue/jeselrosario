import { CAL_LINK } from '@/config'
import { elegir, usePermiso } from '@/lib/consent'

/**
 * Aviso de permisos. Solo aparece si el sitio carga algo de terceros (la agenda de Cal.com).
 * Sin agenda no hay nada que pedir, y no se muestra.
 */
export function CookieBanner() {
  const p = usePermiso()
  if (!CAL_LINK || p) return null
  return (
    <div role="dialog" aria-label="Permisos" className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-xl rounded-2xl bg-white p-3 text-navy shadow-2xl ring-1 ring-navy/15 sm:inset-x-4 sm:bottom-4 sm:p-5">
      <p className="text-xs leading-snug sm:text-sm sm:leading-relaxed">
        Sin cookies de seguimiento. La agenda de Cal.com solo se carga si lo permites.{' '}
        <a className="underline" href="/privacidad/">Privacidad</a>
      </p>
      <div className="mt-2 flex gap-2 sm:mt-4 sm:gap-3">
        <button type="button" onClick={() => elegir('no')} className="min-h-11 flex-1 cursor-pointer rounded-full border border-navy/30 px-4 text-sm font-semibold">Rechazar</button>
        <button type="button" onClick={() => elegir('si')} className="min-h-11 flex-1 cursor-pointer rounded-full bg-navy px-4 text-sm font-semibold text-white">Aceptar</button>
      </div>
    </div>
  )
}
