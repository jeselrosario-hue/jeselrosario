// Clientes: una carpeta por cliente en el Cerebro, Clientes/<slug>/ficha.md con frontmatter.
// Aquí no van claves ni pagos (regla del Cerebro). Solo nombre, contacto, paquete, estado y permiso.
export const ESTADOS_CLIENTE = ['prospecto', 'en-proceso', 'entregado', 'pausado']
export const PERMISOS = ['si', 'capturas', 'no', 'por-preguntar']
export const PAQUETES = ['Presentación', 'Sitio web', 'Tarjeta QR', 'Agenda', 'Invitación', 'A medida']

export function frontmatter(texto) {
  const m = texto.match(/^---\n([\s\S]*?)\n---/)
  const campos = {}
  if (m) for (const l of m[1].split('\n')) {
    const k = l.match(/^(\w+):\s*(.*?)\s*(#.*)?$/)
    if (k) campos[k[1]] = k[2].trim()
  }
  return campos
}

/** Nombre de carpeta: minúsculas, sin acentos, con guiones. */
export function slug(nombre) {
  return String(nombre).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48)
}

/** Lista de clientes desde las notas ya leídas del Cerebro. */
export function listarClientes(notas) {
  const fichas = notas.filter((n) => /^Clientes\/[^/]+\/ficha$/.test(n.path))
  return fichas
    .map((n) => {
      const c = frontmatter(n.texto)
      const id = n.path.split('/')[1]
      const archivos = notas.filter((o) => o.path.startsWith(`Clientes/${id}/`) && o.path !== n.path).map((o) => ({ path: o.path, title: o.title }))
      const sitios = [...n.texto.matchAll(/https:\/\/[^\s)>\]]+/g)].map((m) => m[0])
      const pendientes = [...n.texto.matchAll(/^\s*[-*]\s+\[ \]\s+(.+)$/gm)].length
      return {
        id,
        ficha: n.path,
        nombre: c.nombre || n.title,
        contacto: c.contacto || '',
        paquete: c.paquete || '',
        estado: ESTADOS_CLIENTE.includes(c.estado) ? c.estado : 'prospecto',
        portafolio: PERMISOS.includes(c.portafolio) ? c.portafolio : 'por-preguntar',
        creado: c.creado || '',
        sitios: [...new Set(sitios)],
        archivos,
        pendientes,
        mtime: n.mtime,
      }
    })
    .sort((a, b) => b.mtime - a.mtime)
}

const linea = (v, n = 120) => String(v ?? '').replace(/[\r\n]+/g, ' ').replace(/^---/, '').trim().slice(0, n)

/** Valida lo que llega del formulario. Devuelve { error } o { datos } limpios. */
export function validarCliente(d) {
  const nombre = linea(d.nombre, 80)
  if (nombre.length < 2) return { error: 'Escribe el nombre del cliente.' }
  if (!slug(nombre)) return { error: 'El nombre necesita letras o números.' }
  const paquete = PAQUETES.includes(d.paquete) ? d.paquete : ''
  const estado = ESTADOS_CLIENTE.includes(d.estado) ? d.estado : 'prospecto'
  const portafolio = PERMISOS.includes(d.portafolio) ? d.portafolio : 'por-preguntar'
  const sitio = linea(d.sitio, 200)
  if (sitio && !/^https:\/\/[^\s]+$/.test(sitio)) return { error: 'El sitio debe empezar con https://' }
  const notas = String(d.notas ?? '').replace(/^---/gm, '').slice(0, 1500).trim()
  if (/(sk_|ghp_|AIza|cal_live|nfp_|-----BEGIN)/.test(`${d.contacto} ${notas}`)) return { error: 'Eso parece una clave. Las claves no van al Cerebro.' }
  return { datos: { nombre, contacto: linea(d.contacto, 120), paquete, estado, portafolio, sitio, notas } }
}

export function fichaMd(d, hoy = new Date().toISOString().slice(0, 10)) {
  return `---
nombre: ${d.nombre}
contacto: ${d.contacto}
paquete: ${d.paquete}
estado: ${d.estado}
portafolio: ${d.portafolio}
creado: ${hoy}
---
# ${d.nombre}

Ficha de cliente. Sin claves ni datos de pago. Permiso para el portafolio: **${d.portafolio}**.

## Sitios
${d.sitio ? `- ${d.sitio}` : '- (todavía ninguno)'}

## Archivos
Notas y entregas de este cliente van en esta misma carpeta.

## Pendientes
- [ ] Acuerdo de servicio firmado antes del 50%.

## Notas
${d.notas || ''}
`
}
