import { useTheme } from '../shared/ThemeContext'
import type { Theme } from '../shared/ThemeContext'

const THEMES: { id: Theme; label: string; icon: string; color: string; ring: string }[] = [
  { id: 'giungla', label: 'Giungla', icon: '🌴', color: '#228B22', ring: '#50C878' },
  { id: 'spazio',  label: 'Spazio',  icon: '🚀', color: '#0b0d17', ring: '#7c4dff' },
]

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-2">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          title={t.label}
          className={`h-9 px-3 rounded-full flex items-center gap-1.5 text-sm font-medium transition-all active:scale-95 ${
            theme === t.id ? 'scale-105 shadow-md' : 'opacity-60 hover:opacity-100'
          }`}
          style={{
            backgroundColor: t.color,
            color: '#fff',
            border: theme === t.id ? `2px solid ${t.ring}` : '2px solid transparent',
            boxShadow: theme === t.id ? `0 0 8px ${t.ring}50` : undefined,
          }}
        >
          <span>{t.icon}</span>
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  )
}

export default ThemeSwitcher
