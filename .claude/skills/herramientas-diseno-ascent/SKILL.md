---
name: herramientas-diseno-ascent
description: Qué librerías de animación y componentes usar (y cuáles no) al hacer sitios para clientes de Ascent Co., con licencias, comandos y reglas de rendimiento. Úsala antes de elegir efectos, animaciones o componentes para un sitio.
---

# Herramientas de diseño y animación (Ascent Co.)

Sirve para cualquier modelo (Claude, Hermes). Revisado el 3 nov 2026. Hermes propone y Jesel aprueba: nada de pago, nada fuera de esta lista sin preguntar.

## Permitidas (gratis, licencia revisada)
| Herramienta | Licencia | Cómo se instala | Para qué |
|---|---|---|---|
| Motion (motion.dev) | MIT | `npm i motion` y `import { motion } from "motion/react"` | Entradas, scroll, layout, gestos. Primera opción. |
| Anime.js | MIT | `npm i animejs` | Secuencias y SVG ligeras sin React. |
| GSAP | "Standard no charge" (gratis, incluso comercial; no se usa para hacer un editor visual que compita con Webflow) | `npm i gsap` (+ `@gsap/react`) | Scroll complejo (ScrollTrigger), líneas de tiempo. Pesa más: solo si hace falta. |
| Magic UI | MIT | CLI de shadcn; copia el comando exacto de la página de cada componente | Efectos de landing (marquee, shimmer, bordes, números). Nunca los "Pro". |
| Cult UI | MIT | CLI de shadcn; comando en la página del componente | Tarjetas, textos y bloques animados. |
| React Bits | MIT + Commons Clause | Copiar el código o CLI desde la página del componente | Textos, fondos y tarjetas animados. Se pueden usar dentro del sitio de un cliente; NO revender ni empaquetar sus componentes como librería o plantilla. |

## Solo mirar (inspiración, no instalar)
Godly, Mobbin, Refero Styles (su `DESIGN.md` sirve para copiar un estilo), blog Vibe Coder.

## Prohibidas hasta que Jesel diga
Skiper UI premium, Motion+, Magic UI Pro, Motion Sites, Spline, Manus, BKLit UI, Particles (sin licencia), Watermelon UI y Motion Primitives (licencia sin confirmar).

## Reglas al usarlas
1. Rama propia. Un componente = un archivo; anota en el historial del cliente cuál usaste y de dónde.
2. Máximo 3 efectos llamativos por página; el resto, sobrio. Poco texto, visual y profesional.
3. Respeta `prefers-reduced-motion`: sin movimiento cuando el visitante lo pide.
4. Anima solo `transform` y `opacity`. Nada que cambie el tamaño al cargar (CLS menor de 0.1). Precarga la tipografía principal.
5. Móvil primero (390×844): sin animaciones pesadas ni fondos con canvas grandes.
6. No copies código sin leerlo: ningún script externo, nada de rastreo, sin llamadas a otros sitios.
7. Antes de entregar: build limpio, Playwright en móvil y escritorio, capturas a Jesel para sí o no.
