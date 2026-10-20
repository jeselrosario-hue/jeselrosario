import Lenis from 'lenis'
import { useEffect } from 'react'
import { reducirMovimiento } from '@/lib/motion'

/** Scroll con inercia (Lenis). Se apaga solo si se respeta "Reducir movimiento" (ver lib/motion). Los enlaces #ancla también se deslizan. */
export function SmoothScroll() {
  useEffect(() => {
    if (reducirMovimiento()) return
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 })
    let raf = 0
    const loop = (t: number) => {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      const id = a?.getAttribute('href')
      if (!a || !id || id === '#') return
      const el = document.querySelector<HTMLElement>(id)
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el, { offset: id === '#inicio' ? 0 : -8, duration: 1.5 })
    }
    document.addEventListener('click', onClick)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      document.removeEventListener('click', onClick)
    }
  }, [])
  return null
}
