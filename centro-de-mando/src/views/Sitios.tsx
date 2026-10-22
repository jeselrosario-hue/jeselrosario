import { ExternalLink, Globe } from 'lucide-react'
import { useState } from 'react'
import type { Sitio } from '@/api'
import { useApi } from '@/hooks'

const cuando = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('es-PR', { timeZone: 'America/Puerto_Rico', day: 'numeric', month: 'short', year: 'numeric' }) : null)

function estado(s: Sitio): { texto: string; color: string } {
  if (!s.url) return { texto: 'Sin enlace público', color: '#94a3b8' }
  if (s.deploy === 'error') return { texto: 'Último deploy falló', color: '#f87171' }
  if (s.deploy && s.deploy !== 'ready') return { texto: 'Publicando…', color: '#fbbf24' }
  const c = s.salud?.codigo ?? 0
  if (c >= 200 && c < 400) return { texto: `En línea · ${s.salud?.ms} ms`, color: '#34d399' }
  if (c === 0) return { texto: 'No responde', color: '#f87171' }
  return { texto: `Responde ${c}`, color: '#f87171' }
}

function Tarjeta({ s }: { s: Sitio }) {
  const e = estado(s)
  const [sinCaptura, setSinCaptura] = useState(false)
  const host = s.url?.replace('https://', '')
  return (
    <li className="panel flex flex-col overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-navy-2">
        {s.captura && !sinCaptura ? (
          <img src={s.captura} alt={`Vista previa de ${s.nombre}`} loading="lazy" decoding="async" onError={() => setSinCaptura(true)} className="size-full object-cover object-top" />
        ) : (
          <div className="grid size-full place-items-center bg-[radial-gradient(60%_60%_at_50%_40%,rgb(74_189_240/0.16),transparent)]">
            <span className="font-display text-6xl text-white/80">{s.nombre.trim().charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-2 text-xs text-white/70"><span aria-hidden className="size-2 rounded-full" style={{ background: e.color }} />{e.texto}</p>
        <h2 className="mt-2 font-display text-3xl leading-tight">{s.nombre}</h2>
        {host && <p className="mt-0.5 truncate font-mono text-[11px] text-white/50">{host}</p>}
        <p className="mt-2 text-xs text-white/50">
          {[s.origen === 'netlify' ? 'Cuenta de Ascent en Netlify' : 'De la ficha del cliente', cuando(s.publicado) && `publicado ${cuando(s.publicado)}`, s.portafolio === 'capturas' && 'portafolio: solo capturas'].filter(Boolean).join(' · ')}
        </p>
        <div className="mt-auto flex gap-2 pt-4">
          {s.url && (
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center gap-2 rounded-full bg-sky px-4 text-sm font-semibold text-navy transition-transform duration-150 active:scale-[0.97]">
              <ExternalLink className="size-4" aria-hidden /> Abrir
            </a>
          )}
          {s.cliente && <a href={`#clientes/${s.cliente}`} className="flex min-h-10 items-center rounded-full border border-white/20 px-4 text-sm text-white/80 transition-colors hover:border-sky hover:text-white">Ficha</a>}
        </div>
      </div>
    </li>
  )
}

export function Sitios({ alSinSesion }: { alSinSesion: () => void }) {
  const { datos, error } = useApi<{ sitios: Sitio[]; error: string | null }>('/api/sitios', alSinSesion, 300000)
  if (error) return <p className="text-red-300">{error}</p>
  if (!datos) return <p className="text-white/60">Revisando cada sitio…</p>
  const caidos = datos.sitios.filter((s) => s.url && estado(s).color === '#f87171').length
  return (
    <div className="entra">
      <p className="eyebrow">Sitios</p>
      <h1 className="mt-2 text-5xl">Todo lo que está en línea.</h1>
      <p className="mt-3 flex items-center gap-2 text-sm text-white/65"><Globe className="size-4 text-sky" aria-hidden />{datos.sitios.length} sitios{caidos ? <span className="text-red-300"> · {caidos} con problemas</span> : ' · todos responden'}</p>
      {datos.error && <p className="mt-3 text-sm text-amber-200">{datos.error} Se muestran los de las fichas.</p>}
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{datos.sitios.map((s) => <Tarjeta key={s.id} s={s} />)}</ul>
    </div>
  )
}
