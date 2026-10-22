import { Brain, ListChecks, Network, Bot } from 'lucide-react'
import type { NetlifyVivo, Resumen } from '@/api'
import { Aprobaciones } from '@/components/Aprobaciones'
import { Casa } from '@/components/Casa'
import { AvisoCreditos, Bandeja, cuando } from '@/components/Bandeja'
import { haceCuanto, useApi } from '@/hooks'

function saludo() {
  const h = Number(new Intl.DateTimeFormat('es-PR', { hour: 'numeric', hour12: false, timeZone: 'America/Puerto_Rico' }).format(new Date()))
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}

function Anillo({ pct }: { pct: number }) {
  const r = 46, c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 120 120" className="size-32" role="img" aria-label={`Plan al ${pct}%`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="9" />
      <circle cx="60" cy="60" r={r} fill="none" stroke="#4abdf0" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)' }} />
      <text x="60" y="68" textAnchor="middle" fill="#fff" style={{ font: '400 30px Instrument Serif, serif' }}>{pct}%</text>
    </svg>
  )
}

function Pulso({ dias }: { dias: Record<string, number> }) {
  const hoy = new Date()
  const lista = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(hoy.getTime() - (13 - i) * 86400000).toISOString().slice(0, 10)
    return { d, n: dias[d] || 0 }
  })
  const max = Math.max(1, ...lista.map((x) => x.n))
  return (
    <div className="flex h-20 items-end gap-1.5" role="img" aria-label="Notas tocadas por día, últimos 14 días">
      {lista.map((x) => (
        <div key={x.d} title={`${x.d}: ${x.n}`} className="w-full rounded-t bg-sky/70" style={{ height: `${Math.max(6, (x.n / max) * 100)}%`, opacity: x.n ? 1 : 0.25 }} />
      ))}
    </div>
  )
}

function Sitio({ datos }: { datos: NetlifyVivo | null }) {
  if (!datos?.ok) return null
  const c = datos.creditos
  return (
    <section className="panel mt-4 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-sans text-sm font-semibold">Sitio de Ascent</h2>
        <span className="font-mono text-[11px] text-white/50">{c.disponible ? `${c.quedan} créditos de Netlify` : 'créditos: sin dato'}</span>
      </div>
      <a href={datos.sitio.url} target="_blank" rel="noopener noreferrer" className="mt-1 block break-all text-sm text-sky hover:underline">{datos.sitio.url}</a>
      <ul className="mt-4 space-y-2">
        {datos.deploys.map((d, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-white/75"><span aria-hidden className="size-2 rounded-full" style={{ background: d.estado === 'ready' ? '#34d399' : d.estado === 'error' ? '#f87171' : '#fbbf24' }} /><span className="min-w-0 flex-1 truncate">{d.mensaje || d.rama}</span><span className="font-mono text-[11px] text-white/45">{cuando(d.en)}</span></li>
        ))}
      </ul>
    </section>
  )
}

export function Hoy({ alSinSesion, ir }: { alSinSesion: () => void; ir: (v: string) => void }) {
  const { datos: r, error } = useApi<Resumen>('/api/resumen', alSinSesion, 60000)
  const { datos: netlify } = useApi<NetlifyVivo>('/api/netlify', alSinSesion, 60000)
  if (error) return <p className="text-red-300">{error}</p>
  if (!r) return <p className="text-white/60">Cargando…</p>

  const total = r.plan.abiertos + r.plan.hechos
  const pct = total ? Math.round((r.plan.hechos / total) * 100) : 0
  const dias = Math.max(1, Math.floor((Date.now() - new Date(r.inicioAscent + 'T12:00:00-04:00').getTime()) / 86400000) + 1)

  const tarjetas = [
    { Icono: ListChecks, n: r.pendientes.abiertos, t: 'pendientes abiertos', a: 'pendientes' },
    { Icono: Bot, n: r.agentes.aprobacion + r.propuestas, t: 'esperan tu aprobación', a: r.propuestas ? 'hoy' : 'agentes' },
    { Icono: Brain, n: r.cerebro.notas, t: 'notas en el Cerebro', a: 'cerebro' },
    { Icono: Network, n: r.cerebro.enlaces, t: 'enlaces entre notas', a: 'mapa' },
  ]

  return (
    <div className="entra">
      <p className="eyebrow">Día {dias} de Ascent Co.</p>
      <h1 className="mt-2 text-[clamp(2.4rem,6vw,4.4rem)]">{saludo()}, Jesel.</h1>
      <AvisoCreditos datos={netlify} />
      <Aprobaciones alSinSesion={alSinSesion} />

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {tarjetas.map(({ Icono, n, t, a }) => (
          <button key={a} onClick={() => ir(a)} className="panel group cursor-pointer p-4 text-left transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-sky/50 active:scale-[0.98] sm:p-5">
            <Icono className="size-5 text-sky" aria-hidden />
            <p className="mt-3 font-display text-4xl tabular-nums sm:text-5xl">{n}</p>
            <p className="mt-1 text-[13px] leading-snug text-white/65 sm:text-sm">{t}</p>
          </button>
        ))}
      </div>

      <Bandeja netlify={netlify} alSinSesion={alSinSesion} />

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <section className="panel flex items-center gap-6 p-6">
          <Anillo pct={pct} />
          <div className="min-w-0">
            <p className="eyebrow">Plan maestro</p>
            <p className="mt-2 text-white/80">{r.plan.hechos} de {total} pasos hechos.</p>
            {r.plan.activo && <p className="mt-1 text-sm font-medium text-sky">Ahora: {r.plan.activo}</p>}
            {r.plan.siguiente && (
              <p className="mt-3 text-sm text-white/60"><span className="text-white/90">Siguiente:</span> {r.plan.siguiente.length > 150 ? r.plan.siguiente.slice(0, 149) + '…' : r.plan.siguiente}</p>
            )}
          </div>
        </section>

        <section className="panel p-6">
          <p className="eyebrow">Pulso del Cerebro · 14 días</p>
          <div className="mt-4"><Pulso dias={r.cerebro.dias} /></div>
          <ul className="mt-4 space-y-1 text-sm">
            {r.cerebro.reciente.slice(0, 3).map((n) => (
              <li key={n.path} className="flex justify-between gap-3 text-white/70"><span className="truncate">{n.title}</span><span className="shrink-0 font-mono text-xs text-white/45">{haceCuanto(n.mtime)}</span></li>
            ))}
          </ul>
        </section>
      </div>

      <Sitio datos={netlify} />
      <Casa alSinSesion={alSinSesion} />
    </div>
  )
}
