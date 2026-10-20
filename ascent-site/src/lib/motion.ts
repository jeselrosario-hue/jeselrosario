/**
 * Jesel quiere que el sitio se mueva igual en computadora que en celular, aunque el sistema
 * tenga "Reducir movimiento" o "Efectos de animación" apagados. Para volver a respetar esa
 * opción del sistema, poner `true`.
 */
export const RESPETAR_REDUCIR_MOVIMIENTO = false

export const reducirMovimiento = () =>
  RESPETAR_REDUCIR_MOVIMIENTO && typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
