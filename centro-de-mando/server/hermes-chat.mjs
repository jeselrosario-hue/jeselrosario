// Chat con Hermes por su API Server (compatible con OpenAI, POST /v1/responses).
// La clave (HERMES_API_KEY) vive solo en el .env del servidor; el navegador nunca la ve.
// Hermes guarda la conversación de su lado (parámetro `conversation`); aquí solo se guarda
// una copia corta para mostrarla, en DATA_DIR.
import { guardarEstado, leerEstado } from './datos.mjs'

const BASE = () => (process.env.HERMES_API_URL || '').replace(/\/$/, '')
export const chatConfigurado = () => Boolean(process.env.HERMES_API_URL && process.env.HERMES_API_KEY)
export const MAX_TEXTO = 2000
const MAX_HISTORIAL = 60

// Lo que Hermes recibe en cada turno: quién le habla y la regla de oro (propone, Jesel aprueba).
const INSTRUCCIONES = `Te habla Jesel, dueña de Ascent Co., desde su Centro de mando. Responde en español de Puerto Rico, corto y claro.
Regla: no publiques, no unas PRs, no borres ni envíes nada a terceros por tu cuenta. Si lo que pide escribe, publica o envía algo,
di exactamente qué harías y deja una tarea en Agentes/tareas/ con estado "aprobacion" para que ella apruebe. Nunca muestres claves.`

let ocupado = false

async function conversacion() {
  const e = await leerEstado('chat')
  return e.conversacion || 'centro-de-mando'
}

export async function chatHistorial() {
  const e = await leerEstado('chat')
  return { conversacion: e.conversacion || 'centro-de-mando', mensajes: e.mensajes || [] }
}

export async function chatNueva() {
  await guardarEstado('chat', 'conversacion', `centro-de-mando-${Date.now()}`)
  await guardarEstado('chat', 'mensajes', [])
}

/** Texto final de la respuesta: los mensajes del asistente que no son comentarios a mitad de camino. */
function textoDe(r) {
  const salida = Array.isArray(r.output) ? r.output : []
  const partes = salida
    .filter((o) => o.type === 'message' && o.role === 'assistant' && o.phase !== 'commentary')
    .flatMap((o) => (Array.isArray(o.content) ? o.content : []))
    .filter((c) => c.type === 'output_text' && typeof c.text === 'string')
    .map((c) => c.text)
  return partes.join('\n\n').trim() || (typeof r.output_text === 'string' ? r.output_text : '')
}

export async function chatEnviar(texto) {
  if (ocupado) return { ok: false, error: 'Hermes todavía está contestando el mensaje anterior.' }
  ocupado = true
  const historial = (await chatHistorial()).mensajes
  const yo = { de: 'jesel', texto, en: Date.now() }
  try {
    const res = await fetch(`${BASE()}/v1/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.HERMES_API_KEY}` },
      body: JSON.stringify({ model: 'hermes-agent', input: texto, instructions: INSTRUCCIONES, conversation: await conversacion(), store: true }),
      signal: AbortSignal.timeout(Number(process.env.HERMES_CHAT_TIMEOUT_MS || 240000)),
    })
    if (res.status === 401 || res.status === 403) throw new Error('Hermes rechazó la clave (HERMES_API_KEY).')
    if (!res.ok) throw new Error(`Hermes respondió ${res.status}.`)
    const r = await res.json()
    const herramientas = [...new Set((r.output || []).filter((o) => o.type === 'function_call' && o.name).map((o) => String(o.name)))].slice(0, 8)
    const el = { de: 'hermes', texto: textoDe(r) || '(Hermes no devolvió texto)', herramientas, en: Date.now() }
    await guardarEstado('chat', 'mensajes', [...historial, yo, el].slice(-MAX_HISTORIAL))
    return { ok: true, mensaje: el }
  } catch (e) {
    const msg = e.name === 'TimeoutError' ? 'Hermes tardó demasiado. Puede seguir trabajando; mira Agentes en un rato.' : e.message || 'No pude hablar con Hermes.'
    await guardarEstado('chat', 'mensajes', [...historial, yo, { de: 'error', texto: msg, en: Date.now() }].slice(-MAX_HISTORIAL))
    return { ok: false, error: msg }
  } finally {
    ocupado = false
  }
}
