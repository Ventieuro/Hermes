interface SectionHeaderProps {
  children: string
  className?: string
}

function SectionHeader({ children, className = '' }: SectionHeaderProps) {
  return (
    <h3
      className={`text-xs font-semibold uppercase tracking-wide mb-2 ${className}`}
      style={{ color: 'var(--text-muted)' }}
    >
      {children}
    </h3>
  )
}

export default SectionHeader
