/**
 * Enlaces de contacto. Es el único lugar donde hay que llenarlos.
 * - whatsapp: un número (ej. "17875550142", con código de país) o un enlace completo de wa.me.
 * - instagram / facebook: la URL del perfil.
 * Los que queden vacíos se muestran apagados ("Pronto") y no rompen nada.
 */
export const LINKS: Record<'whatsapp' | 'instagram' | 'facebook', string> = {
  whatsapp: '',
  instagram: '',
  facebook: '',
}

/** Mensaje que ya llega escrito cuando alguien toca el botón de WhatsApp. */
export const WHATSAPP_MESSAGE = 'Hola Ascent Co., quiero cotizar mi página.'

/**
 * Agenda de citas (Cal.com, plan gratis). Es el tramo que va después de cal.com:
 * para cal.com/ascentco/consulta aquí va 'ascentco/consulta'.
 * Vacío = la sección de agenda muestra la demostración dibujada, sin reservar.
 */
export const CAL_LINK = ''

/** Dirección que codifica el QR de demostración. */
export const SITE_URL = 'https://ascentco.netlify.app'

export function whatsappUrl(): string {
  const v = LINKS.whatsapp.trim()
  if (!v) return ''
  if (/^https?:\/\//i.test(v)) return v
  const digits = v.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}` : ''
}

export function linkFor(key: keyof typeof LINKS): string {
  return key === 'whatsapp' ? whatsappUrl() : LINKS[key].trim()
}
