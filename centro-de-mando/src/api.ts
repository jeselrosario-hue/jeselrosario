export class SinSesion extends Error {}

export async function api<T>(ruta: string, init?: RequestInit): Promise<T> {
  const res = await fetch(ruta, { credentials: 'same-origin', ...init })
  if (res.status === 401 && ruta !== '/api/login') throw new SinSesion()
  const datos = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((datos as { error?: string }).error || 'Error')
  return datos as T
}

export const entrar = (clave: string) =>
  api<{ ok: true }>('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clave }) })
export const salir = () => api<{ ok: true }>('/api/logout', { method: 'POST' })

/** Escritura desde la pantalla. La cabecera X-CDM la exige el servidor en todo POST. */
export const enviar = <T = { ok: true }>(ruta: string, cuerpo: unknown) =>
  api<T>(ruta, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CDM': '1' }, body: JSON.stringify(cuerpo) })

export type Casilla = { done: boolean; text: string }
export type Resumen = {
  inicioAscent: string
  pendientes: { abiertos: number; hechos: number; siguiente: string | null }
  plan: { abiertos: number; hechos: number; activo: string | null; siguiente: string | null }
  cerebro: { notas: number; enlaces: number; reciente: { path: string; title: string; mtime: number }[]; dias: Record<string, number> }
  agentes: { total: number; aprobacion: number; haciendo: number }
  propuestas: number
}
export type NotaInfo = { path: string; title: string; folder: string; mtime: number }
export type Tarea = { path: string; titulo: string; agente: string; estado: 'pendiente' | 'haciendo' | 'listo' | 'aprobacion'; actualizado: string; mtime: number }
export type Grafo = { nodos: { id: string; title: string; folder: string }[]; aristas: { from: string; to: string }[] }
export type Conexiones = {
  cerebro: { ok: boolean; notas: number; sync: null | { ok: boolean; en: number } | { pendiente: true } }
  agentes: { ok: boolean }
  netlify: { configurado: boolean; creditos: boolean }
  cal: { configurado: boolean }
  gmail: { configurado: boolean }
  hermes: { configurado: boolean }
  chat: { configurado: boolean }
  escritura: { activa: boolean }
}

export type HermesVivo =
  | { ok: false; configurado: boolean; error?: string }
  | {
      ok: true
      version: string
      gateway: string
      plataformas: { nombre: string; estado: string; error: string | null }[]
      tareas: { nombre: string; horario: string; activa: boolean; estado: string; ultima: string | null; ultimoEstado: string | null; error: string | null; proxima: string | null }[]
      sesiones: { titulo: string; origen: string; modelo: string; mensajes: number; activa: boolean; ultima: string | null }[]
    }

export type NetlifyVivo =
  | { ok: false; configurado: boolean; error?: string }
  | {
      ok: true
      sitio: { nombre: string; url: string; publicado: string | null; estado: string | null }
      deploys: { estado: string; rama: string; mensaje: string; en: string }[]
      creditos: { disponible: false; motivo: string } | { disponible: true; quedan: number; minimo: number; bajo: boolean }
      solicitudes: Solicitud[]
    }

export type EstadoSolicitud = 'nueva' | 'respondida' | 'cliente'
export type Solicitud = { id: string; nombre: string; contacto: string; mensaje: string; paquetes: string; total: string; acepto: boolean; en: string; spam: boolean; estado: EstadoSolicitud }

export type CalVivo =
  | { ok: false; configurado: boolean; error?: string }
  | { ok: true; reservas: { id: string; titulo: string; inicio: string; fin: string; estado: string; nombre: string; correo: string; enlace: string | null }[] }

export type EstadoCliente = 'prospecto' | 'en-proceso' | 'entregado' | 'pausado'
export type Permiso = 'si' | 'capturas' | 'no' | 'por-preguntar'
export type Cliente = { id: string; ficha: string; nombre: string; contacto: string; paquete: string; estado: EstadoCliente; portafolio: Permiso; creado: string; sitios: string[]; archivos: { path: string; title: string }[]; pendientes: number; mtime: number }
export type Clientes = { clientes: Cliente[]; escritura: boolean; chat: boolean; paquetes: string[]; estados: EstadoCliente[]; permisos: Permiso[] }
export type Propuesta = {
  id: string
  tipo: 'crear-cliente' | 'tarea-hermes'
  titulo: string
  vista: string
  estado: 'pendiente' | 'ejecutando' | 'aprobada' | 'rechazada'
  creada: number
  decidida?: number
  error?: string
  resultado?: { texto: string }
  detalle: Record<string, string>
}

/** Avisa a los paneles que hay propuestas nuevas o decididas. */
export const avisarPropuestas = () => dispatchEvent(new Event('cdm:propuestas'))
