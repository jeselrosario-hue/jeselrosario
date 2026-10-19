# Ascent Co. · sitio de presentación

Vite + React + TypeScript + Tailwind v4 + Motion. Fuente: Sora. Listo para Netlify.

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

## Notas técnicas

- Portada WebGL2 (`src/components/LiquidHero.tsx`). Si no hay WebGL2, o el usuario tiene "reducir movimiento", se ve el logo estático con brillo. Se pausa fuera de pantalla y usa menos partículas en móvil.
- Accesibilidad: contraste AA, foco visible, objetivos táctiles de 44 px, carpetas operables con teclado (`aria-expanded`), enlace para saltar al contenido y `prefers-reduced-motion` respetado.
- Portada y carpetas son componentes de **21st.dev**: *Liquid Sculpture Hero* (`src/components/ui/liquid-sculpture-hero.tsx`, autor gughigug) y *Glassmorphism Folder Cards* (`src/components/ui/glass-folder-cards.tsx`, autor kedhareswer). Se usan con el logo de Ascent y la paleta de la marca (`src/sections/Hero.tsx` y `src/sections/Services.tsx`).
- Las imágenes de la portada están en `public/hero/` (logo sobre transparente: `logo-wide.webp` escritorio, `logo-tall.webp` móvil) y las de las hojas de cada carpeta en `public/mockups/`. Para regenerar estas últimas: `npm run dev`, abre `/shots.html?s=phone` (también `links`, `fotos`, `site`, `chat`, `qr20`, `qr15`, `qr10`) y captura la escena. `shots.html` no se incluye en el build.
- Capa estilo shadcn (`components.json`, `cn`, `Button`).
