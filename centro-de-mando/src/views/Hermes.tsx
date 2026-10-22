import { ArrowUp, Loader2, RotateCcw, Wrench } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { api, enviar, SinSesion } from '@/api'
import { Markdown } from '@/components/Markdown'

type Mensaje = { de: 'jesel' | 'hermes' | 'error'; texto: string; herramientas?: string[]; en: number }
type Estado = { configurado: boolean; conversacion: string; mensajes: Mensaje[] }

const IDEAS = ['¿Qué tareas tienes para hoy?', 'Resúmeme lo que hiciste ayer.', 'Mándame el proyecto de ', '¿Qué está fallando en tus tareas programadas?']
const MAX = 2000
const hora = (ms: number) => new Date(ms).toLocaleTimeString('es-PR', { timeZone: 'America/Puerto_Rico', hour: 'numeric', minute: '2-digit' })

function SinConectar() {
  return (
    <section className="panel mt-8 max-w-2xl p-6">
      <h2 className="font-sans text-base font-semibold">El chat todavía no está conectado</h2>
      <p className="mt-2 text-sm text-white/70">Hermes trae una API para hablarle (la misma que usan sus apps). Hay que encenderla una vez en el VPS:</p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-white/80">
        <li>En el VPS: <code className="rounded bg-white/10 px-1.5 font-mono text-xs">bash vps-instalar.sh hermes-chat</code>. Crea la clave y te dice qué poner en Hermes.</li>
        <li>En Hermes: encender la API con esa clave, solo para el VPS (nunca abierta a internet: da acceso a la terminal).</li>
        <li>Volver aquí. El chat aparece solo.</li>
      </ol>
    </section>
  )
}

export function Hermes({ alSinSesion, abrir }: { alSinSesion: () => void; abrir: (ruta: string) => void }) {
  const [estado, setEstado] = useState<Estado | null>(null)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const fin = useRef<HTMLDivElement>(null)
  const caja = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    api<Estado>('/api/hermes/chat').then(setEstado).catch((e) => (e instanceof SinSesion ? alSinSesion() : setError(e.message)))
  }, [alSinSesion])
  useEffect(() => { fin.current?.scrollIntoView({ block: 'end' }) }, [estado?.mensajes.length, enviando])

  async function mandar(e?: FormEvent) {
    e?.preventDefault()
    const t = texto.trim()
    if (!t || enviando || !estado) return
    setEnviando(true)
    setError('')
    setTexto('')
    setEstado({ ...estado, mensajes: [...estado.mensajes, { de: 'jesel', texto: t, en: Date.now() }] })
    try {
      const r = await enviar<{ ok: true; mensaje: Mensaje }>('/api/hermes/chat', { texto: t })
      setEstado((s) => s && { ...s, mensajes: [...s.mensajes, r.mensaje] })
    } catch (err) {
      if (err instanceof SinSesion) return alSinSesion()
      const msg = (err as Error).message
      setEstado((s) => s && { ...s, mensajes: [...s.mensajes, { de: 'error', texto: msg, en: Date.now() }] })
    } finally {
      setEnviando(false)
      caja.current?.focus()
    }
  }

  async function nueva() {
    if (enviando) return
    try {
      await enviar('/api/hermes/chat/nueva', {})
      setEstado((s) => s && { ...s, mensajes: [] })
    } catch (err) {
      if (err instanceof SinSesion) alSinSesion()
      else setError((err as Error).message)
    }
  }

  const teclas = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      mandar()
    }
  }

  if (error && !estado) return <p className="text-red-300">{error}</p>
  if (!estado) return <p className="text-white/60">Cargando…</p>

  return (
    <div className="entra flex min-h-[calc(100dvh-8rem)] flex-col md:min-h-[calc(100dvh-5rem)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Hermes</p>
          <h1 className="mt-2 text-5xl">Háblale a Hermes.</h1>
        </div>
        {estado.configurado && estado.mensajes.length > 0 && (
          <button onClick={nueva} disabled={enviando} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-white/20 px-4 text-sm text-white/75 transition-colors hover:border-sky hover:text-white disabled:opacity-40">
            <RotateCcw className="size-4" aria-hidden /> Conversación nueva
          </button>
        )}
      </div>

      {!estado.configurado ? <SinConectar /> : (
        <>
          <div className="mt-6 flex-1 space-y-4" aria-live="polite">
            {estado.mensajes.length === 0 && (
              <div className="panel max-w-2xl p-6">
                <p className="text-white/80">Pídele lo que necesites. Si algo escribe, publica o envía, Hermes te lo deja en <button onClick={() => (location.hash = 'agentes')} className="cursor-pointer text-sky underline-offset-4 hover:underline">Agentes</button> para que lo apruebes.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {IDEAS.map((i) => (
                    <button key={i} onClick={() => { setTexto(i); caja.current?.focus() }} className="min-h-9 cursor-pointer rounded-full bg-white/8 px-3.5 text-sm text-white/80 transition-colors hover:bg-white/12 hover:text-white">
                      {i.trim()}{i.endsWith(' ') ? '…' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {estado.mensajes.map((m, i) =>
              m.de === 'jesel' ? (
                <div key={i} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-sky px-4 py-3 text-[15px] text-navy sm:max-w-[70%]">
                  <p className="whitespace-pre-wrap break-words">{m.texto}</p>
                  <p className="mt-1 text-right font-mono text-[10px] text-navy/60">{hora(m.en)}</p>
                </div>
              ) : m.de === 'error' ? (
                <p key={i} role="alert" className="w-fit max-w-[85%] rounded-2xl border border-red-300/30 bg-red-300/10 px-4 py-3 text-sm text-red-200">{m.texto}</p>
              ) : (
                <div key={i} className="panel w-fit max-w-[92%] px-5 py-4 sm:max-w-[80%]">
                  <div className="[&_.nota]:max-w-none [&_.nota]:text-[15px] [&_.nota_p:last-child]:mb-0"><Markdown texto={m.texto} onAbrir={abrir} /></div>
                  <p className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] text-white/45">
                    {hora(m.en)}
                    {m.herramientas?.length ? <span className="flex items-center gap-1"><Wrench className="size-3" aria-hidden /> usó {m.herramientas.join(', ')}</span> : null}
                  </p>
                </div>
              ),
            )}
            {enviando && (
              <p className="flex items-center gap-2 text-sm text-white/60"><Loader2 className="size-4 animate-spin text-sky" aria-hidden /> Hermes está trabajando… puede tardar un minuto si usa herramientas.</p>
            )}
            <div ref={fin} />
          </div>

          <form onSubmit={mandar} className="sticky bottom-3 mt-6">
            <div className="panel flex items-end gap-2 bg-navy-3/95 p-2 backdrop-blur">
              <label htmlFor="msj" className="sr-only">Mensaje para Hermes</label>
              <textarea
                id="msj"
                ref={caja}
                value={texto}
                onChange={(e) => setTexto(e.target.value.slice(0, MAX))}
                onKeyDown={teclas}
                rows={1}
                placeholder="Escríbele a Hermes…"
                className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] text-white outline-none placeholder:text-white/40 [field-sizing:content]"
              />
              <button type="submit" disabled={!texto.trim() || enviando} aria-label="Enviar" className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-sky text-navy transition-[transform,opacity] duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35">
                <ArrowUp className="size-5" aria-hidden />
              </button>
            </div>
            {texto.length > MAX * 0.9 && <p className="mt-1 text-right font-mono text-[11px] text-white/50">{texto.length}/{MAX}</p>}
          </form>
        </>
      )}
    </div>
  )
}
