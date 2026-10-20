/** Mismos campos que los bloques de `COPY.trabajos.items` en `src/content.ts`. */
interface Trabajo {
  nombre: string
  linea: string
  paquete: string
  demo: boolean
  url: string
  desktop: string
  movil: string
  alt: string
}

/**
 * Trabajos de clientes que esperan permiso. NO se importan en ningún componente a propósito:
 * así ni la dirección ni el texto entran al código publicado.
 *
 * Para publicar uno cuando la persona diga que sí:
 * 1. Mover su captura de `trabajos-pendientes/` a `public/trabajos/`.
 * 2. Copiar el bloque a `COPY.trabajos.items` en `src/content.ts` y borrarlo de aquí.
 */
export const TRABAJOS_PENDIENTES: Trabajo[] = [
  {
    nombre: 'Invitación Siuliris 21',
    linea: 'Invitación interactiva con música, video y lista de confirmados.',
    paquete: 'A medida',
    demo: false,
    url: 'invitacionsiuliris21.netlify.app',
    desktop: '/trabajos/siuliris-desktop.webp',
    movil: '/trabajos/siuliris-movil.webp',
    alt: 'Pantalla de entrada de una invitación de cumpleaños interactiva.',
  },
  {
    nombre: 'Invitación Tomorrowland',
    linea: 'Invitación en formato Stories con DJs en video y confirmación de asistencia.',
    paquete: 'A medida',
    demo: false,
    url: 'carinatomorrowland.netlify.app',
    desktop: '/trabajos/tomorrowland-desktop.webp',
    movil: '/trabajos/tomorrowland-movil.webp',
    alt: 'Pantalla de entrada de una invitación interactiva con tema Tomorrowland.',
  },
]
