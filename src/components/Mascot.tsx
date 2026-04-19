import { MASCOTTE as MASCOTTE_LABELS } from '../shared/labels'

interface MascotProps {
  mood: 'happy' | 'sad' | 'neutral' | 'excited'
  message: string
  size?: 'sm' | 'md' | 'lg'
}

const EMOJIS: Record<MascotProps['mood'], string> = {
  happy: '🧑‍🚀',
  sad: '😵‍💫',
  neutral: '🛸',
  excited: '🚀',
}

const SIZES: Record<NonNullable<MascotProps['size']>, string> = {
  sm: 'text-3xl',
  md: 'text-5xl',
  lg: 'text-7xl',
}

function Mascot({ mood, message, size = 'md' }: MascotProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className={SIZES[size]} role="img" aria-label={MASCOTTE_LABELS.ariaLabel}>
        {EMOJIS[mood]}
      </span>
      <div
        className="rounded-2xl rounded-bl-none px-4 py-2 text-sm max-w-xs"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        {message}
      </div>
    </div>
  )
}

export default Mascot
