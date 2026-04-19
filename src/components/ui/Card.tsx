import type { ReactNode, CSSProperties } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  padding?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const PADDING = { sm: 'p-2', md: 'p-4', lg: 'p-6' }

function Card({ children, className = '', style, padding = 'md', onClick }: CardProps) {
  return (
    <div
      className={`rounded-2xl transition-colors duration-300 ${PADDING[padding]} ${className}`}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Card
