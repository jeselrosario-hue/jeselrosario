---
name: recetas-creativas-externas
description: Recetas de movimiento y dirección de arte de terceros (MIT), revisadas y sin código ejecutable. Úsala cuando necesites ideas de scroll cinematográfico, sistemas de animación, partículas, atmósferas o para auditar que el sitio no parezca hecho con plantilla de IA. Complementa maestro-web-creativo.
---

# Recetas creativas externas

Fuente: github.com/MengTo/Skills (Meng To, licencia MIT, ver LICENSE-MengTo). Revisadas por Claude el 4 nov 2026: solo se copió el texto de cada receta (sin demos, sin three.min.js, sin scripts). Aprende las ideas y escribe tu versión; no pegues código sin entenderlo.

## Cuándo usar cada una (lee solo la que necesites; pesan 5-18 KB)
| Receta (carpeta `recetas/`) | Úsala para |
|---|---|
| `cinematic-scroll-storytelling` | Historia que se desarrolla con el scroll: pilas de tarjetas pegajosas, parallax, texto por líneas, precarga. |
| `cinematic-gsap-lenis-motion-system` | Sistema de movimiento completo con GSAP ScrollTrigger y scroll suave. |
| `animation-on-scroll` | Aparecer al entrar a pantalla, escalonado, patrones simples. |
| `animation-systems` | Tokens de movimiento (duraciones, curvas, distancias) para que todo se sienta de la misma familia. |
| `build-awwwards-quality-sites` | Criterios de sitios de nivel premio: composición, ritmo, detalles. |
| `ambient-section-particles` | Partículas suaves por sección. |
| `atmosphere-background` | Fondos con atmósfera (luz, niebla, grano). |
| `no-ai-design-slop` y `audit-ai-design-slop` | Evitar y detectar el diseño genérico de IA. Úsala como revisión final. |

## Reglas de Ascent al usarlas
1. Lenis, GSAP y Three.js son librerías: GSAP está permitida (ver `herramientas-diseno-ascent`); Lenis y Three.js solo si Jesel da el sí y se verifica la licencia en el repo. Para scroll suave puedes hacer tu propio `lerp` (patrón de `maestro-web-creativo`).
2. Nada de CDN ni scripts externos: todo embebido.
3. Conserva el modo de movimiento completo/suave y el botón visible. Estas recetas dicen "no scroll hijacking": respétalo.
4. Si una receta choca con `maestro-web-creativo`, manda `maestro-web-creativo`.
5. Cuando uses una idea, anótala en tu lección (`mejora-continua-web`) con el nombre de la receta.
