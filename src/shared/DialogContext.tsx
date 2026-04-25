import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { Popup } from '../components/ui/Popup'

// ─── Types ───────────────────────────────────────────────

type DialogVariant = 'confirm' | 'prompt' | 'info'

interface DialogConfig {
  variant: DialogVariant
  title?: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  inputType?: string
  inputPlaceholder?: string
}

interface DialogContextValue {
  showConfirm: (opts: { title?: string; message: string; confirmLabel?: string; cancelLabel?: string }) => Promise<boolean>
  showPrompt: (opts: { title?: string; message: string; placeholder?: string; inputType?: string; confirmLabel?: string; cancelLabel?: string }) => Promise<string | null>
  showInfo: (opts: { title?: string; message: string }) => Promise<void>
}

// ─── Context ─────────────────────────────────────────────

const DialogContext = createContext<DialogContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────

export function DialogProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<DialogConfig | null>(null)
  const [inputValue, setInputValue] = useState('')
  const resolveRef = useRef<((value: boolean | string | null) => void) | null>(null)

  // Apre il dialog e restituisce una Promise
  const open = useCallback((cfg: DialogConfig) => {
    return new Promise<boolean | string | null>((resolve) => {
      resolveRef.current = resolve
      setInputValue('')
      setConfig(cfg)
    })
  }, [])

  function settle(value: boolean | string | null) {
    resolveRef.current?.(value)
    resolveRef.current = null
    setConfig(null)
  }

  // ── API pubblica ──────────────────────────────────────

  const showConfirm: DialogContextValue['showConfirm'] = useCallback(
    ({ title, message, confirmLabel = 'Conferma', cancelLabel = 'Annulla' }) =>
      open({ variant: 'confirm', title, message, confirmLabel, cancelLabel }) as Promise<boolean>,
    [open]
  )

  const showPrompt: DialogContextValue['showPrompt'] = useCallback(
    ({ title, message, placeholder, inputType = 'password', confirmLabel = 'OK', cancelLabel = 'Annulla' }) =>
      open({ variant: 'prompt', title, message, confirmLabel, cancelLabel, inputType, inputPlaceholder: placeholder }) as Promise<string | null>,
    [open]
  )

  const showInfo: DialogContextValue['showInfo'] = useCallback(
    ({ title, message }) =>
      (open({ variant: 'info', title, message, confirmLabel: 'OK' }) as unknown) as Promise<void>,
    [open]
  )

  // ── Handlers ─────────────────────────────────────────

  function handleConfirm() {
    if (!config) return
    settle(config.variant === 'prompt' ? (inputValue.trim() || null) : true)
  }

  function handleCancel() {
    if (!config) return
    settle(config.variant === 'confirm' ? false : null)
  }

  // ── Render ───────────────────────────────────────────

  return (
    <DialogContext.Provider value={{ showConfirm, showPrompt, showInfo }}>
      {children}

      <Popup
        open={config !== null}
        title={config?.title}
        message={config?.variant !== 'prompt' ? config?.message : undefined}
        confirmLabel={config?.confirmLabel ?? 'OK'}
        cancelLabel={config?.cancelLabel}
        danger={config?.variant === 'confirm'}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      >
        {/* Campo input per prompt */}
        {config?.variant === 'prompt' && (
          <>
            <p style={{ margin: '0 0 12px', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              {config.message}
            </p>
            <input
              autoFocus
              type={config.inputType ?? 'password'}
              placeholder={config.inputPlaceholder ?? ''}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm()
                if (e.key === 'Escape') handleCancel()
              }}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid var(--input-border)',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '15px',
                outline: 'none',
              }}
            />
          </>
        )}
      </Popup>
    </DialogContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function useDialog() {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('useDialog must be used inside DialogProvider')
  return ctx
}
