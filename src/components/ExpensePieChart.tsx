import type { Transaction } from '../shared/types'
import { DASHBOARD } from '../shared/labels'

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

function buildConicGradient(slices: Slice[]): string {
  const parts: string[] = []
  let cumulative = 0
  for (const s of slices) {
    const start = cumulative
    cumulative += s.percent
    parts.push(`${s.color} ${start}% ${cumulative}%`)
  }
  return `conic-gradient(${parts.join(', ')})`
}

function formatEuro(amount: number) {
  return amount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}

function ExpensePieChart({ transactions }: ExpensePieChartProps) {
  const slices = buildSlices(transactions)
  const totalIncome = transactions.filter((t) => t.type === 'entrata').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === 'uscita').reduce((s, t) => s + t.amount, 0)

  return (
    <div
      className="rounded-2xl p-4 transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <h2
        className="text-sm font-semibold uppercase tracking-wide mb-4"
        style={{ color: 'var(--text-muted)' }}
      >
        {DASHBOARD.graficoSpese}
      </h2>

      {slices.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
          {DASHBOARD.nessunGrafico}
        </p>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Donut */}
          <div className="relative w-44 h-44 flex-shrink-0">
            <div
              className="w-full h-full rounded-full"
              style={{ background: buildConicGradient(slices) }}
            />
            {/* Buco centrale */}
            <div
              className="absolute inset-0 m-auto w-24 h-24 rounded-full flex flex-col items-center justify-center"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <span className="text-[10px] font-semibold text-green-500">{DASHBOARD.entrate}</span>
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                {formatEuro(totalIncome)}
              </span>
              <span className="text-[10px] font-semibold text-red-500 mt-0.5">{DASHBOARD.uscite}</span>
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                {formatEuro(totalExpenses)}
              </span>
            </div>
          </div>

          {/* Legenda */}
          <div className="flex-1 space-y-1.5 w-full">
            {slices.map((s) => (
              <div key={s.category} className="flex items-center gap-2 text-sm">
                <span
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
                  {s.category}
                </span>
                <span className="font-medium tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                  {s.percent}%
                </span>
                <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  {formatEuro(s.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpensePieChart
