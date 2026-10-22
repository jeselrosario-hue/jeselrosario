# Centro de mando · Ascent Co.

Dashboard privado de Jesel: Pendientes, Agentes (Hermes), Cerebro, Mapa y Conexiones.
Lee el Cerebro (Markdown) y lo muestra. Versión 0.1: solo lectura.

## En tu computadora (para probar)
```bash
cd centro-de-mando
npm install
cp .env.example .env        # y llénalo
npm run hash                # te pide una contraseña y te da DASH_PASSWORD_HASH
npm run build && npm start  # http://127.0.0.1:3000
```
`.env` necesita `CEREBRO_DIR` (la carpeta donde tienes el Cerebro), `DASH_PASSWORD_HASH` y `SESSION_SECRET` (32+ caracteres al azar: `openssl rand -hex 32`).

## En el VPS de Hostinger (siempre encendido)
1. Instala Docker (si ya corre Hermes en Docker, ya lo tienes).
2. Clona este repo y entra a `centro-de-mando/`.
3. **Cerebro de solo lectura:** crea una *deploy key* de solo lectura para el repo Cerebro (GitHub → Cerebro → Settings → Deploy keys), guarda la llave privada en `./ssh/id_ed25519` (permiso 600) y haz `git clone git@github.com:jeselrosario-hue/Cerebro.git cerebro`.
4. `cp .env.example .env`, llénalo (`CEREBRO_DIR`, `CEREBRO_GIT` y `COOKIE_SECURE` ya los pone el compose).
5. `docker compose up -d --build`. Escucha solo en `127.0.0.1:3000`.
6. **Ábrelo por HTTPS, nunca por http abierto.** Dos caminos:
   - **Cloudflare Tunnel** (gratis, no abre puertos ni necesita IP pública): `cloudflared` apunta un nombre tuyo a `http://127.0.0.1:3000`. Recomendado.
   - **Caddy** con un dominio propio: `tudominio.com { reverse_proxy 127.0.0.1:3000 }` y Caddy saca el certificado solo.
7. Opcional y recomendado: ponerle encima Cloudflare Access (correo + código) además de la contraseña.

## Seguridad (lo que ya trae)
- Contraseña con scrypt, sesión firmada y cookie `HttpOnly` + `SameSite=Strict` (+ `Secure` en el VPS), 12 h.
- Máximo 8 intentos fallidos cada 15 min por IP.
- Solo lectura; las notas se leen sin poder salir de la carpeta del Cerebro.
- CSP estricta y contenedor sin privilegios, sin escritura en disco.
- Las claves (Netlify, Gmail, Hermes) van en `.env`, nunca en la pantalla ni en el Cerebro.

## Aprobaciones
Todo lo que escribe o envía algo (crear la ficha de un cliente, pasarle una tarea a Hermes) se
guarda primero como propuesta y solo corre cuando pulsas **Aprobar**. Para escribir en el Cerebro
hace falta `CEREBRO_ESCRIBIR=1` y la llave del Cerebro con permiso de escritura
(`bash deploy/vps-instalar.sh escribir`). Si GitHub rechaza el cambio, se deshace y la propuesta
queda pendiente para reintentar.

## Clientes
Una carpeta por cliente en el Cerebro: `Clientes/<nombre>/ficha.md` (formato en `Clientes/README.md`
del Cerebro). Sin claves ni datos de pago.

## Salud y alertas
Cada 10 minutos revisa el sitio (responde, días del certificado, cabeceras de seguridad), los créditos
de Netlify y las solicitudes nuevas. Si algo **cambia**, avisa por Telegram a través de un webhook de
Hermes con entrega directa (no gasta tokens). Se conecta con `bash deploy/vps-instalar.sh alertas`.

## Home Assistant
Solo lectura, opcional (`bash deploy/vps-instalar.sh ha`). Usa el puerto 32768; el 32769 es el panel
de Hermes. Si HA no responde, espera cada vez más antes de reintentar. Para los reintentos que hace
Hermes: `bash deploy/vps-instalar.sh ha-revisar` (no cambia nada).

## Tareas de agentes
Hermes deja un archivo por tarea en `Agentes/tareas/` del Cerebro:
```
---
titulo: Sitio para la barbería de Jael
agente: Hermes
estado: aprobacion   # pendiente | haciendo | listo | aprobacion
actualizado: 2026-10-21 14:30
---
Qué hizo y qué necesita de ti.
```

## Siguientes versiones
Ver `Ascent/Centro-de-mando` en el Cerebro (solicitudes de Netlify, correo, chat con Hermes y Claude).
