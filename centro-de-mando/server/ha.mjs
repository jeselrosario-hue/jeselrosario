// Home Assistant de SOLO LECTURA (API REST con un token de larga duración en .env).
// Si HA no responde, espera cada vez más antes de volver a intentar (1, 2, 4… hasta 30 min)
// y lo anota una sola vez en el log: así no hay ruido de reintentos.
const BASE = () => (process.env.HA_URL || '').replace(/\/$/, '')
export const haConfigurado = () => Boolean(process.env.HA_URL && process.env.HA_TOKEN)

let fallos = 0
let siguiente = 0
let ultimo = null

async function leer(ruta) {
  const res = await fetch(`${BASE()}${ruta}`, { headers: { Authorization: `Bearer ${process.env.HA_TOKEN}` }, signal: AbortSignal.timeout(6000) })
  if (!res.ok) throw new Error(`Home Assistant ${ruta}: ${res.status}`)
  return res.json()
}

export async function haResumen() {
  if (Date.now() < siguiente && ultimo) return { ...ultimo, enEspera: Math.ceil((siguiente - Date.now()) / 60000) }
  try {
    const [cfg, estados] = await Promise.all([leer('/api/config'), leer('/api/states')])
    // Bocinas y pantallas de Google (integración Google Cast) son media_player.
    const google = (Array.isArray(estados) ? estados : [])
      .filter((e) => e.entity_id?.startsWith('media_player.'))
      .map((e) => ({
        id: e.entity_id,
        nombre: e.attributes?.friendly_name || e.entity_id,
        estado: e.state,
        titulo: e.attributes?.media_title || null,
        app: e.attributes?.app_name || null,
        cambio: e.last_changed || null,
      }))
      .slice(0, 12)
    if (fallos) console.log('Home Assistant respondió otra vez.')
    fallos = 0
    siguiente = 0
    ultimo = { ok: true, version: cfg.version, lugar: cfg.location_name, estado: cfg.state || 'RUNNING', google }
    return ultimo
  } catch (e) {
    fallos += 1
    siguiente = Date.now() + Math.min(30, 2 ** (fallos - 1)) * 60000
    if (fallos === 1) console.error('Home Assistant no responde:', e.message, '(reintento con espera creciente)')
    ultimo = { ok: false, configurado: true, error: 'Home Assistant no responde.', fallos }
    return ultimo
  }
}
