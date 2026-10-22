// Estado propio del Centro de mando (por ejemplo, si una solicitud ya se respondió).
// Vive en DATA_DIR del servidor (en el VPS, un volumen aparte); nunca en el Cerebro ni en GitHub.
import fs from 'node:fs/promises'
import path from 'node:path'

const DIR = path.resolve(process.env.DATA_DIR || path.join(import.meta.dirname, '../datos'))
const ARCHIVO = path.join(DIR, 'estado.json')
let memoria = null
let cola = Promise.resolve()

async function cargar() {
  if (memoria) return memoria
  try {
    memoria = JSON.parse(await fs.readFile(ARCHIVO, 'utf8'))
  } catch {
    memoria = {}
  }
  return memoria
}

/** Lee una sección del estado (por ejemplo "solicitudes"). */
export async function leerEstado(seccion) {
  return { ...((await cargar())[seccion] || {}) }
}

/** Cambia una clave de una sección y guarda en disco (escritura atómica, una a la vez). */
export function guardarEstado(seccion, clave, valor) {
  cola = cola.then(async () => {
    const todo = await cargar()
    todo[seccion] = { ...(todo[seccion] || {}), [clave]: valor }
    await fs.mkdir(DIR, { recursive: true })
    const tmp = `${ARCHIVO}.${process.pid}.tmp`
    await fs.writeFile(tmp, JSON.stringify(todo, null, 1), { mode: 0o600 })
    await fs.rename(tmp, ARCHIVO)
  })
  return cola
}
