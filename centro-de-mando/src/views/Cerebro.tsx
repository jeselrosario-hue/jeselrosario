import { useEffect, useMemo, useState } from 'react'
import { api, type NotaInfo } from '@/api'
import { Markdown } from '@/components/Markdown'
import { haceCuanto, useApi } from '@/hooks'

export function Cerebro({ alSinSesion, nota, abrir }: { alSinSesion: () => void; nota: string | null; abrir: (ruta: string) => void }) {
  const { datos } = useApi<{ notas: NotaInfo[] }>('/api/notas', alSinSesion, 60000)
  const [busca, setBusca] = useState('')
  const [texto, setTexto] = useState<string | null>(null)
  const [fallo, setFallo] = useState(false)
  const notas = datos?.notas ?? []

  useEffect(() => {
    if (!nota) { setTexto(null); return }
    let vivo = true
    setFallo(false)
    api<{ texto: string }>(`/api/nota?ruta=${encodeURIComponent(nota)}`).then((d) => vivo && setTexto(d.texto)).catch(() => vivo && (setTexto(null), setFallo(true)))
    return () => { vivo = false }
  }, [nota])

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return q ? notas.filter((n) => n.title.toLowerCase().includes(q) || n.path.toLowerCase().includes(q)) : notas
  }, [notas, busca])
  const grupos = useMemo(() => {
    const m = new Map<string, NotaInfo[]>()
    for (const n of filtradas) m.set(n.folder, [...(m.get(n.folder) ?? []), n])
    return [...m.entries()]
  }, [filtradas])

  function abrirPorNombre(nombre: string) {
    const limpio = nombre.split('|')[0].split('#')[0].trim().toLowerCase()
    const hit = notas.find((n) => n.path.toLowerCase() === limpio) ?? notas.find((n) => n.path.toLowerCase().split('/').pop() === limpio.split('/').pop())
    if (hit) abrir(hit.path)
  }

  return (
    <div className="entra grid gap-6 lg:grid-cols-[18rem_1fr]">
      <aside className="min-w-0">
        <p className="eyebrow">Cerebro</p>
        <label htmlFor="busca" className="sr-only">Buscar nota</label>
        <input id="busca" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nota…" className="mt-3 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-sky" />
        <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-1 lg:max-h-[calc(100vh-12rem)]">
          {grupos.map(([carpeta, lista]) => (
            <div key={carpeta}>
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/45">{carpeta}</p>
              <ul className="mt-1">
                {lista.map((n) => (
                  <li key={n.path}>
                    <button onClick={() => abrir(n.path)} aria-current={n.path === nota} className={`w-full cursor-pointer truncate rounded-lg px-2.5 py-1.5 text-left text-sm transition hover:bg-white/8 ${n.path === nota ? 'bg-sky/15 text-sky' : 'text-white/75'}`}>{n.title}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>
      <article className="min-w-0">
        {!nota && <p className="text-white/60">Elige una nota. {notas.length > 0 && `Hay ${notas.length}; la última se tocó ${haceCuanto(Math.max(...notas.map((n) => n.mtime)))}.`}</p>}
        {fallo && <p className="text-red-300">No se pudo abrir esa nota.</p>}
        {texto !== null && <Markdown texto={texto} onAbrir={abrirPorNombre} />}
      </article>
    </div>
  )
}
