import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { bloqueado, cookieBorrar, cookieSesion, crearSesion, registrarFallo, sesionValida, verificarClave } from './auth.mjs'
import { construirGrafo, leerNota, listarNotas, parsearCasillas, parsearTareas } from './cerebro.mjs'

try {
  process.loadEnvFile?.('.env')
} catch {
  /* sin .env: se usan las variables del sistema */
}

const PORT = Number(process.env.PORT || 3000)
const CEREBRO = process.env.CEREBRO_DIR || ''
const HASH = process.env.DASH_PASSWORD_HASH || ''
const SECRETO = process.env.SESSION_SECRET || ''
const SEGURO = process.env.COOKIE_SECURE === '1'
const DIST = path.resolve(import.meta.dirname, '../dist')
const INICIO_ASCENT = '2026-10-18'

if (!CEREBRO || !HASH || SECRETO.length < 32) {
  console.error('Falta configurar .env: CEREBRO_DIR, DASH_PASSWORD_HASH (npm run hash) y SESSION_SECRET (32+ caracteres).')
  process.exit(1)
}

// Sincronizar el Cerebro con GitHub (para el VPS).
let ultimaSync = null
function sincronizar() {
  if (process.env.CEREBRO_GIT !== '1') return
  execFile('git', ['-C', CEREBRO, 'pull', '--ff-only', '-q'], { timeout: 60000 }, (err) => {
    ultimaSync = { ok: !err, en: Date.now() }
  })
}
sincronizar()
setInterval(sincronizar, 5 * 60 * 1000).unref()

// Pequeño caché para no releer todo el Cerebro en cada clic.
let cache = { en: 0, notas: [] }
async function notas() {
  if (Date.now() - cache.en > 10000) cache = { en: Date.now(), notas: await listarNotas(CEREBRO) }
  return cache.notas
}

const CABECERAS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  ...(SEGURO ? { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains' } : {}),
}

function json(res, codigo, cuerpo, extra = {}) {
  res.writeHead(codigo, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...CABECERAS, ...extra })
  res.end(JSON.stringify(cuerpo))
}

async function cuerpoJson(req) {
  let total = 0
  const trozos = []
  for await (const t of req) {
    total += t.length
    if (total > 4096) throw new Error('grande')
    trozos.push(t)
  }
  return JSON.parse(Buffer.concat(trozos).toString() || '{}')
}

const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json', '.webp': 'image/webp' }

async function estatico(req, res) {
  const url = new URL(req.url, 'http://x')
  let ruta = path.join(DIST, decodeURIComponent(url.pathname))
  if (!ruta.startsWith(DIST)) return json(res, 400, { error: 'ruta' })
  try {
    const st = await fs.stat(ruta)
    if (st.isDirectory()) ruta = path.join(ruta, 'index.html')
  } catch {
    ruta = path.join(DIST, 'index.html') // la app maneja sus propias rutas
  }
  try {
    const datos = await fs.readFile(ruta)
    const ext = path.extname(ruta)
    res.writeHead(200, { 'Content-Type': TIPOS[ext] || 'application/octet-stream', 'Cache-Control': ruta.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache', ...CABECERAS })
    res.end(datos)
  } catch {
    json(res, 404, { error: 'no encontrado' })
  }
}

const servidor = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x')
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim()

    if (!url.pathname.startsWith('/api/')) return estatico(req, res)

    // Entrada y salida
    if (url.pathname === '/api/login' && req.method === 'POST') {
      if (!String(req.headers['content-type'] || '').startsWith('application/json')) return json(res, 415, { error: 'tipo' })
      if (bloqueado(ip)) return json(res, 429, { error: 'Demasiados intentos. Espera 15 minutos.' })
      let datos
      try {
        datos = await cuerpoJson(req)
      } catch {
        return json(res, 400, { error: 'datos' })
      }
      if (!verificarClave(datos.clave ?? '', HASH)) {
        registrarFallo(ip)
        return json(res, 401, { error: 'Contraseña incorrecta.' })
      }
      return json(res, 200, { ok: true }, { 'Set-Cookie': cookieSesion(crearSesion(SECRETO), SEGURO) })
    }
    if (url.pathname === '/api/logout' && req.method === 'POST') return json(res, 200, { ok: true }, { 'Set-Cookie': cookieBorrar(SEGURO) })

    // Todo lo demás exige sesión
    if (!sesionValida(req.headers.cookie, SECRETO)) return json(res, 401, { error: 'sin sesión' })
    if (req.method !== 'GET') return json(res, 405, { error: 'método' })

    const todas = await notas()

    if (url.pathname === '/api/yo') return json(res, 200, { ok: true })

    if (url.pathname === '/api/resumen') {
      const pend = parsearCasillas(todas.find((n) => n.path === 'Ascent/Pendientes')?.texto || '')
      const plan = parsearCasillas(todas.find((n) => n.path === 'Ascent/Plan-maestro')?.texto || '')
      const grafo = construirGrafo(todas)
      const dias = {}
      for (const n of todas) {
        const d = new Date(n.mtime).toISOString().slice(0, 10)
        dias[d] = (dias[d] || 0) + 1
      }
      const tareas = parsearTareas(todas)
      return json(res, 200, {
        inicioAscent: INICIO_ASCENT,
        pendientes: { abiertos: pend.filter((p) => !p.done).length, hechos: pend.filter((p) => p.done).length, siguiente: plan.find((p) => !p.done)?.text || pend.find((p) => !p.done)?.text || null },
        plan: { abiertos: plan.filter((p) => !p.done).length, hechos: plan.filter((p) => p.done).length },
        cerebro: { notas: todas.length, enlaces: grafo.aristas.length, reciente: [...todas].sort((a, b) => b.mtime - a.mtime).slice(0, 5).map((n) => ({ path: n.path, title: n.title, mtime: n.mtime })), dias },
        agentes: { total: tareas.length, aprobacion: tareas.filter((t) => t.estado === 'aprobacion').length, haciendo: tareas.filter((t) => t.estado === 'haciendo').length },
      })
    }

    if (url.pathname === '/api/pendientes') {
      const pend = parsearCasillas(todas.find((n) => n.path === 'Ascent/Pendientes')?.texto || '')
      const plan = parsearCasillas(todas.find((n) => n.path === 'Ascent/Plan-maestro')?.texto || '')
      return json(res, 200, { pendientes: pend, plan })
    }

    if (url.pathname === '/api/agentes') return json(res, 200, { tareas: parsearTareas(todas) })

    if (url.pathname === '/api/notas') return json(res, 200, { notas: todas.map(({ texto: _t, ...n }) => n).sort((a, b) => a.path.localeCompare(b.path)) })

    if (url.pathname === '/api/nota') {
      const texto = await leerNota(CEREBRO, url.searchParams.get('ruta') || '')
      if (texto === null) return json(res, 404, { error: 'no existe' })
      return json(res, 200, { texto })
    }

    if (url.pathname === '/api/grafo') return json(res, 200, construirGrafo(todas))

    if (url.pathname === '/api/conexiones') {
      const e = process.env
      return json(res, 200, {
        cerebro: { ok: todas.length > 0, notas: todas.length, sync: process.env.CEREBRO_GIT === '1' ? (ultimaSync ? { ok: ultimaSync.ok, en: ultimaSync.en } : { pendiente: true }) : null },
        agentes: { ok: todas.some((n) => n.path.startsWith('Agentes/tareas/')) },
        netlify: { configurado: Boolean(e.NETLIFY_TOKEN && e.NETLIFY_SITE_ID) },
        gmail: { configurado: Boolean(e.GMAIL_CLIENT_ID) },
        hermes: { configurado: Boolean(e.HERMES_URL) },
      })
    }

    json(res, 404, { error: 'no encontrado' })
  } catch (err) {
    console.error(err)
    json(res, 500, { error: 'error interno' })
  }
})

servidor.listen(PORT, process.env.HOST || '127.0.0.1', () => console.log(`Centro de mando en http://127.0.0.1:${PORT}`))
