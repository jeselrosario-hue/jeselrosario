import { Home, Speaker } from 'lucide-react'
import { useApi } from '@/hooks'

type Casa =
  | { ok: false; configurado: boolean; error?: string; fallos?: number; resumen?: null }
  | {
      ok: true
      version: string
      lugar: string
      enEspera?: number
      google: { id: string; nombre: string; estado: string; titulo: string | null; app: string | null; cambio: string | null }[]
      resumen: { nombre: string; ultima: string | null; ultimoEstado: string | null; proxima: string | null; error: string | null } | null
    }

const hora = (iso: string | null) => (iso ? new Date(iso).toLocaleString('es-PR', { timeZone: 'America/Puerto_Rico', weekday: 'short', hour: 'numeric', minute: '2-digit' }) : '—')

/** Home Assistant y Google Home, solo lectura. No sale nada si no está conectado. */
export function Casa({ alSinSesion }: { alSinSesion: () => void }) {
  const { datos } = useApi<Casa>('/api/casa', alSinSesion, 120000)
  if (!datos || (!datos.ok && !datos.configurado)) return null
  return (
    <section className="panel mt-4 p-6">
      <h2 className="flex items-center gap-2 font-sans text-sm font-semibold"><Home className="size-4 text-sky" aria-hidden /> Casa y Google Home</h2>
      {!datos.ok ? (
        <p className="mt-3 text-sm text-amber-200">{datos.error} Lo vuelvo a intentar solo, cada vez con más espera.</p>
      ) : (
        <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="flex items-center gap-2 text-sm"><span aria-hidden className="size-2 rounded-full bg-emerald-400" />Home Assistant {datos.version}{datos.lugar ? ` · ${datos.lugar}` : ''}</p>
            {datos.resumen && (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                <p className="font-medium">{datos.resumen.nombre}</p>
                <p className="mt-0.5 font-mono text-[11px] text-white/55">última {hora(datos.resumen.ultima)} ({datos.resumen.ultimoEstado ?? '—'}) · próxima {hora(datos.resumen.proxima)}</p>
                {datos.resumen.error && <p className="mt-1 text-xs text-red-300">{datos.resumen.error.slice(0, 160)}</p>}
              </div>
            )}
          </div>
          <ul className="space-y-2">
            {datos.google.length === 0 ? <li className="text-sm text-white/55">No hay bocinas ni pantallas en Home Assistant.</li> : datos.google.map((g) => (
              <li key={g.id} className="flex items-center gap-3 text-sm">
                <Speaker className="size-4 shrink-0 text-white/50" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{g.nombre}</span>
                <span className="shrink-0 font-mono text-[11px] text-white/50">{g.estado === 'playing' ? `sonando${g.titulo ? `: ${g.titulo}` : ''}` : g.estado === 'off' || g.estado === 'unavailable' ? 'apagada' : 'lista'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
