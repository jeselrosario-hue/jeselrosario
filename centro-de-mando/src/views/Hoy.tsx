import { Brain, ListChecks, Network, Bot } from 'lucide-react'
import type { NetlifyVivo, Resumen } from '@/api'
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

function SitioYSolicitudes({ alSinSesion }: { alSinSesion: () => void }) {
  const { datos } = useApi<NetlifyVivo>('/api/netlify', alSinSesion, 60000)
  if (!datos) return null
  const cuando = (iso: string) => new Date(iso).toLocaleString('es-PR', { timeZone: 'America/Puerto_Rico', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
  if (!datos.ok) {
    return (
      <section className="panel mt-4 p-6">
        <p className="eyebrow">Solicitudes del sitio</p>
        <p className="mt-2 text-sm text-white/65">{datos.configurado ? datos.error : 'Sin conectar. Falta NETLIFY_TOKEN y NETLIFY_SITE_ID en el servidor.'}</p>
      </section>
    )
  }
  const reales = datos.solicitudes.filter((s) => !s.spam)
  return (
    <section className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="panel p-6">
        <p className="eyebrow">Solicitudes del sitio <span className="font-mono text-white/45">{reales.length}</span></p>
        {reales.length === 0 ? <p className="mt-3 text-sm text-white/60">Todavía no hay solicitudes.</p> : (
          <ul className="mt-3 divide-y divide-white/10">
            {reales.map((s, i) => (
              <li key={i} className="py-3 text-sm">
                <span className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium">{s.nombre}</span><span className="font-mono text-[11px] text-white/50">{cuando(s.en)}</span></span>
                <span className="block text-white/70">{s.contacto}</span>
                {s.paquetes && <span className="block font-mono text-[11px] text-sky">{s.paquetes} {s.total && `· ${s.total}`}</span>}
                {s.mensaje && <span className="block text-white/60">{s.mensaje}</span>}
                <span className={`mt-1 inline-block font-mono text-[11px] ${s.acepto ? 'text-emerald-300' : 'text-amber-300'}`}>{s.acepto ? 'aceptó privacidad y términos' : 'sin constancia de aceptación'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="panel p-6">
        <p className="eyebrow">Sitio</p>
        <p className="mt-2 break-all text-sm">{datos.sitio.url}</p>
        <p className="mt-1 font-mono text-[11px] text-white/50">publicado {datos.sitio.publicado ? cuando(datos.sitio.publicado) : '—'} · {datos.sitio.estado ?? '—'}</p>
        <ul className="mt-4 space-y-2">
          {datos.deploys.map((d, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-white/75"><span className="size-2 rounded-full" style={{ background: d.estado === 'ready' ? '#34d399' : d.estado === 'error' ? '#f87171' : '#fbbf24' }} /><span className="min-w-0 flex-1 truncate">{d.mensaje || d.rama}</span><span className="font-mono text-[11px] text-white/45">{cuando(d.en)}</span></li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Hoy({ alSinSesion, ir }: { alSinSesion: () => void; ir: (v: string) => void }) {
  const { datos: r, error } = useApi<Resumen>('/api/resumen', alSinSesion, 60000)
  if (error) return <p className="text-red-300">{error}</p>
  if (!r) return <p className="text-white/60">Cargando…</p>

  const total = r.plan.abiertos + r.plan.hechos
  const pct = total ? Math.round((r.plan.hechos / total) * 100) : 0
  const dias = Math.max(1, Math.floor((Date.now() - new Date(r.inicioAscent + 'T12:00:00-04:00').getTime()) / 86400000) + 1)

  const tarjetas = [
    { Icono: ListChecks, n: r.pendientes.abiertos, t: 'pendientes abiertos', a: 'pendientes' },
    { Icono: Bot, n: r.agentes.aprobacion, t: 'esperan tu aprobación', a: 'agentes' },
    { Icono: Brain, n: r.cerebro.notas, t: 'notas en el Cerebro', a: 'cerebro' },
    { Icono: Network, n: r.cerebro.enlaces, t: 'enlaces entre notas', a: 'mapa' },
  ]

  return (
    <div className="entra">
      <p className="eyebrow">Día {dias} de Ascent Co.</p>
      <h1 className="mt-2 text-[clamp(2.4rem,6vw,4.4rem)]">{saludo()}, Jesel.</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tarjetas.map(({ Icono, n, t, a }) => (
          <button key={a} onClick={() => ir(a)} className="panel group cursor-pointer p-5 text-left transition hover:-translate-y-0.5 hover:border-sky/50">
            <Icono className="size-5 text-sky" aria-hidden />
            <p className="mt-3 font-display text-5xl tabular-nums">{n}</p>
            <p className="mt-1 text-sm text-white/65">{t}</p>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <section className="panel flex items-center gap-6 p-6">
          <Anillo pct={pct} />
          <div className="min-w-0">
            <p className="eyebrow">Plan maestro</p>
            <p className="mt-2 text-white/80">{r.plan.hechos} de {total} pasos hechos.</p>
            {r.pendientes.siguiente && (
              <p className="mt-3 text-sm text-white/60"><span className="text-white/90">Siguiente:</span> {r.pendientes.siguiente.length > 150 ? r.pendientes.siguiente.slice(0, 149) + '…' : r.pendientes.siguiente}</p>
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

      <section className="panel mt-4 p-6">
        <p className="eyebrow">Bandeja</p>
        <p className="mt-2 text-white/70">Aquí van a llegar las solicitudes de clientes, los correos de Ascent y los avisos de Hermes.</p>
        <button onClick={() => ir('conexiones')} className="mt-3 cursor-pointer rounded-full border border-white/25 px-4 py-2 text-sm hover:border-sky">Ver qué falta conectar</button>
      </section>
      <SitioYSolicitudes alSinSesion={alSinSesion} />
    </div>
  )
}
