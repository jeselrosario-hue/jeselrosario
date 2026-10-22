// Conector de SOLO LECTURA a Netlify. El token vive solo en el .env del servidor (nunca en el repo ni en el navegador).
// Devuelve el estado del sitio y las últimas solicitudes del formulario. No escribe nada en Netlify.
const API = 'https://api.netlify.com/api/v1'
export const netlifyConfigurado = () => Boolean(process.env.NETLIFY_TOKEN && process.env.NETLIFY_SITE_ID)

async function leer(ruta) {
  const res = await fetch(`${API}${ruta}`, { headers: { Authorization: `Bearer ${process.env.NETLIFY_TOKEN}` }, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`Netlify ${ruta.split('?')[0]}: ${res.status}`)
  return res.json()
}
const corto = (v, n) => { const s = String(v ?? '').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s }

export async function netlifyResumen() {
  const id = encodeURIComponent(process.env.NETLIFY_SITE_ID)
  const [sitio, envios, deploys] = await Promise.all([
    leer(`/sites/${id}`),
    leer(`/sites/${id}/submissions?per_page=20`),
    leer(`/sites/${id}/deploys?per_page=5`),
  ])
  return {
    ok: true,
    sitio: { nombre: sitio.name, url: sitio.ssl_url || sitio.url, publicado: sitio.published_deploy?.published_at ?? null, estado: sitio.published_deploy?.state ?? null },
    deploys: (Array.isArray(deploys) ? deploys : []).map((d) => ({ estado: d.state, rama: d.branch, mensaje: corto(d.title || d.commit_ref || '', 60), en: d.created_at })),
    solicitudes: (Array.isArray(envios) ? envios : []).map((s) => ({
      nombre: corto(s.data?.nombre ?? s.name, 60),
      contacto: corto(s.data?.contacto ?? s.email, 80),
      mensaje: corto(s.data?.mensaje, 140),
      paquetes: corto(s.data?.paquetes, 120),
      total: corto(s.data?.total, 20),
      acepto: s.data?.acepto === 'si',
      en: s.created_at,
      spam: s.spam === true,
    })),
  }
}
