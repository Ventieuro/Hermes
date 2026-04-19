import type { Transaction, AppSettings } from './types'

const STORAGE_KEY = 'astrocoin-transactions'
const SETTINGS_KEY = 'astrocoin-settings'

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveTransactions(transactions: Transaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
}

export function addTransaction(tx: Transaction) {
  const all = loadTransactions()
  all.push(tx)
  saveTransactions(all)
}

export function deleteTransaction(id: string) {
  const all = loadTransactions().filter((t) => t.id !== id)
  saveTransactions(all)
}

export function getTransactionsInPeriod(
  transactions: Transaction[],
  start: Date,
  end: Date,
): Transaction[] {
  const s = start.getTime()
  const e = end.getTime()
  return transactions.filter((t) => {
    const d = new Date(t.date).getTime()
    return d >= s && d <= e
  })
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : { payDay: 27, userName: '' }
  } catch {
    return { payDay: 27, userName: '' }
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

// ─── PIN Lock ────────────────────────────────────────────
const PIN_KEY = 'astrocoin-pin'
const PIN_SESSION_KEY = 'astrocoin-unlocked'

export function loadPin(): string | null {
  try {
    return localStorage.getItem(PIN_KEY)
  } catch {
    return null
  }
}

export function savePin(pin: string) {
  localStorage.setItem(PIN_KEY, pin)
}

export function isUnlocked(): boolean {
  try {
    return sessionStorage.getItem(PIN_SESSION_KEY) === 'true'
  } catch {
    return false
  }
}

export function setUnlocked() {
  sessionStorage.setItem(PIN_SESSION_KEY, 'true')
}

// ─── Categorie Custom ────────────────────────────────────
const CUSTOM_CAT_KEY = 'astrocoin-custom-categories'

export interface CustomCategories {
  entrata: string[]
  uscita: string[]
}

export function loadCustomCategories(): CustomCategories {
  try {
    const raw = localStorage.getItem(CUSTOM_CAT_KEY)
    return raw ? JSON.parse(raw) : { entrata: [], uscita: [] }
  } catch {
    return { entrata: [], uscita: [] }
  }
}

export function saveCustomCategories(cats: CustomCategories) {
  localStorage.setItem(CUSTOM_CAT_KEY, JSON.stringify(cats))
}

export function addCustomCategory(type: 'entrata' | 'uscita', name: string) {
  const cats = loadCustomCategories()
  const trimmed = name.trim()
  if (!trimmed || cats[type].includes(trimmed)) return
  cats[type].push(trimmed)
  saveCustomCategories(cats)
}

export function deleteCustomCategory(type: 'entrata' | 'uscita', name: string) {
  const cats = loadCustomCategories()
  cats[type] = cats[type].filter((c) => c !== name)
  saveCustomCategories(cats)
}
