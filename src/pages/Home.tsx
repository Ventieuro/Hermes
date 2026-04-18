import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-40 h-40 md:w-52 md:h-52 mb-6">
        <img
          src="/mascot.svg"
          alt="Scimmia mascotte con denari"
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
        Gestione Soldi
      </h1>
      <p className="mt-3 text-lg text-gray-500">
        Tieni sotto controllo entrate, uscite e risparmi
      </p>
      <Link
        to="/dashboard"
        className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
      >
        Vai alla Dashboard
      </Link>
    </div>
  )
}

export default Home
