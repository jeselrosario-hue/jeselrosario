import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { linkFor, mailtoUrl } from '@/config'
import { COPY } from '@/content'

const F = COPY.quote.form
type Estado = 'listo' | 'enviando' | 'ok' | 'error'

const campo =
  'w-full rounded-xl border border-navy/25 bg-white px-4 py-3 text-[15px] text-navy outline-none placeholder:text-navy/40 focus-visible:border-navy focus-visible:ring-2 focus-visible:ring-sky'

/** Formulario de solicitud. Se guarda en Netlify Forms (nombre "solicitud", ver index.html). */
export function SolicitudForm({ paquetes, total }: { paquetes: string; total: string }) {
  const [estado, setEstado] = useState<Estado>('listo')

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (estado === 'enviando') return
    const form = e.currentTarget
    const fd = new FormData(form)
    const cuerpo = new URLSearchParams()
    cuerpo.set('form-name', 'solicitud')
    cuerpo.set('bot-field', String(fd.get('bot-field') ?? ''))
    cuerpo.set('nombre', String(fd.get('nombre') ?? '').trim().slice(0, 120))
    cuerpo.set('contacto', String(fd.get('contacto') ?? '').trim().slice(0, 160))
    cuerpo.set('mensaje', String(fd.get('mensaje') ?? '').trim().slice(0, 1000))
    cuerpo.set('paquetes', paquetes)
    cuerpo.set('total', total)
    setEstado('enviando')
    try {
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: cuerpo.toString() })
      setEstado(res.ok ? 'ok' : 'error')
      if (res.ok) form.reset()
    } catch {
      setEstado('error')
    }
  }

  const ig = linkFor('instagram')
  const correo = mailtoUrl()

  return (
    <form name="solicitud" onSubmit={enviar} className="mt-6 flex flex-col gap-3 border-t border-navy/15 pt-6">
      <p className="font-display text-xl">{F.title}</p>
      {/* Trampa para bots: las personas no la ven. */}
      <p aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          No llenar <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <label className="sr-only" htmlFor="sol-nombre">{F.name}</label>
      <input id="sol-nombre" name="nombre" required maxLength={120} autoComplete="name" placeholder={F.name} className={campo} />
      <label className="sr-only" htmlFor="sol-contacto">{F.contact}</label>
      <input id="sol-contacto" name="contacto" required maxLength={160} autoComplete="email" placeholder={F.contact} className={campo} />
      <label className="sr-only" htmlFor="sol-mensaje">{F.message}</label>
      <textarea id="sol-mensaje" name="mensaje" rows={3} maxLength={1000} placeholder={F.message} className={`${campo} resize-none`} />

      <button
        type="submit"
        disabled={estado === 'enviando' || estado === 'ok'}
        className="shimmer inline-flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-navy px-8 text-lg font-semibold text-white outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f4ee] disabled:cursor-not-allowed disabled:opacity-70 [&_svg]:size-5"
      >
        <Send /> {estado === 'enviando' ? F.sending : F.send}
      </button>

      <p role="status" aria-live="polite" className={`min-h-5 text-center text-sm ${estado === 'error' ? 'text-red-700' : 'text-navy'}`}>
        {estado === 'ok' && F.ok}
        {estado === 'error' && F.error}
      </p>

      <p className="text-center font-mono text-[11px] leading-relaxed text-navy/55">
        {F.consent} <a className="underline" href="/privacidad/">{F.privacy}</a> {F.and} <a className="underline" href="/terminos/">{F.terms}</a>.
      </p>
      {(ig || correo) && (
        <p className="text-center font-mono text-[11px] text-navy/55">
          {F.or}{' '}
          {ig && <a className="underline" href={ig} target="_blank" rel="noopener noreferrer">Instagram</a>}
          {ig && correo && ' · '}
          {correo && <a className="underline" href={correo}>Correo</a>}
        </p>
      )}
    </form>
  )
}
