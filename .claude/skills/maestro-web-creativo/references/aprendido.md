# Aprendido (recetario vivo)

Se alimenta con `mejora-continua-web`. Formato: ## Nombre · Para qué · Cómo · Trampa. Nunca borres; corrige y fecha.

## Lo que Hermes ya hace bien (v4 y v5, nov 2026) — conserva esto
- **Build en un solo archivo**: `vite.standalone.config.ts` con `codeSplitting:false`, imágenes y fuentes en base64. Abre con doble clic. Para: que Jesel lo vea sin servidor.
- **Medición real**: Lighthouse escritorio 99/100/100, CLS 0.001, LCP 1.0 s (v5). Reporta números, no estimados.
- **Disciplina de licencias**: `creditos.md` con autor, licencia y enlace de cada foto/fuente; recreaciones "inspiradas en" sin copiar código.
- **Ciclo mirar-y-corregir**: `correcciones.md` con defectos concretos y arreglos; capturas por sección en 1440x900 y 390x844.
- **Entrega ordenada**: html, zip reproducible (`tools/package_zip.py`), capturas e `informe.md` con lista honesta de límites.
- **Piezas buenas de la v5**: SVG de itinerario que se dibuja, comparador con teclado y toque, pedido de demostración, lightbox con teclado/swipe, tarjetas con inclinación 3D, tema día/noche, TypeScript estricto.

## Lo que falló y no debe repetirse
- v5: `prefers-reduced-motion` apagaba TODAS las animaciones → "estático" en Windows de Jesel. Arreglo: modos completo/suave + botón (patrón 11).
- v5: LCP móvil 4.6 s. Pendiente: imagen de portada más liviana, precarga, evitar el chunk de GSAP en móvil.
- Hermes se cuelga con pegados largos (más de ~1,000 caracteres) o con muchas comillas/acentos: pedidos en trozos cortos.
- Cuotas: el plan de ChatGPT/Codex se agota (reinicia en semanas) y Gemini sin créditos. Los modelos gratis de OpenRouter tienen tope diario (~50 pedidos). Planifica: haz primero lo esencial, deja guardado el estado en archivos para retomar.
- Un PNG con metadatos rellenados para esquivar una regla de "mismo tamaño" NO es honesto. Si una regla estorba, dilo; no la esquives.

## Lo que hizo Claude en la v6 y vale estudiar
Ver `patrones-movimiento.md` y `casa-almendra-v6-estudio.html`: portada con video + letras reactivas + polvo; video que avanza con el scroll; texto palabra por palabra; máscara con parallax; galería horizontal fijada; ruta SVG; letrero con velocidad; cursor y botones magnéticos; modos de movimiento.
