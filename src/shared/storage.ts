import type { Transaction, AppSettings } from './types'
import { normalizeCategoryKey } from './labels'

const STORAGE_KEY = 'hermes-transactions'
const SETTINGS_KEY = 'hermes-settings'
const CUSTOM_CAT_KEY = 'hermes-custom-categories'
const CUSTOM_ICONS_KEY = 'hermes-custom-icons'
const NOTIFICATIONS_KEY = 'hermes-notifications'

const QR_TRANSFER_PREFIX = 'hermes-xfer-session-'
const QR_TRANSFER_READY_KEY = 'hermes-xfer-ready-payload'

const INDEXED_DB_NAME = 'hermes-db'
const INDEXED_DB_VERSION = 1
const INDEXED_DB_STORE = 'kv'

const MANAGED_KEYS = [
  STORAGE_KEY,
  SETTINGS_KEY,
  CUSTOM_CAT_KEY,
  CUSTOM_ICONS_KEY,
  NOTIFICATIONS_KEY,
] as const

type ManagedKey = (typeof MANAGED_KEYS)[number]

interface KVRecord {
  key: ManagedKey
  value: string
}

const storageCache = new Map<ManagedKey, string | null>()
let storageEngine: 'localStorage' | 'indexeddb' = 'localStorage'
let indexedDbReady = false

function openHermesDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(INDEXED_DB_STORE)) {
        db.createObjectStore(INDEXED_DB_STORE, { keyPath: 'key' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function idbGet(db: IDBDatabase, key: ManagedKey): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(INDEXED_DB_STORE, 'readonly')
    const store = tx.objectStore(INDEXED_DB_STORE)
    const req = store.get(key)
    req.onsuccess = () => {
      const record = req.result as KVRecord | undefined
      resolve(record?.value ?? null)
    }
    req.onerror = () => reject(req.error)
  })
}

function idbSet(db: IDBDatabase, key: ManagedKey, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(INDEXED_DB_STORE, 'readwrite')
    const store = tx.objectStore(INDEXED_DB_STORE)
    store.put({ key, value } satisfies KVRecord)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function initPersistentStorage(): Promise<void> {
  if (indexedDbReady) return

  if (typeof indexedDB === 'undefined') {
    storageEngine = 'localStorage'
    for (const key of MANAGED_KEYS) {
      storageCache.set(key, localStorage.getItem(key))
    }
    indexedDbReady = true
    return
  }

  try {
    const db = await openHermesDb()

    for (const key of MANAGED_KEYS) {
      const fromDb = await idbGet(db, key)
      if (fromDb !== null) {
        storageCache.set(key, fromDb)
        continue
      }

      const fromLocal = localStorage.getItem(key)
      if (fromLocal !== null) {
        await idbSet(db, key, fromLocal)
        localStorage.removeItem(key)
        storageCache.set(key, fromLocal)
      } else {
        storageCache.set(key, null)
      }
    }

    db.close()
    storageEngine = 'indexeddb'
  } catch {
    storageEngine = 'localStorage'
    for (const key of MANAGED_KEYS) {
      storageCache.set(key, localStorage.getItem(key))
    }
  }

  indexedDbReady = true
}

function getManagedItem(key: ManagedKey): string | null {
  if (storageCache.has(key)) return storageCache.get(key) ?? null
  const fallback = localStorage.getItem(key)
  storageCache.set(key, fallback)
  return fallback
}

function setManagedItem(key: ManagedKey, value: string) {
  storageCache.set(key, value)
  if (storageEngine === 'indexeddb' && typeof indexedDB !== 'undefined') {
    void openHermesDb()
      .then((db) => idbSet(db, key, value).finally(() => db.close()))
      .catch(() => {
        localStorage.setItem(key, value)
      })
    return
  }
  localStorage.setItem(key, value)
}

function isIsoDateTime(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function normalizeTransaction(tx: Transaction): Transaction {
  const fallbackTs = `${tx.date}T00:00:00.000Z`
  const createdAt = isIsoDateTime(tx.createdAt) ? tx.createdAt : fallbackTs
  const updatedAt = isIsoDateTime(tx.updatedAt) ? tx.updatedAt : createdAt
  return {
    ...tx,
    syncId: typeof tx.syncId === 'string' && tx.syncId ? tx.syncId : tx.id,
    createdAt,
    updatedAt,
  }
}

export function loadTransactions(): Transaction[] {
  try {
    const raw = getManagedItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidTransaction).map(normalizeTransaction)
  } catch {
    return []
  }
}

function isValidTransaction(data: unknown): data is Transaction {
  if (typeof data !== 'object' || data === null) return false
  const t = data as Record<string, unknown>
  return (
    typeof t.id === 'string' &&
    (t.syncId === undefined || typeof t.syncId === 'string') &&
    (t.createdAt === undefined || isIsoDateTime(t.createdAt)) &&
    (t.updatedAt === undefined || isIsoDateTime(t.updatedAt)) &&
    (t.type === 'entrata' || t.type === 'uscita') &&
    typeof t.description === 'string' &&
    typeof t.amount === 'number' && t.amount > 0 &&
    typeof t.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.date) &&
    typeof t.recurring === 'boolean' &&
    typeof t.recurringMonths === 'number' &&
    (t.recurringGroupId === undefined || typeof t.recurringGroupId === 'string') &&
    typeof t.category === 'string'
  )
}

export function saveTransactions(transactions: Transaction[]) {
  setManagedItem(STORAGE_KEY, JSON.stringify(transactions.map(normalizeTransaction)))
}

/**
 * Migrazione una-tantum: normalizza le categorie dei movimenti esistenti
 * alla chiave canonica italiana (fix per categorie create in lingua diversa).
 */
// Mapping per categorie rinominate tra versioni
const RENAMED_CATEGORIES: Record<string, string> = {
  Quotidiano: 'Spesa',
  Daily: 'Spesa',
  Diario: 'Spesa',
  Abbigliamento: 'Altro',
  Clothing: 'Altro',
  Ropa: 'Altro',
}

export function migrateCategoryKeys() {
  const all = loadTransactions()
  let changed = false
  const migrated = all.map((tx) => {
    // Prima applica eventuali rinominazioni
    const renamed = RENAMED_CATEGORIES[tx.category]
    if (renamed) {
      changed = true
      return { ...tx, category: renamed }
    }
    const canonical = normalizeCategoryKey(tx.category, tx.type)
    if (canonical !== tx.category) {
      changed = true
      return { ...tx, category: canonical }
    }
    return tx
  })
  if (changed) saveTransactions(migrated)
}

export function addTransaction(tx: Transaction) {
  const all = loadTransactions()
  all.push(normalizeTransaction({
    ...tx,
    updatedAt: new Date().toISOString(),
  }))
  saveTransactions(all)
}

export function deleteTransaction(id: string) {
  const all = loadTransactions().filter((t) => t.id !== id)
  saveTransactions(all)
}

export function deleteTransactionsByGroupId(groupId: string) {
  const all = loadTransactions().filter((t) => t.recurringGroupId !== groupId)
  saveTransactions(all)
}

export function updateTransactionsByGroupId(
  groupId: string,
  patch: Pick<Transaction, 'type' | 'description' | 'amount' | 'category' | 'recurring' | 'recurringMonths'>,
) {
  const all = loadTransactions().map((t) => {
    if (t.recurringGroupId !== groupId) return t
    return normalizeTransaction({ ...t, ...patch, updatedAt: new Date().toISOString() })
  })
  saveTransactions(all)
}

export function updateTransaction(updated: Transaction) {
  const all = loadTransactions().map((t) => {
    if (t.id !== updated.id) return t
    return normalizeTransaction({
      ...updated,
      syncId: t.syncId ?? updated.syncId ?? updated.id,
      createdAt: t.createdAt ?? updated.createdAt,
      updatedAt: new Date().toISOString(),
    })
  })
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
    const raw = getManagedItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : { payDay: 27, userName: '' }
  } catch {
    return { payDay: 27, userName: '' }
  }
}

export function saveSettings(settings: AppSettings) {
  setManagedItem(SETTINGS_KEY, JSON.stringify(settings))
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

export interface CustomCategories {
  entrata: string[]
  uscita: string[]
}

export function loadCustomCategories(): CustomCategories {
  try {
    const raw = getManagedItem(CUSTOM_CAT_KEY)
    return raw ? JSON.parse(raw) : { entrata: [], uscita: [] }
  } catch {
    return { entrata: [], uscita: [] }
  }
}

export function saveCustomCategories(cats: CustomCategories) {
  setManagedItem(CUSTOM_CAT_KEY, JSON.stringify(cats))
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
    setManagedItem(CUSTOM_ICONS_KEY, JSON.stringify(icons))
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

export function loadCustomIcons(): Record<string, string> {
  try {
    const raw = getManagedItem(CUSTOM_ICONS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveCustomIcon(categoryName: string, icon: string) {
  const icons = loadCustomIcons()
  icons[categoryName] = icon
  setManagedItem(CUSTOM_ICONS_KEY, JSON.stringify(icons))
}

export function deleteCustomIcon(categoryName: string) {
  const icons = loadCustomIcons()
  delete icons[categoryName]
  setManagedItem(CUSTOM_ICONS_KEY, JSON.stringify(icons))
}

// ─── Notification Settings ──────────────────────────────

export interface NotificationSettings {
  enabled: boolean
  time: string // HH:MM
}

export function loadNotificationSettings(): NotificationSettings {
  try {
    const raw = getManagedItem(NOTIFICATIONS_KEY)
    return raw ? JSON.parse(raw) : { enabled: false, time: '21:30' }
  } catch {
    return { enabled: false, time: '21:30' }
  }
}

export function saveNotificationSettings(settings: NotificationSettings) {
  setManagedItem(NOTIFICATIONS_KEY, JSON.stringify(settings))
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

// ─── Crypto helpers ──────────────────────────────────────

export interface EncryptedBackup {
  enc: 1
  salt: string  // base64
  iv: string    // base64
  data: string  // base64 AES-GCM ciphertext
}

interface QrTransferSession {
  total: number
  chunks: Record<number, string>
}

interface ImportOptions {
  mode?: 'replace' | 'merge'
}

const TRANSFER_CODE_PREFIX = 'HX1.'

function bufToBase64(buf: ArrayBuffer | Uint8Array<ArrayBuffer>): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  return btoa(String.fromCharCode(...bytes))
}

function base64ToBuf(b64: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(base64Url: string): string {
  const padded = base64Url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64Url.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptJson(json: string, password: string): Promise<EncryptedBackup> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt)
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(json),
  )
  return { enc: 1, salt: bufToBase64(salt), iv: bufToBase64(iv), data: bufToBase64(ciphertext) }
}

async function decryptJson(payload: EncryptedBackup, password: string): Promise<string | null> {
  try {
    const key = await deriveKey(password, base64ToBuf(payload.salt))
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBuf(payload.iv) },
      key,
      base64ToBuf(payload.data),
    )
    return new TextDecoder().decode(plaintext)
  } catch {
    return null
  }
}

// ─── Apply backup ─────────────────────────────────────────

function mergeTransactions(existing: Transaction[], incoming: Transaction[]): Transaction[] {
  const merged = new Map<string, Transaction>()
  for (const tx of existing.map(normalizeTransaction)) {
    merged.set(tx.syncId ?? tx.id, tx)
  }

  for (const tx of incoming.map(normalizeTransaction)) {
    const key = tx.syncId ?? tx.id
    const current = merged.get(key)
    if (!current) {
      merged.set(key, tx)
      continue
    }
    const currentUpdated = Date.parse(current.updatedAt ?? current.createdAt ?? `${current.date}T00:00:00.000Z`)
    const nextUpdated = Date.parse(tx.updatedAt ?? tx.createdAt ?? `${tx.date}T00:00:00.000Z`)
    if (nextUpdated >= currentUpdated) {
      merged.set(key, tx)
    }
  }

  return Array.from(merged.values())
}

function applyBackup(data: Partial<AppBackup>, options: ImportOptions = {}): 'ok' | 'invalid' {
  if (data.version !== 1) return 'invalid'
  if (!Array.isArray(data.transactions)) return 'invalid'
  const incomingTransactions = data.transactions.filter(isValidTransaction)
  if (options.mode === 'merge') {
    saveTransactions(mergeTransactions(loadTransactions(), incomingTransactions))
  } else {
    saveTransactions(incomingTransactions)
  }

  if (data.settings && typeof data.settings === 'object') {
    if (options.mode !== 'merge') {
      saveSettings(data.settings as AppSettings)
    }
  }

  if (data.customCategories && typeof data.customCategories === 'object') {
    if (options.mode === 'merge') {
      const local = loadCustomCategories()
      const next = data.customCategories as CustomCategories
      saveCustomCategories({
        entrata: Array.from(new Set([...local.entrata, ...next.entrata])),
        uscita: Array.from(new Set([...local.uscita, ...next.uscita])),
      })
    } else {
      saveCustomCategories(data.customCategories as CustomCategories)
    }
  }

  if (data.customIcons && typeof data.customIcons === 'object') {
    if (options.mode === 'merge') {
      const local = loadCustomIcons()
      setManagedItem(CUSTOM_ICONS_KEY, JSON.stringify({ ...local, ...(data.customIcons as Record<string, string>) }))
    } else {
      setManagedItem(CUSTOM_ICONS_KEY, JSON.stringify(data.customIcons))
    }
  }

  if (data.notificationSettings && typeof data.notificationSettings === 'object') {
    if (options.mode !== 'merge') {
      saveNotificationSettings(data.notificationSettings as NotificationSettings)
    }
  }

  return 'ok'
}

/** Scarica tutti i dati come file .json cifrato con AES-256-GCM */
export async function exportAllData(password: string): Promise<void> {
  const backup: AppBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions: loadTransactions(),
    settings: loadSettings(),
    customCategories: loadCustomCategories(),
    customIcons: loadCustomIcons(),
    notificationSettings: loadNotificationSettings(),
  }
  const encrypted = await encryptJson(JSON.stringify(backup), password)
  const blob = new Blob([JSON.stringify(encrypted)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hermes-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Importa un backup da file .json (cifrato o plain legacy).
 * @returns 'ok' | 'invalid' | 'needs-password' | 'wrong-password'
 */
export async function importAllData(
  jsonString: string,
  password?: string,
  options: ImportOptions = {},
): Promise<'ok' | 'invalid' | 'needs-password' | 'wrong-password'> {
  try {
    const raw = JSON.parse(jsonString) as Record<string, unknown>

    // Encrypted format
    if (raw.enc === 1) {
      if (!password) return 'needs-password'
      const decrypted = await decryptJson(raw as unknown as EncryptedBackup, password)
      if (decrypted === null) return 'wrong-password'
      return applyBackup(JSON.parse(decrypted) as Partial<AppBackup>, options)
    }

    // Plain legacy format
    return applyBackup(raw as Partial<AppBackup>, options)
  } catch {
    return 'invalid'
  }
}

// ─── QR Transfer (PC -> telefono) ───────────────────────

export async function buildQrTransferLinks(password: string): Promise<string[]> {
  const backup: AppBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions: loadTransactions(),
    settings: loadSettings(),
    customCategories: loadCustomCategories(),
    customIcons: loadCustomIcons(),
    notificationSettings: loadNotificationSettings(),
  }

  const encrypted = await encryptJson(JSON.stringify(backup), password)
  const payload = toBase64Url(JSON.stringify(encrypted))

  const sessionId = generateId()
  const chunkSize = 700
  const chunks: string[] = []
  for (let i = 0; i < payload.length; i += chunkSize) {
    chunks.push(payload.slice(i, i + chunkSize))
  }

  const total = chunks.length
  const baseUrl = `${window.location.origin}${window.location.pathname}`
  return chunks.map((chunk, i) => {
    const token = `1.${sessionId}.${i + 1}.${total}.${chunk}`
    return `${baseUrl}?xfer=${encodeURIComponent(token)}`
  })
}

export async function buildTransferCode(password: string): Promise<string> {
  const backup: AppBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions: loadTransactions(),
    settings: loadSettings(),
    customCategories: loadCustomCategories(),
    customIcons: loadCustomIcons(),
    notificationSettings: loadNotificationSettings(),
  }

  const encrypted = await encryptJson(JSON.stringify(backup), password)
  return `${TRANSFER_CODE_PREFIX}${toBase64Url(JSON.stringify(encrypted))}`
}

export async function importTransferCode(
  code: string,
  password?: string,
  options: ImportOptions = {},
): Promise<'ok' | 'invalid' | 'needs-password' | 'wrong-password'> {
  try {
    const compact = code.trim().replace(/\s+/g, '')
    const raw = compact.startsWith(TRANSFER_CODE_PREFIX)
      ? compact.slice(TRANSFER_CODE_PREFIX.length)
      : compact

    if (!raw) return 'invalid'
    const payload = fromBase64Url(raw)
    return importAllData(payload, password, options)
  } catch {
    return 'invalid'
  }
}

export function ingestQrTransferToken(raw: string): 'ignored' | 'partial' | 'ready' | 'invalid' {
  if (!raw) return 'ignored'

  const parts = raw.split('.')
  if (parts.length < 5) return 'invalid'

  const [version, sessionId, indexRaw, totalRaw, ...chunkParts] = parts
  const index = Number(indexRaw)
  const total = Number(totalRaw)
  const chunk = chunkParts.join('.')

  if (version !== '1' || !sessionId || !Number.isInteger(index) || !Number.isInteger(total) || !chunk) {
    return 'invalid'
  }

  const key = `${QR_TRANSFER_PREFIX}${sessionId}`
  let session: QrTransferSession = { total, chunks: {} }

  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored) as QrTransferSession
      if (parsed.total === total && parsed.chunks && typeof parsed.chunks === 'object') {
        session = parsed
      }
    }
  } catch {
    return 'invalid'
  }

  session.chunks[index] = chunk
  localStorage.setItem(key, JSON.stringify(session))

  const collected = Object.keys(session.chunks).length
  if (collected < total) return 'partial'

  let joined = ''
  for (let i = 1; i <= total; i++) {
    const part = session.chunks[i]
    if (!part) return 'partial'
    joined += part
  }

  try {
    const payload = fromBase64Url(joined)
    localStorage.setItem(QR_TRANSFER_READY_KEY, payload)
    localStorage.removeItem(key)
    return 'ready'
  } catch {
    return 'invalid'
  }
}

// Backward-compatible helper for hash links generated in previous version.
export function ingestQrTransferHash(hash: string): 'ignored' | 'partial' | 'ready' | 'invalid' {
  if (!hash.startsWith('#xfer=')) return 'ignored'
  return ingestQrTransferToken(hash.slice(6))
}

export function getPendingQrTransferPayload(): string | null {
  try {
    return localStorage.getItem(QR_TRANSFER_READY_KEY)
  } catch {
    return null
  }
}

export function clearPendingQrTransferPayload() {
  try {
    localStorage.removeItem(QR_TRANSFER_READY_KEY)
  } catch {
    // noop
  }
}
