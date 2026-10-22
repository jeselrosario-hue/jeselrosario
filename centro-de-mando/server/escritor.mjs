// Escribe en el Cerebro (solo después de que Jesel aprueba). Cada cambio es un commit y un push,
// así queda historia en GitHub y Obsidian lo recibe. Exige CEREBRO_ESCRIBIR=1 y una llave con
// permiso de escritura; sin eso, no toca nada.
import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)
const CEREBRO = () => process.env.CEREBRO_DIR || ''
export const escrituraActiva = () => process.env.CEREBRO_ESCRIBIR === '1'
let cola = Promise.resolve()

/** Ruta segura dentro del Cerebro (sin "..", solo .md, solo carpetas permitidas). */
export function rutaSegura(rel, carpetas = ['Clientes/', 'Agentes/tareas/']) {
  const limpia = String(rel).replace(/\\/g, '/')
  if (!limpia.endsWith('.md') || limpia.includes('..') || limpia.startsWith('/')) return null
  if (!carpetas.some((c) => limpia.startsWith(c))) return null
  if (!/^[\p{L}\p{N}_\-./ ]+$/u.test(limpia)) return null
  const completa = path.resolve(CEREBRO(), limpia)
  return completa.startsWith(path.resolve(CEREBRO()) + path.sep) ? completa : null
}

const git = (args) => run('git', ['-C', CEREBRO(), '-c', 'user.name=Centro de mando', '-c', 'user.email=centro-de-mando@ascent.local', ...args], { timeout: 60000 })

/**
 * cambios: [{ ruta: 'Clientes/x/ficha.md', contenido: '...', soloSiNoExiste?: true }]
 * Uno a la vez. Si el push falla, deshace el commit local para no quedar desfasado de GitHub.
 */
export function escribirCerebro(cambios, mensaje) {
  const tarea = cola.then(async () => {
    if (!escrituraActiva()) throw new Error('El Centro de mando no tiene permiso para escribir en el Cerebro (CEREBRO_ESCRIBIR).')
    const conGit = process.env.CEREBRO_GIT === '1'
    if (conGit) await git(['pull', '--ff-only', '-q'])
    const rutas = []
    for (const c of cambios) {
      const completa = rutaSegura(c.ruta)
      if (!completa) throw new Error(`Ruta no permitida: ${c.ruta}`)
      if (c.soloSiNoExiste) {
        const existe = await fs.stat(completa).then(() => true, () => false)
        if (existe) throw new Error(`Ya existe: ${c.ruta}`)
      }
      await fs.mkdir(path.dirname(completa), { recursive: true })
      await fs.writeFile(completa, c.contenido)
      rutas.push(c.ruta)
    }
    if (!conGit) return { ok: true, rutas, commit: null }
    await git(['add', '--', ...rutas])
    await git(['commit', '-q', '-m', mensaje])
    try {
      await git(['push', '-q'])
    } catch (e) {
      await git(['reset', '--hard', '-q', 'HEAD~1']).catch(() => {})
      throw new Error('GitHub no aceptó el cambio (¿la llave del Cerebro tiene permiso de escritura?).')
    }
    const { stdout } = await git(['rev-parse', '--short', 'HEAD'])
    return { ok: true, rutas, commit: stdout.trim() }
  })
  cola = tarea.catch(() => {})
  return tarea
}
