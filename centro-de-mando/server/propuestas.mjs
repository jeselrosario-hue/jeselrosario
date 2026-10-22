// Propuestas: toda acción que escribe o envía algo se guarda primero aquí y solo corre
// cuando Jesel pulsa Aprobar. Rechazar la cierra sin hacer nada. Vive en DATA_DIR.
import crypto from 'node:crypto'
import { guardarEstado, leerEstado } from './datos.mjs'

const ejecutores = new Map()
/** Cada tipo registra qué hace al aprobarse: async (datos) => resultado. */
export const registrar = (tipo, fn) => ejecutores.set(tipo, fn)

export async function proponer(tipo, titulo, datos, vista = '') {
  if (!ejecutores.has(tipo)) throw new Error(`Tipo desconocido: ${tipo}`)
  const p = { id: crypto.randomUUID(), tipo, titulo, datos, vista, estado: 'pendiente', creada: Date.now() }
  await guardarEstado('propuestas', p.id, p)
  return p
}

export async function listarPropuestas() {
  const todas = Object.values(await leerEstado('propuestas'))
  return todas.sort((a, b) => b.creada - a.creada).slice(0, 50)
}

export async function decidir(id, aprobar) {
  const todas = await leerEstado('propuestas')
  const p = todas[id]
  if (!p) return { ok: false, error: 'No existe esa propuesta.' }
  if (p.estado !== 'pendiente') return { ok: false, error: 'Esa propuesta ya se decidió.' }
  if (!aprobar) {
    await guardarEstado('propuestas', id, { ...p, estado: 'rechazada', decidida: Date.now() })
    return { ok: true, estado: 'rechazada' }
  }
  await guardarEstado('propuestas', id, { ...p, estado: 'ejecutando' })
  try {
    const resultado = await ejecutores.get(p.tipo)(p.datos)
    await guardarEstado('propuestas', id, { ...p, estado: 'aprobada', decidida: Date.now(), resultado })
    return { ok: true, estado: 'aprobada', resultado }
  } catch (e) {
    // Vuelve a pendiente para poder reintentar cuando se arregle la causa.
    await guardarEstado('propuestas', id, { ...p, estado: 'pendiente', error: e.message })
    return { ok: false, error: e.message }
  }
}
