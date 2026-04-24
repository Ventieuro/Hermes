import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LAYOUT, DASHBOARD } from '../shared/labels'

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.7V21h13V9.7" />
      <path d="M10 21v-6h4v6" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="3" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="3" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="3" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => location.pathname === path

  function handleAddClick() {
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => window.dispatchEvent(new Event('hermes:add-transaction')), 120)
      return
    }
    window.dispatchEvent(new Event('hermes:add-transaction'))
  }

  return (
    <>
      {/* ─── Bottom tab bar: always fixed, inline styles only (no Tailwind conflicts) ─── */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'color-mix(in srgb, var(--nav-bg) 97%, transparent)',
          borderTop: '1px solid var(--border)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          color: 'var(--nav-text)',
          /* overflow: visible so the + can poke above the border */
        }}
        aria-label="Navigazione principale"
      >
        {/* Wrapper: 5 equal flex slots — 4 nav items + 1 spacer centrale */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', paddingTop: '10px', paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}>

          {/* Home */}
          <Link
            to="/"
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              padding: '4px 0', textDecoration: 'none',
              color: isActive('/') ? 'var(--accent)' : 'var(--nav-text)',
              transition: 'color 0.2s',
            }}
            title={LAYOUT.navHome}
          >
            <div style={{ width: '44px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: isActive('/') ? 'color-mix(in srgb, var(--accent-light) 60%, transparent)' : 'transparent' }}>
              <HomeIcon />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em' }}>{LAYOUT.navHome}</span>
          </Link>

          {/* Movimenti */}
          <Link
            to="/movimenti"
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              padding: '4px 0', textDecoration: 'none',
              color: isActive('/movimenti') ? 'var(--accent)' : 'var(--nav-text)',
              transition: 'color 0.2s',
            }}
            title={LAYOUT.navMovimenti}
          >
            <div style={{ width: '44px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: isActive('/movimenti') ? 'color-mix(in srgb, var(--accent-light) 60%, transparent)' : 'transparent' }}>
              <ListIcon />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em' }}>{LAYOUT.navMovimenti}</span>
          </Link>

          {/* Spacer for + button slot */}
          <div style={{ flex: 1, flexShrink: 0 }} aria-hidden="true" />

          {/* Categorie */}
          <Link
            to="/categories"
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              padding: '4px 0', textDecoration: 'none',
              color: isActive('/categories') ? 'var(--accent)' : 'var(--nav-text)',
              transition: 'color 0.2s',
            }}
            title={LAYOUT.navCategories}
          >
            <div style={{ width: '44px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: isActive('/categories') ? 'color-mix(in srgb, var(--accent-light) 60%, transparent)' : 'transparent' }}>
              <FolderIcon />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em' }}>{LAYOUT.navCategories}</span>
          </Link>

          {/* Impostazioni */}
          <Link
            to="/settings"
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              padding: '4px 0', textDecoration: 'none',
              color: isActive('/settings') ? 'var(--accent)' : 'var(--nav-text)',
              transition: 'color 0.2s',
            }}
            title={LAYOUT.navSettings}
          >
            <div style={{ width: '44px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundColor: isActive('/settings') ? 'color-mix(in srgb, var(--accent-light) 60%, transparent)' : 'transparent' }}>
              <SettingsIcon />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em' }}>{LAYOUT.navSettings}</span>
          </Link>

          {/* + centrale: absolute, centred, pokes 22px above the bar top edge */}
          <button
            onClick={handleAddClick}
            style={{
              position: 'absolute',
              top: '-22px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: '3px solid color-mix(in srgb, var(--bg-primary) 100%, transparent)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '30px', lineHeight: 1, fontWeight: 300,
              background: 'var(--fab-bg)',
              color: 'var(--fab-text)',
              boxShadow: '0 4px 20px color-mix(in srgb, var(--fab-bg) 55%, transparent)',
              transition: 'transform 0.12s, box-shadow 0.12s',
              zIndex: 10,
            }}
            onPointerDown={e => { e.currentTarget.style.transform = 'translateX(-50%) scale(0.90)' }}
            onPointerUp={e => { e.currentTarget.style.transform = 'translateX(-50%) scale(1)' }}
            onPointerLeave={e => { e.currentTarget.style.transform = 'translateX(-50%) scale(1)' }}
            aria-label={DASHBOARD.aggiungiMovimento}
            title={LAYOUT.navAdd}
          >
            +
          </button>
        </div>
      </nav>
    </>
  )
}

export default BottomNav
