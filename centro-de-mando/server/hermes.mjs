// Conector de solo lectura a Hermes. Inicia sesión con HERMES_USER/HERMES_PASS (solo en .env del servidor)
// y lee estado, tareas programadas y sesiones recientes. Nunca devuelve prompts, scripts ni claves.
const BASE = () => (process.env.HERMES_URL || '').replace(/\/$/, '')
let cookie = ''
let cookieEn = 0

export const hermesConfigurado = () => Boolean(process.env.HERMES_URL && process.env.HERMES_USER && process.env.HERMES_PASS)

async function iniciar() {
  const res = await fetch(`${BASE()}/auth/password-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'basic', username: process.env.HERMES_USER, password: process.env.HERMES_PASS, next: '/' }),
    redirect: 'manual',
    signal: AbortSignal.timeout(8000),
  })
  if (res.status >= 400) throw new Error('Hermes rechazó el inicio de sesión')
  const set = res.headers.getSetCookie?.() ?? []
  cookie = set.map((c) => c.split(';')[0]).join('; ')
  if (!cookie) throw new Error('Hermes no devolvió sesión')
  cookieEn = Date.now()
}

async function leer(ruta) {
  if (!cookie || Date.now() - cookieEn > 6 * 3600e3) await iniciar()
  let res = await fetch(`${BASE()}${ruta}`, { headers: { cookie }, redirect: 'manual', signal: AbortSignal.timeout(8000) })
  if (res.status === 401 || res.status === 302 || res.status === 303) {
    await iniciar()
    res = await fetch(`${BASE()}${ruta}`, { headers: { cookie }, redirect: 'manual', signal: AbortSignal.timeout(8000) })
  }
  if (!res.ok) throw new Error(`Hermes ${ruta}: ${res.status}`)
  return res.json()
}

const ts = (v) => (typeof v === 'string' ? v : typeof v === 'number' ? new Date(v * (v < 1e12 ? 1000 : 1)).toISOString() : null)

export async function hermesResumen() {
  const [st, jobs, ses] = await Promise.all([leer('/api/status'), leer('/api/cron/jobs'), leer('/api/sessions?limit=15&order=created&exclude_sources=tool')])
  const lista = Array.isArray(ses) ? ses : ses.sessions || []
  return {
    ok: true,
    version: st.version,
    gateway: st.gateway_state,
    plataformas: Object.entries(st.gateway_platforms || {}).map(([nombre, p]) => ({ nombre, estado: p.state, error: p.error_message || null })),
    tareas: (Array.isArray(jobs) ? jobs : []).map((j) => ({
      nombre: j.name,
      horario: j.schedule_display || j.schedule?.display || '',
      activa: j.enabled !== false,
      estado: j.state,
      ultima: ts(j.last_run_at),
      ultimoEstado: j.last_status,
      error: j.last_error || j.last_delivery_error || null,
      proxima: ts(j.next_run_at),
    })),
    sesiones: lista.slice(0, 15).map((s) => ({
      titulo: s.title || s.preview || '(sin título)',
      origen: s.source,
      modelo: s.model,
      mensajes: s.message_count,
      activa: Boolean(s.is_active),
      ultima: ts(s.last_active || s.last_activity_at || s.started_at),
    })),
  }
}
