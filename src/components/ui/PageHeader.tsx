import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  fallbackPath?: string
  right?: React.ReactNode
}

function PageHeader({ title, fallbackPath = '/', right }: PageHeaderProps) {
  const navigate = useNavigate()

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallbackPath)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '16px 16px 0',
      }}
    >
      <button
        onClick={handleBack}
        aria-label="Indietro"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--accent)',
          fontSize: '15px',
          fontWeight: 600,
          padding: '4px 0',
          flexShrink: 0,
        }}
      >
        ‹ Indietro
      </button>

      <h1
        style={{
          flex: 1,
          margin: 0,
          fontSize: '17px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </h1>

      {/* Slot destro — mantiene il centro del titolo bilanciato */}
      <div style={{ flexShrink: 0, minWidth: right ? undefined : '60px' }}>
        {right}
      </div>
    </div>
  )
}

export default PageHeader
