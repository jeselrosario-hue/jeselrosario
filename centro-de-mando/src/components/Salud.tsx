import { BellRing, CircleCheck, CircleX, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api, enviar, SinSesion } from '@/api'
import { haceCuanto } from '@/hooks'

type Salud = { en: number; chequeos: { id: string; nombre: string; ok: boolean; detalle: string }[]; alertasConfiguradas: boolean; alertas?: { ok: boolean; motivo?: string } | null }

/** Salud del sitio y del negocio, con avisos a Telegram por Hermes cuando algo cambia. */
export function Salud({ alSinSesion }: { alSinSesion: () => void }) {
  const [s, setS] = useState<Salud | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState('')
  const fallo = (e: unknown) => (e instanceof SinSesion ? alSinSesion() : setAviso((e as Error).message))

  useEffect(() => {
    api<Salud>('/api/salud').then(setS).catch((e) => (e instanceof SinSesion ? alSinSesion() : setAviso(e.message)))
  }, [alSinSesion])

  async function revisar() {
    setOcupado(true)
    setAviso('')
    try {
      const r = await enviar<Salud>('/api/salud/revisar', {})
      setS((v) => ({ ...r, alertasConfiguradas: v?.alertasConfiguradas ?? false }))
    } catch (e) { fallo(e) } finally { setOcupado(false) }
  }
  async function probar() {
    setAviso('')
    try {
      await enviar('/api/alertas/probar', {})
      setAviso('Alerta de prueba enviada. Mira Telegram.')
    } catch (e) { fallo(e) }
  }

  const malos = s?.chequeos.filter((c) => !c.ok).length ?? 0
  return (
    <section className="panel mt-8 max-w-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-sans text-base font-semibold">Salud del sitio {s && s.chequeos.length > 0 && <span className={`ml-1 text-sm font-normal ${malos ? 'text-red-300' : 'text-emerald-300'}`}>{malos ? `${malos} por revisar` : 'todo bien'}</span>}</h2>
        <div className="flex gap-2">
          {s?.alertasConfiguradas && <button onClick={probar} className="flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-white/20 px-3.5 text-xs text-white/80 hover:border-sky"><BellRing className="size-3.5" aria-hidden /> Probar alerta</button>}
          <button onClick={revisar} disabled={ocupado} className="flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full bg-sky px-3.5 text-xs font-semibold text-navy transition-transform duration-150 active:scale-[0.97] disabled:opacity-50"><RefreshCw className={`size-3.5 ${ocupado ? 'animate-spin' : ''}`} aria-hidden /> Revisar ahora</button>
        </div>
      </div>
      {!s || s.chequeos.length === 0 ? (
        <p className="mt-3 text-sm text-white/55">{ocupado ? 'Revisando…' : 'Todavía no hay revisión. Corre sola cada 10 minutos.'}</p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {s.chequeos.map((c) => (
            <li key={c.id} className="flex items-start gap-3 text-sm">
              {c.ok ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-label="Bien" /> : <CircleX className="mt-0.5 size-4 shrink-0 text-red-400" aria-label="Problema" />}
              <span className="min-w-0"><span className="text-white/90">{c.nombre}</span> <span className="text-white/55">· {c.detalle}</span></span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-white/45">
        {s?.en ? `Revisado ${haceCuanto(s.en)}. ` : ''}
        {s?.alertasConfiguradas ? 'Si algo cambia, te avisa por Telegram (Hermes, sin gastar tokens).' : 'Alertas por Telegram: sin conectar (bash vps-instalar.sh alertas).'}
      </p>
      {aviso && <p role="status" className="mt-2 text-sm text-sky">{aviso}</p>}
    </section>
  )
}
