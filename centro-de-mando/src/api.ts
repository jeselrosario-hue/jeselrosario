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

export type Casilla = { done: boolean; text: string }
export type Resumen = {
  inicioAscent: string
  pendientes: { abiertos: number; hechos: number; siguiente: string | null }
  plan: { abiertos: number; hechos: number }
  cerebro: { notas: number; enlaces: number; reciente: { path: string; title: string; mtime: number }[]; dias: Record<string, number> }
  agentes: { total: number; aprobacion: number; haciendo: number }
}
export type NotaInfo = { path: string; title: string; folder: string; mtime: number }
export type Tarea = { path: string; titulo: string; agente: string; estado: 'pendiente' | 'haciendo' | 'listo' | 'aprobacion'; actualizado: string; mtime: number }
export type Grafo = { nodos: { id: string; title: string; folder: string }[]; aristas: { from: string; to: string }[] }
export type Conexiones = {
  cerebro: { ok: boolean; notas: number; sync: null | { ok: boolean; en: number } | { pendiente: true } }
  agentes: { ok: boolean }
  netlify: { configurado: boolean }
  gmail: { configurado: boolean }
  hermes: { configurado: boolean }
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
