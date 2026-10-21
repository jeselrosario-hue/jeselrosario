import { MotionConfig } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import './index.css'
import App from './App'
import { reducirMovimiento, RESPETAR_REDUCIR_MOVIMIENTO } from './lib/motion'

if (reducirMovimiento()) document.documentElement.classList.add('reducir')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion={RESPETAR_REDUCIR_MOVIMIENTO ? 'user' : 'never'}>
      <App />
    </MotionConfig>
  </StrictMode>,
)
