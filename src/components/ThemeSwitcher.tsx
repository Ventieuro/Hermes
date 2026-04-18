import { useTheme } from '../shared/ThemeContext'
import type { Theme } from '../shared/ThemeContext'

const THEMES: { id: Theme; label: string; icon: string; preview: string }[] = [
  { id: 'light', label: 'Chiaro', icon: '☀️', preview: 'bg-white border-gray-300' },
  { id: 'dark', label: 'Scuro', icon: '🌙', preview: 'bg-gray-800 border-gray-600' },
  { id: 'green', label: 'Verde', icon: '🌿', preview: 'bg-green-500 border-green-600' },
  { id: 'blue', label: 'Blu', icon: '🌊', preview: 'bg-blue-500 border-blue-600' },
]

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1.5">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          title={t.label}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-all active:scale-90 ${t.preview} ${
            theme === t.id ? 'ring-2 ring-offset-1 ring-[var(--accent)] scale-110' : 'opacity-70 hover:opacity-100'
          }`}
        >
          {t.icon}
        </button>
      ))}
    </div>
  )
}

export default ThemeSwitcher
