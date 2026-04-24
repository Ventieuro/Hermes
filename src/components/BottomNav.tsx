import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Settings from './Settings'
import Modal from './ui/Modal'
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
      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.7 1.7 0 1 1-2.4 2.4l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.7 1.7 0 1 1-3.4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H6a1.7 1.7 0 1 1 0-3.4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.7 1.7 0 1 1 2.4-2.4l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1.7 1.7 0 1 1 3.4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a1.7 1.7 0 1 1 0 3.4h-.2a1 1 0 0 0-.9.6z" />
    </svg>
  )
}

function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingTop: '8px',
          paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
          background: 'color-mix(in srgb, var(--nav-bg) 97%, transparent)',
          borderTop: '1px solid var(--border)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          color: 'var(--nav-text)',
        }}
        aria-label="Navigazione principale"
      >
        {/* Home */}
        <Link
          to="/"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            padding: '4px 20px', borderRadius: '12px', textDecoration: 'none',
            color: isActive('/') ? 'var(--accent)' : 'var(--nav-text)',
            backgroundColor: isActive('/') ? 'color-mix(in srgb, var(--accent-light) 60%, transparent)' : 'transparent',
            transition: 'color 0.2s',
          }}
          title={LAYOUT.navHome}
        >
          <HomeIcon />
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em' }}>{LAYOUT.navHome}</span>
        </Link>

        {/* Categorie */}
        <Link
          to="/categories"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            padding: '4px 20px', borderRadius: '12px', textDecoration: 'none',
            color: isActive('/categories') ? 'var(--accent)' : 'var(--nav-text)',
            backgroundColor: isActive('/categories') ? 'color-mix(in srgb, var(--accent-light) 60%, transparent)' : 'transparent',
            transition: 'color 0.2s',
          }}
          title={LAYOUT.navCategories}
        >
          <FolderIcon />
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em' }}>{LAYOUT.navCategories}</span>
        </Link>

        {/* + centrale — sollevato di 8px sopra la barra */}
        <button
          onClick={handleAddClick}
          style={{
            width: '52px', height: '52px', borderRadius: '50%', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', lineHeight: 1, fontWeight: 300,
            background: 'var(--fab-bg)', color: 'var(--fab-text)',
            boxShadow: '0 4px 16px color-mix(in srgb, var(--fab-bg) 60%, transparent)',
            transform: 'translateY(-8px)',
            transition: 'transform 0.12s, opacity 0.12s',
            flexShrink: 0,
          }}
          onPointerDown={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(0.91)' }}
          onPointerUp={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1)' }}
          onPointerLeave={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1)' }}
          aria-label={DASHBOARD.aggiungiMovimento}
          title={LAYOUT.navAdd}
        >
          +
        </button>

        {/* Impostazioni */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            padding: '4px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            background: isSettingsOpen ? 'color-mix(in srgb, var(--accent-light) 60%, transparent)' : 'transparent',
            color: isSettingsOpen ? 'var(--accent)' : 'var(--nav-text)',
            transition: 'color 0.2s',
          }}
          title={LAYOUT.navSettings}
        >
          <SettingsIcon />
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em' }}>{LAYOUT.navSettings}</span>
        </button>
      </nav>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <Modal onClose={() => setIsSettingsOpen(false)} position="bottom">
          <div
            className="w-full sm:w-72 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <Settings onClose={() => setIsSettingsOpen(false)} />
          </div>
        </Modal>
      )}
    </>
  )
}

export default BottomNav
