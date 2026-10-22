import { CircleCheck, CircleDashed } from 'lucide-react'
import type { Conexiones as Datos } from '@/api'
import { Salud } from '@/components/Salud'
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
    { nombre: 'Créditos de Netlify (aviso bajo 60)', ok: c.netlify.creditos, detalle: c.netlify.creditos ? 'Leyendo el saldo del equipo' : 'Pendiente', siguiente: 'Poner NETLIFY_TEAM en el .env del servidor: es el nombre corto del equipo que sale en la dirección de Netlify (app.netlify.com/teams/ESTE-NOMBRE).' },
    { nombre: 'Citas (Cal.com, solo lectura)', ok: c.cal.configurado, detalle: c.cal.configurado ? 'Clave configurada' : 'Pendiente', siguiente: 'En Cal.com: Settings → Developer → API keys, crear una clave y ponerla como CAL_API_KEY en el .env del servidor (nunca en el chat).' },
    { nombre: 'Escribir en el Cerebro (con tu aprobación)', ok: c.escritura.activa, detalle: c.escritura.activa ? 'Fichas y tareas se guardan al aprobar' : 'Solo lectura', siguiente: 'En el VPS: bash vps-instalar.sh escribir (te guía para dar permiso de escritura a la llave del Cerebro).' },
    { nombre: 'Home Assistant y Google Home (solo lectura)', ok: c.ha.configurado, detalle: c.ha.configurado ? 'Token configurado' : 'Opcional', siguiente: 'En el VPS: bash vps-instalar.sh ha. Usa el puerto 32768 (Home Assistant), no el 32769 (que es el panel de Hermes).' },
    { nombre: 'Correo de Ascent (Gmail, solo lectura)', ok: c.gmail.configurado, detalle: c.gmail.configurado ? 'Configurado' : 'Pendiente', siguiente: 'Crear el acceso de solo lectura en Google y autorizarlo una vez.' },
    { nombre: 'Hermes en vivo (estado, tareas, sesiones)', ok: c.hermes.configurado, detalle: c.hermes.configurado ? 'Leyendo el panel de Hermes' : 'Pendiente', siguiente: 'En el VPS: bash vps-instalar.sh hermes (usuario y contraseña del panel).' },
    { nombre: 'Chat con Hermes', ok: c.chat.configurado, detalle: c.chat.configurado ? 'API de Hermes conectada' : 'Pendiente', siguiente: 'En el VPS: bash vps-instalar.sh hermes-chat. Crea la clave y explica cómo encender la API de Hermes sin abrirla a internet.' },
  ]

  return (
    <div className="entra">
      <p className="eyebrow">Conexiones</p>
      <h1 className="mt-2 text-5xl">Qué está conectado.</h1>
      <Salud alSinSesion={alSinSesion} />
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
