import { Nav } from '@/components/Nav'
import { Cursor } from '@/components/motion/Cursor'
import { Intro } from '@/components/motion/Intro'
import { ScrollProgress } from '@/components/motion/ScrollProgress'
import { SmoothScroll } from '@/components/motion/SmoothScroll'
import { Closing } from '@/sections/Closing'
import { Extras } from '@/sections/Extras'
import { Hero } from '@/sections/Hero'
import { Process } from '@/sections/Process'
import { Services } from '@/sections/Services'
import { Showcase } from '@/sections/Showcase'
import { Ticker } from '@/sections/Ticker'

export default function App() {
  return (
    <>
      <SmoothScroll />
      <ScrollProgress />
      <Cursor />
      <Intro />
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[95] focus:rounded-full focus:bg-sky focus:px-5 focus:py-3 focus:font-semibold focus:text-navy">
        Saltar al contenido
      </a>
      <Nav />
      <main id="contenido">
        <Hero />
        <Ticker />
        <Showcase />
        <Services />
        <Extras />
        <Process />
        <Closing />
      </main>
    </>
  )
}
