import type { Tarea } from '@/api'
import { haceCuanto, useApi } from '@/hooks'

const ESTADOS: { id: Tarea['estado']; nombre: string; color: string }[] = [
  { id: 'aprobacion', nombre: 'Necesita tu aprobación', color: '#fbbf24' },
  { id: 'haciendo', nombre: 'Haciendo', color: '#4abdf0' },
  { id: 'pendiente', nombre: 'Pendiente', color: '#94a3b8' },
  { id: 'listo', nombre: 'Listo', color: '#34d399' },
]

export function Agentes({ alSinSesion, abrir }: { alSinSesion: () => void; abrir: (ruta: string) => void }) {
  const { datos, error } = useApi<{ tareas: Tarea[] }>('/api/agentes', alSinSesion, 30000)
  if (error) return <p className="text-red-300">{error}</p>
  if (!datos) return <p className="text-white/60">Cargando…</p>

  return (
    <div className="entra">
      <p className="eyebrow">Agentes</p>
      <h1 className="mt-2 text-5xl">Qué está haciendo Hermes.</h1>

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
