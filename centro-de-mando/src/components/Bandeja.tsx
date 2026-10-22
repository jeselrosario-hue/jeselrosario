import { AlertTriangle, CalendarClock, Inbox, UserPlus, Video } from 'lucide-react'
import { useEffect, useState } from 'react'
import { enviar, SinSesion, type CalVivo, type EstadoSolicitud, type NetlifyVivo, type Solicitud } from '@/api'
import { useApi } from '@/hooks'

export const cuando = (iso: string) =>
  new Date(iso).toLocaleString('es-PR', { timeZone: 'America/Puerto_Rico', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

const ESTADOS: { id: EstadoSolicitud; nombre: string; color: string }[] = [
  { id: 'nueva', nombre: 'Nueva', color: '#4abdf0' },
  { id: 'respondida', nombre: 'Respondida', color: '#fbbf24' },
  { id: 'cliente', nombre: 'Cliente', color: '#34d399' },
]

/** Enlace para responder: correo o perfil de Instagram. Lo demás se muestra como texto. */
function contactoHref(c: string) {
  const t = c.trim()
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return `mailto:${t}`
  const ig = t.match(/^@?([A-Za-z0-9._]{1,30})$/)
  if (ig) return `https://www.instagram.com/${ig[1]}/`
  return null
}

function Tarjeta({ s, cambiar }: { s: Solicitud; cambiar: (id: string, e: EstadoSolicitud) => void }) {
  const href = contactoHref(s.contacto)
  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-base font-semibold">{s.nombre || 'Sin nombre'}</span>
        <span className="font-mono text-[11px] text-white/50">{cuando(s.en)}</span>
      </div>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="mt-0.5 inline-block break-all text-sm text-sky underline-offset-4 hover:underline">{s.contacto}</a>
      ) : (
        <p className="mt-0.5 break-all text-sm text-white/75">{s.contacto}</p>
      )}
      {(s.paquetes || s.total) && (
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          {s.paquetes && <span className="text-white/80">{s.paquetes}</span>}
          {s.total && <span className="rounded-full bg-sky/15 px-2.5 py-0.5 font-semibold tabular-nums text-sky">{s.total}</span>}
        </p>
      )}
      {s.mensaje && <p className="mt-2 text-sm text-white/65">{s.mensaje}</p>}
      {s.estado === 'cliente' && (
        <button
          onClick={() => {
            try { sessionStorage.setItem('cdm:prefill-cliente', JSON.stringify({ nombre: s.nombre, contacto: s.contacto, paquete: '', notas: [s.paquetes && `Pidió: ${s.paquetes} ${s.total}`, s.mensaje].filter(Boolean).join('\n') })) } catch { /* sin almacenamiento: el formulario sale vacío */ }
            location.hash = 'clientes/nuevo'
          }}
          className="mt-3 mr-2 inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full bg-emerald-300/15 px-3 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-300/25"
        >
          <UserPlus className="size-3.5" aria-hidden /> Crear ficha
        </button>
      )}
      <div role="radiogroup" aria-label={`Estado de ${s.nombre || 'la solicitud'}`} className="mt-3 inline-flex rounded-full border border-white/15 p-0.5">
        {ESTADOS.map((e) => {
          const activo = s.estado === e.id
          return (
            <button
              key={e.id}
              role="radio"
              aria-checked={activo}
              onClick={() => !activo && cambiar(s.id, e.id)}
              className={`flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-[background-color,color] duration-150 active:scale-[0.97] ${activo ? 'bg-white/12 text-white' : 'text-white/55 hover:text-white'}`}
            >
              <span aria-hidden className="size-1.5 rounded-full" style={{ background: activo ? e.color : 'rgb(255 255 255 / 0.3)' }} />
              {e.nombre}
            </button>
          )
        })}
      </div>
    </li>
  )
}

function Solicitudes({ datos, alSinSesion }: { datos: NetlifyVivo; alSinSesion: () => void }) {
  const [lista, setLista] = useState<Solicitud[]>([])
  const [filtro, setFiltro] = useState<EstadoSolicitud | 'todas'>('nueva')
  const [error, setError] = useState('')
  useEffect(() => { if (datos.ok) setLista(datos.solicitudes.filter((s) => !s.spam)) }, [datos])

  if (!datos.ok) return <p className="mt-3 text-sm text-white/65">{datos.configurado ? datos.error : 'Sin conectar. Falta NETLIFY_TOKEN y NETLIFY_SITE_ID en el servidor.'}</p>

  const cambiar = (id: string, estado: EstadoSolicitud) => {
    const antes = lista
    setLista((l) => l.map((s) => (s.id === id ? { ...s, estado } : s)))
    setError('')
    enviar('/api/solicitudes/estado', { id, estado }).catch((e) => {
      if (e instanceof SinSesion) return alSinSesion()
      setLista(antes)
      setError('No se guardó el cambio. Intenta de nuevo.')
    })
  }
  const cuenta = (e: EstadoSolicitud) => lista.filter((s) => s.estado === e).length
  const visibles = filtro === 'todas' ? lista : lista.filter((s) => s.estado === filtro)

  return (
    <>
      <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Filtrar solicitudes">
        {[...ESTADOS.map((e) => ({ id: e.id, nombre: e.nombre, n: cuenta(e.id) })), { id: 'todas' as const, nombre: 'Todas', n: lista.length }].map((f) => (
          <button key={f.id} role="tab" aria-selected={filtro === f.id} onClick={() => setFiltro(f.id)} className={`min-h-9 cursor-pointer rounded-full px-3.5 text-xs font-medium transition-colors ${filtro === f.id ? 'bg-sky text-navy' : 'bg-white/8 text-white/70 hover:text-white'}`}>
            {f.nombre} <span className="tabular-nums opacity-70">{f.n}</span>
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
      {visibles.length === 0 ? (
        <p className="mt-4 text-sm text-white/55">{lista.length === 0 ? 'Todavía no hay solicitudes.' : 'Nada en este grupo.'}</p>
      ) : (
        <ul className="mt-4 grid gap-3">{visibles.map((s) => <Tarjeta key={s.id} s={s} cambiar={cambiar} />)}</ul>
      )}
    </>
  )
}

function Citas({ alSinSesion }: { alSinSesion: () => void }) {
  const { datos } = useApi<CalVivo>('/api/cal', alSinSesion, 120000)
  return (
    <section className="panel p-6">
      <h2 className="flex items-center gap-2 font-sans text-sm font-semibold"><CalendarClock className="size-4 text-sky" aria-hidden /> Citas de Cal.com</h2>
      {!datos ? <p className="mt-3 text-sm text-white/55">Cargando…</p> : !datos.ok ? (
        <p className="mt-3 text-sm text-white/65">{datos.configurado ? datos.error : 'Sin conectar. Falta CAL_API_KEY en el servidor.'}</p>
      ) : datos.reservas.length === 0 ? (
        <p className="mt-3 text-sm text-white/55">No hay citas próximas.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {datos.reservas.map((r) => (
            <li key={r.id} className="flex gap-3">
              <span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: r.estado === 'accepted' ? '#34d399' : r.estado === 'pending' ? '#fbbf24' : '#94a3b8' }} aria-hidden />
              <div className="min-w-0 text-sm">
                <p className="font-medium">{r.nombre || r.titulo}</p>
                <p className="font-mono text-[11px] text-white/55">{cuando(r.inicio)}{r.estado === 'pending' ? ' · por confirmar' : ''}</p>
                {r.correo && <a href={`mailto:${r.correo}`} className="break-all text-white/65 hover:text-sky">{r.correo}</a>}
                {r.enlace && <a href={r.enlace} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1.5 text-sky hover:underline"><Video className="size-3.5" aria-hidden /> Entrar a la reunión</a>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Aviso arriba de todo cuando a Netlify le quedan pocos créditos. */
export function AvisoCreditos({ datos }: { datos: NetlifyVivo | null }) {
  if (!datos?.ok || !datos.creditos.disponible || !datos.creditos.bajo) return null
  return (
    <div role="alert" className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-300/40 bg-amber-300/10 p-4 text-sm">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-300" aria-hidden />
      <p><span className="font-semibold text-amber-200">Quedan {datos.creditos.quedan} créditos en Netlify.</span> <span className="text-white/75">Con menos de {datos.creditos.minimo}, evita deploys hasta que se renueven.</span></p>
    </div>
  )
}

/** Solicitudes del formulario del sitio y citas de Cal.com, lado a lado. */
export function Bandeja({ netlify, alSinSesion }: { netlify: NetlifyVivo | null; alSinSesion: () => void }) {
  return (
    <section className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <div className="panel p-6">
        <h2 className="flex items-center gap-2 font-sans text-sm font-semibold"><Inbox className="size-4 text-sky" aria-hidden /> Solicitudes del sitio</h2>
        {netlify ? <Solicitudes datos={netlify} alSinSesion={alSinSesion} /> : <p className="mt-3 text-sm text-white/55">Cargando…</p>}
      </div>
      <Citas alSinSesion={alSinSesion} />
    </section>
  )
}
