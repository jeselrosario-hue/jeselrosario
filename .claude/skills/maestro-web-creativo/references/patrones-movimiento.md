# Patrones de movimiento probados (Casa Almendra v6)

Cada patrón: para qué sirve, cómo funciona, trampa conocida. El código completo está en `casa-almendra-v6-estudio.html` (estudia, no copies). Todos usan un solo bucle `requestAnimationFrame` y leen `scrollY` una vez por cuadro.

## Base
```js
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
// progreso de una sección 0..1 mientras pasa por la pantalla
const p = clamp((scrollY - seccionTop) / (seccionAlto - innerHeight), 0, 1);
```
Mide posiciones (`top` de cada sección) UNA vez y vuelve a medir en `resize`, `load` y a los 600 ms y 2 s (las imágenes cambian la altura).

## 1. Video que avanza con el scroll (scrub)
Para qué: contar un proceso (masa → horno → mesa). Es el "momento firma" más fuerte.
Cómo: contenedor alto (420vh) + `position:sticky; top:0; height:100vh` con `<video muted playsinline>`. En el bucle: `target = p * (duration-0.05)`; `cur = lerp(cur, target, .14)`; `video.currentTime = cur` si cambió más de 0.02 y `!video.seeking`.
Trampas: codifica el video con fotogramas clave frecuentes (`-g 4` a `-g 8`), si no, a saltos. Hazlo `webm` VP9 (Chromium de Playwright no reproduce H.264). Resolución 854x480 y `-crf 42` bastan (1.8 MB para 12 s). Cambia textos por tramos de `p` con clases (no por posición).

## 2. Letras que reaccionan al mouse
Para qué: la firma tipográfica de la portada.
Cómo: separa el título en `<span class="ch">` por letra (deja `aria-label` en el h1 y `aria-hidden` en las letras). Cada cuadro, para cada letra: distancia al mouse → `p = smoothstep(1 - d/radio)`; mueve la letra alejándola (`-dx*.22*p`), agrándala (`1+.42*p`), inclínala y mézclale el color hacia el acento. Suaviza con `lerp(actual, destino, .16)`.
Sin mouse (táctil o quieto 1.8 s): ola idle `sin(t/700 + i*.55)` que sube/baja y gira un poco. Así NUNCA está estático.
Trampa: no pongas `transition` en CSS en esas letras (pelea con el lerp).

## 3. Texto que se ilumina palabra por palabra
Divide el párrafo en `<span>` por palabra con `opacity:.14`. `n = round(progreso * palabras)`; las primeras `n` pasan a `opacity:1` con una clase. Progreso: `(scrollY + vh*.82 - top) / (alto + vh*.35)`.

## 4. Imagen que se revela con máscara + parallax
`clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)` según progreso; dentro, la `<img>` más alta que el marco (`inset:-12% 0; height:124%`) y se mueve en `translate3d` a otra velocidad. Un círculo flotante con otro ritmo y rotación da profundidad (tres velocidades).

## 5. Sección horizontal fijada
Contenedor con altura = `track.scrollWidth - innerWidth + innerHeight`; dentro un `sticky` de 100vh; el track se mueve con `translate3d(-p*recorrido,0,0)`. Cada imagen interior se mueve un poco en sentido contrario (parallax interno). En móvil (<820 px): `overflow-x:auto; scroll-snap-type:x mandatory`, sin transform.

## 6. Línea SVG que se dibuja
`path.style.strokeDasharray = largo; strokeDashoffset = largo*(1-p)`. Los puntos de parada se activan cuando `p` pasa su umbral. Usa un `path.base` punteado debajo como guía.

## 7. Letrero (marquee) que reacciona
Posición `x -= 0.8 + |velocidad|*0.35`; `skewX(clamp(-velocidad*.35, -8, 8))`. Velocidad = `lerp(vel, scrollY - lastY, .18)`. Duplica el contenido para el bucle y reinicia con `x += ancho/2`.

## 8. Polvo / partículas en la portada
Canvas 2D con 36 (móvil) a 80 partículas; deriva lenta hacia arriba, parpadeo con `sin`, se apartan del mouse a 120 px. Pausa si la portada no está visible. Alfa baja (.2-.7).

## 9. Cursor propio y botones magnéticos (solo `(hover:hover) and (pointer:fine)`)
Punto de 14 px con `mix-blend-mode:difference` y `lerp .22`; crece a 54 px sobre enlaces y tarjetas. Botón magnético: si el mouse está a menos de 110 px, el botón se desplaza `dx*.28, dy*.4` (suave con lerp); fuera del radio vuelve a 0. Solo en modo completo.

## 10. Tarjetas con inclinación 3D
`perspective:1100px` en el contenedor; en `pointermove` calcula `rotateX/rotateY` (máx. ±7°) y `translateZ(8px)`; al salir, quita el transform (la transición CSS lo suaviza). Solo escritorio, solo modo completo.

## 11. Política de movimiento (OBLIGATORIA)
- Variable `mode = 'full' | 'soft'`. Se guarda en `localStorage` (con try/catch).
- `AMP = mode==='soft' ? .3 : 1` multiplica todas las amplitudes.
- Si `prefers-reduced-motion: reduce` → arranca en `soft`, muestra aviso con botón "Activar movimiento completo" 9 s, y siempre hay un botón fijo "Movimiento: completo/reducido".
- Nunca escribas `@media (prefers-reduced-motion){ *{animation:none!important} }`.
- Las animaciones CSS ambientales (shimmer, ping) se quedan; son leves.

## 12. Un solo archivo autocontenido
- Fuentes: `@font-face` con `data:font/woff2;base64`.
- Imágenes y video: base64 dentro de `<script type="text/plain" id="a-img0">`; en JS decodifica con `atob` → `Uint8Array` → `Blob` → `URL.createObjectURL` y asigna a `src`. Así el video se puede buscar (seek) y el HTML no tiene atributos gigantes.
- Meta: menos de 9 MB. La v6 pesa 7 MB con 8 fotos WebP, 2 videos y 5 fuentes.
- Verifica abriendo por `file://` en Playwright: 0 errores, 0 peticiones externas, `naturalWidth>0` en todas las imágenes.

## 13. Video con ffmpeg a partir de fotos (receta)
Ver `video-ffmpeg.py`. `zoompan` con Ken Burns alternando acercar/alejar, `xfade` entre fotos, VP9.
TRAMPA GRAVE: no uses `-loop 1 -t N` con `zoompan`: `zoompan` produce `d` cuadros POR CADA cuadro de entrada y el archivo sale gigante (12-17 MB y minutos de espera). Entrada de UNA imagen sin `-loop`, y `d = segundos*24`.
Después de codificar mide: si pesa más de 2 MB por clip, baja a 854x480 y `-crf 42`.

## 14. Lecciones de proceso
- Prueba por `file://` con Playwright en 1440x900 y 390x844, en `no-preference` y en `reduce`. Cuenta `document.getAnimations()` y compara capturas por hash: deben ser distintas.
- Los modelos grandes se cuelgan con entradas largas: dale los pedidos en trozos cortos.
- Un buen sitio sale de iterar: construye, mira (o mide), corrige, repite. La v6 ganó con tres vueltas: (1) subtítulo del escenario partido en una palabra por línea por falta de ancho, (2) video de 17 MB por el error de `-loop`, (3) cursor azul feo sobre fondo claro por `difference` con color: usa blanco.
