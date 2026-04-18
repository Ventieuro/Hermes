interface MascotProps {
  mood: 'happy' | 'sad' | 'neutral' | 'excited'
  message: string
  size?: 'sm' | 'md' | 'lg'
}

const EMOJIS: Record<MascotProps['mood'], string> = {
  happy: '🐵',
  sad: '🙈',
  neutral: '🐒',
  excited: '🤑',
}

const SIZES: Record<NonNullable<MascotProps['size']>, string> = {
  sm: 'text-3xl',
  md: 'text-5xl',
  lg: 'text-7xl',
}

function Mascot({ mood, message, size = 'md' }: MascotProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className={SIZES[size]} role="img" aria-label="mascotte">
        {EMOJIS[mood]}
      </span>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl rounded-bl-none px-4 py-2 text-sm text-amber-900 max-w-xs">
        {message}
      </div>
    </div>
  )
}

export default Mascot
