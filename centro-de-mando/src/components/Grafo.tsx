import { useEffect, useRef, useState } from 'react'
import type { Grafo as GrafoDatos } from '@/api'

const COLORES: Record<string, string> = { Ascent: '#4abdf0', Herramientas: '#a78bfa', Diario: '#fbbf24', Agentes: '#34d399', '(raíz)': '#ffffff' }
const color = (f: string) => COLORES[f] ?? '#94a3b8'

type N = { id: string; title: string; folder: string; x: number; y: number; vx: number; vy: number; grado: number }

/** Mapa del Cerebro: cada nota es un punto y cada [[enlace]] una línea. Se acomoda solo. */
export function Grafo({ datos, onAbrir }: { datos: GrafoDatos; onAbrir: (id: string) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [hover, setHover] = useState<string | null>(null)
  const estado = useRef<{ nodos: N[]; hover: string | null }>({ nodos: [], hover: null })

  useEffect(() => {
    const cv = canvas.current!
    const ctx = cv.getContext('2d')!
    const dpr = Math.min(devicePixelRatio || 1, 2)
    let w = 0, h = 0, raf = 0, vivo = true
    const grado = new Map<string, number>()
    for (const a of datos.aristas) {
      grado.set(a.from, (grado.get(a.from) || 0) + 1)
      grado.set(a.to, (grado.get(a.to) || 0) + 1)
    }
    const nodos: N[] = datos.nodos.map((n, i) => {
      const ang = (i / Math.max(datos.nodos.length, 1)) * Math.PI * 2
      return { ...n, x: Math.cos(ang) * 120, y: Math.sin(ang) * 120, vx: 0, vy: 0, grado: grado.get(n.id) || 0 }
    })
    estado.current.nodos = nodos
    const umbral = Math.max(4, [...nodos].map((n) => n.grado).sort((a, b) => b - a)[7] ?? 0)
    const idx = new Map(nodos.map((n) => [n.id, n]))
    const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches
    let pasos = reducir ? 300 : 0

    function tam() {
      const r = cv.getBoundingClientRect()
      w = r.width; h = r.height
      cv.width = w * dpr; cv.height = h * dpr
    }
    tam()
    const ro = new ResizeObserver(tam)
    ro.observe(cv)

    function fisica() {
      for (let i = 0; i < nodos.length; i++) {
        const a = nodos[i]
        for (let j = i + 1; j < nodos.length; j++) {
          const b = nodos[j]
          let dx = a.x - b.x, dy = a.y - b.y
          const d2 = dx * dx + dy * dy + 0.01
          const f = 2600 / d2
          const d = Math.sqrt(d2)
          dx /= d; dy /= d
          a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f
        }
        a.vx -= a.x * 0.012; a.vy -= a.y * 0.012
      }
      for (const e of datos.aristas) {
        const a = idx.get(e.from), b = idx.get(e.to)
        if (!a || !b) continue
        const dx = b.x - a.x, dy = b.y - a.y
        const d = Math.sqrt(dx * dx + dy * dy) || 1
        const f = (d - 90) * 0.02
        a.vx += (dx / d) * f; a.vy += (dy / d) * f; b.vx -= (dx / d) * f; b.vy -= (dy / d) * f
      }
      for (const n of nodos) {
        n.vx *= 0.82; n.vy *= 0.82
        n.x += n.vx; n.y += n.vy
      }
    }

    function dibujar() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const esc = Math.min(w, h) / 620 + 0.35
      ctx.translate(w / 2, h / 2)
      ctx.scale(esc, esc)
      const hv = estado.current.hover
      const vecinos = new Set<string>()
      if (hv) for (const e of datos.aristas) { if (e.from === hv) vecinos.add(e.to); if (e.to === hv) vecinos.add(e.from) }
      ctx.lineWidth = 1
      for (const e of datos.aristas) {
        const a = idx.get(e.from), b = idx.get(e.to)
        if (!a || !b) continue
        const resalta = hv && (e.from === hv || e.to === hv)
        ctx.strokeStyle = resalta ? 'rgba(74,189,240,0.9)' : hv ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.14)'
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
      }
      for (const n of nodos) {
        const r = 3.5 + Math.sqrt(n.grado) * 2.2
        const apagado = hv && n.id !== hv && !vecinos.has(n.id)
        ctx.globalAlpha = apagado ? 0.22 : 1
        ctx.fillStyle = color(n.folder)
        ctx.shadowColor = color(n.folder); ctx.shadowBlur = n.id === hv ? 22 : 8
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0
        if (n.id === hv || (n.grado >= umbral && !apagado)) {
          ctx.fillStyle = '#fff'; ctx.font = '600 11px Geist Variable, system-ui, sans-serif'
          ctx.textAlign = 'center'; ctx.fillText(n.title.length > 28 ? n.title.slice(0, 27) + '…' : n.title, n.x, n.y - r - 6)
        }
      }
      ctx.globalAlpha = 1
    }

    function cuadro() {
      if (!vivo) return
      if (pasos < 400) { fisica(); pasos++ }
      dibujar()
      raf = requestAnimationFrame(cuadro)
    }
    if (reducir) for (let i = 0; i < pasos; i++) fisica()
    cuadro()
    return () => { vivo = false; cancelAnimationFrame(raf); ro.disconnect() }
  }, [datos])

  function nodoEn(e: { clientX: number; clientY: number }) {
    const cv = canvas.current!
    const r = cv.getBoundingClientRect()
    const esc = Math.min(r.width, r.height) / 620 + 0.35
    const x = (e.clientX - r.left - r.width / 2) / esc
    const y = (e.clientY - r.top - r.height / 2) / esc
    let mejor: N | null = null, md = 18
    for (const n of estado.current.nodos) {
      const d = Math.hypot(n.x - x, n.y - y)
      if (d < md) { md = d; mejor = n }
    }
    return mejor
  }

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvas}
        className="h-full w-full cursor-pointer touch-none"
        role="img"
        aria-label="Mapa de las notas del Cerebro y sus enlaces"
        onPointerMove={(e) => { const n = nodoEn(e); estado.current.hover = n?.id ?? null; setHover(n?.title ?? null) }}
        onPointerLeave={() => { estado.current.hover = null; setHover(null) }}
        onClick={(e) => { const n = nodoEn(e); if (n) onAbrir(n.id) }}
      />
      <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[11px] uppercase tracking-widest text-white/50">{hover ?? 'Toca un punto para abrir la nota'}</p>
      <ul className="absolute right-4 top-3 flex flex-wrap justify-end gap-x-4 gap-y-1 font-mono text-[11px] text-white/60">
        {Object.entries(COLORES).filter(([k]) => datos.nodos.some((n) => n.folder === k)).map(([k, c]) => (
          <li key={k} className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: c }} />{k}</li>
        ))}
      </ul>
    </div>
  )
}
