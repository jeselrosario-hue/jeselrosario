# Ascent Co. · sitio de presentación

Vite + React + TypeScript + Tailwind v4 + Motion + Lenis. Tipografía: Instrument Serif (títulos), Geist (texto) y Geist Mono (etiquetas). Listo para Netlify.

## Cambiar los enlaces (WhatsApp, Instagram, Facebook)

Abre **`src/config.ts`** y llena `LINKS`:

```ts
export const LINKS = {
  whatsapp: '17875550142',                 // número con código de país, o un enlace wa.me completo
  instagram: 'https://instagram.com/tu_usuario',
  facebook: 'https://facebook.com/tu_pagina',
}
```

- El mensaje que llega escrito a WhatsApp se cambia en `WHATSAPP_MESSAGE` (mismo archivo).
- Si un enlace queda vacío, su botón se muestra apagado con "Pronto" y el botón de la portada baja a la sección de contacto.
- `SITE_URL` es lo que codifica el QR de ejemplo.

## Agenda de citas (Cal.com)

`CAL_LINK` en el mismo `src/config.ts` enciende la agenda del paquete de citas:

```ts
export const CAL_LINK = 'ascentco/consulta'   // lo que va después de cal.com
```

Vacío no carga nada y la página queda igual. Con enlace aparece un bloque bajo los extras
donde se reserva sin salir del sitio, con los colores de la marca. El componente es
`src/components/CalEmbed.tsx` y sirve tal cual para el sitio de un cliente: se le pone
su propio enlace de Cal.com (el plan gratis alcanza) y listo.

## Cambiar textos y precios

Todo el texto está en **`src/content.ts`** (portada, paquetes, precios, extras, pasos, condiciones). No hay que tocar componentes.

## Cambiar los ejemplos visuales

Las imágenes de los mockups están en `public/examples/` (`fadelab-site.webp` es el sitio que se muestra en el navegador y en la carpeta del sitio web). Cámbialas por trabajos tuyos con el mismo nombre. El logo está en `public/logo-light.png`: las partículas de la portada se forman con esa imagen.

## Correr y publicar

```bash
npm install
npm run dev        # desarrollo
npm run build      # genera dist/
```

**Netlify:** conecta el repositorio, y como carpeta base pon `ascent-site` si el proyecto está dentro de otro repo. `netlify.toml` ya trae el comando (`npm run build`) y la carpeta (`dist`). También sirve arrastrar la carpeta `dist` en netlify.com/drop.

## Movimiento (Motion)

`src/components/motion/`: scroll con inercia (`SmoothScroll`, Lenis), barra de progreso, cursor, botones magnéticos, titulares que se revelan por palabra (`SplitText`), números que cuentan (`CountUp`), tarjetas con foco de luz (`SpotlightCard`), cinta que reacciona al scroll (`Marquee`) y cortina de entrada (`Intro`). "Ejemplos" y "Proceso" son escenas fijas controladas por el scroll (`useScroll` + `useTransform`). Todo respeta `prefers-reduced-motion`.

## Notas técnicas

- Portada WebGL2 (`src/components/LiquidHero.tsx`). Si no hay WebGL2, o el usuario tiene "reducir movimiento", se ve el logo estático con brillo. Se pausa fuera de pantalla y usa menos partículas en móvil.
- Accesibilidad: contraste AA, foco visible, objetivos táctiles de 44 px, carpetas operables con teclado (`aria-expanded`), enlace para saltar al contenido y `prefers-reduced-motion` respetado.
- Portada y carpetas son componentes de **21st.dev**: *Liquid Sculpture Hero* (`src/components/ui/liquid-sculpture-hero.tsx`, autor gughigug) y *Glassmorphism Folder Cards* (`src/components/ui/glass-folder-cards.tsx`, autor kedhareswer). Se usan con el logo de Ascent y la paleta de la marca (`src/sections/Hero.tsx` y `src/sections/Services.tsx`).
- Las imágenes de la portada están en `public/hero/` (logo sobre transparente: `logo-wide.webp` escritorio, `logo-tall.webp` móvil) y las de las hojas de cada carpeta en `public/mockups/`. Para regenerar estas últimas: `npm run dev`, abre `/shots.html?s=phone` (también `links`, `fotos`, `site`, `chat`, `qr20`, `qr15`, `qr10`) y captura la escena. `shots.html` no se incluye en el build.
- Capa estilo shadcn (`components.json`, `cn`, `Button`).

## Herramientas del proyecto (`.mcp.json` y `.claude/skills/`)

Al abrir Claude Code en este repositorio quedan disponibles:

| Qué | Para qué | Necesita |
|---|---|---|
| `playwright` (MCP) | Que Claude abra el sitio, lo pruebe, mire la consola y tome capturas y video en vez de decir "ya está" | nada; se baja solo la primera vez |
| `21st` (MCP) | Traer componentes de 21st.dev | la variable `API_KEY_21ST` |
| `figma` (MCP) | Leer tipografías, componentes y espaciados de un archivo de Figma | cuenta de Figma; autenticar con `/mcp` |
| `frontend-design` | Evitar el diseño genérico de IA | — |
| `taste-skill` | Dirección de arte: reparte direcciones y revisa la página con un inspector real | Node 22+ y Chrome |
| `emil-design-eng` | Pulido de interfaz y decisiones de animación | — |
| `ui-ux-pro-max` | Estilos, paletas y tipografías | — |

Las skills **no se activan solas**: hay que nombrarlas. Por ejemplo:

> Usa la skill emil-design-eng para revisar esta página, y después pruébala con Playwright
> en móvil y escritorio: navegación, botones, consola y capturas. No digas que funciona
> hasta que lo hayas comprobado.

El registro `@cult-ui` está en `components.json`, así que cualquier componente de
cult-ui.com entra con `npx shadcn add @cult-ui/<nombre>`.
