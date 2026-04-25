import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Mascot from '../components/Mascot'
import AddTransactionForm from '../components/AddTransactionForm'
import { loadTransactions, getTransactionsInPeriod, deleteTransaction, deleteTransactionsByGroupId, loadSettings, saveSettings } from '../shared/storage'
import type { Transaction } from '../shared/types'
import ExpensePieChart from '../components/ExpensePieChart'
import { DASHBOARD, MASCOTTE, translateCategory } from '../shared/labels'
import { getCategoryIcon } from '../shared/categoryIcons'
import { useDialog } from '../shared/DialogContext'

function getPeriod(payDay: number, offset: number) {
  const today = new Date()
  const baseMonth = today.getDate() >= payDay ? today.getMonth() : today.getMonth() - 1

  const start = new Date(today.getFullYear(), baseMonth + offset, payDay)
  const end = new Date(start.getFullYear(), start.getMonth() + 1, payDay - 1)

  return { start, end }
}

function formatRange(start: Date, end: Date) {
  const fmt = (d: Date) =>
    d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
  return `${fmt(start)} — ${fmt(end)}`
}

function formatMonth(start: Date) {
  return start.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
}

function formatEuro(amount: number) {
  return amount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
}

function getMascotMessage(saldo: number, count: number): { mood: 'happy' | 'sad' | 'neutral' | 'excited'; message: string } {
  if (count === 0) return { mood: 'neutral', message: MASCOTTE.messaggi.vuoto }
  if (saldo > 500) return { mood: 'excited', message: MASCOTTE.messaggi.ottimo }
  if (saldo > 0) return { mood: 'happy', message: MASCOTTE.messaggi.bene(formatEuro(saldo)) }
  if (saldo === 0) return { mood: 'neutral', message: MASCOTTE.messaggi.pari }
  return { mood: 'sad', message: MASCOTTE.messaggi.rosso(formatEuro(Math.abs(saldo))) }
}

function Dashboard() {
  const settings = loadSettings()
  const { showConfirm } = useDialog()
  const navigate = useNavigate()
  const [payDay, setPayDay] = useState(settings.payDay)
  const [monthOffset, setMonthOffset] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [chartView, setChartView] = useState<'pie' | 'solar' | 'comet'>('pie')

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    const handleAddTransaction = () => setShowForm(true)
    window.addEventListener('hermes:add-transaction', handleAddTransaction)
    return () => window.removeEventListener('hermes:add-transaction', handleAddTransaction)
  }, [])

  const { start, end } = getPeriod(payDay, monthOffset)
  const isCurrentPeriod = monthOffset === 0

  const allTx = loadTransactions()
  void refreshKey // trigger re-render on data change
  const periodTx = getTransactionsInPeriod(allTx, start, end)

  const entrate = periodTx.filter((t) => t.type === 'entrata').reduce((s, t) => s + t.amount, 0)
  const uscite = periodTx.filter((t) => t.type === 'uscita').reduce((s, t) => s + t.amount, 0)
  const saldo = entrate - uscite

  const mascot = getMascotMessage(saldo, periodTx.length)

  function handlePayDayChange(day: number) {
    setPayDay(day)
    setMonthOffset(0)
    saveSettings({ ...settings, payDay: day })
  }

  async function handleDelete(tx: Transaction) {
    const ok = await showConfirm({
      title: DASHBOARD.eliminaLabel,
      message: DASHBOARD.eliminaConferma(tx.description),
      confirmLabel: DASHBOARD.eliminaLabel,
      cancelLabel: '❌ Annulla',
    })
    if (!ok) return
    if (tx.recurringGroupId) {
      const deleteAll = await showConfirm({
        message: DASHBOARD.eliminaRicorrenteScope,
        confirmLabel: DASHBOARD.eliminaTutte,
        cancelLabel: DASHBOARD.eliminaSoloQuesta,
      })
      deleteAll ? deleteTransactionsByGroupId(tx.recurringGroupId) : deleteTransaction(tx.id)
    } else {
      deleteTransaction(tx.id)
    }
    refresh()
  }

  function handleCategoryClick(canonicalKey: string) {
    const from = start.toISOString().slice(0, 10)
    const to = end.toISOString().slice(0, 10)
    navigate(`/movimenti?category=${encodeURIComponent(canonicalKey)}&from=${from}&to=${to}`)
  }

  // Solo uscite, ordinate per data decrescente
  const sortedTx = [...periodTx].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div style={{ paddingBottom: '96px' }}>

      {/* ── 0. Messaggio mascotte ─────────────────────────── */}
      <div style={{ padding: '16px 16px 0' }}>
        <Mascot mood={mascot.mood} message={mascot.message} />
      </div>

      {/* ── 1. Navigazione periodo ─────────────────────────── */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 16px 0',
        }}
      >
        <button
          onClick={() => setMonthOffset(monthOffset - 1)}
          style={{
            width: '40px', height: '40px', borderRadius: '12px', border: '1px solid var(--border)',
            background: 'var(--bg-card)', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '14px',
          }}
          aria-label={DASHBOARD.periodoPrecedente}
        >◀</button>

        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, textTransform: 'capitalize', color: 'var(--text-primary)' }}>
            {formatMonth(start)}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            {formatRange(start, end)}
          </p>
        </div>

        <button
          onClick={() => setMonthOffset(monthOffset + 1)}
          style={{
            width: '40px', height: '40px', borderRadius: '12px', border: '1px solid var(--border)',
            background: 'var(--bg-card)', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '14px',
          }}
          aria-label={DASHBOARD.periodoSuccessivo}
        >▶</button>
      </div>

      {/* Stipendio + Oggi inline sotto nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <label htmlFor="payday">{DASHBOARD.stipendioIl}</label>
          <select
            id="payday"
            value={payDay}
            onChange={(e) => handlePayDayChange(Number(e.target.value))}
            style={{
              background: 'var(--input-bg)', border: '1px solid var(--input-border)',
              color: 'var(--text-primary)', borderRadius: '8px', padding: '3px 8px',
              fontSize: '13px', outline: 'none',
            }}
          >
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        {!isCurrentPeriod && (
          <button
            onClick={() => setMonthOffset(0)}
            style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
          >{DASHBOARD.oggi}</button>
        )}
      </div>

      {/* ── 2. Grafico grande ─────────────────────────────── */}
      <div style={{ padding: '12px 16px 0' }}>
        <ExpensePieChart transactions={periodTx} onCategoryClick={handleCategoryClick} onViewChange={setChartView} />
      </div>

      {/* ── 3. Riepilogo Entrate / Uscite / Risparmi ─────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', padding: '12px 16px 0' }}>
        <div style={{
          borderRadius: '16px', padding: '12px 8px', textAlign: 'center',
          background: 'var(--tx-income-bg)', border: '1px solid var(--tx-income-border)',
          boxShadow: '0 0 14px color-mix(in srgb, var(--tx-income-border) 90%, transparent)',
        }}>
          <p style={{ margin: 0, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--tx-income-label)' }}>{DASHBOARD.entrate}</p>
          <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: 800, color: 'var(--tx-income-text)', lineHeight: 1.2 }}>{formatEuro(entrate)}</p>
        </div>

        <div style={{
          borderRadius: '16px', padding: '12px 8px', textAlign: 'center',
          background: 'var(--tx-expense-bg)', border: '1px solid var(--tx-expense-border)',
          boxShadow: '0 0 14px color-mix(in srgb, var(--tx-expense-border) 90%, transparent)',
        }}>
          <p style={{ margin: 0, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--tx-expense-label)' }}>{DASHBOARD.uscite}</p>
          <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: 800, color: 'var(--tx-expense-text)', lineHeight: 1.2 }}>{formatEuro(uscite)}</p>
        </div>

        <div style={{
          borderRadius: '16px', padding: '12px 8px', textAlign: 'center',
          background: saldo >= 0 ? 'var(--tx-balance-pos-bg)' : 'var(--tx-balance-neg-bg)',
          border: `1px solid ${saldo >= 0 ? 'var(--tx-balance-pos-border)' : 'var(--tx-balance-neg-border)'}`,
          boxShadow: `0 0 14px color-mix(in srgb, ${saldo >= 0 ? 'var(--tx-balance-pos-border)' : 'var(--tx-balance-neg-border)'} 90%, transparent)`,
        }}>
          <p style={{ margin: 0, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: saldo >= 0 ? 'var(--tx-balance-pos-label)' : 'var(--tx-balance-neg-label)' }}>{DASHBOARD.risparmi}</p>
          <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: 800, color: saldo >= 0 ? 'var(--tx-balance-pos-text)' : 'var(--tx-balance-neg-text)', lineHeight: 1.2 }}>{formatEuro(saldo)}</p>
        </div>
      </div>

      {/* ── 4. Messaggio mascotte (spostato in cima) ───────────────── */}

      {/* ── 5. Ultimi movimenti (solo uscite, nascosto in Annuale) ─── */}
      {chartView !== 'comet' && <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
            {DASHBOARD.movimenti}
          </h2>
        </div>

        {sortedTx.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p style={{ margin: 0, fontSize: '32px' }}>{DASHBOARD.nessunoMovimentoEmoji}</p>
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {DASHBOARD.nessunoMovimento}<br />{DASHBOARD.nessunoMovimentoSuggerimento}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sortedTx.map((tx) => (
              <div
                key={tx.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 14px', borderRadius: '14px',
                  background: tx.type === 'entrata' ? 'var(--tx-income-bg)' : 'var(--tx-expense-bg)',
                  border: `1px solid ${tx.type === 'entrata' ? 'var(--tx-income-border)' : 'var(--tx-expense-border)'}`,
                }}
              >
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{getCategoryIcon(tx.category)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tx.description}{tx.recurring && ' 🔄'}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {translateCategory(tx.category)} · {formatDay(tx.date)}
                  </p>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, flexShrink: 0, color: tx.type === 'entrata' ? 'var(--tx-income-text)' : 'var(--tx-expense-text)' }}>
                  {tx.type === 'entrata' ? '+' : '-'}{formatEuro(tx.amount)}
                </span>
                <button onClick={() => setEditingTx(tx)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', padding: '4px', color: 'var(--text-muted)' }} aria-label="Modifica">✏️</button>
                <button onClick={() => handleDelete(tx)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', padding: '4px', color: 'var(--text-muted)' }} aria-label={DASHBOARD.eliminaLabel}>🗑</button>
              </div>
            ))}
          </div>
        )}
      </div>}

      {/* ── Modali ────────────────────────────────────────── */}
      {showForm && (
        <AddTransactionForm onClose={() => setShowForm(false)} onSaved={refresh} />
      )}
      {editingTx && (
        <AddTransactionForm onClose={() => setEditingTx(null)} onSaved={refresh} editTransaction={editingTx} />
      )}
    </div>
  )
}

export default Dashboard
