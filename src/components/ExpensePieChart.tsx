import { useState } from 'react'
import type { Transaction } from '../shared/types'
import { DASHBOARD, normalizeCategoryKey, translateCategory } from '../shared/labels'
import SolarSystemChart from './SolarSystemChart'
import SpaceDonutChart from './SpaceDonutChart'
import CometChart from './CometChart'

// ─── Colori per le categorie di uscita ───────────────────
const EXPENSE_COLORS = [
  '#ef4444', // rosso
  '#f97316', // arancione
  '#eab308', // giallo
  '#06b6d4', // ciano
  '#3b82f6', // blu
  '#8b5cf6', // viola
  '#ec4899', // rosa
  '#f43f5e', // rosa-rosso
]

interface Slice {
  category: string
  canonicalKey: string
  amount: number
  percent: number
  color: string
  type: 'entrata' | 'uscita'
}

interface ExpensePieChartProps {
  transactions: Transaction[]
  onCategoryClick?: (canonicalKey: string) => void
  onViewChange?: (view: 'pie' | 'solar' | 'comet') => void
}

function buildSlices(transactions: Transaction[]): Slice[] {
  const incomeTx = transactions.filter((t) => t.type === 'entrata')
  const expenseTx = transactions.filter((t) => t.type === 'uscita')
  if (incomeTx.length === 0 && expenseTx.length === 0) return []

  const totalIncome = incomeTx.reduce((s, t) => s + t.amount, 0)
  const totalExpenses = expenseTx.reduce((s, t) => s + t.amount, 0)

  // Base = income (or expenses if they exceed income)
  const base = Math.max(totalIncome, totalExpenses) || 1

  // Expense slices — each is a portion of the income circle
  const byExpense = new Map<string, number>()
  for (const tx of expenseTx) {
    const key = normalizeCategoryKey(tx.category, 'uscita')
    byExpense.set(key, (byExpense.get(key) ?? 0) + tx.amount)
  }

  const expenseSlices: Slice[] = [...byExpense.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([canonicalKey, amount], i) => ({
      canonicalKey,
      category: translateCategory(canonicalKey, 'uscita'),
      amount,
      percent: Math.round((amount / base) * 1000) / 10,
      color: EXPENSE_COLORS[i % EXPENSE_COLORS.length],
      type: 'uscita' as const,
    }))

  // Savings slice — the green remainder (income − expenses)
  const savings = totalIncome - totalExpenses
  const savingsSlices: Slice[] = savings > 0 ? [{
    canonicalKey: '', // non-clickable
    category: DASHBOARD.risparmiLabel,
    amount: savings,
    percent: Math.round((savings / base) * 1000) / 10,
    color: '#22c55e',
    type: 'entrata' as const,
  }] : []

  // Expenses first, savings (green) last so it ends the circle
  return [...expenseSlices, ...savingsSlices]
}

function ExpensePieChart({ transactions, onCategoryClick, onViewChange }: ExpensePieChartProps) {
  const slices = buildSlices(transactions)
  const totalIncome = transactions.filter((t) => t.type === 'entrata').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === 'uscita').reduce((s, t) => s + t.amount, 0)
  const [view, setView] = useState<'pie' | 'solar' | 'comet'>('pie')

  function changeView(v: 'pie' | 'solar' | 'comet') {
    setView(v)
    onViewChange?.(v)
  }

  return (
    <div
      className="rounded-2xl p-4 transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          {DASHBOARD.graficoSpese}
        </h2>

        {/* Toggle Torta / Sistema Solare */}
        {slices.length > 0 && (
          <div
            className="flex rounded-lg p-0.5 text-xs"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
          >
            <button
              onClick={() => changeView('pie')}
              className="px-2.5 py-1 rounded-md transition-all font-medium"
              style={{
                backgroundColor: view === 'pie' ? 'var(--accent)' : 'transparent',
                color: view === 'pie' ? '#fff' : 'var(--text-muted)',
              }}
            >
              � {DASHBOARD.vistaTorta}
            </button>
            <button
              onClick={() => changeView('solar')}
              className="px-2.5 py-1 rounded-md transition-all font-medium"
              style={{
                backgroundColor: view === 'solar' ? 'var(--accent)' : 'transparent',
                color: view === 'solar' ? '#fff' : 'var(--text-muted)',
              }}
            >
              🪐 {DASHBOARD.vistaSolare}
            </button>
            <button
              onClick={() => changeView('comet')}
              className="px-2.5 py-1 rounded-md transition-all font-medium"
              style={{
                backgroundColor: view === 'comet' ? 'var(--accent)' : 'transparent',
                color: view === 'comet' ? '#fff' : 'var(--text-muted)',
              }}
            >
              ☄️ {DASHBOARD.vistaCometa}
            </button>
          </div>
        )}
      </div>

      {slices.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
          {DASHBOARD.nessunGrafico}
        </p>
      ) : view === 'comet' ? (
        <CometChart />
      ) : view === 'solar' ? (
        <SolarSystemChart transactions={transactions} onCategoryClick={onCategoryClick} />
      ) : (
        <SpaceDonutChart slices={slices} totalIncome={totalIncome} totalExpenses={totalExpenses} size={280} onCategoryClick={onCategoryClick} />
      )}
    </div>
  )
}

export default ExpensePieChart
