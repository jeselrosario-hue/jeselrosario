#!/usr/bin/env bash
# Instala el Centro de mando en el VPS. Úsalo en dos partes:
#   bash vps-instalar.sh llave     -> prepara carpeta y crea la llave de solo lectura para Cerebro
#   bash vps-instalar.sh app       -> clona Cerebro, pide la contraseña, arranca Docker
#   bash vps-instalar.sh hermes    -> conecta el dashboard a Hermes (solo lectura)
#   bash vps-instalar.sh netlify   -> conecta el dashboard a Netlify (solicitudes del formulario, solo lectura)
#   bash vps-instalar.sh acceso    -> instala Tailscale y publica el dashboard por HTTPS (solo tu red)
# No guarda la contraseña: solo su hash en .env (permiso 600).
set -euo pipefail
BASE=/opt/centro-de-mando
APP=$BASE/repo/centro-de-mando

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
  docker compose up -d --build
  docker compose ps
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
  sed -i '/^HERMES_/d' .env
  { echo "HERMES_URL=http://host.docker.internal:32769"; echo "HERMES_USER=$HU"; echo "HERMES_PASS=$HP"; } >> .env
  unset HP; chmod 600 .env
  docker compose up -d --build
  ;;
netlify)
  cd "$APP" && git -C "$BASE/repo" pull -q
  read -rsp "Token de Netlify (no se ve al escribir): " NT; echo
  read -rp "ID del sitio en Netlify: " NS
  sed -i '/^NETLIFY_/d' .env
  { echo "NETLIFY_TOKEN=$NT"; echo "NETLIFY_SITE_ID=$NS"; } >> .env
  unset NT; chmod 600 .env
  docker compose up -d --build
  ;;
*) echo "Uso: bash vps-instalar.sh llave|app|acceso|hermes|netlify"; exit 1;;
esac
