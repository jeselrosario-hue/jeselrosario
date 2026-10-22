// Avisos a Telegram a través de Hermes: webhook con "entrega directa" (deliver_only), así el
// mensaje llega tal cual, sin pasar por el modelo ni gastar tokens. Firma HMAC V2 de Hermes:
// X-Webhook-Timestamp + X-Webhook-Signature-V2 = hex(HMAC-SHA256(secreto, "<timestamp>.<cuerpo>")).
import crypto from 'node:crypto'

export const alertasConfiguradas = () => Boolean(process.env.HERMES_WEBHOOK_URL && process.env.HERMES_WEBHOOK_SECRET)

export async function enviarAlerta(texto) {
  if (!alertasConfiguradas()) return { ok: false, motivo: 'sin configurar' }
  const cuerpo = JSON.stringify({ mensaje: String(texto).slice(0, 900) })
  const ts = String(Math.floor(Date.now() / 1000))
  const firma = crypto.createHmac('sha256', process.env.HERMES_WEBHOOK_SECRET).update(`${ts}.${cuerpo}`).digest('hex')
  const res = await fetch(process.env.HERMES_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Webhook-Timestamp': ts, 'X-Webhook-Signature-V2': firma },
    body: cuerpo,
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`Hermes webhook: ${res.status}`)
  return { ok: true }
}
