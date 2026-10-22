// Sitios web: los de la cuenta de Netlify (estado, último deploy, captura) más los que aparecen
// en las fichas de clientes. El servidor comprueba que cada uno responda (solo GET, sin datos).
import { netlifyConfigurado } from './netlify.mjs'

const API = () => (process.env.NETLIFY_API_URL || 'https://api.netlify.com/api/v1').replace(/\/$/, '')
const CHEQUEO_MS = 5 * 60 * 1000
const chequeos = new Map() // url -> { en, codigo, ms }
const capturas = new Map() // id -> url de la captura de Netlify (solo las que dio su API)

/** Solo direcciones públicas https con nombre de dominio (nada de IPs ni localhost). */
const publica = (url) => {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' && u.hostname.includes('.') && !/^[\d.]+$|^\[|localhost|\.local$|\.internal$/i.test(u.hostname)
  } catch {
    return false
  }
}

async function chequear(url) {
  if (!publica(url)) return { en: Date.now(), codigo: 0, ms: 0, omitido: true }
  const previo = chequeos.get(url)
  if (previo && Date.now() - previo.en < CHEQUEO_MS) return previo
  const t0 = Date.now()
  let codigo = 0
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'CentroDeMando/1 (chequeo de salud)' } })
    codigo = res.status
    await res.body?.cancel()
  } catch {
    codigo = 0
  }
  const r = { en: Date.now(), codigo, ms: Date.now() - t0 }
  chequeos.set(url, r)
  return r
}

async function sitiosNetlify() {
  if (!netlifyConfigurado()) return []
  const res = await fetch(`${API()}/sites?per_page=50&filter=all`, { headers: { Authorization: `Bearer ${process.env.NETLIFY_TOKEN}` }, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`Netlify sites: ${res.status}`)
  const lista = await res.json()
  return (Array.isArray(lista) ? lista : []).map((s) => {
    if (typeof s.screenshot_url === 'string' && s.screenshot_url.startsWith('https://')) capturas.set(String(s.id), s.screenshot_url)
    return {
      id: String(s.id),
      nombre: s.name,
      url: s.ssl_url || s.url,
      origen: 'netlify',
      deploy: s.published_deploy?.state ?? null,
      publicado: s.published_deploy?.published_at ?? s.updated_at ?? null,
      captura: capturas.has(String(s.id)) ? `/api/sitios/captura?id=${encodeURIComponent(s.id)}` : null,
    }
  })
}

/** clientes: salida de listarClientes. Une por dirección para no repetir sitios. */
export async function listarSitios(clientes) {
  let netlify = []
  let error = null
  try {
    netlify = await sitiosNetlify()
  } catch (e) {
    error = 'No pude leer los sitios de Netlify.'
    console.error('sitios:', e.message)
  }
  const porUrl = new Map()
  for (const s of netlify) porUrl.set(s.url.replace(/\/$/, ''), { ...s, cliente: null, portafolio: null })
  for (const c of clientes) {
    if (c.sitios.length === 0) {
      porUrl.set(`ficha:${c.id}`, { id: `ficha-${c.id}`, nombre: c.nombre, url: null, origen: 'ficha', deploy: null, publicado: null, captura: null, cliente: c.id, portafolio: c.portafolio })
    }
    for (const u of c.sitios) {
      const k = u.replace(/\/$/, '')
      const previo = porUrl.get(k)
      porUrl.set(k, previo ? { ...previo, cliente: c.id, nombre: c.nombre, portafolio: c.portafolio } : { id: `ficha-${c.id}-${porUrl.size}`, nombre: c.nombre, url: k, origen: 'ficha', deploy: null, publicado: null, captura: null, cliente: c.id, portafolio: c.portafolio })
    }
  }
  const sitios = [...porUrl.values()]
  await Promise.all(sitios.filter((s) => s.url).map(async (s) => { s.salud = await chequear(s.url) }))
  return { sitios, error }
}

/** Pasa la captura de Netlify por el servidor (la pantalla solo carga imágenes propias). */
export async function captura(id) {
  const url = capturas.get(String(id))
  if (!url) return null
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  const tipo = res.headers.get('content-type') || ''
  if (!res.ok || !/^image\/(png|jpeg|webp)$/.test(tipo.split(';')[0])) return null
  const datos = Buffer.from(await res.arrayBuffer())
  return datos.length > 3_000_000 ? null : { tipo: tipo.split(';')[0], datos }
}
