import { animate, motion, useMotionValue, useReducedMotionConfig, useSpring, useTransform } from 'motion/react'
import qrcode from 'qrcode-generator'
import { useEffect, useMemo, useRef } from 'react'
import { SITE_URL } from '@/config'

function useQr(text: string) {
  return useMemo(() => {
    const q = qrcode(0, 'M')
    q.addData(text)
    q.make()
    const n = q.getModuleCount()
    const cells: Array<[number, number]> = []
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) cells.push([c, r])
    return { n, cells }
  }, [text])
}

/** Tarjeta con QR real que gira en 3D con el cursor (o sola, si no hay cursor). */
export function QrCard({ className = '', interactive = true }: { className?: string; interactive?: boolean }) {
  const { n, cells } = useQr(SITE_URL)
  const reduce = useReducedMotionConfig()
  const ref = useRef<HTMLDivElement>(null)
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 120, damping: 14 })
  const sy = useSpring(py, { stiffness: 120, damping: 14 })
  const rotY = useTransform(sx, [-1, 1], [-24, 24])
  const rotX = useTransform(sy, [-1, 1], [18, -18])
  const glare = useTransform(sx, [-1, 1], ['20%', '80%'])
  const glareBg = useTransform(glare, (g) => `radial-gradient(circle at ${g} 20%, rgb(255 255 255 / 0.65), transparent 55%)`)
  const hovering = useRef(false)

  useEffect(() => {
    if (reduce || !interactive) return
    const a = animate(px, [-0.55, 0.55], { duration: 4.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' })
    const b = animate(py, [0.2, -0.25], { duration: 3.4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' })
    const stop = () => {
      a.stop()
      b.stop()
    }
    const iv = window.setInterval(() => {
      if (hovering.current) stop()
    }, 200)
    return () => {
      stop()
      window.clearInterval(iv)
    }
  }, [reduce, interactive, px, py])

  const onMove = (e: React.PointerEvent) => {
    if (!interactive || reduce) return
    hovering.current = true
    const r = ref.current!.getBoundingClientRect()
    px.set(((e.clientX - r.left) / r.width) * 2 - 1)
    py.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }

  return (
    <div ref={ref} className={`[perspective:900px] ${className}`} onPointerMove={onMove} style={{ touchAction: 'pan-y' }}>
      <motion.div style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }} className="relative aspect-[1.6/1] w-full rounded-[1.4rem] border border-white/25 bg-gradient-to-br from-[#1a3f78] via-[#11294d] to-[#0b1e3c] p-[7%] shadow-[0_40px_80px_-20px_rgb(0_0_0/0.8),0_0_60px_-10px_rgb(74_189_240/0.45)]">
        <div className="flex h-full items-center justify-between gap-[6%]" style={{ transform: 'translateZ(30px)' }}>
          <div className="flex h-full flex-col justify-between">
            <img src="/logo-light.png" alt="" width={1000} height={751} className="h-7 w-auto sm:h-9" />
            <div className="space-y-1.5">
              <div className="h-2 w-20 rounded-full bg-white/80 sm:w-28" />
              <div className="h-1.5 w-14 rounded-full bg-sky/80 sm:w-20" />
              <div className="h-1.5 w-10 rounded-full bg-white/30 sm:w-14" />
            </div>
          </div>
          <div className="aspect-square h-full rounded-xl bg-white p-[5%] shadow-[0_0_30px_rgb(74_189_240/0.5)]">
            <svg viewBox={`0 0 ${n} ${n}`} className="size-full" shapeRendering="crispEdges" role="img" aria-label="Código QR de ejemplo">
              {cells.map(([x, y]) => (
                <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0b1e3c" />
              ))}
            </svg>
          </div>
        </div>
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[1.4rem] mix-blend-soft-light" style={{ background: glareBg }} />
      </motion.div>
    </div>
  )
}
