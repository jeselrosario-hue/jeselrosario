---
name: sitio-web-premium
description: Flujo obligatorio, paso a paso y para cualquier modelo, para hacer un sitio web de cliente de Ascent Co. con diseño premium, imágenes reales y mucho movimiento. Úsala antes de escribir código de cualquier sitio.
---

# Sitio web premium (funciona con cualquier modelo)

Este flujo no depende del gusto del modelo: cada paso tiene una salida que se puede comprobar. No saltes pasos. Si un paso falla, repítelo; no lo declares hecho.

## 0. Cargar (obligatorio, en este orden)
Carga con skill_view: `design-taste-frontend`, `ui-ux-pro-max`, `emil-design-eng`, `gsap-scrolltrigger`, `gsap-timeline`, `claude-design`, `fixing-motion-performance`, `herramientas-diseno-ascent`. Di en una línea cuáles cargaste. Si falta alguno, dilo y sigue con los demás.

## 1. Brief de diseño (sin código)
Escribe `brief.md` con: idea central en una frase; público; 3 adjetivos de marca; paleta (hex, con roles); dos fuentes (títulos y texto) con tamaños; composición de la portada; lista de secciones con el momento de movimiento de cada una; qué imagen lleva cada sección. Prohíbe lo genérico: tarjetas idénticas en fila, degradado morado, iconos de emoji, texto centrado en todo.

## 2. Imágenes (nada de cuadros vacíos)
Cada sección lleva arte propio. Orden de preferencia: (a) ilustración SVG compleja hecha a mano (capas, sombras, textura de grano con feTurbulence, formas orgánicas, detalles); (b) composición con `image-composition-pil`; (c) `comfyui` si hay modelo local; (d) generador de pago solo con permiso de Jesel. Nunca imágenes de internet con derechos. Guarda todo en `public/img/` y optimiza (webp o svg, con ancho y alto fijos).

## 3. Construir por secciones
Una sección a la vez, no todo junto. Vite + React + TypeScript + Tailwind 3.4. Animación: Motion para entradas y hover, GSAP ScrollTrigger para pin/scrub, Anime.js solo para SVG. Máximo 3 efectos llamativos visibles a la vez. Solo transform, opacity y filter. `prefers-reduced-motion` apaga todo. Sin recursos externos. TypeScript estricto: prohibido `@ts-ignore`; si una librería no trae tipos, escribe un `d.ts` mínimo.
Mínimos de movimiento: portada con título por palabras y fondo vivo; una sección fijada con 3 pasos; números que suben; tarjetas con hover profundo y entrada escalonada; un SVG que se dibuja; un letrero deslizante; transición suave entre secciones.

## 4. Ciclo mirar-y-corregir (mínimo 2 vueltas)
1. `npm run build` sin errores.
2. Con Playwright haz scroll lento por TODA la página (pasos de 300 px con espera de 400 ms) para disparar los reveals, y captura CADA sección en 1440x900 y 390x844 por separado.
3. Mira cada captura (vision). Compruébalo: ninguna sección vacía; ninguna captura con el mismo peso que otra; texto legible; nada cortado en móvil; arte visible en cada sección.
4. Escribe en `correcciones.md` al menos 5 defectos concretos que veas y corrígelos. Repite desde 1.
Si dos capturas de secciones distintas pesan igual, algo está vacío: es un fallo.

## 5. Medidas reales
CLS y LCP con PerformanceObserver en una carga con scroll completo, no antes del scroll. Consola sin errores. Contraste mínimo 4.5:1. Reporta números, no estimados.

## 6. Entrega
`dist/` servible, carpeta `entrar/` con index.html que abre con doble clic (rutas relativas, base './'). Tar.gz sin node_modules. Informe con: herramienta por lugar, comandos, fallos, tiempo, CLS/LCP, y lista honesta de lo que falta. Sube a Drive solo con aprobación de Jesel (tarea en Agentes/tareas/).

## Reglas
- Nada se publica sin aprobación. No instales fuera de la lista permitida. No gastes créditos de pago sin preguntar. Sin claves en archivos.
- Si el modelo es débil: haz menos secciones pero termina el ciclo 4 en cada una.
