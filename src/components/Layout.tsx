import { Outlet, Link } from 'react-router-dom'
import BottomNav from './BottomNav'
import { LAYOUT } from '../shared/labels'
import { useAmounts } from '../shared/AmountsContext'

function Layout() {
  const { amountsVisible, toggleAmounts } = useAmounts()

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
        <button
          onClick={toggleAmounts}
          className="w-9 h-9 flex items-center justify-center rounded-full transition hover:opacity-80 active:scale-90"
          style={{ color: 'var(--nav-text)', background: 'none', border: 'none', cursor: 'pointer' }}
          aria-label={amountsVisible ? LAYOUT.nascondiImporti : LAYOUT.mostraImporti}
          title={amountsVisible ? LAYOUT.nascondiImporti : LAYOUT.mostraImporti}
        >
          {amountsVisible ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
              <line x1="2" y1="2" x2="22" y2="22"/>
            </svg>
          )}
        </button>
      </header>

      <main className="flex-1 px-4 py-6 md:px-8 pb-28 md:pb-28">
        <div className="max-w-5xl w-full mx-auto">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default Layout
