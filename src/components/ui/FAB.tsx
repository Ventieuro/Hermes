import type { ReactNode, CSSProperties } from 'react'

interface FABProps {
  children: ReactNode
  onClick: () => void
  ariaLabel?: string
  style?: CSSProperties
}

function FAB({ children, onClick, ariaLabel, style }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg active:scale-95 transition flex items-center justify-center text-2xl z-40"
      style={{ backgroundColor: 'var(--fab-bg)', color: 'var(--fab-text)', ...style }}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}

export default FAB
