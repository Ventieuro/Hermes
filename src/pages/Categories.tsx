import { useState } from 'react'
import { GESTIONE_CATEGORIE, CATEGORIE } from '../shared/labels'
import { PageHeader } from '../components/ui'
import { loadCustomCategories, addCustomCategory, deleteCustomCategory, renameCustomCategory, saveCustomIcon, deleteCustomIcon } from '../shared/storage'
import { getCategoryIcon } from '../shared/categoryIcons'
import { useDialog } from '../shared/DialogContext'

const EMOJI_OPTIONS = [
  '💰', '💳', '🏠', '🚗', '✈️', '🍕', '🛒', '👕', '💊', '🎮',
  '📱', '📚', '🎵', '🐾', '⚽', '🎁', '💡', '🔧', '✂️', '🧹',
  '💼', '📦', '🎓', '🏋️', '🍺', '☕', '🎬', '💐', '🚀', '⭐',
  '🌌', '🪐',
]

function Categories() {
  const { showConfirm } = useDialog()
  const [refreshKey, setRefreshKey] = useState(0)
  void refreshKey

  // Create form state
  const [newType, setNewType] = useState<'entrata' | 'uscita'>('uscita')
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('🌌')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // Rename state
  const [editingCat, setEditingCat] = useState<{ type: 'entrata' | 'uscita'; name: string } | null>(null)
  const [editName, setEditName] = useState('')

  const custom = loadCustomCategories()

  function handleCreate() {
    const trimmed = newName.trim()
    if (!trimmed) return
    addCustomCategory(newType, trimmed)
    if (newIcon !== '🌌') saveCustomIcon(trimmed, newIcon)
    setNewName('')
    setNewIcon('🌌')
    setRefreshKey((k) => k + 1)
  }

  async function handleDelete(type: 'entrata' | 'uscita', name: string) {
    const ok = await showConfirm({
      message: GESTIONE_CATEGORIE.confermaElimina(name),
      confirmLabel: 'Elimina',
      cancelLabel: 'Annulla',
    })
    if (ok) {
      deleteCustomCategory(type, name)
      deleteCustomIcon(name)
      setRefreshKey((k) => k + 1)
    }
  }

  function startEditing(type: 'entrata' | 'uscita', name: string) {
    setEditingCat({ type, name })
    setEditName(name)
  }

  function handleRename() {
    if (!editingCat) return
    const trimmed = editName.trim()
    if (trimmed && trimmed !== editingCat.name) {
      renameCustomCategory(editingCat.type, editingCat.name, trimmed)
    }
    setEditingCat(null)
    setEditName('')
    setRefreshKey((k) => k + 1)
  }

  function renderCustomCats(type: 'entrata' | 'uscita', cats: string[]) {
    if (cats.length === 0) {
      return <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>{GESTIONE_CATEGORIE.nessuna}</p>
    }
    return (
      <div className="space-y-2">
        {cats.map((cat) => (
          <div
            key={cat}
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ backgroundColor: 'var(--accent-light)', border: '1px solid var(--border)' }}
          >
            {editingCat?.type === type && editingCat.name === cat ? (
              <>
                <span className="text-sm">{getCategoryIcon(cat)}</span>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  className="flex-1 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2"
                  style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
                  autoFocus
                />
                <button
                  onClick={handleRename}
                  className="text-xs font-bold px-2 py-1 rounded-lg transition"
                  style={{ color: 'var(--accent)' }}
                >
                  {GESTIONE_CATEGORIE.salva}
                </button>
                <button
                  onClick={() => { setEditingCat(null); setEditName('') }}
                  className="text-xs px-2 py-1 rounded-lg transition"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {GESTIONE_CATEGORIE.annulla}
                </button>
              </>
            ) : (
              <>
                <span className="text-sm">{getCategoryIcon(cat)}</span>
                <span className="flex-1 text-sm font-medium" style={{ color: 'var(--accent)' }}>{cat}</span>
                <button
                  onClick={() => startEditing(type, cat)}
                  className="text-xs px-2 py-1 rounded-lg transition hover:opacity-80"
                  style={{ color: 'var(--text-muted)' }}
                >
                  ✏️ {GESTIONE_CATEGORIE.rinomina}
                </button>
                <button
                  onClick={() => handleDelete(type, cat)}
                  className="text-xs px-2 py-1 rounded-lg transition hover:text-red-500"
                  style={{ color: 'var(--text-muted)' }}
                >
                  🗑
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <PageHeader title={GESTIONE_CATEGORIE.titolo} />

      {/* ─── Create Form ─── */}
      <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          {GESTIONE_CATEGORIE.nuovaCategoria}
        </h2>

        {/* Type selector */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={() => setNewType('entrata')}
            className={`py-2 rounded-xl text-sm font-medium transition ${
              newType === 'entrata' ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: newType === 'entrata' ? 'var(--tx-income-bg)' : 'var(--bg-secondary)',
              color: newType === 'entrata' ? 'var(--tx-income-text)' : 'var(--text-muted)',
              '--tw-ring-color': 'var(--tx-income-text)',
            } as React.CSSProperties}
          >
            ➕ {GESTIONE_CATEGORIE.categorieEntrata}
          </button>
          <button
            type="button"
            onClick={() => setNewType('uscita')}
            className={`py-2 rounded-xl text-sm font-medium transition ${
              newType === 'uscita' ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: newType === 'uscita' ? 'var(--tx-expense-bg)' : 'var(--bg-secondary)',
              color: newType === 'uscita' ? 'var(--tx-expense-text)' : 'var(--text-muted)',
              '--tw-ring-color': 'var(--tx-expense-text)',
            } as React.CSSProperties}
          >
            ➖ {GESTIONE_CATEGORIE.categorieUscita}
          </button>
        </div>

        {/* Name + Emoji + Add */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition shrink-0"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            title={GESTIONE_CATEGORIE.scegliIcona}
          >
            {newIcon}
          </button>
          <input
            type="text"
            placeholder={GESTIONE_CATEGORIE.placeholderNome}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white transition active:scale-95 disabled:opacity-40 shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {GESTIONE_CATEGORIE.aggiungi}
          </button>
        </div>

        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="mt-2 p-2 rounded-xl grid grid-cols-8 gap-1" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => { setNewIcon(emoji); setShowEmojiPicker(false) }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition hover:scale-110 ${
                  newIcon === emoji ? 'ring-2' : ''
                }`}
                style={{ '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Categorie Entrata ─── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
          {GESTIONE_CATEGORIE.categorieEntrata}
        </h2>

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

        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{GESTIONE_CATEGORIE.personalizzate}</p>
        {renderCustomCats('entrata', custom.entrata)}
      </section>

      {/* ─── Categorie Uscita ─── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
          {GESTIONE_CATEGORIE.categorieUscita}
        </h2>

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

        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{GESTIONE_CATEGORIE.personalizzate}</p>
        {renderCustomCats('uscita', custom.uscita)}
      </section>
    </div>
  )
}

export default Categories
