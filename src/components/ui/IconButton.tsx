import type { ReactNode, CSSProperties } from 'react'

type Size = 'sm' | 'md' | 'lg'

interface IconButtonProps {
  children: ReactNode
  onClick?: () => void
  size?: Size
  shape?: 'circle' | 'square'
  ariaLabel?: string
  className?: string
  style?: CSSProperties
}

const SIZES: Record<Size, string> = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-10 h-10 text-base',
}

function IconButton({
  children,
  onClick,
  size = 'md',
  shape = 'circle',
  ariaLabel,
  className = '',
  style,
}: IconButtonProps) {
  const radius = shape === 'circle' ? 'rounded-full' : 'rounded-xl'

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center ${radius} transition active:scale-95 ${SIZES[size]} ${className}`}
      style={{ color: 'var(--text-muted)', ...style }}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}

export default IconButton
