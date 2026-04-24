import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../shared/ThemeContext'
import {
  loadNotificationSettings,
  saveNotificationSettings,
  exportAllData,
  importAllData,
} from '../shared/storage'
import {
  connectDrive,
  loadSyncSettings,
  pullDriveToLocal,
  saveSyncSettings,
  syncDriveNow,
  setLocalMode,
  type DriveSyncResult,
} from '../shared/driveSync'
import {
  loadAutoBackupSettings,
  saveAutoBackupSettings,
  pickFolder,
  triggerDownloadBackup,
  isFSASupported,
  type AutoBackupSettings,
} from '../shared/autoBackup'
import { SETTINGS, NOTIFICHE, AUTO_BACKUP, getLocale, setLocale, type Locale } from '../shared/labels'
import { FEATURES } from '../app/features'
import { useDialog } from '../shared/DialogContext'

interface SettingsProps {
  onClose?: () => void
}

function Settings({ onClose }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on click outside (only for header mode)
  useEffect(() => {
    if (onClose) return
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  return (
    <>
      {/* ─── Header Mode: Button + Popover (when onClose is not provided) ─── */}
      {!onClose && (
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-full transition hover:opacity-80"
            style={{ color: 'var(--nav-text)' }}
            aria-label="Settings"
          >
            <span className="text-xl">⚙️</span>
          </button>

          {isOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-2xl z-50 overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <SettingsContent onRequestClose={() => setIsOpen(false)} />
            </div>
          )}
        </div>
      )}

      {/* ─── Modal Mode: Full Content (header is handled by SettingsPage via PageHeader) ─── */}
      {onClose && (
        <div className="w-full" ref={panelRef}>
          {/* Settings Content */}
          <SettingsContent onRequestClose={onClose} />
        </div>
      )}
    </>
  )
}

// ─── Settings Content Component ───
interface SettingsContentProps {
  onRequestClose?: () => void
}

function SettingsContent({ onRequestClose: _onRequestClose }: SettingsContentProps) {
  const { theme, setTheme } = useTheme()
  const { showConfirm, showPrompt } = useDialog()
  const [notifSettings, setNotifSettings] = useState(loadNotificationSettings)
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'invalid' | 'wrong-password'>('idle')
  const [syncSettings, setSyncSettings] = useState(loadSyncSettings)
  const [driveStatus, setDriveStatus] = useState<'idle' | DriveSyncResult>('idle')
  const [isDriveSyncing, setIsDriveSyncing] = useState(false)
  const [autoBackup, setAutoBackup] = useState<AutoBackupSettings>(loadAutoBackupSettings)

  function toggleNotifications() {
    if (!notifSettings.enabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          const updated = { ...notifSettings, enabled: true }
          setNotifSettings(updated)
          saveNotificationSettings(updated)
        }
      })
    } else {
      const updated = { ...notifSettings, enabled: !notifSettings.enabled }
      setNotifSettings(updated)
      saveNotificationSettings(updated)
    }
  }

  function setNotifTime(time: string) {
    const updated = { ...notifSettings, time }
    setNotifSettings(updated)
    saveNotificationSettings(updated)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const ok = await showConfirm({
        title: SETTINGS.importaDati,
        message: SETTINGS.importaConferma,
        confirmLabel: SETTINGS.importaDati,
        cancelLabel: '✕ Annulla',
      })
      if (!ok) { e.target.value = ''; return }
      const content = ev.target?.result as string
      // First try without password to detect format
      const probe = await importAllData(content, undefined, { mode: 'merge' })
      if (probe === 'needs-password') {
        const pwd = await showPrompt({
          title: SETTINGS.passwordImporta,
          message: SETTINGS.passwordImporta,
          inputType: 'password',
          confirmLabel: 'OK',
        })
        if (!pwd) return
        const result = await importAllData(content, pwd, { mode: 'merge' })
        setImportStatus(result === 'needs-password' ? 'invalid' : result)
      } else {
        setImportStatus(probe)
      }
      setTimeout(() => setImportStatus('idle'), 3000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function handleConnectDrive() {
    setIsDriveSyncing(true)
    try {
      const result = await connectDrive()
      setDriveStatus(result)
      setSyncSettings(loadSyncSettings())
    } finally {
      setIsDriveSyncing(false)
      setTimeout(() => setDriveStatus('idle'), 3500)
    }
  }

  function handleUseLocalMode() {
    setLocalMode()
    setSyncSettings(loadSyncSettings())
    setDriveStatus('idle')
  }

  function handleUseDriveMode() {
    const current = loadSyncSettings()
    const next = { ...current, mode: 'drive' as const }
    saveSyncSettings(next)
    setSyncSettings(next)
  }

  async function handleSyncNow() {
    const pwd = await showPrompt({
      title: SETTINGS.passwordImporta,
      message: SETTINGS.passwordImporta,
      inputType: 'password',
      confirmLabel: 'OK',
    })
    if (!pwd) return

    setIsDriveSyncing(true)
    try {
      const pullResult = await pullDriveToLocal(pwd)
      if (pullResult !== 'ok' && pullResult !== 'no-cloud-data') {
        setDriveStatus(pullResult)
        return
      }

      const pushResult = await syncDriveNow(pwd)
      setDriveStatus(pushResult)
      setSyncSettings(loadSyncSettings())
    } finally {
      setIsDriveSyncing(false)
      setTimeout(() => setDriveStatus('idle'), 3500)
    }
  }

  function getDriveStatusLabel() {
    if (driveStatus === 'ok') return SETTINGS.driveStatoOk
    if (driveStatus === 'no-cloud-data') return SETTINGS.driveStatoNoData
    if (driveStatus === 'missing-client-id') return SETTINGS.driveStatoNoClient
    if (driveStatus === 'needs-password' || driveStatus === 'wrong-password') return SETTINGS.passwordErrata
    return SETTINGS.driveStatoAuth
  }

  function updateAutoBackup(patch: Partial<AutoBackupSettings>) {
    const updated = { ...autoBackup, ...patch }
    setAutoBackup(updated)
    saveAutoBackupSettings(updated)
  }

  async function handlePickFolder() {
    const name = await pickFolder()
    if (name) updateAutoBackup({ dest: 'folder', folderName: name })
  }

  return (
    <>
      {/* ─── Theme Section ─── */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h3
          className="text-xs font-semibold uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          {SETTINGS.tema}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setTheme('spazio')}
            className={`py-2.5 px-2 rounded-xl text-sm font-medium transition ${
              theme === 'spazio' ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: theme === 'spazio' ? 'var(--accent-light)' : 'var(--bg-secondary)',
              color: theme === 'spazio' ? 'var(--accent)' : 'var(--text-secondary)',
              '--tw-ring-color': 'var(--accent)',
            } as React.CSSProperties}
          >
            🌑 {SETTINGS.darkMode}
          </button>
          <button
            onClick={() => setTheme('nasa')}
            className={`py-2.5 px-2 rounded-xl text-sm font-medium transition ${
              theme === 'nasa' ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: theme === 'nasa' ? 'var(--accent-light)' : 'var(--bg-secondary)',
              color: theme === 'nasa' ? 'var(--accent)' : 'var(--text-secondary)',
              '--tw-ring-color': 'var(--accent)',
            } as React.CSSProperties}
          >
            ☀️ {SETTINGS.lightMode}
          </button>
          <button
            onClick={() => setTheme('mission')}
            className={`py-2.5 px-2 rounded-xl text-sm font-medium transition ${
              theme === 'mission' ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: theme === 'mission' ? 'var(--accent-light)' : 'var(--bg-secondary)',
              color: theme === 'mission' ? 'var(--accent)' : 'var(--text-secondary)',
              '--tw-ring-color': 'var(--accent)',
            } as React.CSSProperties}
          >
            🚀 Mission
          </button>
        </div>
      </div>

      {/* ─── Language Section ─── */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h3
          className="text-xs font-semibold uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          {SETTINGS.lingua}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {([
            { locale: 'it', flag: '🇮🇹', label: 'Italiano' },
            { locale: 'en', flag: '🇬🇧', label: 'English' },
            { locale: 'es', flag: '🇪🇸', label: 'Español' },
          ] as { locale: Locale; flag: string; label: string }[]).map(({ locale, flag, label }) => {
            const active = getLocale() === locale
            return (
              <button
                key={locale}
                onClick={() => { setLocale(locale); window.location.reload() }}
                className={`py-2 px-1 rounded-xl text-xs font-medium transition ${active ? 'ring-2' : ''}`}
                style={{
                  backgroundColor: active ? 'var(--accent-light)' : 'var(--bg-secondary)',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  '--tw-ring-color': 'var(--accent)',
                } as React.CSSProperties}
              >
                {flag} {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Notifications Section ─── */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h3
          className="text-xs font-semibold uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          {SETTINGS.notifiche}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {SETTINGS.promemoria}
          </span>
          <div
            onClick={toggleNotifications}
            className="w-11 h-6 rounded-full transition relative cursor-pointer"
            style={{
              backgroundColor: notifSettings.enabled ? 'var(--accent)' : 'var(--bg-secondary)',
              border: '1px solid var(--border)',
            }}
            role="switch"
            aria-checked={notifSettings.enabled}
          >
            <div
              className="w-4 h-4 rounded-full absolute top-0.5 transition-transform"
              style={{
                backgroundColor: '#fff',
                transform: notifSettings.enabled ? 'translateX(22px)' : 'translateX(3px)',
              }}
            />
          </div>
        </div>

        {notifSettings.enabled && (
          <div className="mt-3 space-y-2">
            <button
              onClick={() => {
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                  navigator.serviceWorker.ready.then((reg) => {
                    reg.showNotification('🚀 Hermes', {
                      body: NOTIFICHE.messaggioPromemoria,
                      icon: '/Hermes/pwa-192x192.svg',
                      badge: '/Hermes/pwa-192x192.svg',
                    })
                  })
                } else if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('🚀 Hermes', { body: NOTIFICHE.messaggioPromemoria })
                }
              }}
              className="w-full py-2 rounded-xl text-xs font-medium transition active:scale-95"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {SETTINGS.testNotifica}
            </button>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {SETTINGS.orarioPromemoria}
            </p>
            <div className="flex gap-2 flex-wrap">
              {['19:00', '21:30'].map((time) => (
                <button
                  key={time}
                  onClick={() => setNotifTime(time)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    notifSettings.time === time ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor:
                      notifSettings.time === time ? 'var(--accent-light)' : 'var(--bg-secondary)',
                    color:
                      notifSettings.time === time ? 'var(--accent)' : 'var(--text-secondary)',
                    '--tw-ring-color': 'var(--accent)',
                  } as React.CSSProperties}
                >
                  🕐 {time}
                </button>
              ))}
              <input
                type="time"
                value={notifSettings.time}
                onChange={(e) => setNotifTime(e.target.value)}
                className="px-2 py-1 rounded-lg text-xs focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-primary)',
                  '--tw-ring-color': 'var(--accent)',
                } as React.CSSProperties}
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── Sync Section ─── */}
      {FEATURES.exportImportJson && (
        <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3
            className="text-xs font-semibold uppercase tracking-wide mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            {SETTINGS.sincronizzazione}
          </h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={async () => {
                const pwd = await showPrompt({
                  title: SETTINGS.passwordEsporta,
                  message: SETTINGS.passwordEsporta,
                  inputType: 'password',
                  confirmLabel: SETTINGS.esportaDati,
                })
                if (!pwd) return
                await exportAllData(pwd)
              }}
              className="w-full py-2 rounded-xl text-sm font-medium transition active:scale-95"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
            >
              {SETTINGS.esportaDati}
            </button>
            <label
              className="w-full py-2 rounded-xl text-sm font-medium transition active:scale-95 text-center cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: importStatus === 'ok'
                  ? 'var(--accent)'
                  : importStatus === 'invalid' || importStatus === 'wrong-password'
                  ? '#ef4444'
                  : 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
            >
              {importStatus === 'ok'
                ? SETTINGS.importaOk
                : importStatus === 'invalid'
                ? SETTINGS.importaErrore
                : importStatus === 'wrong-password'
                ? SETTINGS.passwordErrata
                : SETTINGS.importaDati}
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            {FEATURES.codeTransfer && (
              <div
                className="rounded-xl p-3"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                  {SETTINGS.modalitaDati}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleUseLocalMode}
                    className={`py-2 rounded-lg text-xs font-medium transition ${syncSettings.mode === 'local' ? 'ring-2' : ''}`}
                    style={{
                      backgroundColor: syncSettings.mode === 'local' ? 'var(--accent-light)' : 'var(--bg-card)',
                      color: syncSettings.mode === 'local' ? 'var(--accent)' : 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                      '--tw-ring-color': 'var(--accent)',
                    } as React.CSSProperties}
                  >
                    {SETTINGS.soloLocale}
                  </button>

                  <button
                    onClick={handleUseDriveMode}
                    className={`py-2 rounded-lg text-xs font-medium transition ${syncSettings.mode === 'drive' ? 'ring-2' : ''}`}
                    style={{
                      backgroundColor: syncSettings.mode === 'drive' ? 'var(--accent-light)' : 'var(--bg-card)',
                      color: syncSettings.mode === 'drive' ? 'var(--accent)' : 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                      '--tw-ring-color': 'var(--accent)',
                    } as React.CSSProperties}
                  >
                    {SETTINGS.syncDrive}
                  </button>
                </div>

                {syncSettings.mode === 'drive' && (
                  <div className="mt-2 space-y-2">
                    {!syncSettings.driveConnected ? (
                      <button
                        onClick={handleConnectDrive}
                        disabled={isDriveSyncing}
                        className="w-full py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {SETTINGS.driveConnetti}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleSyncNow}
                          disabled={isDriveSyncing}
                          className="w-full py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                          style={{
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {SETTINGS.driveSyncOra}
                        </button>

                        <button
                          onClick={handleUseLocalMode}
                          className="w-full py-2 rounded-lg text-sm"
                          style={{
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {SETTINGS.driveDisconnetti}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {driveStatus !== 'idle' && (
                  <p
                    className="text-xs mt-2"
                    style={{
                      color: driveStatus === 'ok' || driveStatus === 'no-cloud-data' ? 'var(--accent)' : '#ef4444',
                    }}
                  >
                    {getDriveStatusLabel()}
                  </p>
                )}

                <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
                  {syncSettings.lastSyncedAt ? new Date(syncSettings.lastSyncedAt).toLocaleString() : '-'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Backup Section ─── */}
      <div className="p-4">
        <h3
          className="text-xs font-semibold uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          {AUTO_BACKUP.titolo}
        </h3>

        <div className="space-y-3">
          {/* Password cifratura */}
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              {AUTO_BACKUP.passwordLabel}
            </p>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-xl text-sm"
              style={{
                backgroundColor: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--text-primary)',
              }}
              placeholder={AUTO_BACKUP.passwordPlaceholder}
              value={autoBackup.password ?? ''}
              onChange={(e) => updateAutoBackup({ password: e.target.value || null })}
            />
          </div>

          {/* Destinazione */}
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              {AUTO_BACKUP.destinazione}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateAutoBackup({ dest: 'download' })}
                className={`py-2 rounded-xl text-xs font-medium transition ${autoBackup.dest === 'download' ? 'ring-2' : ''}`}
                style={{
                  backgroundColor: autoBackup.dest === 'download' ? 'var(--accent-light)' : 'var(--bg-secondary)',
                  color: autoBackup.dest === 'download' ? 'var(--accent)' : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  '--tw-ring-color': 'var(--accent)',
                } as React.CSSProperties}
              >
                📥 {AUTO_BACKUP.download}
              </button>
              <button
                onClick={() => {
                  if (!isFSASupported()) return
                  updateAutoBackup({ dest: 'folder' })
                }}
                disabled={!isFSASupported()}
                className={`py-2 rounded-xl text-xs font-medium transition disabled:opacity-40 ${autoBackup.dest === 'folder' ? 'ring-2' : ''}`}
                style={{
                  backgroundColor: autoBackup.dest === 'folder' ? 'var(--accent-light)' : 'var(--bg-secondary)',
                  color: autoBackup.dest === 'folder' ? 'var(--accent)' : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  '--tw-ring-color': 'var(--accent)',
                } as React.CSSProperties}
              >
                📁 {AUTO_BACKUP.cartella}
              </button>
            </div>
            {!isFSASupported() && (
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                {AUTO_BACKUP.nonSupportato}
              </p>
            )}
          </div>

          {/* Scegli cartella */}
          {autoBackup.dest === 'folder' && isFSASupported() && (
            <button
              onClick={handlePickFolder}
              className="w-full py-2 rounded-xl text-sm font-medium transition active:scale-95"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
            >
              {autoBackup.folderName
                ? AUTO_BACKUP.cartellaScelta(autoBackup.folderName)
                : AUTO_BACKUP.sceglicartella}
            </button>
          )}

          {/* Ultimo backup */}
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {AUTO_BACKUP.ultimoBackup}{' '}
            {autoBackup.lastBackup
              ? new Date(autoBackup.lastBackup).toLocaleString()
              : AUTO_BACKUP.mai}
          </p>

          {/* Backup ora */}
          <button
            onClick={async () => {
              await triggerDownloadBackup(autoBackup.password ?? null)
              updateAutoBackup({ lastBackup: new Date().toISOString() })
            }}
            className="w-full py-2 rounded-xl text-sm font-medium transition active:scale-95"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
          >
            {AUTO_BACKUP.backupOra}
          </button>

          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {AUTO_BACKUP.nota}
          </p>
        </div>
      </div>

    </>
  )
}

export default Settings
