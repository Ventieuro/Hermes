import { useEffect } from 'react'
import { loadNotificationSettings } from './storage'
import { NOTIFICHE } from './labels'

const LAST_NOTIF_KEY = 'hermes-last-notification'

function showNotification(body: string) {
  // Try SW notification first (works even when tab is in background on mobile)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification('🚀 Hermes', {
        body,
        icon: '/Hermes/pwa-192x192.svg',
        badge: '/Hermes/pwa-192x192.svg',
      })
    })
  } else if ('Notification' in window) {
    new Notification('🚀 Hermes', { body })
  }
}

function alreadySentToday(): boolean {
  try {
    return localStorage.getItem(LAST_NOTIF_KEY) === new Date().toISOString().slice(0, 10)
  } catch { return true }
}

function markSentToday() {
  try { localStorage.setItem(LAST_NOTIF_KEY, new Date().toISOString().slice(0, 10)) } catch { /* noop */ }
}

function tryNotify(): boolean {
  const settings = loadNotificationSettings()
  if (!settings.enabled) return false
  if (!('Notification' in window) || Notification.permission !== 'granted') return false
  if (alreadySentToday()) return false

  const now = new Date()
  const [h, m] = settings.time.split(':').map(Number)
  const targetMinutes = h * 60 + m
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  // Fire if we're at or past the target time (catch-up for missed notifications)
  if (nowMinutes >= targetMinutes) {
    markSentToday()
    showNotification(NOTIFICHE.messaggioPromemoria)
    return true
  }
  return false
}

function msUntilTarget(time: string): number {
  const [h, m] = time.split(':').map(Number)
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0)
  if (target.getTime() <= now.getTime()) {
    // Already passed today, schedule for tomorrow
    target.setDate(target.getDate() + 1)
  }
  return target.getTime() - now.getTime()
}

export function useNotificationScheduler() {
  useEffect(() => {
    // 1. Catch-up: if app opens after the scheduled time, fire immediately
    tryNotify()

    // 2. Precise timer: schedule a setTimeout for the exact target time
    const settings = loadNotificationSettings()
    if (!settings.enabled) return

    const delay = msUntilTarget(settings.time)
    const timer = window.setTimeout(() => {
      tryNotify()
    }, delay)

    // 3. Fallback: also keep a slow interval in case the tab stays open overnight
    const interval = window.setInterval(() => {
      tryNotify()
    }, 60_000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])
}
