import { Outlet, Link } from 'react-router-dom'
import ThemeSwitcher from './ThemeSwitcher'
import { LAYOUT } from '../shared/labels'

function Layout() {
  return (
    <div className="flex flex-col min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header
        className="px-4 py-3 md:px-8 flex items-center gap-4 md:gap-8 transition-colors duration-300"
        style={{ backgroundColor: 'var(--nav-bg)', borderBottom: '1px solid var(--border)', color: 'var(--nav-text)' }}
      >
        <Link to="/" className="text-lg md:text-xl font-bold no-underline" style={{ color: 'var(--nav-text)' }}>
          {LAYOUT.appName}
        </Link>
        <div className="flex-1" />
        <ThemeSwitcher />
      </header>

      <main className="flex-1 px-4 py-6 md:px-8">
        <div className="max-w-5xl w-full mx-auto">
          <Outlet />
        </div>
      </main>

      <footer className="px-4 py-3 md:px-8 text-center text-sm transition-colors duration-300" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        {LAYOUT.footerText} &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}

export default Layout
