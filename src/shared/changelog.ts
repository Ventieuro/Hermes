// ─── Changelog: aggiungi una nuova entry in cima ad ogni deploy ───

export interface ChangelogEntry {
  version: string
  date: string
  changes: {
    it: string[]
    en: string[]
    es: string[]
  }
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.8.0',
    date: '2026-04-20',
    changes: {
      it: [
        '✏️ Ora puoi modificare le spese e le entrate già inserite',
        '🔒 PIN protetto con hash SHA-256 e confronto sicuro',
        '🛡️ Validazione dati su ogni caricamento dal localStorage',
        '🧩 Nuovi componenti UI riusabili (Card, Button, Input, Modal…)',
      ],
      en: [
        '✏️ You can now edit existing transactions',
        '🔒 PIN protected with SHA-256 hash and secure comparison',
        '🛡️ Data validation on every localStorage load',
        '🧩 New reusable UI components (Card, Button, Input, Modal…)',
      ],
      es: [
        '✏️ Ahora puedes editar transacciones existentes',
        '🔒 PIN protegido con hash SHA-256 y comparación segura',
        '🛡️ Validación de datos en cada carga del localStorage',
        '🧩 Nuevos componentes UI reutilizables (Card, Button, Input, Modal…)',
      ],
    },
  },
  {
    version: '1.7.0',
    date: '2026-04-19',
    changes: {
      it: [
        '🪐 Nuovo nome: Hermes!',
        '🎨 Grafico a ciambella spaziale animato su canvas',
        '🌍 Sistema solare animato: pianeti orbitanti con scie luminose',
        '📱 Supporto installazione PWA su iPhone/iPad',
      ],
      en: [
        '🪐 New name: Hermes!',
        '🎨 Animated space donut chart on canvas',
        '🌍 Animated solar system: orbiting planets with light trails',
        '📱 PWA install support on iPhone/iPad',
      ],
      es: [
        '🪐 ¡Nuevo nombre: Hermes!',
        '🎨 Gráfico de dona espacial animado en canvas',
        '🌍 Sistema solar animado: planetas orbitando con estelas de luz',
        '📱 Soporte de instalación PWA en iPhone/iPad',
      ],
    },
  },
  {
    version: '1.6.0',
    date: '2026-04-19',
    changes: {
      it: [
        '📱 Hermes è ora una PWA! Installabile sul telefono',
        '🔔 Notifiche push anche con app in background',
        '💾 Funziona offline grazie al Service Worker',
        '⬇️ Banner "Installa Hermes" sulla home screen',
      ],
      en: [
        '📱 Hermes is now a PWA! Installable on your phone',
        '🔔 Push notifications even with app in background',
        '💾 Works offline thanks to Service Worker',
        '⬇️ "Install Hermes" banner on home screen',
      ],
      es: [
        '📱 ¡Hermes es ahora una PWA! Instalable en tu teléfono',
        '🔔 Notificaciones push incluso con la app en segundo plano',
        '💾 Funciona sin conexión gracias al Service Worker',
        '⬇️ Banner "Instalar Hermes" en la pantalla de inicio',
      ],
    },
  },
  {
    version: '1.5.0',
    date: '2026-04-19',
    changes: {
      it: [
        '⚙️ Nuovo menu Settings con tema e notifiche',
        '☀️ Tema NASA Light (bianco, nero, arancione)',
        '🔔 Promemoria giornaliero per inserire le spese',
        '🏷️ Gestione categorie completa: crea, rinomina, elimina con emoji picker',
        '🎨 Restyling colori movimenti in dark mode (palette NASA)',
        '📋 Notifica "Novità" dopo ogni deploy',
      ],
      en: [
        '⚙️ New Settings menu with theme and notifications',
        '☀️ NASA Light theme (white, black, orange)',
        '🔔 Daily reminder to log expenses',
        '🏷️ Full category management: create, rename, delete with emoji picker',
        '🎨 Transaction colors restyled in dark mode (NASA palette)',
        '📋 "What\'s New" notification after each deploy',
      ],
      es: [
        '⚙️ Nuevo menú de Ajustes con tema y notificaciones',
        '☀️ Tema NASA Light (blanco, negro, naranja)',
        '🔔 Recordatorio diario para registrar gastos',
        '🏷️ Gestión completa de categorías: crear, renombrar, eliminar con selector de emoji',
        '🎨 Colores de movimientos rediseñados en modo oscuro (paleta NASA)',
        '📋 Notificación de "Novedades" después de cada deploy',
      ],
    },
  },
]

export const CURRENT_VERSION = CHANGELOG[0].version
