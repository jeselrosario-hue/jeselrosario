import { useEffect, useRef, useState } from 'react'

/**
 * Portada WebGL2: partículas líquidas que se juntan para formar el logo de Ascent
 * y se apartan del cursor / dedo. Si no hay WebGL2 (o el usuario pidió menos movimiento)
 * se muestra el logo estático con brillo.
 */
type Mode = 'loading' | 'gl' | 'static'

const VERT = `#version 300 es
precision highp float;
in vec4 a;
uniform vec2 u_res;
uniform float u_time;
uniform float u_form;
uniform vec2 u_mouse;
uniform float u_mstr;
uniform vec3 u_logo;
uniform float u_dpr;
uniform float u_maxsize;
out float v_kind;
out float v_alpha;
float h(float n){ return fract(sin(n * 127.1) * 43758.5453); }
void main(){
  float seed = a.z;
  float kind = a.w;
  vec2 pos;
  float size;
  float alpha = 1.0;
  if (kind < 2.0) {
    vec2 t = u_logo.xy + vec2(a.x, a.y) * u_logo.z;
    float tt = u_time * 0.55;
    vec2 flow = vec2(
      sin(tt + a.y * 7.0 + seed * 6.2831) + sin(tt * 1.3 + a.x * 5.0),
      cos(tt * 0.9 + a.x * 6.0 + seed * 6.2831) + cos(tt * 1.1 + a.y * 4.0)
    ) * u_logo.z * 0.0055;
    float ang = seed * 6.2831 * 3.0;
    vec2 start = u_logo.xy + vec2(cos(ang), sin(ang)) * (0.4 + h(seed * 9.0) * 0.9) * max(u_res.x, u_res.y) * 0.55;
    float f = clamp((u_form - seed * 0.35) / 0.65, 0.0, 1.0);
    f = f * f * (3.0 - 2.0 * f);
    pos = mix(start, t + flow, f);
    vec2 d = pos - u_mouse;
    float dist = length(d);
    float r = u_logo.z * 0.11;
    float push = exp(-(dist * dist) / (r * r)) * u_mstr;
    pos += normalize(d + vec2(0.001)) * push * r * 0.85 + vec2(-d.y, d.x) / (dist + 8.0) * push * r * 0.35;
    size = mix(3.0, 6.2, h(seed * 3.1)) * clamp(u_logo.z / 520.0, 0.8, 1.35);
  } else if (kind < 2.5) {
    vec2 base = a.xy * u_res;
    pos = base + vec2(sin(u_time * 0.2 + seed * 30.0), cos(u_time * 0.17 + seed * 20.0)) * 38.0;
    size = 1.4 + h(seed * 5.0) * 1.8;
    alpha = 0.55;
  } else {
    vec2 t = u_logo.xy + vec2(a.x, a.y) * u_logo.z;
    float tt = u_time * 0.35;
    pos = t + vec2(sin(tt + seed * 20.0), cos(tt * 1.2 + seed * 14.0)) * u_logo.z * 0.05;
    float f = clamp(u_form * 1.2 - 0.2, 0.0, 1.0);
    size = mix(40.0, 95.0, h(seed * 7.0)) * clamp(u_logo.z / 560.0, 0.7, 1.2);
    alpha = 0.07 * f;
  }
  gl_Position = vec4(pos.x / u_res.x * 2.0 - 1.0, 1.0 - pos.y / u_res.y * 2.0, 0.0, 1.0);
  gl_PointSize = min(size * u_dpr, u_maxsize);
  v_kind = kind;
  v_alpha = alpha;
}`

const FRAG = `#version 300 es
precision highp float;
in float v_kind;
in float v_alpha;
out vec4 outColor;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a = pow(a, 1.35) * v_alpha;
  vec3 sky = vec3(0.29, 0.74, 0.94);
  vec3 col = v_kind > 0.5 && v_kind < 1.5 ? sky : (v_kind > 2.5 ? sky : vec3(0.92, 0.97, 1.0));
  outColor = vec4(col * a, a);
}`

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
  return s
}

function buildParticles(img: HTMLImageElement, nLogo: number, nAmbient: number, nBlob: number) {
  const W = 360
  const H = Math.round((W * img.naturalHeight) / img.naturalWidth)
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0, W, H)
  const px = ctx.getImageData(0, 0, W, H).data
  const pts: number[][] = []
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4
      if (px[i + 3] > 140) pts.push([x / W - 0.5, y / W - H / W / 2, px[i + 2] - px[i] > 90 ? 1 : 0])
    }
  const out = new Float32Array((nLogo + nAmbient + nBlob) * 4)
  let k = 0
  for (let i = 0; i < nLogo; i++) {
    const p = pts[(Math.random() * pts.length) | 0]
    const kind = p[2] === 1 || Math.random() < 0.2 ? 1 : 0
    out.set([p[0] + (Math.random() - 0.5) * 0.004, p[1] + (Math.random() - 0.5) * 0.004, Math.random(), kind], k)
    k += 4
  }
  for (let i = 0; i < nAmbient; i++) {
    out.set([Math.random(), Math.random(), Math.random(), 2], k)
    k += 4
  }
  for (let i = 0; i < nBlob; i++) {
    const p = pts[(Math.random() * pts.length) | 0]
    out.set([p[0], p[1], Math.random(), 3], k)
    k += 4
  }
  return out
}

function initialMode(): Mode {
  if (typeof window === 'undefined') return 'static'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'static'
  try {
    const probe = document.createElement('canvas').getContext('webgl2')
    if (!probe) return 'static'
    probe.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    return 'static'
  }
  return 'loading'
}

export function LiquidHero({ className = '' }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<Mode>(initialMode)

  useEffect(() => {
    const cv = canvas.current!
    const host = wrap.current!
    if (mode === 'static') return
    const gl = cv.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' })
    if (!gl) return

    let disposed = false
    let raf = 0
    let visible = true
    let started = 0
    const mouse = { x: -9999, y: -9999, str: 0, target: 0 }
    let cleanupFns: Array<() => void> = []

    const img = new Image()
    img.src = '/logo-light.png'
    img.onload = () => {
      if (disposed) return
      try {
        const small = window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4
        const data = buildParticles(img, small ? 6500 : 15000, small ? 500 : 1100, small ? 40 : 90)
        const prog = gl.createProgram()!
        gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT))
        gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG))
        gl.linkProgram(prog)
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link')
        gl.useProgram(prog)
        const vao = gl.createVertexArray()
        gl.bindVertexArray(vao)
        const buf = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
        const loc = gl.getAttribLocation(prog, 'a')
        gl.enableVertexAttribArray(loc)
        gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0)
        const U = (n: string) => gl.getUniformLocation(prog, n)
        const uRes = U('u_res'), uTime = U('u_time'), uForm = U('u_form'), uMouse = U('u_mouse'), uMstr = U('u_mstr'), uLogo = U('u_logo'), uDpr = U('u_dpr'), uMax = U('u_maxsize')
        const maxPoint = (gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array)[1]
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.ONE, gl.ONE)

        const aspect = img.naturalHeight / img.naturalWidth
        let w = 1, h = 1, dpr = 1
        const logo = { x: 0, y: 0, s: 1 }
        const resize = () => {
          const r = host.getBoundingClientRect()
          w = Math.max(1, r.width)
          h = Math.max(1, r.height)
          dpr = Math.min(window.devicePixelRatio || 1, w < 768 ? 1.5 : 2)
          cv.width = Math.round(w * dpr)
          cv.height = Math.round(h * dpr)
          if (w >= 1024) {
            logo.s = Math.min(w * 0.36, h * 0.74 / aspect)
            logo.x = w * 0.74
            logo.y = h * 0.52
          } else {
            logo.s = Math.min(w * 0.74, h * 0.4 / aspect, 460)
            logo.x = w / 2
            logo.y = Math.max(96 + logo.s * aspect * 0.5, h * 0.3)
          }
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(host)

        const onMove = (e: PointerEvent) => {
          const r = cv.getBoundingClientRect()
          const x = e.clientX - r.left
          const y = e.clientY - r.top
          const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height
          mouse.target = inside ? 1 : 0
          if (inside) {
            mouse.x = x
            mouse.y = y
          }
        }
        const onLeave = () => (mouse.target = 0)
        window.addEventListener('pointermove', onMove, { passive: true })
        window.addEventListener('pointerdown', onMove, { passive: true })
        document.documentElement.addEventListener('pointerleave', onLeave)

        const io = new IntersectionObserver(([e]) => {
          visible = e.isIntersecting
          if (visible && !raf && !disposed) raf = requestAnimationFrame(frame)
        })
        io.observe(host)
        const onVis = () => {
          if (!document.hidden && visible && !raf && !disposed) raf = requestAnimationFrame(frame)
        }
        document.addEventListener('visibilitychange', onVis)

        const onLost = (e: Event) => {
          e.preventDefault()
          setMode('static')
        }
        cv.addEventListener('webglcontextlost', onLost)

        const total = data.length / 4
        started = performance.now()
        let first = true
        function frame(now: number) {
          raf = 0
          if (disposed || !visible || document.hidden) return
          const t = (now - started) / 1000
          mouse.str += (mouse.target - mouse.str) * 0.12
          gl!.viewport(0, 0, cv.width, cv.height)
          gl!.clearColor(0, 0, 0, 0)
          gl!.clear(gl!.COLOR_BUFFER_BIT)
          gl!.uniform2f(uRes, w, h)
          gl!.uniform1f(uTime, t)
          gl!.uniform1f(uForm, Math.min(1, t / 2.6))
          gl!.uniform2f(uMouse, mouse.x, mouse.y)
          gl!.uniform1f(uMstr, mouse.str)
          gl!.uniform3f(uLogo, logo.x, logo.y, logo.s)
          gl!.uniform1f(uDpr, dpr)
          gl!.uniform1f(uMax, maxPoint)
          gl!.drawArrays(gl!.POINTS, 0, total)
          if (first) {
            first = false
            setMode('gl')
          }
          raf = requestAnimationFrame(frame)
        }
        raf = requestAnimationFrame(frame)

        cleanupFns = [
          () => ro.disconnect(),
          () => io.disconnect(),
          () => window.removeEventListener('pointermove', onMove),
          () => window.removeEventListener('pointerdown', onMove),
          () => document.documentElement.removeEventListener('pointerleave', onLeave),
          () => document.removeEventListener('visibilitychange', onVis),
          () => cv.removeEventListener('webglcontextlost', onLost),
          () => {
            gl.deleteBuffer(buf)
            gl.deleteProgram(prog)
            gl.getExtension('WEBGL_lose_context')?.loseContext()
          },
        ]
      } catch {
        setMode('static')
      }
    }
    img.onerror = () => setMode('static')

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      cleanupFns.forEach((f) => f())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={wrap} className={`absolute inset-0 ${className}`} aria-hidden="true">
      <canvas ref={canvas} className={`absolute inset-0 size-full transition-opacity duration-700 ${mode === 'gl' ? 'opacity-100' : 'opacity-0'}`} />
      <StaticLogo visible={mode !== 'gl'} />
    </div>
  )
}

/** Respaldo sin WebGL: el mismo logo, con brillo celeste. */
function StaticLogo({ visible }: { visible: boolean }) {
  return (
    <div className={`pointer-events-none absolute inset-0 flex items-start justify-center pt-28 transition-opacity duration-700 lg:items-center lg:justify-end lg:pt-0 lg:pr-[10vw] ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative w-[min(70vw,420px)] lg:w-[min(38vw,620px)]">
        <div className="absolute inset-[-20%] rounded-full bg-sky/25 blur-[90px]" />
        <img src="/logo-light.png" alt="" width={1000} height={751} className="relative h-auto w-full drop-shadow-[0_0_40px_rgb(74_189_240/0.55)] motion-safe:animate-[float_6s_ease-in-out_infinite]" />
      </div>
    </div>
  )
}
