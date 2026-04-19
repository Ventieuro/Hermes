import { useState } from 'react'
import type { TransactionType, Transaction } from '../shared/types'
import { generateId, addTransaction, updateTransaction, loadCustomCategories, addCustomCategory } from '../shared/storage'
import Mascot from './Mascot'
import { FORM, CATEGORIE } from '../shared/labels'
import { getCategoryIcon } from '../shared/categoryIcons'

interface AddTransactionProps {
  onClose: () => void
  onSaved: () => void
  defaultDate?: string
  editTransaction?: Transaction
}

function AddTransactionForm({ onClose, onSaved, defaultDate, editTransaction }: AddTransactionProps) {
  const today = defaultDate ?? new Date().toISOString().slice(0, 10)
  const isEdit = !!editTransaction

  const [type, setType] = useState<TransactionType>(editTransaction?.type ?? 'uscita')
  const [description, setDescription] = useState(editTransaction?.description ?? '')
  const [amount, setAmount] = useState(editTransaction ? String(editTransaction.amount) : '')
  const [date, setDate] = useState(editTransaction?.date ?? today)
  const [category, setCategory] = useState(editTransaction?.category ?? '')
  const [recurring, setRecurring] = useState(editTransaction?.recurring ?? false)
  const [recurringMonths, setRecurringMonths] = useState(editTransaction?.recurringMonths ?? 1)
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [saveForFuture, setSaveForFuture] = useState(false)

  const customCats = loadCustomCategories()
  const categories = [...CATEGORIE[type], ...customCats[type]]
  const isValid = Number(amount) > 0 && category

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return

    if (isEdit && editTransaction) {
      updateTransaction({
        ...editTransaction,
        type,
        description: description.trim() || category,
        amount: Number(amount),
        date,
        category,
        recurring,
        recurringMonths: recurring ? recurringMonths : 0,
      })
      onSaved()
      onClose()
      return
    }

    const tx: Transaction = {
      id: generateId(),
      type,
      description: description.trim() || category,
      amount: Number(amount),
      date,
      category,
      recurring,
      recurringMonths: recurring ? recurringMonths : 0,
    }

    // Se ricorrente, crea una copia per ogni mese futuro
    if (recurring && recurringMonths > 1) {
      for (let i = 0; i < recurringMonths; i++) {
        const d = new Date(date)
        d.setMonth(d.getMonth() + i)
        addTransaction({
          ...tx,
          id: generateId() + i,
          date: d.toISOString().slice(0, 10),
        })
      }
    } else {
      addTransaction(tx)
    }

    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {isEdit
              ? (type === 'entrata' ? FORM.titoloModificaEntrata : FORM.titoloModificaUscita)
              : (type === 'entrata' ? FORM.titoloEntrata : FORM.titoloUscita)}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">

          {/* Tipo toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setType('entrata'); setCategory('') }}
              className={`py-2.5 rounded-xl font-semibold text-sm transition ${
                type === 'entrata'
                  ? 'bg-green-100 text-green-700 ring-2 ring-green-400'
                  : ''
              }`}
              style={type !== 'entrata' ? { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' } : undefined}
            >
              {FORM.toggleEntrata}
            </button>
            <button
              type="button"
              onClick={() => { setType('uscita'); setCategory('') }}
              className={`py-2.5 rounded-xl font-semibold text-sm transition ${
                type === 'uscita'
                  ? 'bg-red-100 text-red-700 ring-2 ring-red-400'
                  : ''
              }`}
              style={type !== 'uscita' ? { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' } : undefined}
            >
              {FORM.toggleUscita}
            </button>
          </div>

          {/* Importo */}
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{FORM.labelQuanto}</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder={FORM.placeholderImporto}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-2xl font-bold text-center focus:outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: 'var(--text-muted)' }}>{FORM.simboloValuta}</span>
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{FORM.labelCategoria}</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    category === cat
                      ? type === 'entrata'
                        ? 'bg-green-200 text-green-800 ring-1 ring-green-400'
                        : 'bg-red-200 text-red-800 ring-1 ring-red-400'
                      : ''
                  }`}
                  style={category !== cat ? { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' } : undefined}
                >
                  {getCategoryIcon(cat)} {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowNewCat(!showNewCat)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition"
                style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                {FORM.nuovaCategoria}
              </button>
            </div>

            {showNewCat && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={FORM.placeholderNuovaCat}
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = newCatName.trim()
                      if (!trimmed) return
                      if (saveForFuture) addCustomCategory(type, trimmed)
                      setCategory(trimmed)
                      setNewCatName('')
                      setShowNewCat(false)
                      setSaveForFuture(false)
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-white transition active:scale-95"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    {FORM.aggiungiCategoria}
                  </button>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveForFuture}
                    onChange={(e) => setSaveForFuture(e.target.checked)}
                    className="w-4 h-4 rounded accent-purple-500"
                  />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{FORM.salvaPerFuturo}</span>
                </label>
              </div>
            )}
          </div>

          {/* Descrizione (opzionale) */}
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{FORM.labelPerCosaOpzionale}</label>
            <input
              type="text"
              placeholder={FORM.placeholderDescrizione}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
            />
          </div>

          {/* Data */}
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{FORM.labelQuando}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
            />
          </div>

          {/* Ricorrente */}
          <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                className="w-5 h-5 rounded accent-amber-500"
              />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {FORM.labelRicorrente}
              </span>
            </label>

            {recurring && (
              <div className="mt-3 flex items-center gap-2">
                <Mascot mood="neutral" message={FORM.messaggioRicorrente} size="sm" />
              </div>
            )}

            {recurring && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={recurringMonths}
                  onChange={(e) => setRecurringMonths(Number(e.target.value))}
                  className="w-20 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2"
                  style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{FORM.unitaMesi}</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-3 rounded-xl font-bold text-white text-sm transition ${
              isValid
                ? type === 'entrata'
                  ? 'bg-green-600 hover:bg-green-700 active:scale-[0.98]'
                  : 'bg-red-500 hover:bg-red-600 active:scale-[0.98]'
                : 'cursor-not-allowed opacity-40'
            }`}
            style={!isValid ? { backgroundColor: 'var(--text-muted)' } : undefined}
          >
            {isEdit
              ? (type === 'entrata' ? FORM.modificaEntrata : FORM.modificaUscita)
              : (type === 'entrata' ? FORM.submitEntrata : FORM.submitUscita)}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddTransactionForm
