import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { loadTransactions, deleteTransaction, loadSettings } from '../shared/storage'
import type { Transaction } from '../shared/types'
import { MOVIMENTI, CATEGORIE, normalizeCategoryKey, translateCategory } from '../shared/labels'
import { getCategoryIcon } from '../shared/categoryIcons'
import { useDialog } from '../shared/DialogContext'
import AddTransactionForm from '../components/AddTransactionForm'
import { PageHeader } from '../components/ui'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatEuro(amount: number) {
  return amount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
}

function toLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getCurrentPeriod(payDay: number): { start: string; end: string } {
  const today = new Date()
  const baseMonth = today.getDate() >= payDay ? today.getMonth() : today.getMonth() - 1
  const start = new Date(today.getFullYear(), baseMonth, payDay)
  const end = new Date(start.getFullYear(), start.getMonth() + 1, payDay - 1)
  return {
    start: toLocalDate(start),
    end: toLocalDate(end),
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

function Movimenti() {
  const { showConfirm } = useDialog()
  const [searchParams, setSearchParams] = useSearchParams()
  const [refreshKey, setRefreshKey] = useState(0)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'entrata' | 'uscita'>('all')
  const [filterRecurring, setFilterRecurring] = useState(false)
  const [filterCategory, setFilterCategory] = useState(searchParams.get('category') ?? '')

  const { payDay } = loadSettings()
  const defaultPeriod = getCurrentPeriod(payDay)

  const [dateFrom, setDateFrom] = useState(searchParams.get('from') ?? defaultPeriod.start)
  const [dateTo, setDateTo] = useState(searchParams.get('to') ?? defaultPeriod.end)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  // Sincronizza lo stato dai searchParams quando cambiano (navigazione esterna)
  useEffect(() => {
    const { start, end } = getCurrentPeriod(payDay)
    setFilterCategory(searchParams.get('category') ?? '')
    setDateFrom(searchParams.get('from') ?? start)
    setDateTo(searchParams.get('to') ?? end)
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  void refreshKey

  const allTx = loadTransactions()

  // Tutte le categorie disponibili (da etichette + transazioni esistenti)
  const allCategories = useMemo(() => {
    // Normalizza le categorie esistenti alla chiave canonica IT, poi traduci per la visualizzazione
    const fromTx = new Set(allTx.map((t) => normalizeCategoryKey(t.category, t.type)).filter(Boolean))
    const fromLabels = [...CATEGORIE.entrata, ...CATEGORIE.uscita]
    return Array.from(new Set([...fromLabels, ...fromTx])).sort()
  }, [allTx.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Filtraggio
  const filtered = useMemo(() => {
    return allTx
      .filter((t) => {
        if (filterType !== 'all' && t.type !== filterType) return false
        if (filterRecurring && !t.recurring) return false
        if (filterCategory && normalizeCategoryKey(t.category, t.type) !== filterCategory) return false
        if (dateFrom && t.date < dateFrom) return false
        if (dateTo && t.date > dateTo) return false
        if (search.trim()) {
          const q = search.toLowerCase()
          return (
            t.description.toLowerCase().includes(q) ||
            translateCategory(t.category).toLowerCase().includes(q)
          )
        }
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [allTx, filterType, filterRecurring, filterCategory, dateFrom, dateTo, search, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  function clearPeriodFilter() {
    const { start, end } = getCurrentPeriod(payDay)
    setDateFrom(start)
    setDateTo(end)
    setFilterCategory('')
    setSearchParams({})
  }

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
      <PageHeader title={MOVIMENTI.titolo} />

      {/* ─── Banner filtro categoria (da navigazione Dashboard) ─── */}
      {filterCategory && (
        <div style={{
          margin: '0 16px 12px',
          padding: '10px 14px',
          borderRadius: '14px',
          background: 'var(--accent-light)',
          border: '1px solid var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}>
          <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600 }}>
            📂 {translateCategory(filterCategory)}
          </span>
          <button
            onClick={clearPeriodFilter}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '2px', color: 'var(--accent)', flexShrink: 0 }}
            aria-label="Rimuovi filtro"
          >✕</button>
        </div>
      )}

      {/* ─── Search ─── */}
      <div style={{ padding: '0 16px 10px' }}>
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

      {/* ─── Filtro date Dal / Al ─── */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
            {MOVIMENTI.dalLabel}
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '9px 12px',
              borderRadius: '12px',
              border: `1px solid ${dateFrom ? 'var(--accent)' : 'var(--input-border)'}`,
              background: 'var(--input-bg)',
              color: dateFrom ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '14px',
              outline: 'none',
              colorScheme: 'dark',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
            {MOVIMENTI.alLabel}
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            min={dateFrom || undefined}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '9px 12px',
              borderRadius: '12px',
              border: `1px solid ${dateTo ? 'var(--accent)' : 'var(--input-border)'}`,
              background: 'var(--input-bg)',
              color: dateTo ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '14px',
              outline: 'none',
              colorScheme: 'dark',
            }}
          />
        </div>
        {(dateFrom !== defaultPeriod.start || dateTo !== defaultPeriod.end) && (
          <button
            onClick={() => { setDateFrom(defaultPeriod.start); setDateTo(defaultPeriod.end) }}
            style={{
              flexShrink: 0,
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--bg-secondary)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1px',
            }}
            aria-label="Cancella date"
          >✕</button>
        )}
      </div>

      {/* ─── Filtri tipo + ricorrenti ─── */}
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
        <button style={chipStyle(filterRecurring)} onClick={() => setFilterRecurring((v) => !v)}>
          🔁 {MOVIMENTI.filtroRicorrenti}
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
                  {tx.description || translateCategory(tx.category)}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {translateCategory(tx.category)} · {formatDate(tx.date)}
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
