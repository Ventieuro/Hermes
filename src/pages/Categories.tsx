import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GESTIONE_CATEGORIE, CATEGORIE } from '../shared/labels'
import { loadCustomCategories, deleteCustomCategory } from '../shared/storage'
import { getCategoryIcon } from '../shared/categoryIcons'

function Categories() {
  const [refreshKey, setRefreshKey] = useState(0)
  void refreshKey

  const custom = loadCustomCategories()

  function handleDelete(type: 'entrata' | 'uscita', name: string) {
    if (confirm(GESTIONE_CATEGORIE.confermaElimina(name))) {
      deleteCustomCategory(type, name)
      setRefreshKey((k) => k + 1)
    }
  }

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {GESTIONE_CATEGORIE.titolo}
        </h1>
        <Link
          to="/"
          className="text-sm font-medium transition"
          style={{ color: 'var(--accent)' }}
        >
          {GESTIONE_CATEGORIE.tornaIndietro}
        </Link>
      </div>

      {/* Categorie Entrata */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
          {GESTIONE_CATEGORIE.categorieEntrata}
        </h2>

        {/* Predefinite */}
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{GESTIONE_CATEGORIE.predefinite}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIE.entrata.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
            >
              {getCategoryIcon(cat)} {cat}
            </span>
          ))}
        </div>

        {/* Custom */}
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{GESTIONE_CATEGORIE.personalizzate}</p>
        {custom.entrata.length === 0 ? (
          <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>{GESTIONE_CATEGORIE.nessuna}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {custom.entrata.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
                style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                {getCategoryIcon(cat)} {cat}
                <button
                  onClick={() => handleDelete('entrata', cat)}
                  className="ml-1 hover:text-red-500 transition"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Categorie Uscita */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
          {GESTIONE_CATEGORIE.categorieUscita}
        </h2>

        {/* Predefinite */}
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{GESTIONE_CATEGORIE.predefinite}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIE.uscita.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
            >
              {getCategoryIcon(cat)} {cat}
            </span>
          ))}
        </div>

        {/* Custom */}
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{GESTIONE_CATEGORIE.personalizzate}</p>
        {custom.uscita.length === 0 ? (
          <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>{GESTIONE_CATEGORIE.nessuna}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {custom.uscita.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
                style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                {getCategoryIcon(cat)} {cat}
                <button
                  onClick={() => handleDelete('uscita', cat)}
                  className="ml-1 hover:text-red-500 transition"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Categories
