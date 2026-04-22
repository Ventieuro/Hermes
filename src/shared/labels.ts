/**
 * Sistema i18n dell'app.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  AGGIUNGERE UNA NUOVA LABEL:                                   ║
 * ║                                                                 ║
 * ║  1. Trova la sezione giusta (layout, dashboard, ecc.)           ║
 * ║  2. Aggiungi UNA riga:                                          ║
 * ║                                                                 ║
 * ║     nomeLabel: t('Italiano', 'English', 'Español'),             ║
 * ║                                                                 ║
 * ║  Per funzioni con parametri:                                    ║
 * ║     saluto: tf(                                                 ║
 * ║       (nome: string) => `Ciao ${nome}!`,                       ║
 * ║       (nome: string) => `Hello ${nome}!`,                      ║
 * ║       (nome: string) => `¡Hola ${nome}!`,                      ║
 * ║     ),                                                          ║
 * ║                                                                 ║
 * ║  Per array:                                                     ║
 * ║     frutti: ta(['Mela','Pera'], ['Apple','Pear'], ['Manzana','Pera']), ║
 * ║                                                                 ║
 * ║  Fatto! Non serve toccare nient'altro.                          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ─── Lingue disponibili ──────────────────────────────────
export type Locale = 'it' | 'en' | 'es'

// ─── Helper: scrivi it + en + es sulla stessa riga ───────
type I18n<V> = Record<Locale, V>
function t(it: string, en: string, es: string): I18n<string> { return { it, en, es } }
function tf<A extends unknown[]>(it: (...a: A) => string, en: (...a: A) => string, es: (...a: A) => string): I18n<(...a: A) => string> { return { it, en, es } }
function ta(it: readonly string[], en: readonly string[], es: readonly string[]): I18n<readonly string[]> { return { it, en, es } }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//                    TUTTE LE LABEL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const STRINGS = {

  // ── Layout ─────────────────────────────────────────────
  layout: {
    appName:    t('🚀 Hermes',  '🚀 Hermes',     '🚀 Hermes'),
    footerText: t('Hermes',     'Hermes',        'Hermes'),
  },

  // ── Temi ───────────────────────────────────────────────
  temi: {
    spazio:  t('Spazio',  'Space',  'Espacio'),
  },

  // ── Dashboard ──────────────────────────────────────────
  dashboard: {
    periodoPrecedente:            t('Periodo precedente',                             'Previous period',                        'Período anterior'),
    periodoSuccessivo:            t('Periodo successivo',                              'Next period',                            'Período siguiente'),
    stipendioIl:                  t('�️ Stipendio il:',                                '🛰️ Pay day:',                             '🛰️ Día de pago:'),
    oggi:                         t('🌍 Oggi',                                         '🌍 Today',                                '🌍 Hoy'),
    entrate:                      t('Entrate',                                         'Income',                                 'Ingresos'),
    uscite:                       t('Uscite',                                          'Expenses',                               'Gastos'),
    risparmi:                     t('Risparmi',                                        'Savings',                                'Ahorros'),
    movimenti:                    t('Movimenti',                                       'Transactions',                           'Movimientos'),
    nessunoMovimentoEmoji:        t('🪐',                                              '🪐',                                      '🪐'),
    nessunoMovimento:             t('Nessun movimento in questo periodo.',              'No transactions in this period.',         'No hay movimientos en este período.'),
    nessunoMovimentoSuggerimento: t('Premi il bottone qui sotto per aggiungerne uno!', 'Tap the button below to add one!',       '¡Pulsa el botón de abajo para añadir uno!'),
    eliminaLabel:                 t('Elimina',                                         'Delete',                                 'Eliminar'),
    eliminaConferma: tf(
      (desc: string) => `Vuoi eliminare "${desc}"?`,
      (desc: string) => `Delete "${desc}"?`,
      (desc: string) => `¿Eliminar "${desc}"?`,
    ),
    aggiungiMovimento:            t('Aggiungi movimento',                              'Add transaction',                        'Añadir movimiento'),
    graficoSpese:                 t('Dove vanno i soldi',                              'Where your money goes',                  'A dónde va el dinero'),
    nessunGrafico:                t('Nessuna uscita in questo periodo.',               'No expenses in this period.',            'No hay gastos en este período.'),
    risparmiLabel:                t('Risparmi',                                        'Savings',                                'Ahorros'),
    categorieLabel:               t('Categorie',                                       'Categories',                             'Categorías'),
    vistaTorta:                   t('Riepilogo',                                       'Overview',                               'Resumen'),
    vistaSolare:                  t('Spese',                                           'Expenses',                               'Gastos'),
    vistaCometa:                  t('Annuale',                                         'Yearly',                                 'Anual'),
  },

  // ── Mascotte ───────────────────────────────────────────
  mascotte: {
    ariaLabel: t('astronauta', 'astronaut', 'astronauta'),
    messaggi: {
      vuoto:  t('Houston, nessun movimento rilevato! Lancia la tua prima transazione 🛸',
                'Houston, no transactions detected! Launch your first one 🛸',
                '¡Houston, sin movimientos! Lanza tu primera transacción 🛸'),
      ottimo: t('Missione risparmio: successo totale! Continua così, astronauta! 🌟',
                'Savings mission: total success! Keep it up, astronaut! 🌟',
                '¡Misión ahorro: éxito total! ¡Sigue así, astronauta! 🌟'),
      bene: tf(
        (saldo: string) => `Ottimo pilota! Hai messo in orbita ${saldo} questo mese 🪐`,
        (saldo: string) => `Great pilot! You put ${saldo} into orbit this month 🪐`,
        (saldo: string) => `¡Gran piloto! Pusiste ${saldo} en órbita este mes 🪐`,
      ),
      pari:   t('Stazione spaziale in equilibrio. Proviamo a spingere verso le stelle? ⭐',
                'Space station balanced. Shall we push toward the stars? ⭐',
                'Estación espacial en equilibrio. ¿Intentamos llegar a las estrellas? ⭐'),
      rosso: tf(
        (importo: string) => `Allerta! Sei in rosso di ${importo}... Rientro d'emergenza! 🆘`,
        (importo: string) => `Alert! You're ${importo} in the red... Emergency landing! 🆘`,
        (importo: string) => `¡Alerta! Estás en rojo por ${importo}... ¡Aterrizaje de emergencia! 🆘`,
      ),
    },
  },

  // ── Form Transazione ───────────────────────────────────
  form: {
    titoloEntrata:          t('💚 Nuova entrata',                   '💚 New income',                  '💚 Nuevo ingreso'),
    titoloUscita:           t('🔴 Nuova uscita',                    '🔴 New expense',                 '🔴 Nuevo gasto'),
    toggleEntrata:          t('➕ Entrata',                          '➕ Income',                       '➕ Ingreso'),
    toggleUscita:           t('➖ Uscita',                           '➖ Expense',                      '➖ Gasto'),
    labelQuanto:            t('Quanto?',                             'How much?',                      '¿Cuánto?'),
    placeholderImporto:     t('0,00',                                '0.00',                           '0,00'),
    simboloValuta:          t('€',                                   '€',                              '€'),
    labelPerCosa:           t('Per cosa?',                           'What for?',                      '¿Para qué?'),
    placeholderDescrizione: t('es. Spesa al supermercato',           'e.g. Grocery shopping',          'ej. Compra en el supermercado'),
    labelCategoria:         t('Categoria',                           'Category',                       'Categoría'),
    labelQuando:            t('Quando?',                             'When?',                          '¿Cuándo?'),
    labelRicorrente:        t('Si ripete ogni mese? 🌀',             'Repeats every month? 🌀',        '¿Se repite cada mes? 🌀'),
    messaggioRicorrente:    t('Per quanti mesi vuoi che si ripeta?', 'For how many months?',           '¿Durante cuántos meses?'),
    unitaMesi:              t('mesi',                                'months',                         'meses'),
    submitEntrata:          t('✅ Aggiungi entrata',                  '✅ Add income',                   '✅ Añadir ingreso'),
    submitUscita:           t('✅ Aggiungi uscita',                   '✅ Add expense',                  '✅ Añadir gasto'),
    modificaEntrata:        t('✏️ Salva modifiche',                   '✏️ Save changes',                 '✏️ Guardar cambios'),
    modificaUscita:         t('✏️ Salva modifiche',                   '✏️ Save changes',                 '✏️ Guardar cambios'),
    titoloModificaEntrata:  t('✏️ Modifica entrata',                  '✏️ Edit income',                  '✏️ Editar ingreso'),
    titoloModificaUscita:   t('✏️ Modifica uscita',                   '✏️ Edit expense',                 '✏️ Editar gasto'),
    nuovaCategoria:         t('+ Nuova categoria',                   '+ New category',                 '+ Nueva categoría'),
    placeholderNuovaCat:    t('Nome categoria',                      'Category name',                  'Nombre categoría'),
    aggiungiCategoria:      t('Aggiungi',                             'Add',                            'Añadir'),
    salvaPerFuturo:         t('Salva per il futuro',                  'Save for future',                'Guardar para el futuro'),
    labelPerCosaOpzionale:  t('Per cosa? (opzionale)',                'What for? (optional)',            '¿Para qué? (opcional)'),
  },

  // ── Categorie ──────────────────────────────────────────
  categorie: {
    entrata: ta(
      ['Stipendio', 'Freelance', 'Regalo', 'Rimborso', 'Altro'],
      ['Salary',    'Freelance', 'Gift',   'Refund',   'Other'],
      ['Salario',   'Freelance', 'Regalo', 'Reembolso','Otro'],
    ),
    uscita: ta(
      ['Cibo', 'Quotidiano', 'Trasporti', 'Sociale', 'Residenza', 'Regalo', 'Comunicazioni', 'Abbigliamento', 'Svago', 'Bellezza', 'Medico', 'Hobby', 'Bollette', 'Altro'],
      ['Food', 'Daily',      'Transport', 'Social',  'Housing',   'Gift',   'Communications','Clothing',      'Entertainment','Beauty','Medical','Hobby','Bills',   'Other'],
      ['Comida','Diario',    'Transporte','Social',  'Vivienda',  'Regalo', 'Comunicaciones','Ropa',          'Ocio',         'Belleza','Médico','Hobby','Facturas','Otro'],
    ),
  },

  // ── Pagina 404 ─────────────────────────────────────────
  notFound: {
    messaggio: t('Pagina non trovata.', 'Page not found.',  'Página no encontrada.'),
    tornaHome: t('Torna alla Home',     'Back to Home',     'Volver al inicio'),
  },

  // ── PIN Lock ────────────────────────────────────────────
  pin: {
    titolo:          t('Accesso protetto',              'Protected access',              'Acceso protegido'),
    inserisciPin:    t('Inserisci il PIN',               'Enter your PIN',                'Introduce el PIN'),
    creaPin:         t('Crea un PIN di 4 cifre',         'Create a 4-digit PIN',          'Crea un PIN de 4 dígitos'),
    confermaPin:     t('Conferma il PIN',                'Confirm your PIN',              'Confirma el PIN'),
    pinErrato:       t('PIN errato, riprova.',           'Wrong PIN, try again.',         'PIN incorrecto, inténtalo de nuevo.'),
    pinNonCoincide:  t('I PIN non coincidono, riprova.', 'PINs don\'t match, try again.', 'Los PIN no coinciden, inténtalo de nuevo.'),
    sblocca:         t('Sblocca',                        'Unlock',                        'Desbloquear'),
    conferma:        t('Conferma',                       'Confirm',                       'Confirmar'),
  },

  // ── Home ───────────────────────────────────────────────
  home: {
    altMascotte:  t('Astronauta mascotte di Hermes',                   'Astronaut mascot of Hermes',             'Astronauta mascota de Hermes'),
    titolo:       t('Hermes',                                            'Hermes',                                 'Hermes'),
    sottotitolo:  t('Tieni sotto controllo entrate, uscite e risparmi', 'Keep track of income, expenses and savings', 'Controla tus ingresos, gastos y ahorros'),
    vaiDashboard: t('Vai alla Dashboard',                               'Go to Dashboard',                        'Ir al Panel'),
  },

  // ── Gestione Categorie ─────────────────────────────────
  gestioneCategorie: {
    titolo:           t('Gestione Categorie',         'Manage Categories',           'Gestión de Categorías'),
    categorieEntrata: t('Categorie Entrata',          'Income Categories',           'Categorías de Ingreso'),
    categorieUscita:  t('Categorie Uscita',           'Expense Categories',          'Categorías de Gasto'),
    predefinite:      t('Predefinite',                'Default',                     'Predeterminadas'),
    personalizzate:   t('Personalizzate',             'Custom',                      'Personalizadas'),
    nessuna:          t('Nessuna categoria custom.',  'No custom categories.',       'Sin categorías personalizadas.'),
    confermaElimina: tf(
      (nome: string) => `Eliminare la categoria "${nome}"?`,
      (nome: string) => `Delete category "${nome}"?`,
      (nome: string) => `¿Eliminar la categoría "${nome}"?`,
    ),
    tornaIndietro:    t('← Dashboard',                '← Dashboard',                '← Panel'),
    nuovaCategoria:   t('Nuova Categoria',             'New Category',                'Nueva Categoría'),
    placeholderNome:  t('Nome categoria',              'Category name',               'Nombre categoría'),
    aggiungi:         t('Aggiungi',                    'Add',                         'Añadir'),
    scegliIcona:      t('Scegli icona',                'Choose icon',                 'Elegir icono'),
    rinomina:         t('Rinomina',                    'Rename',                      'Renombrar'),
    salva:            t('Salva',                       'Save',                        'Guardar'),
    annulla:          t('Annulla',                     'Cancel',                      'Cancelar'),
  },

  // ── Settings ───────────────────────────────────────────
  settings: {
    tema:              t('Tema',                         'Theme',                       'Tema'),
    darkMode:          t('Spazio',                       'Space',                       'Espacio'),
    lightMode:         t('NASA',                         'NASA',                        'NASA'),
    lingua:            t('Lingua',                       'Language',                    'Idioma'),
    notifiche:         t('Notifiche',                    'Notifications',               'Notificaciones'),
    promemoria:        t('Promemoria giornaliero',       'Daily reminder',              'Recordatorio diario'),
    orarioPromemoria:  t('A che ora?',                   'At what time?',               '¿A qué hora?'),
    gestioneCategorie: t('Gestione Categorie',           'Manage Categories',           'Gestión de Categorías'),
    permessoNegato:    t('Permesso notifiche negato',    'Notification permission denied','Permiso de notificaciones denegado'),
    testNotifica:      t('🔔 Invia notifica di test',      '🔔 Send test notification',     '🔔 Enviar notificación de prueba'),
    sincronizzazione:  t('Sincronizzazione',               'Sync',                          'Sincronización'),
    esportaDati:       t('📤 Esporta dati',                '📤 Export data',                 '📤 Exportar datos'),
    importaDati:       t('📥 Importa dati',                '📥 Import data',                 '📥 Importar datos'),
    importaConferma:   t('Vuoi unire i dati importati con quelli presenti?', 'Merge imported data with existing data?', '¿Quieres fusionar los datos importados con los existentes?'),
    importaOk:         t('✅ Importazione completata (merge)', '✅ Import complete (merge)',    '✅ Importación completada (fusión)'),
    importaErrore:     t('❌ File non valido',             '❌ Invalid file',                '❌ Archivo no válido'),
    passwordErrata:    t('❌ Password errata',             '❌ Wrong password',              '❌ Contraseña incorrecta'),
    passwordEsporta:   t('Scegli una password per cifrare il backup:', 'Choose a password to encrypt the backup:', 'Elige una contraseña para cifrar el backup:'),
    passwordImporta:   t('Inserisci la password del backup:', 'Enter the backup password:', 'Ingresa la contraseña del backup:'),
    qrTransfer:        t('Trasferimento QR (PC → telefono)', 'QR transfer (PC → phone)',     'Transferencia QR (PC → móvil)'),
    qrGenera:          t('📲 Genera QR trasferimento',      '📲 Generate transfer QR',         '📲 Generar QR de transferencia'),
    qrScansiona:       t('Scansiona tutti i QR in ordine dal telefono.', 'Scan all QR codes in order from your phone.', 'Escanea todos los QR en orden desde tu móvil.'),
    qrPrecedente:      t('Precedente',                     'Previous',                       'Anterior'),
    qrSuccessivo:      t('Successivo',                     'Next',                           'Siguiente'),
    qrChiudi:          t('Chiudi',                         'Close',                          'Cerrar'),
    qrCaricamento:     t('Caricamento QR...',              'Loading QR...',                  'Cargando QR...'),
    qrBlocco:          tf(
      (corrente: number, totale: number) => `QR ${corrente}/${totale}`,
      (corrente: number, totale: number) => `QR ${corrente}/${totale}`,
      (corrente: number, totale: number) => `QR ${corrente}/${totale}`,
    ),
    qrImportPrompt:    t('QR completo! Inserisci la password di trasferimento:', 'QR complete! Enter transfer password:', '¡QR completo! Ingresa la contraseña de transferencia:'),
  },

  // ── Notifiche ──────────────────────────────────────────
  notifiche: {
    messaggioPromemoria: t(
      'Heila astronauta! 🚀 Hai inserito le tue spese di oggi?',
      'Hey astronaut! 🚀 Have you logged today\'s expenses?',
      '¡Oye astronauta! 🚀 ¿Has registrado tus gastos de hoy?',
    ),
  },

  // ── PWA Install ────────────────────────────────────────
  pwa: {
    installTitle:   t('Installa Hermes',                                'Install Hermes',                         'Instalar Hermes'),
    installMessage: t('Aggiungi alla schermata home per accesso rapido', 'Add to home screen for quick access',    'Añade a la pantalla de inicio para acceso rápido'),
    installButton:  t('Installa',                                       'Install',                                'Instalar'),
    chiudi:         t('Non ora',                                        'Not now',                                'Ahora no'),
    iosMessage:     t('Per installare: tocca ⬆️ poi "Aggiungi alla schermata Home"',
                      'To install: tap ⬆️ then "Add to Home Screen"',
                      'Para instalar: toca ⬆️ y luego "Añadir a pantalla de inicio"'),
  },
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//              INFRASTRUTTURA (non toccare)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Tipo Labels derivato automaticamente dalla struttura STRINGS
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Resolve<S> = { [K in keyof S]: S[K] extends I18n<infer V> ? V : Resolve<S[K]> }
export type Labels = Resolve<typeof STRINGS>

// ─── Lingua attiva ───────────────────────────────────────
const LANG_KEY = 'hermes-lang'

function getStoredLocale(): Locale {
  try {
    const v = localStorage.getItem(LANG_KEY)
    if (v === 'it' || v === 'en' || v === 'es') return v
  } catch { /* SSR / test */ }
  return 'it'
}

let currentLocale: Locale = getStoredLocale()

export function getLocale(): Locale { return currentLocale }

export function setLocale(locale: Locale) {
  currentLocale = locale
  try { localStorage.setItem(LANG_KEY, locale) } catch { /* noop */ }
}

/** Restituisce tutte le label nella lingua attiva (oggetto completo) */
export function labels(): Labels {
  return resolve(STRINGS) as Labels
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolve(obj: Record<string, any>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const k in obj) {
    const v = obj[k]
    if (v && typeof v === 'object' && 'it' in v && 'en' in v && 'es' in v) {
      out[k] = v[currentLocale]
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = resolve(v)
    } else {
      out[k] = v
    }
  }
  return out
}

// ─── Esportazioni per sezione (usate dai componenti) ─────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function localize(obj: Record<string, any>): any {
  return new Proxy({}, {
    get(_target, prop: string | symbol) {
      if (typeof prop === 'symbol') return undefined
      const v = obj[prop]
      if (!v) return v
      if (typeof v === 'object' && 'it' in v && 'en' in v && 'es' in v) return v[currentLocale]
      if (typeof v === 'object' && !Array.isArray(v)) return localize(v)
      return v
    },
  })
}

export const LAYOUT:    Labels['layout']    = localize(STRINGS.layout)
export const TEMI:      Labels['temi']      = localize(STRINGS.temi)
export const DASHBOARD: Labels['dashboard'] = localize(STRINGS.dashboard)
export const MASCOTTE:  Labels['mascotte']  = localize(STRINGS.mascotte)
export const FORM:      Labels['form']      = localize(STRINGS.form)
export const CATEGORIE: Labels['categorie'] = localize(STRINGS.categorie)
export const NOT_FOUND: Labels['notFound']  = localize(STRINGS.notFound)
export const HOME:      Labels['home']      = localize(STRINGS.home)
export const PIN:       Labels['pin']       = localize(STRINGS.pin)
export const GESTIONE_CATEGORIE: Labels['gestioneCategorie'] = localize(STRINGS.gestioneCategorie)
export const SETTINGS:  Labels['settings']  = localize(STRINGS.settings)
export const NOTIFICHE: Labels['notifiche'] = localize(STRINGS.notifiche)
export const PWA:       Labels['pwa']       = localize(STRINGS.pwa)
