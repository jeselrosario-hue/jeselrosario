import { Camera, MapPin } from 'lucide-react'
import { InstagramIcon, WhatsAppIcon } from '../BrandIcons'

/** Ejemplo de "página de presentación" dentro de un teléfono, con scroll automático. */
export function PhoneBio({ className = '' }: { className?: string }) {
  return (
    <div className={`relative aspect-[9/18.5] w-full rounded-[2.4rem] border-[7px] border-[#050d1c] bg-[#050d1c] shadow-[0_40px_90px_-20px_rgb(0_0_0/0.7),0_0_0_1.5px_rgb(255_255_255/0.18)] ${className}`}>
      <div className="absolute left-1/2 top-2 z-20 h-4 w-16 -translate-x-1/2 rounded-full bg-black" />
      <div className="relative h-full overflow-hidden rounded-[1.9rem] bg-gradient-to-b from-[#0d2a55] to-[#071733]">
        <div className="animate-[page-scroll_12s_ease-in-out_infinite] [--scroll-dist:-34%]">
          <div className="h-28 bg-cover bg-center" style={{ backgroundImage: 'url(/examples/estudio.webp)' }} />
          <div className="-mt-9 flex flex-col items-center px-4 pb-6">
            <div className="size-[4.5rem] rounded-full border-[3px] border-sky bg-cover bg-center shadow-[0_0_24px_rgb(74_189_240/0.6)]" style={{ backgroundImage: 'url(/examples/lowfade.webp)' }} />
            <p className="mt-2 text-[15px] font-extrabold tracking-tight">Fade Lab</p>
            <p className="flex items-center gap-1 text-[10px] text-white/70"><MapPin className="size-3" aria-hidden /> Bayamón, PR</p>
            <div className="mt-4 w-full space-y-2.5">
              <div className="flex items-center justify-center gap-2 rounded-full bg-sky py-2.5 text-[11px] font-bold text-navy"><WhatsAppIcon className="size-4" /> Reservar por WhatsApp</div>
              <div className="flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 py-2.5 text-[11px] font-semibold"><InstagramIcon className="size-4" /> Instagram</div>
              <div className="flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 py-2.5 text-[11px] font-semibold"><Camera className="size-4" aria-hidden /> Trabajos recientes</div>
            </div>
            <div className="mt-4 grid w-full grid-cols-2 gap-2">
              {['navaja', 'perfilado', 'taper', 'espacio'].map((n) => (
                <div key={n} className="aspect-square rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(/examples/${n}.webp)` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
