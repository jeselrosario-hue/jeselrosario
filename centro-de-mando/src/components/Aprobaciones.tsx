import { Check, ShieldCheck, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { api, avisarPropuestas, enviar, SinSesion, type Propuesta } from '@/api'

const ETIQUETAS: Record<string, string> = { nombre: 'Cliente', paquete: 'Paquete', estado: 'Estado', portafolio: 'Portafolio', ruta: 'Archivo', instruccion: 'Instrucción' }

/** Bandeja de aprobaciones: nada que escriba o envíe corre sin que Jesel pulse Aprobar. */
export function Aprobaciones({ alSinSesion, vista, cliente, siempre = false }: { alSinSesion: () => void; vista?: string; cliente?: string; siempre?: boolean }) {
  const [lista, setLista] = useState<Propuesta[] | null>(null)
  const [ocupada, setOcupada] = useState<string | null>(null)
  const [avisos, setAvisos] = useState<Record<string, string>>({})
  const [ultimo, setUltimo] = useState<{ titulo: string; texto: string; ok: boolean } | null>(null)

  const cargar = useCallback(() => {
    api<{ propuestas: Propuesta[] }>('/api/propuestas')
      .then((d) => setLista(d.propuestas))
      .catch((e) => e instanceof SinSesion && alSinSesion())
  }, [alSinSesion])

  useEffect(() => {
    cargar()
    addEventListener('cdm:propuestas', cargar)
    const t = setInterval(cargar, 30000)
    return () => { removeEventListener('cdm:propuestas', cargar); clearInterval(t) }
  }, [cargar])

  async function decidir(p: Propuesta, aprobar: boolean) {
    setOcupada(p.id)
    try {
      const r = await enviar<{ ok: true; resultado?: { texto: string } }>('/api/propuestas/decidir', { id: p.id, aprobar })
      const texto = aprobar ? r.resultado?.texto || 'Hecho.' : 'Rechazada. No se hizo nada.'
      setAvisos((a) => ({ ...a, [p.id]: texto }))
      setUltimo({ titulo: p.titulo, texto, ok: aprobar })
    } catch (e) {
      if (e instanceof SinSesion) return alSinSesion()
      setAvisos((a) => ({ ...a, [p.id]: (e as Error).message }))
    } finally {
      setOcupada(null)
      avisarPropuestas()
    }
  }

  if (!lista) return null
  const mia = (p: Propuesta) => (!vista || p.vista === vista) && (!cliente || p.detalle.nombre === cliente)
  const pendientes = lista.filter((p) => (p.estado === 'pendiente' || p.estado === 'ejecutando') && mia(p))
  const recientes = lista.filter((p) => (p.estado === 'aprobada' || p.estado === 'rechazada') && mia(p)).slice(0, 5)
  if (!pendientes.length && !siempre && !ultimo) return null

  return (
    <section className="panel mt-6 border-amber-300/30 p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-sans text-sm font-semibold">
        <ShieldCheck className="size-4 text-amber-300" aria-hidden /> Esperan tu aprobación <span className="font-mono text-white/45">{pendientes.length}</span>
      </h2>
      {ultimo && (
        <p role="status" className={`mt-3 rounded-xl px-3.5 py-2.5 text-sm ${ultimo.ok ? 'bg-emerald-300/10 text-emerald-100' : 'bg-white/5 text-white/70'}`}>
          <span className="font-medium">{ultimo.ok ? 'Aprobada' : 'Rechazada'}:</span> {ultimo.titulo}. {ultimo.texto}
        </p>
      )}
      {pendientes.length === 0 ? <p className="mt-3 text-sm text-white/55">Nada pendiente.</p> : (
        <ul className="mt-4 grid gap-3">
          {pendientes.map((p) => (
            <li key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="font-medium">{p.titulo}</p>
              <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
                {Object.entries(p.detalle).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-white/50">{ETIQUETAS[k] ?? k}</dt>
                    <dd className="break-words text-white/85">{k === 'ruta' ? <code className="font-mono text-xs">{v}</code> : v}</dd>
                  </div>
                ))}
              </dl>
              {(avisos[p.id] || p.error) && <p role="alert" className="mt-2 text-sm text-red-300">{avisos[p.id] || p.error}</p>}
              <div className="mt-3 flex gap-2">
                <button onClick={() => decidir(p, true)} disabled={ocupada !== null} className="flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full bg-sky px-4 text-sm font-semibold text-navy transition-[transform,opacity] duration-150 active:scale-[0.97] disabled:opacity-50">
                  <Check className="size-4" aria-hidden /> {ocupada === p.id ? 'Haciendo…' : 'Aprobar'}
                </button>
                <button onClick={() => decidir(p, false)} disabled={ocupada !== null} className="flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-white/20 px-4 text-sm text-white/80 transition-colors hover:border-red-300 hover:text-red-200 disabled:opacity-50">
                  <X className="size-4" aria-hidden /> Rechazar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {recientes.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-white/55">Decididas hace poco ({recientes.length})</summary>
          <ul className="mt-2 space-y-1.5 text-sm">
            {recientes.map((p) => (
              <li key={p.id} className="flex gap-2 text-white/65">
                <span className={p.estado === 'aprobada' ? 'text-emerald-300' : 'text-white/40'}>{p.estado === 'aprobada' ? 'Aprobada' : 'Rechazada'}</span>
                <span className="min-w-0 truncate">{p.titulo}{avisos[p.id] || p.resultado?.texto ? ` · ${avisos[p.id] || p.resultado?.texto}` : ''}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
