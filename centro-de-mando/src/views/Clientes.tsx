import { ArrowLeft, ExternalLink, FileText, Plus, Send, UserRound } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { api, avisarPropuestas, enviar, SinSesion, type Cliente, type Clientes as Datos } from '@/api'
import { Aprobaciones } from '@/components/Aprobaciones'
import { Markdown } from '@/components/Markdown'
import { useApi } from '@/hooks'

const ESTADO: Record<string, { nombre: string; color: string }> = {
  prospecto: { nombre: 'Prospecto', color: '#94a3b8' },
  'en-proceso': { nombre: 'En proceso', color: '#4abdf0' },
  entregado: { nombre: 'Entregado', color: '#34d399' },
  pausado: { nombre: 'Pausado', color: '#fbbf24' },
}
const PERMISO: Record<string, string> = { si: 'Portafolio: sí', capturas: 'Portafolio: solo capturas', no: 'Portafolio: no', 'por-preguntar': 'Portafolio: por preguntar' }

/** Datos que la Bandeja deja para empezar la ficha desde una solicitud. */
export const PREFILL = 'cdm:prefill-cliente'

function Chip({ estado }: { estado: string }) {
  const e = ESTADO[estado] ?? ESTADO.prospecto
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-0.5 text-xs"><span aria-hidden className="size-1.5 rounded-full" style={{ background: e.color }} />{e.nombre}</span>
}

const campo = 'min-h-11 w-full rounded-xl border border-white/15 bg-white/[0.05] px-3.5 text-[15px] text-white outline-none transition-colors placeholder:text-white/35 focus:border-sky'

function Nuevo({ datos, volver, alSinSesion }: { datos: Datos; volver: () => void; alSinSesion: () => void }) {
  const [f, setF] = useState(() => {
    let previo: Record<string, string> = {}
    try { previo = JSON.parse(sessionStorage.getItem(PREFILL) || '{}'); sessionStorage.removeItem(PREFILL) } catch { /* sin datos previos */ }
    return { nombre: previo.nombre || '', contacto: previo.contacto || '', paquete: previo.paquete || '', estado: previo.nombre ? 'en-proceso' : 'prospecto', portafolio: 'por-preguntar', sitio: '', notas: previo.notas || '' }
  })
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)
  const poner = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  async function proponer(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await enviar('/api/clientes/proponer', f)
      setListo(true)
      avisarPropuestas()
    } catch (err) {
      if (err instanceof SinSesion) return alSinSesion()
      setError((err as Error).message)
    }
  }

  if (listo) {
    return (
      <div className="entra max-w-2xl">
        <button onClick={volver} className="flex min-h-10 cursor-pointer items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="size-4" aria-hidden /> Clientes</button>
        <h1 className="mt-4 text-5xl">Falta tu aprobación.</h1>
        <p className="mt-3 text-white/70">La ficha de <span className="text-white">{f.nombre}</span> se crea en el Cerebro cuando pulses Aprobar.</p>
        <Aprobaciones alSinSesion={alSinSesion} vista="clientes" siempre />
      </div>
    )
  }

  return (
    <form onSubmit={proponer} className="entra max-w-2xl">
      <button type="button" onClick={volver} className="flex min-h-10 cursor-pointer items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="size-4" aria-hidden /> Clientes</button>
      <h1 className="mt-4 text-5xl">Cliente nuevo.</h1>
      {!datos.escritura && <p className="mt-4 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">Puedes preparar la ficha, pero el Centro de mando todavía no tiene permiso para escribir en el Cerebro. Al aprobar te dirá qué falta.</p>}
      <div className="panel mt-6 grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <label className="grid gap-1.5 text-sm sm:col-span-2">Nombre del negocio o cliente
          <input required minLength={2} maxLength={80} value={f.nombre} onChange={poner('nombre')} className={campo} placeholder="Barbería de Jael" autoFocus />
        </label>
        <label className="grid gap-1.5 text-sm">Contacto
          <input maxLength={120} value={f.contacto} onChange={poner('contacto')} className={campo} placeholder="@usuario o correo" />
        </label>
        <label className="grid gap-1.5 text-sm">Paquete
          <select value={f.paquete} onChange={poner('paquete')} className={campo}>
            <option value="">Por decidir</option>
            {datos.paquetes.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">Estado
          <select value={f.estado} onChange={poner('estado')} className={campo}>
            {datos.estados.map((e) => <option key={e} value={e}>{ESTADO[e]?.nombre ?? e}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">Permiso para el portafolio
          <select value={f.portafolio} onChange={poner('portafolio')} className={campo}>
            {datos.permisos.map((p) => <option key={p} value={p}>{PERMISO[p].replace('Portafolio: ', '')}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm sm:col-span-2">Sitio (si ya tiene)
          <input type="url" pattern="https://.*" maxLength={200} value={f.sitio} onChange={poner('sitio')} className={campo} placeholder="https://…" />
        </label>
        <label className="grid gap-1.5 text-sm sm:col-span-2">Notas
          <textarea maxLength={1500} rows={3} value={f.notas} onChange={poner('notas')} className={`${campo} py-2.5`} placeholder="Qué quiere, fechas, ideas. Sin claves ni datos de pago." />
        </label>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
      <button type="submit" className="mt-5 flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-sky px-5 font-semibold text-navy transition-transform duration-150 active:scale-[0.97]">Preparar ficha</button>
    </form>
  )
}

function Detalle({ c, datos, abrir, volver, alSinSesion }: { c: Cliente; datos: Datos; abrir: (ruta: string) => void; volver: () => void; alSinSesion: () => void }) {
  const [texto, setTexto] = useState<string | null>(null)
  const [instruccion, setInstruccion] = useState('')
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    api<{ texto: string }>(`/api/nota?ruta=${encodeURIComponent(c.ficha)}`).then((d) => setTexto(d.texto)).catch((e) => e instanceof SinSesion && alSinSesion())
  }, [c.ficha, alSinSesion])

  async function pasar(e: FormEvent) {
    e.preventDefault()
    setAviso('')
    try {
      await enviar('/api/clientes/hermes', { id: c.id, instruccion })
      setInstruccion('')
      setAviso('Lista para aprobar. Cuando apruebes, Hermes la recibe con la ficha.')
      avisarPropuestas()
    } catch (err) {
      if (err instanceof SinSesion) return alSinSesion()
      setAviso((err as Error).message)
    }
  }

  return (
    <div className="entra">
      <button onClick={volver} className="flex min-h-10 cursor-pointer items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="size-4" aria-hidden /> Clientes</button>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-5xl">{c.nombre}</h1>
        <Chip estado={c.estado} />
      </div>
      <p className="mt-2 text-sm text-white/60">{[c.paquete, PERMISO[c.portafolio], c.contacto].filter(Boolean).join(' · ')}</p>
      <Aprobaciones alSinSesion={alSinSesion} vista="clientes" cliente={c.nombre} />

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <section className="panel min-w-0 p-6">{texto === null ? <p className="text-white/55">Cargando…</p> : <Markdown texto={texto.replace(/^(---\n[\s\S]*?\n---\n)?\s*#\s.+\n/, '')} onAbrir={abrir} />}</section>
        <div className="grid content-start gap-4">
          {c.sitios.length > 0 && (
            <section className="panel p-5">
              <h2 className="font-sans text-sm font-semibold">Sitios</h2>
              <ul className="mt-3 space-y-2">{c.sitios.map((s) => <li key={s}><a href={s} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 break-all text-sm text-sky hover:underline"><ExternalLink className="size-3.5 shrink-0" aria-hidden />{s.replace('https://', '')}</a></li>)}</ul>
            </section>
          )}
          {c.archivos.length > 0 && (
            <section className="panel p-5">
              <h2 className="font-sans text-sm font-semibold">Archivos</h2>
              <ul className="mt-3 space-y-1.5">{c.archivos.map((a) => <li key={a.path}><button onClick={() => abrir(a.path)} className="flex cursor-pointer items-center gap-2 text-left text-sm text-white/80 hover:text-sky"><FileText className="size-3.5 shrink-0" aria-hidden />{a.title}</button></li>)}</ul>
            </section>
          )}
          <form onSubmit={pasar} className="panel p-5">
            <h2 className="font-sans text-sm font-semibold">Pasarle algo a Hermes</h2>
            {!datos.chat ? <p className="mt-2 text-sm text-white/55">Primero conecta el chat con Hermes (Conexiones).</p> : (
              <>
                <label htmlFor="instr" className="sr-only">Instrucción para Hermes</label>
                <textarea id="instr" required minLength={3} maxLength={1500} rows={3} value={instruccion} onChange={(e) => setInstruccion(e.target.value)} className={`${campo} mt-3 py-2.5`} placeholder="Ej.: arma la primera versión del sitio con la receta de Ascent." />
                <button type="submit" className="mt-3 flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-sky px-4 text-sm font-semibold text-navy transition-transform duration-150 active:scale-[0.97]"><Send className="size-4" aria-hidden /> Preparar para Hermes</button>
                <p className="mt-2 text-xs text-white/50">Va con la ficha. No sale hasta que apruebes.</p>
              </>
            )}
            {aviso && <p role="status" className="mt-2 text-sm text-sky">{aviso}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}

export function Clientes({ alSinSesion, sub, abrir }: { alSinSesion: () => void; sub: string | null; abrir: (ruta: string) => void }) {
  const { datos, error } = useApi<Datos>('/api/clientes', alSinSesion, 60000)
  const ir = (r: string) => { location.hash = r }
  if (error) return <p className="text-red-300">{error}</p>
  if (!datos) return <p className="text-white/60">Cargando…</p>

  if (sub === 'nuevo') return <Nuevo datos={datos} volver={() => ir('clientes')} alSinSesion={alSinSesion} />
  const c = sub ? datos.clientes.find((x) => x.id === sub) : null
  if (c) return <Detalle c={c} datos={datos} abrir={abrir} volver={() => ir('clientes')} alSinSesion={alSinSesion} />

  return (
    <div className="entra">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Clientes</p>
          <h1 className="mt-2 text-5xl">Para quién trabajas.</h1>
        </div>
        <button onClick={() => ir('clientes/nuevo')} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-sky px-5 text-sm font-semibold text-navy transition-transform duration-150 active:scale-[0.97]"><Plus className="size-4" aria-hidden /> Cliente nuevo</button>
      </div>
      <Aprobaciones alSinSesion={alSinSesion} vista="clientes" />
      {datos.clientes.length === 0 ? (
        <section className="panel mt-8 max-w-2xl p-6"><p className="text-white/75">Todavía no hay fichas. Cada cliente vive en <code className="rounded bg-white/10 px-1.5 font-mono text-sm">Clientes/&lt;nombre&gt;/ficha.md</code> del Cerebro.</p></section>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {datos.clientes.map((x) => (
            <li key={x.id}>
              <button onClick={() => ir(`clientes/${x.id}`)} className="panel flex h-full w-full cursor-pointer flex-col p-5 text-left transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-sky/50 active:scale-[0.99]">
                <span className="flex items-start justify-between gap-3"><UserRound className="size-5 text-sky" aria-hidden /><Chip estado={x.estado} /></span>
                <span className="mt-3 font-display text-3xl leading-tight">{x.nombre}</span>
                <span className="mt-1 text-sm text-white/60">{x.paquete || 'Paquete por decidir'}</span>
                <span className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-4 font-mono text-[11px] text-white/50">
                  <span>{PERMISO[x.portafolio]}</span>
                  {x.sitios.length > 0 && <span>{x.sitios.length} sitio{x.sitios.length > 1 ? 's' : ''}</span>}
                  {x.pendientes > 0 && <span className="text-amber-200/80">{x.pendientes} pendiente{x.pendientes > 1 ? 's' : ''}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
