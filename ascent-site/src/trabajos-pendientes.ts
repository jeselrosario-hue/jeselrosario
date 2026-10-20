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
 * Trabajos de clientes que esperan permiso (hoy no hay ninguno). NO se importan en ningún componente a propósito:
 * así ni la dirección ni el texto entran al código publicado.
 *
 * Para publicar uno cuando la persona diga que sí:
 * 1. Mover su captura de `trabajos-pendientes/` a `public/trabajos/`.
 * 2. Copiar el bloque a `COPY.trabajos.items` en `src/content.ts` y borrarlo de aquí.
 */
export const TRABAJOS_PENDIENTES: Trabajo[] = []
