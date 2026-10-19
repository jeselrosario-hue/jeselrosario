import { Marquee } from '@/components/motion/Marquee'
import { COPY } from '@/content'

export function Ticker() {
  return (
    <div className="relative border-y border-white/10 bg-navy">
      <Marquee items={COPY.marquee} />
    </div>
  )
}
