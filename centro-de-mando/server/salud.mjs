// Salud del sitio y del negocio, cada 10 minutos: responde 200, días que le quedan al certificado,
// cabeceras de seguridad, créditos de Netlify y solicitudes nuevas. Avisa por Telegram (alertas.mjs)
// solo cuando algo CAMBIA, para no llenar el chat. Todo de solo lectura.
import tls from 'node:tls'
import { enviarAlerta } from './alertas.mjs'
import { guardarEstado, leerEstado } from './datos.mjs'
import { netlifyConfigurado, netlifyResumen } from './netlify.mjs'

const SITIOS = () => (process.env.SALUD_SITIOS || 'https://ascentco.netlify.app').split(',').map((s) => s.trim()).filter((s) => s.startsWith('https://'))
const CABECERAS = ['content-security-policy', 'strict-transport-security', 'x-content-type-options', 'referrer-policy', 'permissions-policy']
let ultimo = { en: 0, chequeos: [] }

function diasCertificado(host) {
  return new Promise((ok) => {
    const s = tls.connect({ host, port: 443, servername: host, timeout: 8000 }, () => {
      const c = s.getPeerCertificate()
      s.end()
      ok(c?.valid_to ? Math.floor((new Date(c.valid_to).getTime() - Date.now()) / 86400000) : null)
    })
    s.on('error', () => ok(null))
    s.on('timeout', () => { s.destroy(); ok(null) })
  })
}

async function chequearSitio(url) {
  const host = new URL(url).hostname
  let codigo = 0
  let faltan = CABECERAS
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(10000) })
    codigo = res.status
    faltan = CABECERAS.filter((h) => !res.headers.has(h))
    await res.body?.cancel()
  } catch { /* codigo 0 = no responde */ }
  const dias = await diasCertificado(host)
  return [
    { id: `sitio:${host}`, nombre: `${host} responde`, ok: codigo >= 200 && codigo < 400, detalle: codigo ? `HTTP ${codigo}` : 'No responde' },
    { id: `cert:${host}`, nombre: `Certificado de ${host}`, ok: dias !== null && dias >= 14, detalle: dias === null ? 'No pude leerlo' : `Vence en ${dias} días` },
    { id: `cabeceras:${host}`, nombre: `Cabeceras de seguridad de ${host}`, ok: faltan.length === 0, detalle: faltan.length ? `Faltan: ${faltan.join(', ')}` : 'Completas' },
  ]
}

async function chequearNetlify() {
  if (!netlifyConfigurado()) return { chequeos: [], solicitudes: [] }
  try {
    const n = await netlifyResumen()
    const c = n.creditos
    return {
      chequeos: c.disponible ? [{ id: 'creditos', nombre: 'Créditos de Netlify', ok: !c.bajo, detalle: `Quedan ${c.quedan}` }] : [],
      solicitudes: n.solicitudes.filter((s) => !s.spam),
    }
  } catch {
    return { chequeos: [{ id: 'netlify', nombre: 'API de Netlify', ok: false, detalle: 'No responde' }], solicitudes: [] }
  }
}

export async function revisar() {
  const [sitios, netlify] = await Promise.all([Promise.all(SITIOS().map(chequearSitio)), chequearNetlify()])
  const chequeos = [...sitios.flat(), ...netlify.chequeos]
  const previo = await leerEstado('salud')
  const avisos = []
  for (const c of chequeos) {
    const antes = previo[c.id]
    if (antes !== undefined && antes !== c.ok) avisos.push(c.ok ? `✅ Se arregló: ${c.nombre}. ${c.detalle}.` : `⚠️ ${c.nombre}: ${c.detalle}.`)
    if (antes === undefined && !c.ok) avisos.push(`⚠️ ${c.nombre}: ${c.detalle}.`)
    if (antes !== c.ok) await guardarEstado('salud', c.id, c.ok)
  }
  // Solicitudes nuevas: la primera vez solo se memorizan, para no avisar de las viejas.
  const vistas = await leerEstado('salud-solicitudes')
  const primeraVez = Object.keys(vistas).length === 0
  for (const s of netlify.solicitudes) {
    if (vistas[s.id]) continue
    await guardarEstado('salud-solicitudes', s.id, true)
    if (!primeraVez) avisos.push(`📩 Solicitud nueva de ${s.nombre || 'alguien'}${s.paquetes ? `: ${s.paquetes}` : ''}${s.total ? ` (${s.total})` : ''}. Mírala en el Centro de mando.`)
  }
  let alertas = null
  if (avisos.length) {
    try {
      alertas = await enviarAlerta(avisos.join('\n'))
    } catch (e) {
      alertas = { ok: false, motivo: e.message }
      console.error('alertas:', e.message)
    }
  }
  ultimo = { en: Date.now(), chequeos, avisos, alertas }
  return ultimo
}

export const saludUltima = () => ultimo

export function arrancarSalud() {
  if (process.env.SALUD_ACTIVA === '0') return
  const correr = () => revisar().catch((e) => console.error('salud:', e.message))
  setTimeout(correr, 15000).unref()
  setInterval(correr, 10 * 60 * 1000).unref()
}
