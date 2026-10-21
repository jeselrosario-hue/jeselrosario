import crypto from 'node:crypto'

const COOKIE = 'cdm_sesion'
const DURACION_MS = 12 * 60 * 60 * 1000

export function verificarClave(clave, guardado) {
  const [alg, saltHex, hashHex] = (guardado || '').split(':')
  if (alg !== 'scrypt' || !saltHex || !hashHex) return false
  const esperado = Buffer.from(hashHex, 'hex')
  const real = crypto.scryptSync(String(clave), Buffer.from(saltHex, 'hex'), esperado.length)
  return crypto.timingSafeEqual(esperado, real)
}

function firmar(payload, secreto) {
  return crypto.createHmac('sha256', secreto).update(payload).digest('base64url')
}

export function crearSesion(secreto) {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + DURACION_MS })).toString('base64url')
  return `${payload}.${firmar(payload, secreto)}`
}

export function sesionValida(cookieHeader, secreto) {
  const m = (cookieHeader || '').split(/;\s*/).find((c) => c.startsWith(COOKIE + '='))
  if (!m) return false
  const [payload, firma] = m.slice(COOKIE.length + 1).split('.')
  if (!payload || !firma) return false
  const esperada = firmar(payload, secreto)
  if (firma.length !== esperada.length || !crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(esperada))) return false
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now()
  } catch {
    return false
  }
}

export function cookieSesion(valor, seguro) {
  return `${COOKIE}=${valor}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${DURACION_MS / 1000}${seguro ? '; Secure' : ''}`
}
export function cookieBorrar(seguro) {
  return `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${seguro ? '; Secure' : ''}`
}

/** Límite simple de intentos de entrada por IP: 8 cada 15 minutos. */
const intentos = new Map()
export function bloqueado(ip) {
  const ahora = Date.now()
  const lista = (intentos.get(ip) || []).filter((t) => ahora - t < 15 * 60 * 1000)
  intentos.set(ip, lista)
  return lista.length >= 8
}
export function registrarFallo(ip) {
  intentos.set(ip, [...(intentos.get(ip) || []), Date.now()])
}
