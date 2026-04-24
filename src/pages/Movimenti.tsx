import { useState, useMemo, useCallback } from 'react'
import { loadTransactions, deleteTransaction } from '../shared/storage'
import type { Transaction } from '../shared/types'
import { MOVIMENTI, CATEGORIE } from '../shared/labels'
import { getCategoryIcon } from '../shared/categoryIcons'
import { useDialog } from '../shared/DialogContext'
import AddTransactionForm from '../components/AddTransactionForm'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatEuro(amount: number) {
  return amount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Component ───────────────────────────────────────────────────────────────

function Movimenti() {
  const { showConfirm } = useDialog()
  const [refreshKey, setRefreshKey] = useState(0)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'entrata' | 'uscita'>('all')
  const [filterCategory, setFilterCategory] = useState('')
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  void refreshKey

  const allTx = loadTransactions()

  // Tutte le categorie disponibili (da etichette + transazioni esistenti)
  const allCategories = useMemo(() => {
    const fromTx = new Set(allTx.map((t) => t.category).filter(Boolean))
    const fromLabels = [...CATEGORIE.entrata, ...CATEGORIE.uscita]
    return Array.from(new Set([...fromLabels, ...fromTx])).sort()
  }, [allTx.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Filtraggio
  const filtered = useMemo(() => {
    return allTx
      .filter((t) => {
        if (filterType !== 'all' && t.type !== filterType) return false
        if (filterCategory && t.category !== filterCategory) return false
        if (search.trim()) {
          const q = search.toLowerCase()
          return (
            t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)
          )
        }
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [allTx, filterType, filterCategory, search, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete(tx: Transaction) {
    const ok = await showConfirm({
      message: MOVIMENTI.eliminaConferma(tx.description),
      confirmLabel: MOVIMENTI.eliminaLabel,
      cancelLabel: 'Annulla',
    })
    if (ok) {
      deleteTransaction(tx.id)
      refresh()
    }
  }

  const chipStyle = (active: boolean) => ({
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
    background: active ? 'var(--accent)' : 'var(--bg-secondary)',
    color: active ? 'var(--fab-text, #fff)' : 'var(--text-secondary)',
  } as React.CSSProperties)

  return (
    <div style={{ paddingBottom: '96px' }}>

      {/* ─── Titolo ─── */}
      <div style={{ padding: '20px 16px 12px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {MOVIMENTI.titolo}
        </h1>
      </div>

      {/* ─── Search ─── */}
      <div style={{ padding: '0 16px 12px' }}>
        <input
          type="search"
          placeholder={MOVIMENTI.cercaPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '11px 16px',
            borderRadius: '14px',
            border: '1px solid var(--input-border)',
            background: 'var(--input-bg)',
            color: 'var(--text-primary)',
            fontSize: '15px',
            outline: 'none',
          }}
        />
      </div>

      {/* ─── Filtri tipo ─── */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <button style={chipStyle(filterType === 'all')} onClick={() => setFilterType('all')}>
          {MOVIMENTI.filtroTutti}
        </button>
        <button style={chipStyle(filterType === 'entrata')} onClick={() => setFilterType('entrata')}>
          {MOVIMENTI.filtroEntrate}
        </button>
        <button style={chipStyle(filterType === 'uscita')} onClick={() => setFilterType('uscita')}>
          {MOVIMENTI.filtroUscite}
        </button>
      </div>

      {/* ─── Filtro categoria ─── */}
      <div style={{ padding: '0 16px 16px' }}>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px 14px',
            borderRadius: '14px',
            border: '1px solid var(--input-border)',
            background: 'var(--input-bg)',
            color: filterCategory ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: '14px',
            outline: 'none',
          }}
        >
          <option value="">Tutte le categorie</option>
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>{getCategoryIcon(cat)} {cat}</option>
          ))}
        </select>
      </div>

      {/* ─── Lista ─── */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.length === 0 ? (
          <div style={{
            padding: '40px 16px',
            textAlign: 'center',
            borderRadius: '16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>{MOVIMENTI.nessuno}</p>
          </div>
        ) : (
          filtered.map((tx) => (
            <div
              key={tx.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '16px',
                background: tx.type === 'entrata' ? 'var(--tx-income-bg)' : 'var(--tx-expense-bg)',
                border: `1px solid ${tx.type === 'entrata' ? 'var(--tx-income-border)' : 'var(--tx-expense-border)'}`,
              }}
            >
              {/* Icona categoria */}
              <span style={{ fontSize: '22px', flexShrink: 0 }}>{getCategoryIcon(tx.category)}</span>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tx.description || tx.category}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {tx.category} · {formatDate(tx.date)}
                </p>
              </div>

              {/* Importo */}
              <span style={{
                fontSize: '15px',
                fontWeight: 700,
                flexShrink: 0,
                color: tx.type === 'entrata' ? 'var(--tx-income-text)' : 'var(--tx-expense-text)',
              }}>
                {tx.type === 'entrata' ? '+' : '-'}{formatEuro(tx.amount)}
              </span>

              {/* Azioni */}
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={() => setEditingTx(tx)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px', color: 'var(--text-muted)' }}
                  aria-label="Modifica"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(tx)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px', color: 'var(--text-muted)' }}
                  aria-label="Elimina"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── Modifica modale ─── */}
      {editingTx && (
        <AddTransactionForm
          onClose={() => setEditingTx(null)}
          onSaved={refresh}
          editTransaction={editingTx}
        />
      )}
    </div>
  )
}

export default Movimenti
