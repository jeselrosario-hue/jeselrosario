// Clientes: una carpeta por cliente en el Cerebro, Clientes/<slug>/ficha.md con frontmatter.
// Aquí no van claves ni pagos (regla del Cerebro). Solo nombre, contacto, paquete, estado y permiso.
export const ESTADOS_CLIENTE = ['prospecto', 'en-proceso', 'entregado', 'pausado']
export const PERMISOS = ['si', 'capturas', 'no', 'por-preguntar']
export const CONTRATOS = ['pendiente', 'enviado', 'firmado']
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
      const cn = notas.find((o) => o.path === `Clientes/${id}/contrato`)
      const ce = cn ? frontmatter(cn.texto).contrato : ''
      const contrato = CONTRATOS.includes(ce) ? ce : 'sin-contrato'
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
        contrato,
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
- [ ] Acuerdo de servicio firmado por los dos antes del 50% (ver contrato.md).

## Notas
${d.notas || ''}
`
}

/** Hoja de contrato: datos del acuerdo y seguimiento de firmas. El PDF firmado vive en Drive, no aquí. */
export function contratoMd(d, hoy = new Date().toISOString().slice(0, 10)) {
  return `---
contrato: pendiente   # pendiente | enviado | firmado
cliente: ${d.nombre}
creado: ${hoy}
---
# Contrato de ${d.nombre}

Basado en [[Ascent/plantillas/acuerdo-de-servicio]]. Sin claves, datos de pago ni direcciones personales. El PDF firmado se guarda en una carpeta privada de Drive; aquí solo va el enlace y las fechas.

## Datos
- Proveedor: Ascent Co. (Jesel Rosario)
- Cliente: ${d.nombre} · contacto de trabajo: ${d.contacto || '(por completar)'}
- Paquete: ${d.paquete || '(por decidir)'}
- Qué se entrega:
- Precio total: $   · 50% al empezar: $   · 50% al entregar: $
- Rondas de cambios incluidas: 2
- Fecha estimada de entrega:
- Dominio y cuentas: a nombre de ${d.nombre} (el dominio se paga directo donde se compra)
- Permiso para el portafolio: ${d.portafolio || 'por-preguntar'}

## Firmas (las dos partes)
| Parte | Nombre | Fecha | Cómo firmó |
|---|---|---|---|
| Ascent Co. | Jesel Rosario | | |
| Cliente | ${d.nombre} | | |

- PDF firmado (enlace de Drive privado):
- Contrato enviado el:
- Depósito del 50% recibido el:

## Reglas
- No se empieza el trabajo sin contrato firmado por los dos y el 50% pagado.
- Cualquier cambio de alcance o precio se anota aquí con fecha y se confirma por escrito.
- Estado del contrato arriba (campo contrato): el Centro de mando lo muestra en la ficha.
`
}

/** Historial: una línea por hecho, con fecha. Lo llenan Jesel, Claude y Hermes. */
export function historialMd(d, hoy = new Date().toISOString().slice(0, 10)) {
  return `---
cliente: ${d.nombre}
---
# Historial de ${d.nombre}

Una línea por hecho, la más nueva abajo. Formato: \`AAAA-MM-DD · quién · qué pasó\`. Sin claves ni datos de pago.

- ${hoy} · Centro de mando · Ficha creada.
`
}
