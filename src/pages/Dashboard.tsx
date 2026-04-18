import { useState, useCallback } from 'react'
import Mascot from '../components/Mascot'
import AddTransactionForm from '../components/AddTransactionForm'
import { loadTransactions, getTransactionsInPeriod, deleteTransaction, loadSettings, saveSettings } from '../shared/storage'
import type { Transaction } from '../shared/types'
import ExpensePieChart from '../components/ExpensePieChart'
import { DASHBOARD, MASCOTTE } from '../shared/labels'

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
  const [payDay, setPayDay] = useState(settings.payDay)
  const [monthOffset, setMonthOffset] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

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

  function handleDelete(tx: Transaction) {
    if (confirm(DASHBOARD.eliminaConferma(tx.description))) {
      deleteTransaction(tx.id)
      refresh()
    }
  }

  // Ordina per data decrescente
  const sortedTx = [...periodTx].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-5 pb-24">

      {/* Mascotte + Grafico insieme */}
      <div className="space-y-3">
        <Mascot mood={mascot.mood} message={mascot.message} />
        <ExpensePieChart transactions={periodTx} />
      </div>

      {/* Navigazione periodo */}
      <div className="rounded-2xl p-4 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMonthOffset(monthOffset - 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl active:scale-95 transition"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-secondary)' }}
            aria-label={DASHBOARD.periodoPrecedente}
          >
            ◀
          </button>

          <div className="text-center flex-1 px-2">
            <p className="text-lg font-bold capitalize" style={{ color: 'var(--text-primary)' }}>
              {formatMonth(start)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {formatRange(start, end)}
            </p>
          </div>

          <button
            onClick={() => setMonthOffset(monthOffset + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl active:scale-95 transition"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-secondary)' }}
            aria-label={DASHBOARD.periodoSuccessivo}
          >
            ▶
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <label htmlFor="payday">{DASHBOARD.stipendioIl}</label>
            <select
              id="payday"
              value={payDay}
              onChange={(e) => handlePayDayChange(Number(e.target.value))}
              className="rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          {!isCurrentPeriod && (
            <button
              onClick={() => setMonthOffset(0)}
              className="text-sm font-medium"
              style={{ color: 'var(--accent)' }}
            >
              {DASHBOARD.oggi}
            </button>
          )}
        </div>
      </div>

      {/* Riepilogo */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center">
          <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide">{DASHBOARD.entrate}</p>
          <p className="mt-1 text-base md:text-xl font-bold text-green-700">
            {formatEuro(entrate)}
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
          <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wide">{DASHBOARD.uscite}</p>
          <p className="mt-1 text-base md:text-xl font-bold text-red-700">
            {formatEuro(uscite)}
          </p>
        </div>

        <div className={`rounded-2xl p-3 text-center border ${
          saldo >= 0
            ? 'bg-indigo-50 border-indigo-200'
            : 'bg-orange-50 border-orange-200'
        }`}>
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${
            saldo >= 0 ? 'text-indigo-600' : 'text-orange-600'
          }`}>{DASHBOARD.risparmi}</p>
          <p className={`mt-1 text-base md:text-xl font-bold ${
            saldo >= 0 ? 'text-indigo-700' : 'text-orange-700'
          }`}>
            {formatEuro(saldo)}
          </p>
        </div>
      </div>

      {/* Lista movimenti */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
          {DASHBOARD.movimenti}
        </h2>

        {sortedTx.length === 0 ? (
          <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-4xl mb-2">{DASHBOARD.nessunoMovimentoEmoji}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {DASHBOARD.nessunoMovimento}<br />
              {DASHBOARD.nessunoMovimentoSuggerimento}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTx.map((tx) => (
              <div
                key={tx.id}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  tx.type === 'entrata'
                    ? 'bg-green-50/50 border-green-100'
                    : 'bg-red-50/50 border-red-100'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {tx.description}
                    {tx.recurring && <span className="ml-1 text-amber-500">🔄</span>}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {tx.category} · {formatDay(tx.date)}
                  </p>
                </div>
                <p className={`text-sm font-bold whitespace-nowrap ${
                  tx.type === 'entrata' ? 'text-green-700' : 'text-red-600'
                }`}>
                  {tx.type === 'entrata' ? '+' : '-'}{formatEuro(tx.amount)}
                </p>
                <button
                  onClick={() => handleDelete(tx)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition text-xs"
                  aria-label={DASHBOARD.eliminaLabel}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB - Bottone aggiungi */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg active:scale-95 transition flex items-center justify-center text-2xl z-40"
        style={{ backgroundColor: 'var(--fab-bg)', color: 'var(--fab-text)' }}
        aria-label={DASHBOARD.aggiungiMovimento}
      >
        +
      </button>

      {/* Modale inserimento */}
      {showForm && (
        <AddTransactionForm
          onClose={() => setShowForm(false)}
          onSaved={refresh}
        />
      )}
    </div>
  )
}

export default Dashboard
