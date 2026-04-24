import { useEffect, useRef, type ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PopupProps {
  /** Se true il popup è visibile */
  open: boolean
  /** Titolo (opzionale) */
  title?: string
  /** Testo principale */
  message?: string
  /** Contenuto custom al posto di message */
  children?: ReactNode
  /** Label pulsante di conferma */
  confirmLabel?: string
  /** Label pulsante di annullamento — se omesso il pulsante non appare */
  cancelLabel?: string
  /** Se true, il pulsante conferma è rosso (azione distruttiva) */
  danger?: boolean
  /** Callback conferma */
  onConfirm: () => void
  /** Callback annullamento / chiusura */
  onCancel: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Popup({
  open,
  title,
  message,
  children,
  confirmLabel = 'OK',
  cancelLabel,
  danger = false,
  onConfirm,
  onCancel,
}: PopupProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Focus trap: focus sulla card appena aperta
  useEffect(() => {
    if (open) cardRef.current?.focus()
  }, [open])

  // Blocca lo scroll del body mentre il popup è aperto
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Chiudi con Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'popup-title' : undefined}
      // Overlay
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'popup-fade-in 0.15s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      {/* Card */}
      <div
        ref={cardRef}
        tabIndex={-1}
        style={{
          width: '100%',
          maxWidth: '340px',
          borderRadius: '22px',
          overflow: 'hidden',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          outline: 'none',
          animation: 'popup-scale-in 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Body */}
        <div style={{ padding: '24px 22px 20px' }}>
          {title && (
            <p
              id="popup-title"
              style={{
                margin: '0 0 8px',
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.3,
              }}
            >
              {title}
            </p>
          )}

          {message && (
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
              }}
            >
              {message}
            </p>
          )}

          {children}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border)' }} />

        {/* Buttons */}
        <div style={{ display: 'flex' }}>
          {cancelLabel && (
            <>
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: '15px 10px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onPointerEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                onPointerLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {cancelLabel}
              </button>
              {/* Divider verticale */}
              <div style={{ width: '1px', background: 'var(--border)' }} />
            </>
          )}

          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '15px 10px',
              border: 'none',
              background: 'transparent',
              color: danger ? '#e74c3c' : 'var(--accent)',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.12s',
            }}
            onPointerEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
            onPointerLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      {/* Animazioni keyframe inline (iniettate una volta sola) */}
      <style>{`
        @keyframes popup-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes popup-scale-in {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

export default Popup
