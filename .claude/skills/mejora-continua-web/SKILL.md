---
name: mejora-continua-web
description: Ciclo de aprendizaje para que Hermes mejore con cada sitio que hace. Úsala al terminar cualquier sitio o ronda de correcciones (y cuando algo falle): guarda lecciones, mide, actualiza tus recetas y propone skills nuevas.
---

# Mejora continua (cada sitio te deja más experto)

Meta de Jesel: que Hermes sea un experto que no dependa de Claude y que cada sitio salga mejor que el anterior. Esta skill es el "después" de cada trabajo.

## Al terminar un sitio (obligatorio, 15 minutos)
1. **Lección del sitio**: crea `/opt/data/lecciones/AAAA-MM-DD-<sitio>.md` con:
   - Qué funcionó (técnica + por qué).
   - Qué falló o costó tiempo (error exacto + arreglo).
   - Medidas: CLS, LCP, peso, capturas distintas, animaciones activas en `reduce`.
   - Técnicas nuevas que inventaste o aprendiste (nombre, idea, 5 líneas de cómo).
   - Extras no pedidos que añadiste y si valieron la pena.
   - Autocalificación de la rúbrica de `maestro-web-creativo` (10 puntos).
2. **Actualiza tu recetario**: añade al final de `/opt/data/skills/maestro-web-creativo/references/aprendido.md` cada técnica nueva con el formato: `## Nombre` · Para qué · Cómo · Trampa. Nunca borres lo anterior; corrige si estaba mal y anota la fecha.
3. **Compara con el sitio anterior**: ¿qué hiciste mejor y qué peor? Una frase cada uno. Si empeoraste algo, es la primera tarea del próximo sitio.
4. **Siguiente nivel**: escribe 3 cosas concretas que intentarás en el próximo sitio que hoy no sabes hacer (ej. "scroll con textura 3D ligera", "transiciones entre páginas").

## Crear y mejorar tus propias skills
- Puedes crear o editar skills PROPIAS (solo Markdown, en `/opt/data/skills/<nombre>/SKILL.md`) cuando descubras un patrón que se repite. Nómbralas con claridad y ponles una `description` que diga cuándo usarlas.
- Al crear o cambiar una skill propia, avisa a Jesel en una línea (qué y por qué). No necesita aprobación porque es solo texto tuyo.
- Skills o código de TERCEROS, paquetes, MCP: sigue el proceso de `references/recursos-gratis.md` de `maestro-web-creativo` y pide el sí de Jesel.

## Cada 5 sitios: revisión mayor
Lee tus últimas 5 lecciones. Escribe `/opt/data/lecciones/resumen-AAAA-MM-DD.md`: patrones de éxito, errores repetidos, qué skill falta, qué regla vieja estorba. Propón a Jesel los cambios que afectan reglas (él decide).

## Cuando algo falle
Anótalo el mismo día en la lección: síntoma, causa real (no la primera sospecha), arreglo, y cómo evitarlo. Los errores que ya conocemos están en `maestro-web-creativo/references/patrones-movimiento.md` (por ejemplo el `-loop` con `zoompan`, o apagar todo el movimiento con reduced-motion). No repitas un error ya escrito.

## Honestidad
Reporta lo que no igualaste (por ejemplo "no pude verificar con imágenes porque mi modelo no tiene visión; verifiqué con medidas"). Jesel prefiere una lista honesta a un "todo perfecto".

## Límites
No publiques, no gastes créditos de pago, no uses claves que no te dieron, no instales nada de terceros sin el sí de Jesel. Estos límites no cambian por mejorar tu nivel.
