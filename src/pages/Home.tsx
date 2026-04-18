import { Link } from 'react-router-dom'
import { HOME } from '../shared/labels'

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-40 h-40 md:w-52 md:h-52 mb-6">
        <img
          src="/mascot.svg"
          alt={HOME.altMascotte}
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {HOME.titolo}
      </h1>
      <p className="mt-3 text-lg" style={{ color: 'var(--text-secondary)' }}>
        {HOME.sottotitolo}
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 rounded-xl font-semibold text-white transition-colors"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        {HOME.vaiDashboard}
      </Link>
    </div>
  )
}

export default Home
