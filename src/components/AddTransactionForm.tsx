import { useState, useEffect } from 'react'
import type { TransactionType, Transaction } from '../shared/types'
import { generateId, addTransaction, updateTransaction, loadCustomCategories, addCustomCategory } from '../shared/storage'
import Mascot from './Mascot'
import { FORM, normalizeCategoryKey, translateCategory, getCanonicalCategories } from '../shared/labels'
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

  // Blocca lo scroll del body mentre il modale è aperto
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const [type, setType] = useState<TransactionType>(editTransaction?.type ?? 'uscita')
  const [description, setDescription] = useState(editTransaction?.description ?? '')
  const [amount, setAmount] = useState(editTransaction ? String(editTransaction.amount) : '')
  const [date, setDate] = useState(editTransaction?.date ?? today)
  const [category, setCategory] = useState(
    editTransaction ? normalizeCategoryKey(editTransaction.category, editTransaction.type) : ''
  )
  const [recurring, setRecurring] = useState(editTransaction?.recurring ?? false)
  const [recurringMonths, setRecurringMonths] = useState(editTransaction?.recurringMonths ?? 1)
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [saveForFuture, setSaveForFuture] = useState(false)

  const customCats = loadCustomCategories()
  // Usiamo sempre chiavi canoniche IT; la visualizzazione usa translateCategory()
  const builtinKeys = getCanonicalCategories(type)
  const categories = [...builtinKeys, ...customCats[type]]
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90dvh',
          overflowY: 'auto',
          borderRadius: '22px',
          backgroundColor: 'var(--bg-card)',
          backgroundImage: 'none',
          isolation: 'isolate',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}
      >

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
                type="text"
                inputMode="decimal"
                placeholder={FORM.placeholderImporto}
                value={amount}
                onChange={(e) => {
                  const v = e.target.value.replace(',', '.')
                  // Accetta solo cifre e un singolo punto decimale
                  if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) {
                    setAmount(v)
                  }
                }}
                onFocus={(e) => { if (e.target.value === '0') setAmount('') }}
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
                  {getCategoryIcon(cat)} {translateCategory(cat, type)}
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
