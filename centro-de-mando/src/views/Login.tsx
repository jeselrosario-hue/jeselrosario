import { useState, type FormEvent } from 'react'
import { entrar } from '@/api'

export function Login({ alEntrar }: { alEntrar: () => void }) {
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setOcupado(true); setError('')
    try {
      await entrar(clave)
      alEntrar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo entrar.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <main className="relative grid min-h-full place-items-center overflow-hidden px-5">
      <div aria-hidden className="absolute left-1/2 top-1/3 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky/15 blur-[120px]" />
      <form onSubmit={enviar} className="panel entra relative w-full max-w-sm p-8">
        <img src="/logo-light.png" alt="Ascent Co." className="mx-auto mb-6 h-14 w-auto" />
        <p className="eyebrow text-center">Centro de mando</p>
        <label htmlFor="clave" className="sr-only">Contraseña</label>
        <input
          id="clave" type="password" autoComplete="current-password" autoFocus required value={clave} onChange={(e) => setClave(e.target.value)}
          placeholder="Contraseña" className="mt-6 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 outline-none placeholder:text-white/40 focus:border-sky"
        />
        <button disabled={ocupado} className="mt-4 min-h-12 w-full cursor-pointer rounded-full bg-sky font-semibold text-navy transition hover:brightness-110 disabled:opacity-60">
          {ocupado ? 'Entrando…' : 'Entrar'}
        </button>
        <p role="alert" className="mt-3 min-h-5 text-center text-sm text-red-300">{error}</p>
      </form>
    </main>
  )
}
