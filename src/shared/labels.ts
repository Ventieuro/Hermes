/**
 * Sistema i18n dell'app.
 *
 * Ogni lingua è un oggetto con la stessa struttura (tipo Labels).
 * Per aggiungere una lingua:
 *   1. Crea un nuovo oggetto che soddisfa il tipo Labels
 *   2. Aggiungilo a TRANSLATIONS
 *   3. Aggiungi il codice locale a Locale
 *
 * La lingua attiva si legge da localStorage ('gestione-soldi-lang') e
 * può essere cambiata chiamando setLocale(). Default: 'it'.
 */

// ─── Tipo struttura traduzioni ───────────────────────────
export interface Labels {
  layout: {
    appName: string
    footerText: string
  }
  temi: {
    giungla: string
    spazio: string
  }
  dashboard: {
    periodoPrecedente: string
    periodoSuccessivo: string
    stipendioIl: string
    oggi: string
    entrate: string
    uscite: string
    risparmi: string
    movimenti: string
    nessunoMovimentoEmoji: string
    nessunoMovimento: string
    nessunoMovimentoSuggerimento: string
    eliminaLabel: string
    eliminaConferma: (desc: string) => string
    aggiungiMovimento: string
  }
  mascotte: {
    ariaLabel: string
    messaggi: {
      vuoto: string
      ottimo: string
      bene: (saldo: string) => string
      pari: string
      rosso: (importo: string) => string
    }
  }
  form: {
    titoloEntrata: string
    titoloUscita: string
    toggleEntrata: string
    toggleUscita: string
    labelQuanto: string
    placeholderImporto: string
    simboloValuta: string
    labelPerCosa: string
    placeholderDescrizione: string
    labelCategoria: string
    labelQuando: string
    labelRicorrente: string
    messaggioRicorrente: string
    unitaMesi: string
    submitEntrata: string
    submitUscita: string
  }
  categorie: {
    entrata: readonly string[]
    uscita: readonly string[]
  }
  notFound: {
    messaggio: string
    tornaHome: string
  }
  home: {
    altMascotte: string
    titolo: string
    sottotitolo: string
    vaiDashboard: string
  }
}

// ─── Lingue disponibili ──────────────────────────────────
export type Locale = 'it' | 'en'

// ─── Italiano ────────────────────────────────────────────
const it: Labels = {
  layout: {
    appName: '💰 Gestione Soldi',
    footerText: 'Gestione Soldi',
  },
  temi: {
    giungla: 'Giungla',
    spazio: 'Spazio',
  },
  dashboard: {
    periodoPrecedente: 'Periodo precedente',
    periodoSuccessivo: 'Periodo successivo',
    stipendioIl: '📅 Stipendio il:',
    oggi: '📍 Oggi',
    entrate: 'Entrate',
    uscite: 'Uscite',
    risparmi: 'Risparmi',
    movimenti: 'Movimenti',
    nessunoMovimentoEmoji: '📭',
    nessunoMovimento: 'Nessun movimento in questo periodo.',
    nessunoMovimentoSuggerimento: 'Premi il bottone qui sotto per aggiungerne uno!',
    eliminaLabel: 'Elimina',
    eliminaConferma: (desc) => `Vuoi eliminare "${desc}"?`,
    aggiungiMovimento: 'Aggiungi movimento',
  },
  mascotte: {
    ariaLabel: 'mascotte',
    messaggi: {
      vuoto: 'Nessun movimento ancora! Inizia aggiungendo la tua prima entrata o uscita 😊',
      ottimo: 'Wow, stai risparmiando un bel po\'! Continua così! 🚀',
      bene: (saldo) => `Bene! Hai messo da parte ${saldo} questo mese 👍`,
      pari: 'Sei in pari questo mese. Proviamo a risparmiare qualcosina?',
      rosso: (importo) => `Attenzione, sei in rosso di ${importo}... Rivediamo le spese?`,
    },
  },
  form: {
    titoloEntrata: '💚 Nuova entrata',
    titoloUscita: '🔴 Nuova uscita',
    toggleEntrata: '➕ Entrata',
    toggleUscita: '➖ Uscita',
    labelQuanto: 'Quanto?',
    placeholderImporto: '0,00',
    simboloValuta: '€',
    labelPerCosa: 'Per cosa?',
    placeholderDescrizione: 'es. Spesa al supermercato',
    labelCategoria: 'Categoria',
    labelQuando: 'Quando?',
    labelRicorrente: 'Si ripete ogni mese? 🔄',
    messaggioRicorrente: 'Per quanti mesi vuoi che si ripeta?',
    unitaMesi: 'mesi',
    submitEntrata: '✅ Aggiungi entrata',
    submitUscita: '✅ Aggiungi uscita',
  },
  categorie: {
    entrata: ['Stipendio', 'Freelance', 'Regalo', 'Rimborso', 'Altro'],
    uscita: ['Affitto', 'Bollette', 'Spesa', 'Trasporti', 'Svago', 'Salute', 'Abbonamenti', 'Altro'],
  },
  notFound: {
    messaggio: 'Pagina non trovata.',
    tornaHome: 'Torna alla Home',
  },
  home: {
    altMascotte: 'Scimmia mascotte con denari',
    titolo: 'Gestione Soldi',
    sottotitolo: 'Tieni sotto controllo entrate, uscite e risparmi',
    vaiDashboard: 'Vai alla Dashboard',
  },
}

// ─── English (placeholder — da completare) ───────────────
const en: Labels = {
  layout: {
    appName: '💰 Money Manager',
    footerText: 'Money Manager',
  },
  temi: {
    giungla: 'Jungle',
    spazio: 'Space',
  },
  dashboard: {
    periodoPrecedente: 'Previous period',
    periodoSuccessivo: 'Next period',
    stipendioIl: '📅 Pay day:',
    oggi: '📍 Today',
    entrate: 'Income',
    uscite: 'Expenses',
    risparmi: 'Savings',
    movimenti: 'Transactions',
    nessunoMovimentoEmoji: '📭',
    nessunoMovimento: 'No transactions in this period.',
    nessunoMovimentoSuggerimento: 'Tap the button below to add one!',
    eliminaLabel: 'Delete',
    eliminaConferma: (desc) => `Delete "${desc}"?`,
    aggiungiMovimento: 'Add transaction',
  },
  mascotte: {
    ariaLabel: 'mascot',
    messaggi: {
      vuoto: 'No transactions yet! Start by adding your first income or expense 😊',
      ottimo: 'Wow, you\'re saving a lot! Keep it up! 🚀',
      bene: (saldo) => `Nice! You saved ${saldo} this month 👍`,
      pari: 'You broke even this month. Shall we try to save a little?',
      rosso: (importo) => `Watch out, you\'re ${importo} in the red... Let\'s review expenses?`,
    },
  },
  form: {
    titoloEntrata: '💚 New income',
    titoloUscita: '🔴 New expense',
    toggleEntrata: '➕ Income',
    toggleUscita: '➖ Expense',
    labelQuanto: 'How much?',
    placeholderImporto: '0.00',
    simboloValuta: '€',
    labelPerCosa: 'What for?',
    placeholderDescrizione: 'e.g. Grocery shopping',
    labelCategoria: 'Category',
    labelQuando: 'When?',
    labelRicorrente: 'Repeats every month? 🔄',
    messaggioRicorrente: 'For how many months?',
    unitaMesi: 'months',
    submitEntrata: '✅ Add income',
    submitUscita: '✅ Add expense',
  },
  categorie: {
    entrata: ['Salary', 'Freelance', 'Gift', 'Refund', 'Other'],
    uscita: ['Rent', 'Bills', 'Groceries', 'Transport', 'Entertainment', 'Health', 'Subscriptions', 'Other'],
  },
  notFound: {
    messaggio: 'Page not found.',
    tornaHome: 'Back to Home',
  },
  home: {
    altMascotte: 'Monkey mascot with coins',
    titolo: 'Money Manager',
    sottotitolo: 'Keep track of income, expenses and savings',
    vaiDashboard: 'Go to Dashboard',
  },
}

// ─── Registro traduzioni ─────────────────────────────────
const TRANSLATIONS: Record<Locale, Labels> = { it, en }

// ─── Lingua attiva ───────────────────────────────────────
const LANG_KEY = 'gestione-soldi-lang'

function getStoredLocale(): Locale {
  try {
    const v = localStorage.getItem(LANG_KEY)
    if (v && v in TRANSLATIONS) return v as Locale
  } catch { /* SSR / test */ }
  return 'it'
}

let currentLocale: Locale = getStoredLocale()
let t: Labels = TRANSLATIONS[currentLocale]

export function getLocale(): Locale {
  return currentLocale
}

export function setLocale(locale: Locale) {
  currentLocale = locale
  t = TRANSLATIONS[locale]
  try { localStorage.setItem(LANG_KEY, locale) } catch { /* noop */ }
}

/** Restituisce tutte le label nella lingua attiva */
export function labels(): Labels {
  return t
}

// ─── Esportazioni per retro-compatibilità ────────────────
// I componenti esistenti importano: LAYOUT, DASHBOARD, FORM, ecc.
// Continuano a funzionare puntando alla lingua corrente via getter.

function makeProxy<K extends keyof Labels>(section: K): Labels[K] {
  return new Proxy({} as Labels[K], {
    get(_target, prop) {
      return (t[section] as Record<string | symbol, unknown>)[prop]
    },
  })
}

export const LAYOUT    = makeProxy('layout')
export const TEMI      = makeProxy('temi')
export const DASHBOARD = makeProxy('dashboard')
export const MASCOTTE  = makeProxy('mascotte')
export const FORM      = makeProxy('form')
export const CATEGORIE = makeProxy('categorie')
export const NOT_FOUND = makeProxy('notFound')
export const HOME      = makeProxy('home')
