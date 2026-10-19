/** Todos los textos del sitio. Cámbialos aquí sin tocar los componentes. */
export const COPY = {
  brand: 'Ascent Co.',
  nav: [
    { id: 'servicios', label: 'Paquetes' },
    { id: 'ejemplos', label: 'Ejemplos' },
    { id: 'proceso', label: 'Proceso' },
    { id: 'contacto', label: 'Contacto' },
  ],
  marquee: ['Presentación', 'Sitio web', 'Tarjeta QR', 'Agenda', 'Recibos', 'Dominio propio'],
  eyebrows: { ejemplos: '01', servicios: '02', extras: '03', galeria: '04', proceso: '05', contacto: '06' },
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
    bio: { name: 'Presentación', price: '$35–50', line: 'Tu link en la bio.', chips: ['WhatsApp', 'Instagram', 'Fotos'] },
    site: { name: 'Sitio web', price: '$50–70', line: 'Te escriben directo.', chips: ['WhatsApp', 'Instagram', 'Mensaje listo'] },
    qr: {
      name: 'Tarjeta QR',
      line: 'Escanea y listo.',
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
      { id: 'agenda', title: 'Agenda y citas', price: 'desde $85' },
      { id: 'dominio', title: 'Dominio propio', price: 'desde $100' },
      { id: 'recibos', title: 'Cotizaciones y recibos', price: 'precio aparte' },
    ],
  },
  gallery: { title: 'Galería.' },
  /** Reseñas reales de clientes. Vacío = la galería muestra solo trabajos (no se inventan reseñas). */
  testimonials: [] as ReadonlyArray<{ name: string; role: string; quote: string }>,
  process: {
    title: '3 pasos.',
    steps: ['Escríbenos', 'Diseñamos', 'Publicamos'],
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
