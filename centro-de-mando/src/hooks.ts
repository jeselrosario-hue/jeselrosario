import { useEffect, useState } from 'react'
import { api, SinSesion } from '@/api'

/** Pide datos a la API; si la sesión venció, avisa para volver al login. */
export function useApi<T>(ruta: string | null, alSinSesion: () => void, cada = 0) {
  const [datos, setDatos] = useState<T | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!ruta) return
    let vivo = true
    const cargar = () =>
      api<T>(ruta)
        .then((d) => { if (vivo) { setDatos(d); setError('') } })
        .catch((e) => { if (e instanceof SinSesion) alSinSesion(); else if (vivo) setError(e.message) })
    cargar()
    const t = cada ? setInterval(cargar, cada) : undefined
    return () => { vivo = false; if (t) clearInterval(t) }
  }, [ruta, alSinSesion, cada])
  return { datos, error }
}

export function haceCuanto(ms: number) {
  const s = Math.max(0, (Date.now() - ms) / 1000)
  if (s < 90) return 'ahora mismo'
  if (s < 3600) return `hace ${Math.round(s / 60)} min`
  if (s < 86400) return `hace ${Math.round(s / 3600)} h`
  return `hace ${Math.round(s / 86400)} d`
}
