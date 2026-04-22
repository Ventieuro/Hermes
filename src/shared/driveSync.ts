import { buildTransferCode, importTransferCode } from './storage'

export type DataMode = 'local' | 'drive'

export interface SyncSettings {
  mode: DataMode
  driveConnected: boolean
  driveFileId?: string
  lastSyncedAt?: string
}

type TokenResult = 'ok' | 'missing-client-id' | 'auth-error'

export type DriveSyncResult =
  | 'ok'
  | 'missing-client-id'
  | 'auth-error'
  | 'no-cloud-data'
  | 'invalid'
  | 'needs-password'
  | 'wrong-password'

const SYNC_SETTINGS_KEY = 'hermes-sync-settings'
const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client'
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata'
const DRIVE_FILE_NAME = (import.meta.env.VITE_GOOGLE_DRIVE_FILE_NAME as string | undefined) ?? 'hermes-sync.enc.txt'

interface GoogleTokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void
}

interface GoogleAccountsOauth2 {
  initTokenClient: (config: {
    client_id: string
    scope: string
    callback: (response: { access_token?: string; error?: string }) => void
  }) => GoogleTokenClient
}

interface GoogleAccounts {
  oauth2: GoogleAccountsOauth2
}

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts
    }
  }
}

export function loadSyncSettings(): SyncSettings {
  try {
    const raw = localStorage.getItem(SYNC_SETTINGS_KEY)
    if (!raw) return { mode: 'local', driveConnected: false }
    const parsed = JSON.parse(raw) as Partial<SyncSettings>
    return {
      mode: parsed.mode === 'drive' ? 'drive' : 'local',
      driveConnected: !!parsed.driveConnected,
      driveFileId: parsed.driveFileId,
      lastSyncedAt: parsed.lastSyncedAt,
    }
  } catch {
    return { mode: 'local', driveConnected: false }
  }
}

export function saveSyncSettings(settings: SyncSettings) {
  localStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify(settings))
}

function getGoogleClientId(): string | null {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  return id && id.trim() ? id.trim() : null
}

async function ensureGoogleScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return
  const existing = document.querySelector(`script[src="${GOOGLE_IDENTITY_SCRIPT}"]`) as HTMLScriptElement | null
  if (existing) {
    await new Promise<void>((resolve, reject) => {
      if (window.google?.accounts?.oauth2) {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Google script load failed')), { once: true })
    })
    return
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GOOGLE_IDENTITY_SCRIPT
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google script load failed'))
    document.head.appendChild(script)
  })
}

async function getAccessToken(prompt: 'consent' | ''): Promise<{ status: TokenResult; token?: string }> {
  const clientId = getGoogleClientId()
  if (!clientId) return { status: 'missing-client-id' }

  try {
    await ensureGoogleScript()
  } catch {
    return { status: 'auth-error' }
  }

  if (!window.google?.accounts?.oauth2) return { status: 'auth-error' }

  return new Promise((resolve) => {
    const tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          resolve({ status: 'auth-error' })
          return
        }
        resolve({ status: 'ok', token: response.access_token })
      },
    })

    tokenClient.requestAccessToken({ prompt })
  })
}

async function findDriveFileId(accessToken: string): Promise<string | null> {
  const q = encodeURIComponent(`name='${DRIVE_FILE_NAME}' and 'appDataFolder' in parents and trashed=false`)
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&spaces=appDataFolder&fields=files(id,name)`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return null
  const data = await res.json() as { files?: Array<{ id: string }> }
  return data.files?.[0]?.id ?? null
}

async function createDriveFile(accessToken: string, content: string): Promise<string | null> {
  const boundary = 'hermes_boundary'
  const metadata = {
    name: DRIVE_FILE_NAME,
    parents: ['appDataFolder'],
    mimeType: 'text/plain',
  }

  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: text/plain',
    '',
    content,
    `--${boundary}--`,
  ].join('\r\n')

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  })

  if (!res.ok) return null
  const data = await res.json() as { id?: string }
  return data.id ?? null
}

async function updateDriveFile(accessToken: string, fileId: string, content: string): Promise<boolean> {
  const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'text/plain',
    },
    body: content,
  })
  return res.ok
}

async function downloadDriveFile(accessToken: string, fileId: string): Promise<string | null> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  if (!res.ok) return null
  return res.text()
}

export async function connectDrive(): Promise<DriveSyncResult> {
  const token = await getAccessToken('consent')
  if (token.status !== 'ok' || !token.token) return token.status

  const current = loadSyncSettings()
  saveSyncSettings({
    ...current,
    mode: 'drive',
    driveConnected: true,
  })
  return 'ok'
}

export function setLocalMode() {
  const current = loadSyncSettings()
  saveSyncSettings({
    mode: 'local',
    driveConnected: false,
    driveFileId: undefined,
    lastSyncedAt: current.lastSyncedAt,
  })
}

export async function syncDriveNow(password: string): Promise<DriveSyncResult> {
  const token = await getAccessToken('')
  if (token.status !== 'ok' || !token.token) return token.status

  const current = loadSyncSettings()
  let fileId = current.driveFileId
  if (!fileId) {
    const found = await findDriveFileId(token.token)
    if (found) fileId = found
  }

  if (fileId) {
    const remoteContent = await downloadDriveFile(token.token, fileId)
    if (remoteContent) {
      const importResult = await importTransferCode(remoteContent, password, { mode: 'merge' })
      if (importResult === 'wrong-password' || importResult === 'invalid') return importResult
    }
  }

  const nextContent = await buildTransferCode(password)

  let nextFileId = fileId
  if (!nextFileId) {
    const created = await createDriveFile(token.token, nextContent)
    if (created) nextFileId = created
    if (!nextFileId) return 'auth-error'
  } else {
    const updated = await updateDriveFile(token.token, nextFileId, nextContent)
    if (!updated) return 'auth-error'
  }

  saveSyncSettings({
    mode: 'drive',
    driveConnected: true,
    driveFileId: nextFileId,
    lastSyncedAt: new Date().toISOString(),
  })
  return 'ok'
}

export async function pullDriveToLocal(password: string): Promise<DriveSyncResult> {
  const token = await getAccessToken('')
  if (token.status !== 'ok' || !token.token) return token.status

  const current = loadSyncSettings()
  let fileId = current.driveFileId
  if (!fileId) {
    const found = await findDriveFileId(token.token)
    if (found) fileId = found
  }
  if (!fileId) return 'no-cloud-data'

  const remoteContent = await downloadDriveFile(token.token, fileId)
  if (!remoteContent) return 'no-cloud-data'

  const result = await importTransferCode(remoteContent, password, { mode: 'merge' })
  if (result !== 'ok') return result

  saveSyncSettings({
    mode: 'drive',
    driveConnected: true,
    driveFileId: fileId,
    lastSyncedAt: new Date().toISOString(),
  })
  return 'ok'
}
