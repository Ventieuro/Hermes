import type { ReactNode, CSSProperties } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: Variant
  selected?: boolean
  disabled?: boolean
  fullWidth?: boolean
  className?: string
  style?: CSSProperties
}

function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  selected = false,
  disabled = false,
  fullWidth = false,
  className = '',
  style,
}: ButtonProps) {
  const base = `rounded-xl font-bold text-sm transition active:scale-[0.98] ${fullWidth ? 'w-full' : ''}`

  const variants: Record<Variant, { className: string; style: CSSProperties }> = {
    primary: {
      className: `${base} py-3 px-6 text-white ${disabled ? 'cursor-not-allowed opacity-40' : ''}`,
      style: disabled
        ? { backgroundColor: 'var(--text-muted)' }
        : { backgroundColor: 'var(--accent)' },
    },
    secondary: {
      className: `${base} py-2.5 px-3 ${selected ? 'ring-2' : ''}`,
      style: selected
        ? { backgroundColor: 'var(--accent-light)', color: 'var(--accent)', '--tw-ring-color': 'var(--accent)' } as CSSProperties
        : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' },
    },
    danger: {
      className: `${base} py-3 px-6 text-white bg-red-500 hover:bg-red-600`,
      style: {},
    },
    ghost: {
      className: `${base} py-2 px-3`,
      style: { color: 'var(--text-muted)' },
    },
  }

  const v = variants[variant]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${v.className} ${className}`}
      style={{ ...v.style, ...style }}
    >
      {children}
    </button>
  )
}

export default Button
