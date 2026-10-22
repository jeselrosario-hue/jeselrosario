#!/usr/bin/env bash
# Instala el Centro de mando en el VPS. Úsalo en dos partes:
#   bash vps-instalar.sh llave     -> prepara carpeta y crea la llave de solo lectura para Cerebro
#   bash vps-instalar.sh app       -> clona Cerebro, pide la contraseña, arranca Docker
#   bash vps-instalar.sh hermes    -> conecta el dashboard a Hermes (solo lectura)
#   bash vps-instalar.sh netlify   -> conecta el dashboard a Netlify (solicitudes del formulario, solo lectura)
#   bash vps-instalar.sh hermes-chat -> conecta el chat con Hermes (su API, solo por la red interna de Docker)
#   bash vps-instalar.sh escribir  -> deja que el dashboard escriba en el Cerebro (fichas, tareas), siempre con tu Aprobar
#   bash vps-instalar.sh cal       -> conecta las citas de Cal.com (solo lectura)
#   bash vps-instalar.sh actualizar -> baja la última versión y reinicia
#   bash vps-instalar.sh acceso    -> instala Tailscale y publica el dashboard por HTTPS (solo tu red)
# No guarda la contraseña: solo su hash en .env (permiso 600).
set -euo pipefail
BASE=/opt/centro-de-mando
APP=$BASE/repo/centro-de-mando

# Cambia (o añade) una variable del .env sin tocar las demás.
fijar() { touch .env; sed -i "/^$1=/d" .env; printf '%s=%s\n' "$1" "$2" >> .env; chmod 600 .env; }
# Carpeta de estado propio del dashboard (estados de solicitudes, aprobaciones). El contenedor corre como 1000.
datos() { mkdir -p "$APP/datos" && chmod 700 "$APP/datos" && chown 1000:1000 "$APP/datos"; }
reiniciar() { datos; docker compose up -d --build; docker compose ps; }

case "${1:-}" in
llave)
  mkdir -p "$BASE" && cd "$BASE"
  [ -d repo ] && git -C repo pull -q || git clone -q --depth 1 -b ccr-2820c56a-jsfr7r https://github.com/jeselrosario-hue/jeselrosario.git repo
  mkdir -p "$APP/ssh" && chmod 700 "$APP/ssh"
  [ -f "$APP/ssh/id_ed25519" ] || ssh-keygen -q -t ed25519 -N "" -C "centro-de-mando-vps" -f "$APP/ssh/id_ed25519"
  ssh-keyscan -t ed25519 github.com > "$APP/ssh/known_hosts" 2>/dev/null
  chmod 600 "$APP/ssh/id_ed25519"; chown -R 1000:1000 "$APP/ssh"
  echo; echo "Copia esta llave PUBLICA y pégala en GitHub > Cerebro > Settings > Deploy keys (sin marcar 'write'):"; echo
  cat "$APP/ssh/id_ed25519.pub"
  ;;
app)
  cd "$APP"
  [ -d cerebro ] || GIT_SSH_COMMAND="ssh -i $APP/ssh/id_ed25519 -o UserKnownHostsFile=$APP/ssh/known_hosts" git clone -q git@github.com:jeselrosario-hue/Cerebro.git cerebro
  chown -R 1000:1000 cerebro
  read -rsp "Contraseña del dashboard (12+ caracteres): " PW; echo
  HASH=$(PW="$PW" node -e "const c=require('crypto');const p=process.env.PW;if(p.length<12){process.exit(1)}const s=c.randomBytes(16);console.log('scrypt:'+s.toString('hex')+':'+c.scryptSync(p,s,64).toString('hex'))" 2>/dev/null \
    || docker run --rm -e PW="$PW" node:22-alpine node -e "const c=require('crypto');const p=process.env.PW;if(p.length<12){process.exit(1)}const s=c.randomBytes(16);console.log('scrypt:'+s.toString('hex')+':'+c.scryptSync(p,s,64).toString('hex'))") || { echo "Muy corta o error."; exit 1; }
  unset PW
  umask 077
  { echo "PORT=3000"; echo "DASH_PASSWORD_HASH=$HASH"; echo "SESSION_SECRET=$(openssl rand -hex 32)"; } > .env
  chmod 600 .env
  reiniciar
  ;;
acceso)
  command -v tailscale >/dev/null || curl -fsSL https://tailscale.com/install.sh | sh
  tailscale up
  tailscale serve --bg 3000
  tailscale serve status
  ;;
hermes)
  cd "$APP" && git -C "$BASE/repo" pull -q
  read -rp "Usuario del panel de Hermes: " HU
  read -rsp "Contraseña del panel de Hermes: " HP; echo
  fijar HERMES_URL http://host.docker.internal:32769; fijar HERMES_USER "$HU"; fijar HERMES_PASS "$HP"
  unset HP
  reiniciar
  ;;
netlify)
  cd "$APP" && git -C "$BASE/repo" pull -q
  read -rsp "Token de Netlify (no se ve al escribir): " NT; echo
  read -rp "ID del sitio en Netlify: " NS
  read -rp "Nombre corto del equipo (app.netlify.com/teams/ESTE; Enter para saltar): " NE
  fijar NETLIFY_TOKEN "$NT"; fijar NETLIFY_SITE_ID "$NS"; [ -n "$NE" ] && fijar NETLIFY_TEAM "$NE"
  unset NT
  reiniciar
  ;;
hermes-chat)
  cd "$APP" && git -C "$BASE/repo" pull -q
  HC=$(docker ps --format '{{.Names}}' | grep -i hermes | head -1)
  [ -n "$HC" ] || { echo "No encontré el contenedor de Hermes (docker ps)."; exit 1; }
  NET=$(docker inspect "$HC" -f '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}' | awk '{print $1}')
  if [ "$NET" = "bridge" ] || [ -z "$NET" ]; then
    echo "Hermes está en la red 'bridge' por defecto: ahí Docker no resuelve nombres. Pídele a Claude el plan B."; exit 1
  fi
  KEY=$(openssl rand -hex 32)
  fijar HERMES_API_URL "http://$HC:8642"; fijar HERMES_API_KEY "$KEY"
  # El Centro de mando entra a la red de Hermes; el puerto 8642 NO se publica en el VPS.
  printf 'services:\n  centro-de-mando:\n    networks: [default, hermes]\nnetworks:\n  hermes:\n    external: true\n    name: %s\n' "$NET" > docker-compose.override.yml
  reiniciar
  echo
  echo "Falta encender la API en Hermes ($HC). En sus variables de entorno (hPanel > Docker, o el .env de Hermes) pon:"
  echo "  API_SERVER_ENABLED=true"
  echo "  API_SERVER_HOST=0.0.0.0"
  echo "  API_SERVER_KEY=$KEY"
  echo "NO publiques el puerto 8642 (nada de 8642:8642): da acceso a la terminal de Hermes. Reinicia Hermes y abre el chat."
  unset KEY
  ;;
cal)
  cd "$APP" && git -C "$BASE/repo" pull -q
  read -rsp "Clave de Cal.com (Settings > Developer > API keys; no se ve al escribir): " CK; echo
  fijar CAL_API_KEY "$CK"; unset CK
  reiniciar
  ;;
escribir)
  cd "$APP" && git -C "$BASE/repo" pull -q
  echo "1) En GitHub > Cerebro > Settings > Deploy keys: borra la llave 'centro-de-mando-vps' y vuelve a añadirla"
  echo "   con esta misma llave pública, marcando 'Allow write access':"; echo; cat "$APP/ssh/id_ed25519.pub"; echo
  read -rp "2) ¿Ya la añadiste con permiso de escritura? (si/no): " OK
  [ "$OK" = "si" ] || { echo "No cambié nada."; exit 0; }
  fijar CEREBRO_ESCRIBIR 1
  reiniciar
  ;;
actualizar)
  cd "$APP" && git -C "$BASE/repo" pull -q
  reiniciar
  ;;
*) echo "Uso: bash vps-instalar.sh llave|app|acceso|hermes|hermes-chat|netlify|cal|escribir|actualizar"; exit 1;;
esac
