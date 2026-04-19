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
