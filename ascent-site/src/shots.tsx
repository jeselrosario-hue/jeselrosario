/** Solo para desarrollo: genera las imágenes que van dentro de las carpetas (npm run dev → /shots.html?s=phone). */
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserSite } from '@/components/mockups/BrowserSite'
import { PhoneBio } from '@/components/mockups/PhoneBio'
import { QrCard } from '@/components/mockups/QrCard'
import { InstagramIcon, WhatsAppIcon } from '@/components/BrandIcons'
import { Camera, Check } from 'lucide-react'

const bg = 'radial-gradient(70% 90% at 70% 20%, rgb(74 189 240 / 0.38), transparent 70%), linear-gradient(160deg, #17407a, #0B1E3C 70%)'

function Scene({ children }: { children: React.ReactNode }) {
  return <div id="scene" style={{ width: 544, height: 368, background: bg, position: 'relative', overflow: 'hidden', fontFamily: 'Geist Variable, Geist, sans-serif' }}>{children}</div>
}

const photo = (n: string) => ({ backgroundImage: `url(/examples/${n}.webp)` })

const SCENES: Record<string, React.ReactNode> = {
  phone: (
    <Scene>
      <div style={{ position: 'absolute', left: 214, top: -48, width: 190 }}><PhoneBio /></div>
      <div style={{ position: 'absolute', left: 36, top: 96, color: '#fff', fontFamily: 'Instrument Serif, serif', fontSize: 44, letterSpacing: '-0.02em', lineHeight: 0.95 }}>Tu link<br /><i style={{ color: '#4ABDF0' }}>en la bio</i></div>
    </Scene>
  ),
  links: (
    <Scene>
      <div style={{ position: 'absolute', inset: '52px 56px 0', display: 'grid', gap: 12, alignContent: 'start' }}>
        {[
          { i: <WhatsAppIcon width={26} height={26} />, t: 'WhatsApp', p: true },
          { i: <InstagramIcon width={26} height={26} />, t: 'Instagram' },
          { i: <Camera width={26} height={26} />, t: 'Trabajos' },
        ].map((l) => (
          <div key={l.t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 62, borderRadius: 999, fontWeight: 700, fontSize: 21, color: l.p ? '#0B1E3C' : '#fff', background: l.p ? '#4ABDF0' : 'rgb(255 255 255 / .12)', border: l.p ? 'none' : '1px solid rgb(255 255 255 / .28)', boxShadow: l.p ? '0 0 40px rgb(74 189 240 / .6)' : 'none' }}>{l.i}{l.t}</div>
        ))}
      </div>
    </Scene>
  ),
  fotos: (
    <Scene>
      <div style={{ position: 'absolute', inset: '52px 40px 28px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {['navaja', 'estudio', 'perfilado', 'espacio'].map((n) => (
          <div key={n} style={{ ...photo(n), backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 18, boxShadow: '0 12px 30px rgb(0 0 0 / .45)' }} />
        ))}
      </div>
    </Scene>
  ),
  site: (
    <Scene>
      <div style={{ position: 'absolute', left: 44, top: 46, width: 456 }}><BrowserSite bubble={false} url="tuservicio.netlify.app" /></div>
    </Scene>
  ),
  chat: (
    <Scene>
      <div style={{ position: 'absolute', inset: '62px 36px 0', display: 'grid', gap: 14, alignContent: 'start' }}>
        <div style={{ justifySelf: 'end', background: '#4ABDF0', color: '#0B1E3C', fontWeight: 700, fontSize: 22, padding: '16px 22px', borderRadius: '22px 22px 6px 22px', boxShadow: '0 0 40px rgb(74 189 240 / .55)', display: 'flex', gap: 10, alignItems: 'center' }}><WhatsAppIcon width={26} height={26} /> Hola, quiero reservar</div>
        <div style={{ justifySelf: 'start', background: '#fff', color: '#0B1E3C', fontWeight: 700, fontSize: 20, padding: '14px 20px', borderRadius: '22px 22px 22px 6px', display: 'flex', gap: 8, alignItems: 'center' }}><Check width={22} height={22} color="#1aa05a" /> ¡Listo! Te esperamos</div>
      </div>
    </Scene>
  ),
}

for (const price of ['$20', '$15', '$10']) {
  SCENES['qr' + price.slice(1)] = (
    <Scene>
      <div style={{ position: 'absolute', left: 26, top: 54, width: 300, transform: 'perspective(900px) rotateY(-16deg) rotateX(8deg) rotate(-3deg)' }}><QrCard interactive={false} /></div>
      <div style={{ position: 'absolute', right: 26, top: 56, color: '#4ABDF0', fontFamily: 'Instrument Serif, serif', fontSize: 104, letterSpacing: '-0.02em', lineHeight: 0.9, textShadow: '0 0 40px rgb(74 189 240 / .6)' }}>{price}</div>
    </Scene>
  )
}

const s = new URLSearchParams(location.search).get('s') ?? 'phone'
createRoot(document.getElementById('root')!).render(SCENES[s] ?? <Scene>?</Scene>)
