import { useSyncExternalStore } from 'react'

/** Elección de permisos opcionales (solo Cal.com). Se guarda en este navegador, nada más. */
export type Permiso = 'si' | 'no' | null
const KEY = 'ascent-permisos'
const oyentes = new Set<() => void>()

function leer(): Permiso {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'si' || v === 'no' ? v : null
  } catch {
    return null
  }
}
let memoria: Permiso = null

export function elegir(v: 'si' | 'no') {
  memoria = v
  try { localStorage.setItem(KEY, v) } catch { /* sin almacenamiento: vale solo esta visita */ }
  oyentes.forEach((f) => f())
}
export function reabrir() {
  memoria = null
  try { localStorage.removeItem(KEY) } catch { /* nada */ }
  oyentes.forEach((f) => f())
}
const actual = () => memoria ?? leer()
export function usePermiso(): Permiso {
  return useSyncExternalStore((f) => { oyentes.add(f); return () => oyentes.delete(f) }, actual, () => null)
}
