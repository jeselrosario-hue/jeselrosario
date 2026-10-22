import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { enviar, SinSesion, type HermesVivo, type Tarea } from '@/api'
import { haceCuanto, useApi } from '@/hooks'

const COLUMNAS: { id: string; nombre: string; color: string; estados: Tarea['estado'][] }[] = [
  { id: 'aprobacion', nombre: 'Necesita tu aprobación', color: '#fbbf24', estados: ['aprobacion'] },
  { id: 'haciendo', nombre: 'Haciendo', color: '#4abdf0', estados: ['haciendo'] },
  { id: 'pendiente', nombre: 'Pendiente', color: '#94a3b8', estados: ['pendiente'] },
  { id: 'listo', nombre: 'Listo', color: '#34d399', estados: ['listo', 'aprobada', 'rechazada'] },
]
const SELLO: Partial<Record<Tarea['estado'], { texto: string; clase: string }>> = {
  aprobada: { texto: 'Aprobada', clase: 'text-emerald-300' },
  rechazada: { texto: 'Rechazada', clase: 'text-red-300' },
}

const cuando = (iso: string | null) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-PR', { timeZone: 'America/Puerto_Rico', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}
const colorEstado = (e: string | null | undefined) => (e === 'ok' || e === 'connected' || e === 'running' ? '#34d399' : e === 'retrying' || e === 'connecting' ? '#fbbf24' : '#f87171')

function HermesEnVivo({ alSinSesion }: { alSinSesion: () => void }) {
  const { datos } = useApi<HermesVivo>('/api/hermes', alSinSesion, 30000)
  if (!datos) return null
  if (!datos.ok) {
    return (
      <section className="panel mt-8 p-5">
        <h2 className="font-sans text-sm font-semibold">Hermes en vivo</h2>
        <p className="mt-2 text-sm text-white/65">{datos.configurado ? datos.error : 'Sin conectar. Falta HERMES_URL, HERMES_USER y HERMES_PASS en el servidor.'}</p>
      </section>
    )
  }
  return (
    <section className="mt-8 grid gap-4 xl:grid-cols-3">
      <div className="panel p-5 xl:col-span-1">
        <h2 className="font-sans text-sm font-semibold">Hermes en vivo <span className="font-mono text-white/45">v{datos.version}</span></h2>
        <p className="mt-3 flex items-center gap-2 text-sm"><span className="size-2.5 rounded-full" style={{ background: colorEstado(datos.gateway) }} />Gateway: {datos.gateway}</p>
        <ul className="mt-3 space-y-2">
          {datos.plataformas.map((p) => (
            <li key={p.nombre} className="flex items-center gap-2 text-sm text-white/80"><span className="size-2 rounded-full" style={{ background: colorEstado(p.estado) }} />{p.nombre}<span className="font-mono text-[11px] text-white/45">{p.estado}</span></li>
          ))}
        </ul>
      </div>
      <div className="panel p-5 xl:col-span-2">
        <h2 className="font-sans text-sm font-semibold">Tareas programadas <span className="font-mono text-white/45">{datos.tareas.length}</span></h2>
        <ul className="mt-3 space-y-2">
          {datos.tareas.map((t) => (
            <li key={t.nombre} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <span className="flex items-center gap-2 text-sm font-medium"><span className="size-2 rounded-full" style={{ background: t.activa ? colorEstado(t.ultimoEstado) : '#64748b' }} />{t.nombre}</span>
              <span className="mt-1 block font-mono text-[11px] text-white/55">última {cuando(t.ultima)} ({t.ultimoEstado ?? '—'}) · próxima {cuando(t.proxima)}</span>
              {t.error && <span className="mt-1 block break-words font-mono text-[11px] text-red-300">{t.error.slice(0, 160)}</span>}
            </li>
          ))}
        </ul>
      </div>
      <div className="panel p-5 xl:col-span-3">
        <h2 className="font-sans text-sm font-semibold">Sesiones recientes</h2>
        <ul className="mt-3 divide-y divide-white/10">
          {datos.sesiones.map((s, i) => (
            <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate">{s.activa && <span className="mr-2 text-emerald-300">●</span>}{s.titulo}</span>
              <span className="font-mono text-[11px] text-white/50">{s.origen} · {s.modelo} · {s.mensajes} msgs · {cuando(s.ultima)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function TareaCard({ t, escritura, abrir, alSinSesion, decidida }: { t: Tarea; escritura: boolean; abrir: (ruta: string) => void; alSinSesion: () => void; decidida: () => void }) {
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState('')
  const sello = SELLO[t.estado]
  async function decidir(aprobar: boolean) {
    setOcupado(true)
    setError('')
    try {
      await enviar('/api/agentes/decidir', { path: t.path, aprobar })
      decidida()
    } catch (e) {
      if (e instanceof SinSesion) return alSinSesion()
      setError((e as Error).message)
    } finally {
      setOcupado(false)
    }
  }
  return (
    <li className="rounded-xl border border-white/10 bg-white/5 p-3">
      <button onClick={() => abrir(t.path)} className="w-full cursor-pointer text-left">
        <span className="block text-sm font-medium hover:text-sky">{t.titulo}</span>
        {t.resumen && <span className="mt-1 line-clamp-3 block text-xs text-white/60">{t.resumen}</span>}
        <span className="mt-1.5 block font-mono text-[11px] text-white/50">{t.agente} · {t.creado ? `desde ${t.creado}` : t.actualizado ? `al ${t.actualizado}` : haceCuanto(t.mtime)}{sello && <span className={`ml-1.5 ${sello.clase}`}>· {sello.texto}</span>}</span>
      </button>
      {t.estado === 'aprobacion' && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button disabled={!escritura || ocupado} onClick={() => decidir(true)} className="flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full bg-sky px-3.5 text-xs font-semibold text-navy transition-transform duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"><Check className="size-3.5" aria-hidden /> Aprobar</button>
          <button disabled={!escritura || ocupado} onClick={() => decidir(false)} className="flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-white/20 px-3.5 text-xs text-white/80 transition-colors hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-40"><X className="size-3.5" aria-hidden /> Rechazar</button>
          {!escritura && <span className="w-full text-[11px] text-white/45">Para decidir desde aquí, activa la escritura en Conexiones.</span>}
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-xs text-red-300">{error}</p>}
    </li>
  )
}

export function Agentes({ alSinSesion, abrir }: { alSinSesion: () => void; abrir: (ruta: string) => void }) {
  const [vuelta, setVuelta] = useState(0)
  const { datos, error } = useApi<{ tareas: Tarea[]; escritura: boolean }>(`/api/agentes?v=${vuelta}`, alSinSesion, 30000)
  if (error) return <p className="text-red-300">{error}</p>
  if (!datos) return <p className="text-white/60">Cargando…</p>

  return (
    <div className="entra">
      <p className="eyebrow">Agentes</p>
      <h1 className="mt-2 text-5xl">Qué están haciendo los agentes.</h1>

      {datos.tareas.length === 0 ? (
        <section className="panel mt-8 max-w-2xl p-6">
          <p className="text-white/80">Todavía no hay tareas. Cuando Hermes, Claude Code o un subagente trabaje, deja un archivo en <code className="rounded bg-white/10 px-1.5 font-mono text-sm">Agentes/tareas/</code> del Cerebro y aparece aquí solo.</p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-black/35 p-4 font-mono text-xs leading-relaxed text-white/75">{`---
titulo: Sitio para la barbería de Jael
agente: Hermes
estado: aprobacion   # pendiente | haciendo | aprobacion | listo
creado: 2026-10-21 09:00
actualizado: 2026-10-21 14:30
cliente: jaeloo-cuts
---
Qué hizo, enlaces a las capturas y qué necesita de ti.`}</pre>
        </section>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNAS.map((c) => {
            const lista = datos.tareas.filter((t) => c.estados.includes(t.estado))
            return (
              <section key={c.id} className={`panel p-4 ${c.id === 'aprobacion' && lista.length ? 'border-amber-300/40' : ''}`}>
                <h2 className="flex items-center gap-2 font-sans text-sm font-semibold"><span aria-hidden className="size-2.5 rounded-full" style={{ background: c.color }} />{c.nombre} <span className="font-mono text-white/45">{lista.length}</span></h2>
                <ul className="mt-3 space-y-2">
                  {lista.map((t) => <TareaCard key={t.path} t={t} escritura={datos.escritura} abrir={abrir} alSinSesion={alSinSesion} decidida={() => setVuelta((v) => v + 1)} />)}
                </ul>
              </section>
            )
          })}
        </div>
      )}
      <HermesEnVivo alSinSesion={alSinSesion} />
    </div>
  )
}
