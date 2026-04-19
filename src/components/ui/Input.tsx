import type { CSSProperties } from 'react'

interface InputProps {
  type?: 'text' | 'number' | 'date' | 'password' | 'time'
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  step?: string
  min?: string | number
  max?: string | number
  className?: string
  style?: CSSProperties
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-2xl font-bold text-center',
}

function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  step,
  min,
  max,
  className = '',
  style,
  size = 'md',
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      step={step}
      min={min}
      max={max}
      className={`w-full rounded-xl focus:outline-none focus:ring-2 ${SIZES[size]} ${className}`}
      style={{
        backgroundColor: 'var(--input-bg)',
        border: '1px solid var(--input-border)',
        color: 'var(--text-primary)',
        '--tw-ring-color': 'var(--accent)',
        ...style,
      } as CSSProperties}
    />
  )
}

export default Input
