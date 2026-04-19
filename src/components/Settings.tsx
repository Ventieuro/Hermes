import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../shared/ThemeContext'
import { loadNotificationSettings, saveNotificationSettings } from '../shared/storage'
import { SETTINGS } from '../shared/labels'

function Settings() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const panelRef = useRef<HTMLDivElement>(null)
  const [notifSettings, setNotifSettings] = useState(loadNotificationSettings)

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
