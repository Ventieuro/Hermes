import { useState, useEffect } from 'react'
import { PWA } from '../shared/labels'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'astrocoin-pwa-dismissed'

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone)
}

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [iosMode, setIosMode] = useState(false)

  useEffect(() => {
    // Already installed as PWA
    if (isInStandaloneMode()) return

    // Don't show if already dismissed recently
    try {
      const dismissed = localStorage.getItem(DISMISSED_KEY)
      if (dismissed) {
        const dismissedDate = new Date(dismissed)
        const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSince < 7) return
      }
    } catch { /* noop */ }

    // iOS: show instructions banner
    if (isIos()) {
      setIosMode(true)
      setVisible(true)
      return
    }

    // Android/desktop: wait for beforeinstallprompt
    function handleBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
  }

  function handleDismiss() {
    try { localStorage.setItem(DISMISSED_KEY, new Date().toISOString()) } catch { /* noop */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 rounded-2xl shadow-2xl p-4 z-50 flex items-start gap-3"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      <span className="text-3xl shrink-0">🚀</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          {PWA.installTitle}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {iosMode ? PWA.iosMessage : PWA.installMessage}
        </p>
        <div className="flex gap-2 mt-3">
          {!iosMode && (
            <button
              onClick={handleInstall}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white transition active:scale-95"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {PWA.installButton}
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-xl text-xs transition"
            style={{ color: 'var(--text-muted)' }}
          >
            {PWA.chiudi}
          </button>
        </div>
      </div>
    </div>
  )
}

export default InstallPrompt
