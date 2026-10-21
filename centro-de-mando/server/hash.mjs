// Uso: npm run hash  → pide la contraseña y imprime el valor para DASH_PASSWORD_HASH
import crypto from 'node:crypto'
import readline from 'node:readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
rl.question('Contraseña nueva (mínimo 12 caracteres): ', (pw) => {
  rl.close()
  if (pw.length < 12) {
    console.error('Muy corta. Usa 12 caracteres o más.')
    process.exit(1)
  }
  const salt = crypto.randomBytes(16)
  const hash = crypto.scryptSync(pw, salt, 64)
  console.log(`\nDASH_PASSWORD_HASH=scrypt:${salt.toString('hex')}:${hash.toString('hex')}`)
})
