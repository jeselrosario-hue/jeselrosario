import { Bot, Brain, Home, ListChecks, LogOut, MessageSquare, Network, PlugZap, Users } from 'lucide-react'
import { useCallback, useEffect, useState, type ComponentType } from 'react'
import { api, salir } from '@/api'
import { Agentes } from '@/views/Agentes'
import { Cerebro } from '@/views/Cerebro'
import { Clientes } from '@/views/Clientes'
import { Conexiones } from '@/views/Conexiones'
import { Hermes } from '@/views/Hermes'
import { Hoy } from '@/views/Hoy'
import { Login } from '@/views/Login'
import { Mapa } from '@/views/Mapa'
import { Pendientes } from '@/views/Pendientes'

type Vista = 'hoy' | 'hermes' | 'clientes' | 'pendientes' | 'agentes' | 'cerebro' | 'mapa' | 'conexiones'
const MENU: { id: Vista; nombre: string; Icono: ComponentType<{ className?: string }> }[] = [
  { id: 'hoy', nombre: 'Hoy', Icono: Home },
  { id: 'hermes', nombre: 'Hermes', Icono: MessageSquare },
  { id: 'clientes', nombre: 'Clientes', Icono: Users },
  { id: 'pendientes', nombre: 'Pendientes', Icono: ListChecks },
  { id: 'agentes', nombre: 'Agentes', Icono: Bot },
  { id: 'cerebro', nombre: 'Cerebro', Icono: Brain },
  { id: 'mapa', nombre: 'Mapa', Icono: Network },
  { id: 'conexiones', nombre: 'Conexiones', Icono: PlugZap },
]

function leerHash(): { vista: Vista; nota: string | null } {
  const [v, ...resto] = decodeURIComponent(location.hash.slice(1)).split('/')
  const vista = MENU.some((m) => m.id === v) ? (v as Vista) : 'hoy'
  return { vista, nota: resto.length ? resto.join('/') : null }
}

export function App() {
  const [sesion, setSesion] = useState<'cargando' | 'si' | 'no'>('cargando')
  const [{ vista, nota }, setRuta] = useState(leerHash)

  useEffect(() => {
    api('/api/yo').then(() => setSesion('si')).catch(() => setSesion('no'))
    const alHash = () => setRuta(leerHash())
    addEventListener('hashchange', alHash)
    return () => removeEventListener('hashchange', alHash)
  }, [])

  const alSinSesion = useCallback(() => setSesion('no'), [])
  const ir = useCallback((v: string) => { location.hash = v }, [])
  const abrirNota = useCallback((ruta: string) => { location.hash = `cerebro/${encodeURIComponent(ruta).replace(/%2F/g, '/')}` }, [])

  if (sesion === 'cargando') return null
  if (sesion === 'no') return <Login alEntrar={() => setSesion('si')} />

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <nav aria-label="Principal" className="sticky top-0 z-20 flex shrink-0 items-center gap-1 overflow-x-auto border-b border-white/10 bg-navy-3/90 px-3 py-2 backdrop-blur md:h-screen md:w-60 md:flex-col md:items-stretch md:gap-1 md:overflow-visible md:border-b-0 md:border-r md:px-4 md:py-6">
        <img src="/logo-light.png" alt="Ascent Co." className="hidden h-10 w-auto self-start md:mb-6 md:block" />
        {MENU.map(({ id, nombre, Icono }) => (
          <a key={id} href={`#${id}`} aria-current={vista === id ? 'page' : undefined} className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition ${vista === id ? 'bg-sky/15 text-sky' : 'text-white/70 hover:bg-white/8 hover:text-white'}`}>
            <Icono className="size-[18px]" /> {nombre}
          </a>
        ))}
        <button onClick={() => salir().finally(() => setSesion('no'))} className="ml-auto flex min-h-11 shrink-0 cursor-pointer items-center gap-3 rounded-xl px-3.5 text-sm text-white/55 hover:bg-white/8 hover:text-white md:ml-0 md:mt-auto">
          <LogOut className="size-[18px]" /> Salir
        </button>
      </nav>
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 md:py-10 lg:px-12">
        {vista === 'hoy' && <Hoy alSinSesion={alSinSesion} ir={ir} />}
        {vista === 'hermes' && <Hermes alSinSesion={alSinSesion} abrir={abrirNota} />}
        {vista === 'clientes' && <Clientes alSinSesion={alSinSesion} sub={nota} abrir={abrirNota} />}
        {vista === 'pendientes' && <Pendientes alSinSesion={alSinSesion} />}
        {vista === 'agentes' && <Agentes alSinSesion={alSinSesion} abrir={abrirNota} />}
        {vista === 'cerebro' && <Cerebro alSinSesion={alSinSesion} nota={nota} abrir={abrirNota} />}
        {vista === 'mapa' && <Mapa alSinSesion={alSinSesion} abrir={abrirNota} />}
        {vista === 'conexiones' && <Conexiones alSinSesion={alSinSesion} />}
      </main>
    </div>
  )
}
