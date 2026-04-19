import { TEMI } from '../shared/labels'

function ThemeSwitcher() {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-9 px-3 rounded-full flex items-center gap-1.5 text-sm font-medium scale-105 shadow-md"
        style={{
          backgroundColor: '#0b0d17',
          color: '#fff',
          border: '2px solid #7c4dff',
          boxShadow: '0 0 8px #7c4dff50',
        }}
      >
        <span>🚀</span>
        <span className="hidden sm:inline">{TEMI.spazio}</span>
      </span>
    </div>
  )
}

export default ThemeSwitcher
