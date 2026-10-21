import { Check } from 'lucide-react'
import type { Casilla } from '@/api'
import { useApi } from '@/hooks'

function Lista({ titulo, items }: { titulo: string; items: Casilla[] }) {
  const abiertos = items.filter((i) => !i.done)
  const hechos = items.filter((i) => i.done)
  return (
    <section className="panel p-6">
      <h2 className="text-3xl">{titulo}</h2>
      <p className="mt-1 font-mono text-xs uppercase tracking-widest text-white/50">{abiertos.length} abiertos · {hechos.length} hechos</p>
      <ul className="mt-4 space-y-2.5">
        {abiertos.map((i, k) => (
          <li key={k} className="flex gap-3 text-[15px] text-white/85"><span aria-hidden className="mt-1 size-4 shrink-0 rounded border-2 border-white/35" />{i.text}</li>
        ))}
      </ul>
      {hechos.length > 0 && (
        <details className="mt-5">
          <summary className="cursor-pointer text-sm text-white/55">Hechos ({hechos.length})</summary>
          <ul className="mt-3 space-y-2">
            {hechos.map((i, k) => (
              <li key={k} className="flex gap-3 text-sm text-white/50"><Check className="mt-0.5 size-4 shrink-0 text-sky" aria-hidden /><span className="line-through decoration-white/25">{i.text}</span></li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}

export function Pendientes({ alSinSesion }: { alSinSesion: () => void }) {
  const { datos, error } = useApi<{ pendientes: Casilla[]; plan: Casilla[] }>('/api/pendientes', alSinSesion, 60000)
  if (error) return <p className="text-red-300">{error}</p>
  if (!datos) return <p className="text-white/60">Cargando…</p>
  return (
    <div className="entra">
      <p className="eyebrow">Pendientes</p>
      <h1 className="mt-2 text-5xl">Lo que falta.</h1>
      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <Lista titulo="Plan maestro" items={datos.plan} />
        <Lista titulo="Pendientes de Ascent" items={datos.pendientes} />
      </div>
    </div>
  )
}
