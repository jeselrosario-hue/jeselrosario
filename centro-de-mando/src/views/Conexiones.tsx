import { CircleCheck, CircleDashed } from 'lucide-react'
import type { Conexiones as Datos } from '@/api'
import { haceCuanto, useApi } from '@/hooks'

export function Conexiones({ alSinSesion }: { alSinSesion: () => void }) {
  const { datos: c, error } = useApi<Datos>('/api/conexiones', alSinSesion, 30000)
  if (error) return <p className="text-red-300">{error}</p>
  if (!c) return <p className="text-white/60">Cargando…</p>

  const sync = c.cerebro.sync
  const filas: { nombre: string; ok: boolean; detalle: string; siguiente?: string }[] = [
    { nombre: 'Cerebro (notas, pendientes, mapa)', ok: c.cerebro.ok, detalle: `${c.cerebro.notas} notas leídas${sync ? ('pendiente' in sync ? ' · sincronizando con GitHub…' : sync.ok ? ` · GitHub ${haceCuanto(sync.en)}` : ' · falló la sincronización con GitHub') : ''}` },
    { nombre: 'Tareas de agentes (Hermes)', ok: c.agentes.ok, detalle: c.agentes.ok ? 'Leyendo Agentes/tareas/' : 'Aún sin tareas', siguiente: 'Enseñar a Hermes a dejar un archivo por tarea (ver Herramientas/Hermes-aprende).' },
    { nombre: 'Solicitudes de clientes (Netlify Forms)', ok: c.netlify.configurado, detalle: c.netlify.configurado ? 'Token configurado' : 'Pendiente', siguiente: 'Crear un token en Netlify (User settings → Applications → Personal access tokens) y en el servidor correr: bash cdm-instalar.sh netlify. El token se escribe ahí, nunca en el chat.' },
    { nombre: 'Correo de Ascent (Gmail, solo lectura)', ok: c.gmail.configurado, detalle: c.gmail.configurado ? 'Configurado' : 'Pendiente', siguiente: 'Crear el acceso de solo lectura en Google y autorizarlo una vez.' },
    { nombre: 'Hablar con Hermes', ok: c.hermes.configurado, detalle: c.hermes.configurado ? 'Configurado' : 'Pendiente', siguiente: 'Confirmar qué API expone el panel de Hermes y ponerla detrás de HTTPS.' },
  ]

  return (
    <div className="entra">
      <p className="eyebrow">Conexiones</p>
      <h1 className="mt-2 text-5xl">Qué está conectado.</h1>
      <ul className="mt-8 grid max-w-3xl gap-3">
        {filas.map((f) => (
          <li key={f.nombre} className="panel flex gap-4 p-5">
            {f.ok ? <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-400" aria-label="Conectado" /> : <CircleDashed className="mt-0.5 size-5 shrink-0 text-white/45" aria-label="Pendiente" />}
            <div className="min-w-0">
              <p className="font-semibold">{f.nombre}</p>
              <p className="text-sm text-white/60">{f.detalle}</p>
              {!f.ok && f.siguiente && <p className="mt-2 text-sm text-sky/90">Siguiente paso: {f.siguiente}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
