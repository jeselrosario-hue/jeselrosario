import fs from 'node:fs/promises'
import path from 'node:path'

const IGNORAR = new Set(['.git', '.obsidian', 'node_modules', '.claude', '_grafo', '.trash'])

export async function listarNotas(raiz) {
  const notas = []
  async function caminar(dir) {
    let entradas
    try {
      entradas = await fs.readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of entradas) {
      if (IGNORAR.has(e.name) || e.name.startsWith('.')) continue
      const completa = path.join(dir, e.name)
      if (e.isDirectory()) await caminar(completa)
      else if (e.isFile() && e.name.endsWith('.md')) {
        const rel = path.relative(raiz, completa).split(path.sep).join('/')
        const [st, texto] = await Promise.all([fs.stat(completa), fs.readFile(completa, 'utf8')])
        const h1 = texto.match(/^#\s+(.+)$/m)
        notas.push({
          path: rel.replace(/\.md$/, ''),
          title: (h1 ? h1[1] : e.name.replace(/\.md$/, '')).trim(),
          folder: rel.includes('/') ? rel.split('/')[0] : '(raíz)',
          mtime: st.mtimeMs,
          texto,
        })
      }
    }
  }
  await caminar(raiz)
  return notas
}

export function resolverEnlace(destino, notas) {
  const limpio = destino.split('|')[0].split('#')[0].trim().replace(/\.md$/, '').toLowerCase()
  if (!limpio) return null
  const exacta = notas.find((n) => n.path.toLowerCase() === limpio)
  if (exacta) return exacta.path
  const porNombre = notas.find((n) => n.path.toLowerCase().split('/').pop() === limpio.split('/').pop())
  return porNombre ? porNombre.path : null
}

export function construirGrafo(notas) {
  const nodos = notas.map((n) => ({ id: n.path, title: n.title, folder: n.folder }))
  const aristas = []
  const vistos = new Set()
  for (const n of notas) {
    for (const m of n.texto.matchAll(/\[\[([^\]]+)\]\]/g)) {
      const destino = resolverEnlace(m[1], notas)
      if (!destino || destino === n.path) continue
      const clave = `${n.path}→${destino}`
      if (vistos.has(clave)) continue
      vistos.add(clave)
      aristas.push({ from: n.path, to: destino })
    }
  }
  return { nodos, aristas }
}

/** Lista de casillas "- [ ]" / "- [x]" de un archivo, uniendo las líneas de continuación. */
export function parsearCasillas(texto) {
  const items = []
  let actual = null
  for (const linea of texto.split('\n')) {
    const m = linea.match(/^\s*[-*]\s+\[( |x|X)\]\s+(.*)$/)
    if (m) {
      actual = { done: m[1].toLowerCase() === 'x', text: m[2].trim() }
      items.push(actual)
    } else if (actual && /^\s{2,}\S/.test(linea)) {
      actual.text += ' ' + linea.trim()
    } else {
      actual = null
    }
  }
  const limpio = (t) => t.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, d, a) => a || d.split('/').pop()).replace(/\*\*/g, '').replace(/`/g, '')
  return items.map((i) => ({ ...i, text: limpio(i.text) }))
}

/** Tareas de agentes: Agentes/tareas/*.md con frontmatter (titulo, agente, estado, actualizado). */
export function parsearTareas(notas) {
  return notas
    .filter((n) => n.path.startsWith('Agentes/tareas/'))
    .map((n) => {
      const fm = n.texto.match(/^---\n([\s\S]*?)\n---/)
      const campos = {}
      if (fm) for (const l of fm[1].split('\n')) {
        const k = l.match(/^(\w+):\s*(.*)$/)
        if (k) campos[k[1]] = k[2].trim()
      }
      const estado = ['pendiente', 'haciendo', 'listo', 'aprobacion'].includes(campos.estado) ? campos.estado : 'pendiente'
      return { path: n.path, titulo: campos.titulo || n.title, agente: campos.agente || 'sin nombre', estado, actualizado: campos.actualizado || '', mtime: n.mtime }
    })
    .sort((a, b) => b.mtime - a.mtime)
}

/** Lee una nota por ruta, sin salir de la carpeta del Cerebro. */
export async function leerNota(raiz, ruta) {
  const limpia = String(ruta).replace(/\.md$/, '')
  if (!/^[\p{L}\p{N}_\-./ ]+$/u.test(limpia) || limpia.includes('..')) return null
  const completa = path.resolve(raiz, limpia + '.md')
  if (!completa.startsWith(path.resolve(raiz) + path.sep)) return null
  try {
    return await fs.readFile(completa, 'utf8')
  } catch {
    return null
  }
}
