import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../shared/ThemeContext'
import { loadNotificationSettings, saveNotificationSettings, exportAllData, importAllData } from '../shared/storage'
import { SETTINGS, NOTIFICHE, getLocale, setLocale, type Locale } from '../shared/labels'
import { FEATURES } from '../app/features'

function Settings() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const panelRef = useRef<HTMLDivElement>(null)
  const [notifSettings, setNotifSettings] = useState(loadNotificationSettings)
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'invalid' | 'wrong-password'>('idle')

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

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
    if (!window.confirm(SETTINGS.importaConferma)) {
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const content = ev.target?.result as string
      // First try without password to detect format
      const probe = await importAllData(content)
      if (probe === 'needs-password') {
        const pwd = window.prompt(SETTINGS.passwordImporta)
        if (!pwd) return
        const result = await importAllData(content, pwd)
        setImportStatus(result === 'needs-password' ? 'invalid' : result)
      } else {
        setImportStatus(probe)
      }
      setTimeout(() => setImportStatus('idle'), 3000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
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
          {/* ─── Theme Section ─── */}
          <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3
              className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              {SETTINGS.tema}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme('spazio')}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium transition ${
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
                className={`py-2.5 px-3 rounded-xl text-sm font-medium transition ${
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
                    const pwd = window.prompt(SETTINGS.passwordEsporta)
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
              </div>
            </div>
          )}

          {/* ─── Categories Section ─── */}
          <div className="p-4">
            <Link
              to="/categories"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-sm font-medium no-underline transition hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              🏷️ {SETTINGS.gestioneCategorie}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
