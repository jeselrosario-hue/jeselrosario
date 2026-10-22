import { WhatsAppIcon } from '../BrandIcons'

/** Sitio real (FadeLab) dentro de una ventana de navegador, con scroll automático. */
export function BrowserSite({ className = '', bubble = true, url = 'tu-negocio.com' }: { className?: string; bubble?: boolean; url?: string }) {
  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border border-white/20 bg-[#050d1c] shadow-[0_40px_100px_-20px_rgb(0_0_0/0.75)] ${className}`}>
      <div className="flex items-center gap-2 bg-[#0a1a36] px-3 py-2.5">
        <span className="size-2.5 rounded-full bg-white/25" /><span className="size-2.5 rounded-full bg-white/25" /><span className="size-2.5 rounded-full bg-white/25" />
        <div className="mx-auto w-3/5 truncate rounded-full bg-white/10 px-3 py-1 text-center text-[11px] text-white/70">{url}</div>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src="/examples/fadelab-site.webp" alt="Ejemplo: sitio web de una barbería hecho por Ascent Co." width={1100} height={4320} loading="lazy" className="w-full animate-[page-scroll_16s_ease-in-out_infinite] [--scroll-dist:-84%]" />
        {bubble && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-2xl rounded-br-sm bg-sky px-3 py-2 text-[11px] font-bold text-navy shadow-[0_0_30px_rgb(74_189_240/0.6)] sm:text-xs">
            <WhatsAppIcon className="size-4" /> Hola, quiero reservar
          </div>
        )}
      </div>
    </div>
  )
}
