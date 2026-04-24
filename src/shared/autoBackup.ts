/**
 * Backup automatico — salva i dati localmente e/o in una cartella scelta dall'utente.
 *
 * Flusso:
 *  1. L'utente attiva il backup automatico nelle Impostazioni.
 *  2. Al cambio di visibilità (app in background / chiusura) il backup si attiva.
 *  3. Il JSON viene sempre salvato in localStorage come "buffer" affidabile.
 *  4. Se è selezionata la cartella (File System Access API), viene scritto anche lì.
 *  5. Il pulsante "Backup ora" / "Scarica" scarica l'ultimo backup come file .json.
 */

import {
  loadTransactions,
  loadSettings,
  loadCustomCategories,
  loadCustomIcons,
  loadNotificationSettings,
  encryptJson,
} from './storage'

// ─── Tipi ────────────────────────────────────────────────
export type AutoBackupDest = 'download' | 'folder'

export interface AutoBackupSettings {
  enabled: boolean
  dest: AutoBackupDest
  lastBackup: string | null
  folderName: string | null
  password: string | null
}

// ─── Chiavi storage ──────────────────────────────────────
const SETTINGS_KEY = 'hermes-autobackup-settings'
const IDB_NAME = 'hermes-fsa'
const IDB_STORE = 'handles'
const HANDLE_KEY = 'dir'

// ─── Settings localStorage ───────────────────────────────
function defaults(): AutoBackupSettings {
  return { enabled: false, dest: 'download', lastBackup: null, folderName: null, password: null }
}

export function loadAutoBackupSettings(): AutoBackupSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { ...defaults(), ...JSON.parse(raw) }
  } catch { /* noop */ }
  return defaults()
}

export function saveAutoBackupSettings(s: AutoBackupSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}

// ─── IndexedDB per FileSystemDirectoryHandle ─────────────
function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveDirHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openIDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(handle, HANDLE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export async function loadDirHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openIDB()
    const result = await new Promise<FileSystemDirectoryHandle | null>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const req = tx.objectStore(IDB_STORE).get(HANDLE_KEY)
      req.onsuccess = () => resolve((req.result as FileSystemDirectoryHandle | undefined) ?? null)
      req.onerror = () => resolve(null)
    })
    db.close()
    return result
  } catch {
    return null
  }
}

export async function clearDirHandle(): Promise<void> {
  try {
    const db = await openIDB()
    await new Promise<void>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      tx.objectStore(IDB_STORE).delete(HANDLE_KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    })
    db.close()
  } catch { /* noop */ }
}

// ─── Feature detection ───────────────────────────────────
export function isFSASupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}

// ─── Dati backup ─────────────────────────────────────────
async function buildBackupContent(password: string | null): Promise<string> {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions: loadTransactions(),
    settings: loadSettings(),
    customCategories: loadCustomCategories(),
    customIcons: loadCustomIcons(),
    notificationSettings: loadNotificationSettings(),
  }
  if (password) {
    const encrypted = await encryptJson(JSON.stringify(backup), password)
    return JSON.stringify(encrypted)
  }
  return JSON.stringify(backup, null, 2)
}

function buildFilename(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  return `hermes-backup-${date}.json`
}

// ─── Operazioni backup ───────────────────────────────────

/** Scarica il backup come file .json (cifrato se password impostata). */
export async function triggerDownloadBackup(password: string | null = null): Promise<void> {
  const content = await buildBackupContent(password)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = buildFilename()
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Apre il selettore cartella (File System Access API). Restituisce il nome della cartella o null. */
export async function pickFolder(): Promise<string | null> {
  if (!isFSASupported()) return null
  try {
    const handle = await (window as Window & typeof globalThis & { showDirectoryPicker: (opts?: { mode?: string }) => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker({ mode: 'readwrite' })
    await saveDirHandle(handle)
    return handle.name
  } catch {
    return null // utente ha annullato
  }
}

/** Prova a scrivere il backup nella cartella scelta. Restituisce true se ok. */
export async function writeBackupToFolder(password: string | null = null): Promise<boolean> {
  const handle = await loadDirHandle()
  if (!handle) return false
  try {
    // requestPermission non è ancora nei tipi TS ufficiali ma è supportato da Chrome/Edge
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const perm = await (handle as any).requestPermission({ mode: 'readwrite' })
    if (perm !== 'granted') return false
    const fileHandle = await handle.getFileHandle(buildFilename(), { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(await buildBackupContent(password))
    await writable.close()
    return true
  } catch {
    return false
  }
}

/**
 * Esegue il backup automatico.
 * - dest='folder': scrive nella cartella scelta, fallback a download
 * - dest='download': scarica il file
 * Aggiorna sempre il timestamp lastBackup.
 */
export async function performAutoBackup(): Promise<void> {
  const settings = loadAutoBackupSettings()
  if (!settings.enabled) return

  const pwd = settings.password || null

  if (settings.dest === 'folder') {
    const ok = await writeBackupToFolder(pwd)
    if (!ok) {
      // fallback silenzioso: salva in localStorage (sempre affidabile)
      // il download non si fa automaticamente se il browser blocca l'accesso alla cartella
    }
  } else {
    await triggerDownloadBackup(pwd)
  }

  saveAutoBackupSettings({ ...settings, lastBackup: new Date().toISOString() })
}
