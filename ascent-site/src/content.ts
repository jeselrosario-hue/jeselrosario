/** Todos los textos del sitio. Cámbialos aquí sin tocar los componentes. */
export const COPY = {
  brand: 'Ascent Co.',
  nav: [
    { id: 'servicios', label: 'Paquetes' },
    { id: 'ejemplos', label: 'Ejemplos' },
    { id: 'cotiza', label: 'Cotiza' },
    { id: 'proceso', label: 'Proceso' },
    { id: 'contacto', label: 'Contacto' },
  ],
  marquee: ['Presentación', 'Sitio web', 'Tarjeta QR', 'Agenda', 'Recibos', 'Dominio propio'],
  eyebrows: { ejemplos: '01', servicios: '02', extras: '03', cotiza: '04', galeria: '05', proceso: '06', contacto: '07' },
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
    demo: {
      eyebrow: 'Pruébala',
      title: 'Así reservarían tus clientes.',
      sub: 'Esta es la misma agenda que se instala en tu sitio. Aparta un espacio y la ves por dentro.',
    },
  },
  quote: {
    title: 'Cuánto te cuesta.',
    sub: 'Marca lo que necesitas y el estimado se arma solo. Lo envías por WhatsApp ya escrito.',
    empty: '$0',
    from: 'Desde',
    toQuote: 'A cotizar',
    cta: 'Enviar por WhatsApp',
    waPrefix: 'Hola Ascent Co., quiero cotizar:',
    waTotal: 'Estimado del sitio:',
    bundle: { bio: '+ presentación', site: '+ sitio web' },
    items: [
      { id: 'bio', name: 'Página de presentación', line: 'Tu link en la bio.', tag: '$35–50' },
      { id: 'site', name: 'Sitio web', line: 'Te escriben directo, con mensaje listo.', tag: '$50–70' },
      { id: 'qr', name: 'Tarjeta con QR', line: 'Baja de precio si llevas página.', tag: '$20 · $15 · $10' },
      { id: 'agenda', name: 'Agenda y citas', line: 'Reservan y confirman por WhatsApp.', tag: 'desde $85' },
      { id: 'dominio', name: 'Dominio propio', line: 'Tu dirección, sin netlify.app.', tag: 'desde $100' },
      { id: 'recibos', name: 'Cotizaciones y recibos', line: 'Documentos para tus clientes.', tag: 'aparte' },
    ],
    slip: {
      title: 'Tu estimado',
      meta: 'Ascent Co.',
      none: 'Marca una opción para empezar',
      total: 'Total estimado',
      terms: '50% al comenzar · 50% al entregar · 2 rondas de cambios incluidas.',
      foot: 'Es un estimado. El precio final se confirma al hablar.',
    },
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
