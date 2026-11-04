---
name: maestro-web-creativo
description: La mente creativa para hacer sitios web de nivel profesional en Ascent Co. Úsala SIEMPRE que vayas a diseñar o construir una página, antes de sitio-web-premium. Fija la ambición (el brief es el piso, no el techo), qué añadir sin que te lo pidan, cómo mover el sitio de verdad y cómo calificarte antes de entregar.
---

# Maestro web creativo (Ascent Co.)

Jesel quiere que Hermes sea un experto que NO dependa de Claude: que piense, proponga y haga cosas que nadie le pidió porque dejan el sitio mejor. Esta skill es esa mentalidad. Va junto a `sitio-web-premium` (el flujo paso a paso) y `mejora-continua-web` (aprender de cada sitio).

## 0. Postura (léela cada vez)
1. El pedido es el PISO. Cumple todo lo pedido y luego sube el nivel con ideas propias.
2. Aprende, no copies. En `references/` hay un sitio de estudio (Casa Almendra v6). Entiende POR QUÉ funciona cada técnica y reinterprétala para el cliente nuevo. Nunca entregues el mismo diseño con otro nombre.
3. Cada negocio tiene una idea central distinta. Un taller mecánico, una barbería y una panadería no se mueven igual.
4. Un sitio estático es un fallo. Si en el navegador de Jesel "no se mueve nada", el trabajo no está hecho, aunque el código sea bonito.
5. Decide como un director de arte: elige, descarta, justifica en una línea. No rellenes.

## 1. Flujo creativo (antes de escribir código)
Escribe `concepto.md` (máximo 25 líneas) con:
- **Idea central**: una frase que otro diseñador pueda juzgar ("el pan lleva su propio ritmo").
- **Momento firma**: UN elemento que se recuerda (en la v6: video que avanza con el scroll + letras que reaccionan al mouse). Sin momento firma no se construye.
- **Sistema de tipografía**: escala dramática. Título de portada entre 9vw y 14vw con serif o display con carácter; texto de 17-20 px. Contraste fuerte entre tamaños. Las letras pueden tener vida (ver patrones).
- **Sistema de color**: 1 oscuro cálido, 1 claro, 1 acento y 1 apoyo. El fondo cambia de color por sección para marcar ritmo (claro, oscuro, claro, acento).
- **Sistema de movimiento**: qué se mueve con el scroll, qué con el mouse, qué solo (nunca todo igual). Tres capas: ambiente (siempre vivo), scroll (cuenta la historia), interacción (premia al visitante).
- **Ritmo de secciones**: alterna secciones densas con respiros; una sección fija (pin) por cada 3-4 secciones normales.
- **Lista de extras no pedidos**: mínimo 5 (ver sección 3), cada uno con una línea de por qué.

## 2. Cómo se siente "profesional" (criterio)
- Jerarquía clara: una cosa grande por pantalla, no cinco medianas.
- Poco texto, mucha imagen y movimiento con intención. Frases cortas.
- Imágenes con tratamiento: recorte con intención, zoom lento (Ken Burns), superposición oscura para leer texto, máscaras (clip-path), parallax a dos velocidades.
- Espacio generoso (padding vertical entre 90 y 160 px en escritorio).
- Detalles de acabado: estados hover, foco visible, cursor propio en escritorio, barra de progreso, transiciones con curvas suaves (cubic-bezier(.2,.7,.2,1)), duraciones 0.5-0.9 s para entradas, 0.15-0.25 s para clics.
- Prohibido: tres tarjetas idénticas en fila como único recurso, degradado morado, iconos de emoji, todo centrado, sombras genéricas, fotos sin tratamiento, textos de relleno ("Lorem").

## 3. Extras que debes añadir sin que te los pidan (elige los que encajen, mínimo 5)
Movimiento y mouse: letras reactivas al mouse con ola en reposo · polvo/partículas ligeras en la portada · cursor propio con agrandado sobre enlaces · botones magnéticos · tarjetas con inclinación 3D · letrero que se inclina con la velocidad del scroll.
Scroll: video que avanza y retrocede con el scroll (scrub) · texto que se ilumina palabra por palabra · imagen que se revela con máscara · sección horizontal fijada · línea SVG que se dibuja · números que cuentan · cambio de color de fondo por sección · barra de progreso · cabecera que se esconde al bajar.
Producto: botón visible "Movimiento: completo/reducido" · comparador antes/después arrastrable · simulador de pedido o cotización con total en vivo · modo día/noche · galería con teclado y swipe · enlace "saltar al contenido".
Acabado: favicon, metaetiquetas, imagen para compartir, página 404 bonita, estilos de impresión, `:focus-visible` dorado o del color de acento, textos alternativos.
Regla: cada extra debe sumar al concepto. Si no suma, no va. Anótalos en el informe: "Extra no pedido: X, porque Y".

## 4. Movimiento que sí se ve (regla dura)
- Nunca apagues TODO el movimiento por `prefers-reduced-motion`. Eso dejó el sitio v5 "estático" en la computadora de Jesel (Windows con animaciones reducidas).
- Usa dos modos: **completo** y **suave**. Suave conserva video, letras ondulando, reveals cortos y cinta lenta; solo atenúa parallax grande, rotaciones y efectos de mouse.
- Si el sistema pide reducir, empieza en suave y muestra un aviso con botón para pasar a completo. Siempre un botón visible para cambiar.
- Móvil: video sí, efectos de mouse no, sección horizontal como carrusel táctil.
- Rendimiento: solo `transform`, `opacity` y `filter`; un solo bucle `requestAnimationFrame`; pausa lo que no se ve (IntersectionObserver); CLS menor de 0.1.
- No limites a "3 efectos". Límite real: que no se vea caótico (una idea fuerte por pantalla) y que el rendimiento aguante.

## 5. Autocrítica (rúbrica, 10 puntos)
Puntúa honestamente antes de entregar. Menos de 8 = no entregues, corrige.
1. Idea central clara en 5 segundos.  2. Momento firma presente y funcionando.  3. Tipografía con jerarquía fuerte.  4. Color con ritmo por sección.  5. Movimiento de las 3 capas (ambiente, scroll, interacción).  6. Se mueve con movimiento reducido (modo suave).  7. Imágenes con tratamiento.  8. Móvil usable (390 px, sin desbordes).  9. Rendimiento y accesibilidad (CLS, contraste, teclado).  10. Al menos 5 extras no pedidos, justificados.
Incluye la tabla con tu nota y la prueba de cada punto en `informe.md`. Si no puedes ver imágenes (modelo sin visión), prueba con medidas: ver `references/prueba-movimiento.md`.

## 6. Qué cargar y en qué orden
1. `maestro-web-creativo` (esta) → concepto.  2. `sitio-web-premium` → flujo y entrega.  3. `design-taste-frontend` y `emil-design-eng` → gusto y detalles de animación.  4. `ui-ux-pro-max` → paletas y fuentes.  5. `herramientas-diseno-ascent` → qué librerías sí.  6. `gsap-scrolltrigger` si usas GSAP.  7. `references/patrones-movimiento.md` → recetas probadas.  8. `fixing-motion-performance` al final.
Para variar el estilo: `web-design-engineer/references/style-recipes/INDEX.md` (25 direcciones de estilo; elige 3 distintas y decide). Para ideas de scroll cinematográfico o partículas: `recetas-creativas-externas`. Para la crítica final: `web-design-engineer/references/critique-guide.md` y `recetas-creativas-externas/recetas/audit-ai-design-slop`.
Para una página de un solo archivo (como la v6) no hace falta React: HTML + CSS + JS propio bastan y pesan menos. Para sitios grandes de cliente, Vite + React + TS.

## 7. Límites que nunca se rompen
- Nada se publica. Jesel aprueba. Sin claves en archivos. No gastes créditos de pago.
- No inventes reseñas, direcciones, horarios ni precios reales: usa "demo" o "por confirmar".
- Solo licencias permitidas (`herramientas-diseno-ascent`). Fotos: solo con licencia y crédito aparte.
- Sin recursos externos en el archivo final (fuentes, imágenes y video embebidos).
- Si algo de arriba choca con una skill vieja (por ejemplo "máximo 3 efectos" o "reduced-motion apaga todo"), manda esta.
