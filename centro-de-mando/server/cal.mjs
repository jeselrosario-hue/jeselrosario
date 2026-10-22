// Conector de SOLO LECTURA a Cal.com (API v2). La clave vive solo en el .env del servidor.
// Devuelve las próximas reservas: título, hora, estado y quién reservó. No crea ni cambia citas.
const API = () => (process.env.CAL_API_URL || 'https://api.cal.com').replace(/\/$/, '')
export const calConfigurado = () => Boolean(process.env.CAL_API_KEY)

const corto = (v, n) => { const s = String(v ?? '').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s }

export async function calReservas() {
  const res = await fetch(`${API()}/v2/bookings?status=upcoming&sortStart=asc&take=15`, {
    headers: { Authorization: `Bearer ${process.env.CAL_API_KEY}`, 'cal-api-version': '2024-08-13' },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Cal.com: ${res.status}`)
  const cuerpo = await res.json()
  const lista = Array.isArray(cuerpo.data) ? cuerpo.data : []
  return {
    ok: true,
    reservas: lista.map((b) => ({
      id: String(b.uid ?? b.id ?? ''),
      titulo: corto(b.title, 80),
      inicio: b.start,
      fin: b.end,
      estado: b.status,
      nombre: corto(b.attendees?.[0]?.name, 60),
      correo: corto(b.attendees?.[0]?.email, 80),
      enlace: typeof b.meetingUrl === 'string' && b.meetingUrl.startsWith('https://') ? b.meetingUrl : null,
    })),
  }
}
