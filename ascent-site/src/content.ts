/** Todos los textos del sitio. Cámbialos aquí sin tocar los componentes. */
export const COPY = {
  brand: 'Ascent Co.',
  hero: {
    line1: 'Que te encuentren.',
    line2: 'Que te elijan.',
    cta: 'Cotiza por WhatsApp',
    secondary: 'Ver servicios',
  },
  showcase: {
    title: 'Así se ve.',
    labels: { site: 'Sitio web', phone: 'Presentación', qr: 'Tarjeta QR' },
  },
  services: {
    title: 'Paquetes.',
    sub: 'Precios de lanzamiento',
    featured: 'Más completo',
    bio: { name: 'Página de presentación', price: '$35–50', line: 'Tu link en la bio.', chips: ['WhatsApp', 'Instagram', 'Fotos'] },
    site: { name: 'Sitio web de tu servicio', price: '$50–70', line: 'Te escriben directo, con mensaje listo.', chips: ['WhatsApp', 'Instagram', 'Mensaje listo'] },
    qr: {
      name: 'Tarjeta con QR',
      line: 'Escanea y te encuentran.',
      tiers: [
        { price: '$20', label: 'Sola' },
        { price: '$15', label: '+ Presentación' },
        { price: '$10', label: '+ Sitio web' },
      ],
    },
    openLabel: 'Abrir carpeta',
    closeLabel: 'Cerrar carpeta',
  },
  extras: {
    title: 'Extras.',
    items: [
      { id: 'agenda', title: 'Agenda con confirmación por WhatsApp', price: 'desde $85' },
      { id: 'dominio', title: 'Dominio propio y envíos automáticos', price: 'desde $100' },
      { id: 'recibos', title: 'Cotizaciones y recibos', price: 'precio aparte' },
    ],
  },
  process: {
    title: '3 pasos.',
    steps: ['Nos escribes', 'Lo diseñamos', 'Lo publicamos'],
    terms: [
      { big: '50%', small: 'al comenzar' },
      { big: '50%', small: 'al entregar' },
      { big: '2', small: 'rondas de cambios' },
    ],
  },
  closing: {
    title: '¿Arrancamos?',
    soon: 'Pronto',
    buttons: { whatsapp: 'WhatsApp', instagram: 'Instagram', facebook: 'Facebook' },
  },
  footer: 'Ascent Co. · Puerto Rico',
} as const
