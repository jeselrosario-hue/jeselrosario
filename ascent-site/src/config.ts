/**
 * Enlaces de contacto de Ascent Co. Es el único lugar donde hay que llenarlos.
 * - instagram / facebook: la URL del perfil (debe empezar con https://).
 * - email: el correo del negocio.
 * Los que queden vacíos se muestran apagados ("Pronto") y no rompen nada.
 * No se usa WhatsApp ni ningún número de teléfono.
 */
export const LINKS: Record<'instagram' | 'facebook' | 'email', string> = {
  instagram: '',
  facebook: '',
  email: 'ascentco.pr@gmail.com',
}

/** Mensaje que llega escrito cuando alguien toca el botón de correo. */
export const CONTACT_MESSAGE = 'Hola Ascent Co., quiero cotizar mi página.'

/**
 * Agenda de citas (Cal.com, plan gratis). Es el tramo que va después de cal.com:
 * para cal.com/ascentco/consulta aquí va 'ascentco/consulta'.
 * Vacío = la sección de agenda muestra la demostración dibujada, sin reservar.
 */
export const CAL_LINK = ''

/** Dirección que codifica el QR de demostración. */
export const SITE_URL = 'https://ascentco.netlify.app'

const httpsOnly = (v: string) => (/^https:\/\/[^\s]+$/i.test(v.trim()) ? v.trim() : '')
const emailOnly = (v: string) => (/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(v.trim()) ? v.trim() : '')

/** Correo con el mensaje ya escrito. Vacío si no hay correo válido. */
export function mailtoUrl(message: string = CONTACT_MESSAGE): string {
  const e = emailOnly(LINKS.email)
  return e ? `mailto:${e}?subject=${encodeURIComponent('Cotización Ascent Co.')}&body=${encodeURIComponent(message)}` : ''
}

export function linkFor(key: keyof typeof LINKS): string {
  if (key === 'email') return mailtoUrl()
  return httpsOnly(LINKS[key])
}

/** Botón principal: Instagram primero, correo si no hay Instagram. */
export function primaryContactUrl(): string {
  return linkFor('instagram') || linkFor('email')
}
