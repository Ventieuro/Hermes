import type { Transaction, AppSettings } from './types'

const STORAGE_KEY = 'gestione-soldi-transactions'
const SETTINGS_KEY = 'gestione-soldi-settings'

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
