/**
 * Sistema i18n dell'app.
 *
 * ╔══════════════════════════════════════════════════════════╗
 * ║  AGGIUNGERE UNA NUOVA LABEL:                           ║
 * ║                                                         ║
 * ║  1. Trova la sezione giusta (layout, dashboard, ecc.)   ║
 * ║  2. Aggiungi UNA riga:                                  ║
 * ║                                                         ║
 * ║     nomeLabel:  t('Testo italiano', 'English text'),    ║
 * ║                                                         ║
 * ║  Per funzioni con parametri:                            ║
 * ║     saluto: tf(                                         ║
 * ║       (nome: string) => `Ciao ${nome}!`,               ║
 * ║       (nome: string) => `Hello ${nome}!`,              ║
 * ║     ),                                                  ║
 * ║                                                         ║
 * ║  Per array:                                             ║
 * ║     frutti: ta(['Mela', 'Pera'], ['Apple', 'Pear']),   ║
 * ║                                                         ║
 * ║  Fatto! Non serve toccare nient'altro.                  ║
 * ╚══════════════════════════════════════════════════════════╝
 */

// ─── Lingue disponibili ──────────────────────────────────
export type Locale = 'it' | 'en'

// ─── Helper: scrivi it + en sulla stessa riga ────────────
type I18n<V> = Record<Locale, V>
function t(it: string, en: string): I18n<string> { return { it, en } }
function tf<A extends unknown[]>(it: (...a: A) => string, en: (...a: A) => string): I18n<(...a: A) => string> { return { it, en } }
function ta(it: readonly string[], en: readonly string[]): I18n<readonly string[]> { return { it, en } }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//                    TUTTE LE LABEL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const STRINGS = {

  // ── Layout ─────────────────────────────────────────────
  layout: {
    appName:    t('💰 Gestione Soldi',  '💰 Money Manager'),
    footerText: t('Gestione Soldi',     'Money Manager'),
  },

  // ── Temi ───────────────────────────────────────────────
  temi: {
    giungla: t('Giungla', 'Jungle'),
    spazio:  t('Spazio',  'Space'),
  },

  // ── Dashboard ──────────────────────────────────────────
  dashboard: {
    periodoPrecedente:            t('Periodo precedente',                            'Previous period'),
    periodoSuccessivo:            t('Periodo successivo',                            'Next period'),
    stipendioIl:                  t('📅 Stipendio il:',                              '📅 Pay day:'),
    oggi:                         t('📍 Oggi',                                       '📍 Today'),
    entrate:                      t('Entrate',                                       'Income'),
    uscite:                       t('Uscite',                                        'Expenses'),
    risparmi:                     t('Risparmi',                                      'Savings'),
    movimenti:                    t('Movimenti',                                     'Transactions'),
    nessunoMovimentoEmoji:        t('📭',                                            '📭'),
    nessunoMovimento:             t('Nessun movimento in questo periodo.',            'No transactions in this period.'),
    nessunoMovimentoSuggerimento: t('Premi il bottone qui sotto per aggiungerne uno!','Tap the button below to add one!'),
    eliminaLabel:                 t('Elimina',                                       'Delete'),
    eliminaConferma: tf(
      (desc: string) => `Vuoi eliminare "${desc}"?`,
      (desc: string) => `Delete "${desc}"?`,
    ),
    aggiungiMovimento:            t('Aggiungi movimento',                            'Add transaction'),
  },

  // ── Mascotte ───────────────────────────────────────────
  mascotte: {
    ariaLabel: t('mascotte', 'mascot'),
    messaggi: {
      vuoto:  t('Nessun movimento ancora! Inizia aggiungendo la tua prima entrata o uscita 😊',
                'No transactions yet! Start by adding your first income or expense 😊'),
      ottimo: t('Wow, stai risparmiando un bel po\'! Continua così! 🚀',
                'Wow, you\'re saving a lot! Keep it up! 🚀'),
      bene: tf(
        (saldo: string) => `Bene! Hai messo da parte ${saldo} questo mese 👍`,
        (saldo: string) => `Nice! You saved ${saldo} this month 👍`,
      ),
      pari:   t('Sei in pari questo mese. Proviamo a risparmiare qualcosina?',
                'You broke even this month. Shall we try to save a little?'),
      rosso: tf(
        (importo: string) => `Attenzione, sei in rosso di ${importo}... Rivediamo le spese?`,
        (importo: string) => `Watch out, you're ${importo} in the red... Let's review expenses?`,
      ),
    },
  },

  // ── Form Transazione ───────────────────────────────────
  form: {
    titoloEntrata:          t('💚 Nuova entrata',                  '💚 New income'),
    titoloUscita:           t('🔴 Nuova uscita',                   '🔴 New expense'),
    toggleEntrata:          t('➕ Entrata',                         '➕ Income'),
    toggleUscita:           t('➖ Uscita',                          '➖ Expense'),
    labelQuanto:            t('Quanto?',                            'How much?'),
    placeholderImporto:     t('0,00',                               '0.00'),
    simboloValuta:          t('€',                                  '€'),
    labelPerCosa:           t('Per cosa?',                          'What for?'),
    placeholderDescrizione: t('es. Spesa al supermercato',          'e.g. Grocery shopping'),
    labelCategoria:         t('Categoria',                          'Category'),
    labelQuando:            t('Quando?',                            'When?'),
    labelRicorrente:        t('Si ripete ogni mese? 🔄',            'Repeats every month? 🔄'),
    messaggioRicorrente:    t('Per quanti mesi vuoi che si ripeta?', 'For how many months?'),
    unitaMesi:              t('mesi',                               'months'),
    submitEntrata:          t('✅ Aggiungi entrata',                 '✅ Add income'),
    submitUscita:           t('✅ Aggiungi uscita',                  '✅ Add expense'),
  },

  // ── Categorie ──────────────────────────────────────────
  categorie: {
    entrata: ta(
      ['Stipendio', 'Freelance', 'Regalo', 'Rimborso', 'Altro'],
      ['Salary',    'Freelance', 'Gift',   'Refund',   'Other'],
    ),
    uscita: ta(
      ['Affitto', 'Bollette', 'Spesa',     'Trasporti', 'Svago',         'Salute', 'Abbonamenti',   'Altro'],
      ['Rent',    'Bills',    'Groceries', 'Transport', 'Entertainment', 'Health', 'Subscriptions', 'Other'],
    ),
  },

  // ── Pagina 404 ─────────────────────────────────────────
  notFound: {
    messaggio: t('Pagina non trovata.', 'Page not found.'),
    tornaHome: t('Torna alla Home',     'Back to Home'),
  },

  // ── Home ───────────────────────────────────────────────
  home: {
    altMascotte:  t('Scimmia mascotte con denari',                      'Monkey mascot with coins'),
    titolo:       t('Gestione Soldi',                                   'Money Manager'),
    sottotitolo:  t('Tieni sotto controllo entrate, uscite e risparmi', 'Keep track of income, expenses and savings'),
    vaiDashboard: t('Vai alla Dashboard',                               'Go to Dashboard'),
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
const LANG_KEY = 'gestione-soldi-lang'

function getStoredLocale(): Locale {
  try {
    const v = localStorage.getItem(LANG_KEY)
    if (v === 'it' || v === 'en') return v
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
    if (v && typeof v === 'object' && 'it' in v && 'en' in v) {
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
      if (typeof v === 'object' && 'it' in v && 'en' in v) return v[currentLocale]
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
