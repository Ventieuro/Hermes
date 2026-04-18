import { Link } from 'react-router-dom'
import { NOT_FOUND } from '../shared/labels'

function NotFound() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold">404</h1>
      <p className="mt-2" style={{ color: 'var(--text-muted)' }}>{NOT_FOUND.messaggio}</p>
      <Link to="/" className="mt-4 inline-block font-medium" style={{ color: 'var(--accent)' }}>
        {NOT_FOUND.tornaHome}
      </Link>
    </div>
  )
}

export default NotFound
