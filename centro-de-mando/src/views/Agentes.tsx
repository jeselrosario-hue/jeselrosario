import type { HermesVivo, Tarea } from '@/api'
import { haceCuanto, useApi } from '@/hooks'

const ESTADOS: { id: Tarea['estado']; nombre: string; color: string }[] = [
  { id: 'aprobacion', nombre: 'Necesita tu aprobación', color: '#fbbf24' },
  { id: 'haciendo', nombre: 'Haciendo', color: '#4abdf0' },
  { id: 'pendiente', nombre: 'Pendiente', color: '#94a3b8' },
  { id: 'listo', nombre: 'Listo', color: '#34d399' },
]

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

export function Agentes({ alSinSesion, abrir }: { alSinSesion: () => void; abrir: (ruta: string) => void }) {
  const { datos, error } = useApi<{ tareas: Tarea[] }>('/api/agentes', alSinSesion, 30000)
  if (error) return <p className="text-red-300">{error}</p>
  if (!datos) return <p className="text-white/60">Cargando…</p>

  return (
    <div className="entra">
      <p className="eyebrow">Agentes</p>
      <h1 className="mt-2 text-5xl">Qué está haciendo Hermes.</h1>
      <HermesEnVivo alSinSesion={alSinSesion} />

      {datos.tareas.length === 0 ? (
        <section className="panel mt-8 max-w-2xl p-6">
          <p className="text-white/80">Todavía no hay tareas. Cuando Hermes o un subagente trabaje, deja un archivo en <code className="rounded bg-white/10 px-1.5 font-mono text-sm">Agentes/tareas/</code> del Cerebro y aparece aquí solo.</p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-black/35 p-4 font-mono text-xs leading-relaxed text-white/75">{`---
titulo: Sitio para la barbería de Jael
agente: Hermes
estado: aprobacion   # pendiente | haciendo | listo | aprobacion
actualizado: 2026-10-21 14:30
---
Qué hizo, enlaces a las capturas y qué necesita de ti.`}</pre>
        </section>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ESTADOS.map((e) => {
            const lista = datos.tareas.filter((t) => t.estado === e.id)
            return (
              <section key={e.id} className="panel p-4">
                <h2 className="flex items-center gap-2 font-sans text-sm font-semibold"><span className="size-2.5 rounded-full" style={{ background: e.color }} />{e.nombre} <span className="font-mono text-white/45">{lista.length}</span></h2>
                <ul className="mt-3 space-y-2">
                  {lista.map((t) => (
                    <li key={t.path}>
                      <button onClick={() => abrir(t.path)} className="w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-sky/50">
                        <span className="block text-sm font-medium">{t.titulo}</span>
                        <span className="mt-1 block font-mono text-[11px] text-white/50">{t.agente} · {haceCuanto(t.mtime)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
