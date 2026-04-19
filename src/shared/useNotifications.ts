import { useEffect } from 'react'
import { loadNotificationSettings } from './storage'
import { NOTIFICHE } from './labels'

const LAST_NOTIF_KEY = 'astrocoin-last-notification'

function showNotification(body: string) {
  // Try SW notification first (works even when tab is in background on mobile)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification('🚀 AstroCoin', {
        body,
        icon: '/AstroCoin/pwa-192x192.svg',
        badge: '/AstroCoin/pwa-192x192.svg',
      })
    })
  } else {
    new Notification('🚀 AstroCoin', { body })
  }
}

export function useNotificationScheduler() {
  useEffect(() => {
    const interval = window.setInterval(() => {
      const settings = loadNotificationSettings()
      if (!settings.enabled) return
      if (!('Notification' in window)) return
      if (Notification.permission !== 'granted') return

      const now = new Date()
      const [h, m] = settings.time.split(':').map(Number)

      if (now.getHours() === h && now.getMinutes() === m) {
        const today = now.toISOString().slice(0, 10)
        try {
          const last = localStorage.getItem(LAST_NOTIF_KEY)
          if (last === today) return
          localStorage.setItem(LAST_NOTIF_KEY, today)
        } catch { return }

        showNotification(NOTIFICHE.messaggioPromemoria)
      }
    }, 30_000)

    return () => clearInterval(interval)
  }, [])
}
