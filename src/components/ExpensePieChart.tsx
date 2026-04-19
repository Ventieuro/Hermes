import { useState } from 'react'
import type { Transaction } from '../shared/types'
import { DASHBOARD } from '../shared/labels'
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
const SAVINGS_COLOR = '#22c55e' // verde per i risparmi

interface Slice {
  category: string
  amount: number
  percent: number
  color: string
}

interface ExpensePieChartProps {
  transactions: Transaction[]
}

function buildSlices(transactions: Transaction[]): Slice[] {
  const income = transactions.filter((t) => t.type === 'entrata').reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter((t) => t.type === 'uscita')
  if (expenses.length === 0) return []

  // Il totale base è il massimo tra entrate e uscite (se spendi più di quanto guadagni, la torta copre tutto)
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0)
  const base = Math.max(income, totalExpenses)

  const byCategory = new Map<string, number>()
  for (const tx of expenses) {
    byCategory.set(tx.category, (byCategory.get(tx.category) ?? 0) + tx.amount)
  }

  const slices: Slice[] = [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount], i) => ({
      category,
      amount,
      percent: Math.round((amount / base) * 100),
      color: EXPENSE_COLORS[i % EXPENSE_COLORS.length],
    }))

  // Aggiungi fetta risparmi se entrate > uscite
  const savings = income - totalExpenses
  if (savings > 0) {
    slices.push({
      category: DASHBOARD.risparmiLabel,
      amount: savings,
      percent: Math.round((savings / base) * 100),
      color: SAVINGS_COLOR,
    })
  }

  return slices
}

function ExpensePieChart({ transactions }: ExpensePieChartProps) {
  const slices = buildSlices(transactions)
  const totalIncome = transactions.filter((t) => t.type === 'entrata').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === 'uscita').reduce((s, t) => s + t.amount, 0)
  const [view, setView] = useState<'pie' | 'solar' | 'comet'>('pie')

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
              onClick={() => setView('pie')}
              className="px-2.5 py-1 rounded-md transition-all font-medium"
              style={{
                backgroundColor: view === 'pie' ? 'var(--accent)' : 'transparent',
                color: view === 'pie' ? '#fff' : 'var(--text-muted)',
              }}
            >
              🥧 {DASHBOARD.vistaTorta}
            </button>
            <button
              onClick={() => setView('solar')}
              className="px-2.5 py-1 rounded-md transition-all font-medium"
              style={{
                backgroundColor: view === 'solar' ? 'var(--accent)' : 'transparent',
                color: view === 'solar' ? '#fff' : 'var(--text-muted)',
              }}
            >
              🪐 {DASHBOARD.vistaSolare}
            </button>
            <button
              onClick={() => setView('comet')}
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
        <SolarSystemChart transactions={transactions} />
      ) : (
        <SpaceDonutChart slices={slices} totalIncome={totalIncome} totalExpenses={totalExpenses} />
      )}
    </div>
  )
}

export default ExpensePieChart
