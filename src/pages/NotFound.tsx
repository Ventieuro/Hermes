import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold">404</h1>
      <p className="mt-2 text-gray-500">Pagina non trovata.</p>
      <Link to="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
        Torna alla Home
      </Link>
    </div>
  )
}

export default NotFound
