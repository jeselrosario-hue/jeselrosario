import { Button } from '@/components/ui/button'
import { COPY } from '@/content'
import { whatsappUrl } from '@/config'
import { WhatsAppIcon } from './BrandIcons'

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav aria-label="Principal" className="glass flex w-full max-w-5xl items-center justify-between rounded-full py-2 pl-5 pr-2">
        <a href="#inicio" className="flex min-h-11 items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-sky">
          <img src="/logo-light.png" alt="" width={1000} height={751} className="h-7 w-auto" />
          <span className="text-lg font-extrabold tracking-tight">{COPY.brand}</span>
        </a>
        <Button href={whatsappUrl() || '#contacto'} size="sm" target={whatsappUrl() ? '_blank' : undefined} rel="noopener noreferrer">
          <WhatsAppIcon /> <span className="hidden sm:inline">WhatsApp</span>
          <span className="sr-only sm:hidden">WhatsApp</span>
        </Button>
      </nav>
    </header>
  )
}
