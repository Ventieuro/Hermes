import { useState } from 'react'
import { CHANGELOG, CURRENT_VERSION } from '../shared/changelog'
import { getLocale } from '../shared/labels'

const SEEN_VERSION_KEY = 'hermes-seen-version'

function getUnseenChanges() {
  try {
    const seen = localStorage.getItem(SEEN_VERSION_KEY)
    if (seen === CURRENT_VERSION) return null
  } catch { /* first visit */ }
  return CHANGELOG[0]
}

function WhatsNew() {
  const [entry] = useState(getUnseenChanges)
  const [visible, setVisible] = useState(!!entry)

  if (!visible || !entry) return null

  const locale = getLocale()
  const changes = entry.changes[locale]

  function dismiss() {
    try { localStorage.setItem(SEEN_VERSION_KEY, CURRENT_VERSION) } catch { /* noop */ }
    setVisible(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="p-5 text-center" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-4xl mb-2">🚀</p>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {locale === 'en' ? "What's New" : locale === 'es' ? 'Novedades' : 'Novità'}
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            v{entry.version} · {entry.date}
          </p>
        </div>

        {/* Changes list */}
        <div className="p-5 space-y-2 max-h-60 overflow-y-auto">
          {changes.map((change, i) => (
            <p key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {change}
            </p>
          ))}
        </div>

        {/* Dismiss */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={dismiss}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition active:scale-[0.98]"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {locale === 'en' ? 'Got it!' : locale === 'es' ? '¡Entendido!' : 'Ho capito!'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default WhatsNew
