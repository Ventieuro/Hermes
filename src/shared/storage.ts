import type { Transaction, AppSettings } from './types'

const STORAGE_KEY = 'hermes-transactions'
const SETTINGS_KEY = 'hermes-settings'

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidTransaction)
  } catch {
    return []
  }
}

function isValidTransaction(data: unknown): data is Transaction {
  if (typeof data !== 'object' || data === null) return false
  const t = data as Record<string, unknown>
  return (
    typeof t.id === 'string' &&
    (t.type === 'entrata' || t.type === 'uscita') &&
    typeof t.description === 'string' &&
    typeof t.amount === 'number' && t.amount > 0 &&
    typeof t.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.date) &&
    typeof t.recurring === 'boolean' &&
    typeof t.recurringMonths === 'number' &&
    typeof t.category === 'string'
  )
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

export function updateTransaction(updated: Transaction) {
  const all = loadTransactions().map((t) => t.id === updated.id ? updated : t)
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
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

// ─── PIN Lock ────────────────────────────────────────────
const PIN_KEY = 'hermes-pin'
const PIN_SESSION_KEY = 'hermes-unlocked'
const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('')
}

export function loadPin(): string | null {
  try {
    const pin = localStorage.getItem(PIN_KEY)
    // Migration: old plain-text PINs are not 64-char hex (SHA-256) → force reset
    if (pin && !/^[0-9a-f]{64}$/.test(pin)) {
      localStorage.removeItem(PIN_KEY)
      return null
    }
    return pin
  } catch {
    return null
  }
}

export async function savePin(pin: string) {
  const hash = await sha256(pin)
  localStorage.setItem(PIN_KEY, hash)
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = loadPin()
  if (!stored) return false
  const hash = await sha256(pin)
  // Constant-time comparison
  if (hash.length !== stored.length) return false
  let result = 0
  for (let i = 0; i < hash.length; i++) {
    result |= hash.charCodeAt(i) ^ stored.charCodeAt(i)
  }
  return result === 0
}

export function isUnlocked(): boolean {
  try {
    const ts = sessionStorage.getItem(PIN_SESSION_KEY)
    if (!ts) return false
    if (Date.now() - Number(ts) > SESSION_TIMEOUT_MS) {
      sessionStorage.removeItem(PIN_SESSION_KEY)
      return false
    }
    return true
  } catch {
    return false
  }
}

export function setUnlocked() {
  sessionStorage.setItem(PIN_SESSION_KEY, Date.now().toString())
}

// ─── Categorie Custom ────────────────────────────────────
const CUSTOM_CAT_KEY = 'hermes-custom-categories'

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

export function renameCustomCategory(type: 'entrata' | 'uscita', oldName: string, newName: string) {
  const trimmed = newName.trim()
  if (!trimmed || oldName === trimmed) return
  const cats = loadCustomCategories()
  const idx = cats[type].indexOf(oldName)
  if (idx === -1) return
  cats[type][idx] = trimmed
  saveCustomCategories(cats)
  // Update icon
  const icons = loadCustomIcons()
  if (icons[oldName]) {
    icons[trimmed] = icons[oldName]
    delete icons[oldName]
    localStorage.setItem(CUSTOM_ICONS_KEY, JSON.stringify(icons))
  }
  // Update transactions
  const txs = loadTransactions()
  let changed = false
  for (const tx of txs) {
    if (tx.category === oldName) {
      tx.category = trimmed
      changed = true
    }
  }
  if (changed) saveTransactions(txs)
}

// ─── Custom Category Icons ──────────────────────────────
const CUSTOM_ICONS_KEY = 'hermes-custom-icons'

export function loadCustomIcons(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CUSTOM_ICONS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveCustomIcon(categoryName: string, icon: string) {
  const icons = loadCustomIcons()
  icons[categoryName] = icon
  localStorage.setItem(CUSTOM_ICONS_KEY, JSON.stringify(icons))
}

export function deleteCustomIcon(categoryName: string) {
  const icons = loadCustomIcons()
  delete icons[categoryName]
  localStorage.setItem(CUSTOM_ICONS_KEY, JSON.stringify(icons))
}

// ─── Notification Settings ──────────────────────────────
const NOTIFICATIONS_KEY = 'hermes-notifications'

export interface NotificationSettings {
  enabled: boolean
  time: string // HH:MM
}

export function loadNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY)
    return raw ? JSON.parse(raw) : { enabled: false, time: '21:30' }
  } catch {
    return { enabled: false, time: '21:30' }
  }
}

export function saveNotificationSettings(settings: NotificationSettings) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(settings))
}

// ─── Export / Import JSON ────────────────────────────────

export interface AppBackup {
  version: 1
  exportedAt: string  // ISO timestamp
  transactions: Transaction[]
  settings: AppSettings
  customCategories: CustomCategories
  customIcons: Record<string, string>
  notificationSettings: NotificationSettings
}

/** Scarica tutti i dati come file .json */
export function exportAllData(): void {
  const backup: AppBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions: loadTransactions(),
    settings: loadSettings(),
    customCategories: loadCustomCategories(),
    customIcons: loadCustomIcons(),
    notificationSettings: loadNotificationSettings(),
  }
  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hermes-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Importa un backup da file .json.
 * @returns 'ok' se importato con successo, 'invalid' se il file non è valido.
 */
export function importAllData(jsonString: string): 'ok' | 'invalid' {
  try {
    const data = JSON.parse(jsonString) as Partial<AppBackup>
    if (data.version !== 1) return 'invalid'
    if (!Array.isArray(data.transactions)) return 'invalid'
    const validTxs = data.transactions.filter(isValidTransaction)
    saveTransactions(validTxs)
    if (data.settings && typeof data.settings === 'object') {
      saveSettings(data.settings as AppSettings)
    }
    if (data.customCategories && typeof data.customCategories === 'object') {
      saveCustomCategories(data.customCategories as CustomCategories)
    }
    if (data.customIcons && typeof data.customIcons === 'object') {
      localStorage.setItem(CUSTOM_ICONS_KEY, JSON.stringify(data.customIcons))
    }
    if (data.notificationSettings && typeof data.notificationSettings === 'object') {
      saveNotificationSettings(data.notificationSettings as NotificationSettings)
    }
    return 'ok'
  } catch {
    return 'invalid'
  }
}
