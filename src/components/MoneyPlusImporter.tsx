/**
 * MoneyPlusImporter — Converte backup .MoneyPlusPack nell'app Hermes.
 *
 * Il file .MoneyPlusPack è un archivio ZIP contenente:
 *  - account.db  → database SQLite con le transazioni
 *  - meta.json   → metadati dell'app di origine
 *
 * Il componente:
 *  1. Legge lo ZIP con fflate
 *  2. Apre il database SQLite con sql.js (WASM)
 *  3. Auto-rileva lo schema fra i pattern noti
 *  4. Mostra anteprima e mappa le categorie
 *  5. Importa le transazioni in Hermes via addTransaction()
 */
import { useState, useCallback } from 'react'
import { unzipSync } from 'fflate'
import type { Transaction } from '../shared/types'
import { addTransaction, generateId, loadTransactions } from '../shared/storage'

// ─── Tipi interni ───────────────────────────────────────

interface RawTransaction {
  date: string       // ISO yyyy-mm-dd
  amount: number     // positivo = entrata, negativo = uscita
  description: string
  category: string
}

interface PreviewTransaction extends RawTransaction {
  hermesType: 'entrata' | 'uscita'
  hermesCategory: string
  isDuplicate: boolean
}

type ImportStep = 'idle' | 'loading' | 'preview' | 'done' | 'error'

// ─── Mapping categorie MoneyPlus → Hermes ───────────────

const MONEYPLUS_CATEGORY_MAP: Record<string, string> = {
  // Uscite
  'basedata.diet':          'Cibo',
  'basedata.daily':         'Spesa',
  'basedata.traffic':       'Trasporti',
  'basedata.social':        'Sociale',
  'basedata.residential':   'Residenza',
  'basedata.gift':          'Regalo',
  'basedata.medical':       'Medico',
  'basedata.bill':          'Bollette',
  'basedata.entertainment': 'Svago',
  'basedata.beauty':        'Bellezza',
  'basedata.sport':         'Hobby',
  'basedata.communication': 'Comunicazioni',
  'basedata.education':     'Hobby',
  'basedata.pet':           'Altro',
  'basedata.car':           'Trasporti',
  'basedata.travel':        'Svago',
  'basedata.tax':           'Bollette',
  'basedata.loan':          'Finanziamento',
  'basedata.fine':          'Multe',
  // Entrate
  'basedata.wage':          'Stipendio',
  'basedata.salary':        'Stipendio',
  'basedata.parttime':      'Freelance',
  'basedata.bonus':         'Stipendio',
  'basedata.investment':    'Altro',
  'basedata.refund':        'Rimborso',
  'basedata.red_envelope':  'Regalo',
}

function mapMoneyPlusCategory(name: string, type: 'entrata' | 'uscita'): string {
  const mapped = MONEYPLUS_CATEGORY_MAP[name.toLowerCase()]
  if (mapped) return mapped
  // Estrai la parte dopo "basedata." e capitalizza
  const bare = name.replace(/^basedata\./i, '')
  if (bare) return bare.charAt(0).toUpperCase() + bare.slice(1)
  return type === 'entrata' ? 'Altro' : 'Altro'
}

/**
 * Core Data timestamp: secondi dal 2001-01-01
 * Se il numero è > 1e10 lo tratta come millisecondi Unix.
 * Se il numero è < 1e9 lo tratta come secondi Core Data (offset 2001).
 * Risultato sempre clampato tra 2000-01-01 e 2100-01-01.
 */
function parseTimestamp(raw: unknown): string {
  const MIN_DATE = '2000-01-01'
  const MAX_DATE = '2100-01-01'

  let iso: string | null = null

  if (typeof raw === 'number' && isFinite(raw)) {
    const CORE_DATA_EPOCH = 978307200 // 2001-01-01T00:00:00Z in Unix seconds
    let unixMs: number
    if (raw > 1e12) {
      // Già in millisecondi
      unixMs = raw
    } else if (raw > 1e9) {
      // Secondi Unix normali
      unixMs = raw * 1000
    } else {
      // Secondi Core Data (dal 2001)
      unixMs = (raw + CORE_DATA_EPOCH) * 1000
    }
    const d = new Date(unixMs)
    if (!isNaN(d.getTime())) iso = d.toISOString().slice(0, 10)
  } else if (typeof raw === 'string' && raw.trim()) {
    const d = new Date(raw.trim())
    if (!isNaN(d.getTime())) iso = d.toISOString().slice(0, 10)
  }

  if (!iso || iso < MIN_DATE || iso > MAX_DATE) return MIN_DATE
  return iso
}

// ─── Helpers ────────────────────────────────────────────

// ─── Parser SQLite ───────────────────────────────────────

type SqlRow = Record<string, unknown>

async function parseSqlite(dbBytes: Uint8Array): Promise<RawTransaction[]> {
  const initSqlJs = (await import('sql.js')).default
  const SQL = await initSqlJs({ locateFile: () => `${import.meta.env.BASE_URL}sql-wasm.wasm` })
  const db = new SQL.Database(dbBytes)

  function queryAll(sql: string): SqlRow[] {
    try {
      const res = db.exec(sql)
      if (!res[0]) return []
      const { columns, values } = res[0]
      return values.map((row) =>
        Object.fromEntries(columns.map((col, i) => [col, row[i]])),
      )
    } catch {
      return []
    }
  }

  // Lista tabelle disponibili
  const tableRes = db.exec("SELECT name FROM sqlite_master WHERE type='table'")
  const tables: string[] = tableRes[0]?.values.map((r) => String(r[0]).toLowerCase()) ?? []
  console.log('[MoneyPlus] Tabelle trovate:', tables)

  // ── Schema MoneyPlus: tabella "bill" con join "category" ──
  if (tables.includes('bill')) {
    const rows = queryAll(`
      SELECT
        b.id,
        b.bill_type,
        b.money,
        b.createtime,
        b.name       AS bill_name,
        b.note,
        c.name       AS category_name
      FROM bill b
      LEFT JOIN category c ON c.id = b.category_id
      LIMIT 5000
    `)
    console.log('[MoneyPlus] Pattern bill rows:', rows.length, rows[0])
    if (rows.length > 0) {
      return rows
        .filter((r) => Number(r.bill_type) === 1 || Number(r.bill_type) === 2) // 1=uscita 2=entrata
        .map((r) => {
          const billType = Number(r.bill_type)
          // amount: uscita = negativo, entrata = positivo
          const amount = billType === 2
            ? Math.abs(Number(r.money))
            : -Math.abs(Number(r.money))
          const catName = String(r.category_name ?? r.bill_name ?? '')
          const description = String(r.note ?? '').trim()
          return {
            date: parseTimestamp(r.createtime),
            amount,
            description,
            category: catName,
          }
        })
    }
  }

  // ── Pattern 2: tabella "transactions" diretta ──────────
  if (tables.includes('transactions')) {
    const rows = queryAll('SELECT * FROM transactions LIMIT 2000')
    console.log('[MoneyPlus] Pattern2 transactions rows:', rows.length, rows[0])
    if (rows.length > 0) {
      return rows.map((r) => {
        const amount = Number(r.amount ?? r.value ?? r.price ?? 0)
        return {
          date: parseTimestamp(r.date ?? r.created_at ?? r.timestamp),
          amount,
          description: String(r.note ?? r.description ?? r.title ?? r.memo ?? ''),
          category: String(r.category ?? r.category_name ?? ''),
        }
      })
    }
  }

  // ── Pattern 3: Core Data ZTRANSACTION ─────────────────
  const coreDataTable = tables.find((t) => t.includes('ztransaction') || t.includes('z_transaction'))
  if (coreDataTable) {
    const rows = queryAll(`SELECT * FROM ${coreDataTable} LIMIT 2000`)
    if (rows.length > 0) {
      const catCol = Object.keys(rows[0]).find((k) =>
        k.toLowerCase().includes('categor') || k.toLowerCase().includes('type'),
      )
      return rows.map((r) => {
        const amount = Number(r.ZAMOUNT ?? r.zamount ?? r.ZVALUE ?? r.zvalue ?? 0)
        return {
          date: parseTimestamp(r.ZDATE ?? r.zdate ?? r.ZTIMESTAMP ?? r.ztimestamp),
          amount,
          description: String(r.ZNOTE ?? r.znote ?? r.ZTITLE ?? r.ztitle ?? r.ZMEMO ?? r.zmemo ?? ''),
          category: catCol ? String(r[catCol] ?? '') : '',
        }
      })
    }
  }

  db.close()
  return []
}

// ─── Componente ─────────────────────────────────────────

interface MoneyPlusImporterProps {
  onDone: () => void
}

function MoneyPlusImporter({ onDone }: MoneyPlusImporterProps) {
  const [step, setStep] = useState<ImportStep>('idle')
  const [preview, setPreview] = useState<PreviewTransaction[]>([])
  const [error, setError] = useState('')
  const [metaInfo, setMetaInfo] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setStep('loading')
    setError('')

    try {
      const buffer = await file.arrayBuffer()
      const zipData = new Uint8Array(buffer)

      // Unzip
      const files = unzipSync(zipData)

      // Leggi meta.json se presente
      if (files['meta.json']) {
        try {
          const meta = JSON.parse(new TextDecoder().decode(files['meta.json'])) as Record<string, unknown>
          const parts: string[] = []
          if (meta.appName) parts.push(String(meta.appName))
          if (meta.version) parts.push(`v${meta.version}`)
          if (meta.exportDate) parts.push(String(meta.exportDate).slice(0, 10))
          setMetaInfo(parts.join(' · '))
        } catch { /* ignora errori meta */ }
      }

      // Trova il file .db
      const dbEntry = Object.keys(files).find((n) => n.endsWith('.db'))
      if (!dbEntry) throw new Error('Nessun database trovato nello ZIP')

      const raw = await parseSqlite(files[dbEntry])
      if (raw.length === 0) throw new Error('Nessuna transazione trovata nel database')

      // Costruisci set di chiavi già presenti in Hermes per deduplicazione
      const existingKeys = new Set(
        loadTransactions().map((t) => `${t.date}|${t.amount}|${t.type}`),
      )

      // Converti in formato Hermes preview
      const mapped: PreviewTransaction[] = raw
        .filter((r) => r.amount !== 0)
        .map((r) => {
          const hermesType: 'entrata' | 'uscita' = r.amount >= 0 ? 'entrata' : 'uscita'
          const amount = Math.abs(r.amount)
          const isDuplicate = existingKeys.has(`${r.date}|${amount}|${hermesType}`)
          return {
            ...r,
            amount,
            hermesType,
            hermesCategory: mapMoneyPlusCategory(r.category, hermesType),
            isDuplicate,
          }
        })
        .sort((a, b) => b.date.localeCompare(a.date))

      console.log('[MoneyPlus] Raw parsed:', raw.slice(0, 3))
      console.log('[MoneyPlus] Mapped preview:', mapped.slice(0, 3))

      setPreview(mapped)
      // Pre-seleziona solo le transazioni non duplicate
      setSelected(new Set(mapped.map((_, i) => i).filter((i) => !mapped[i].isDuplicate)))
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      setStep('error')
    }

    // Reset input per permettere ri-caricamento dello stesso file
    e.target.value = ''
  }, [])

  function handleImport() {
    let imported = 0
    preview.forEach((tx, i) => {
      if (!selected.has(i)) return
      const hermesTx: Transaction = {
        id: generateId(),
        type: tx.hermesType,
        description: tx.description || tx.hermesCategory,
        amount: tx.amount,
        date: tx.date,
        category: tx.hermesCategory,
        recurring: false,
        recurringMonths: 0,
      }
      addTransaction(hermesTx)
      imported++
    })
    setStep('done')
    setTimeout(() => {
      onDone()
    }, 1500)
    // Aggiorna contatore per mostrare quante
    setMetaInfo(`${imported} transazioni importate`)
  }

  function toggleAll() {
    if (selected.size === preview.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(preview.map((_, i) => i)))
    }
  }

  function toggleOne(i: number) {
    const next = new Set(selected)
    if (next.has(i)) next.delete(i)
    else next.add(i)
    setSelected(next)
  }

  // ─── Render ─────────────────────────────────────────────

  const borderStyle = { borderBottom: '1px solid var(--border)' }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9200,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: '560px',
          maxHeight: '90dvh', overflowY: 'auto',
          borderRadius: '22px',
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={borderStyle}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Importa da MoneyPlus
            </h2>
            {metaInfo && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{metaInfo}</p>
            )}
          </div>
          <button
            onClick={onDone}
            className="w-8 h-8 flex items-center justify-center rounded-full transition"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">

          {/* STEP: idle / error — seleziona file */}
          {(step === 'idle' || step === 'error') && (
            <>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Seleziona il file <strong style={{ color: 'var(--text-primary)' }}>.MoneyPlusPack</strong> esportato dall'app MoneyPlus.
              </p>
              <p className="text-xs rounded-xl p-3" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}>
                🐟 <strong>iPhone:</strong> apri il file in Dropbox/Files → tocca Condividi → <em>Salva su File</em> → poi selezionalo qui.
              </p>
              {step === 'error' && (
                <p className="text-sm rounded-xl p-3" style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  ❌ {error}
                </p>
              )}
              <label
                className="flex flex-col items-center justify-center gap-2 w-full py-8 rounded-xl cursor-pointer transition active:scale-95"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '2px dashed var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                <span className="text-3xl">📦</span>
                <span className="text-sm font-medium">Seleziona .MoneyPlusPack</span>
                <input
                  type="file"
                  accept=".MoneyPlusPack,.zip,application/zip,application/octet-stream,*/*"
                  style={{ display: 'none' }}
                  onChange={handleFile}
                />
              </label>
            </>
          )}

          {/* STEP: loading */}
          {step === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div
                className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
              />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Lettura database in corso…
              </p>
            </div>
          )}

          {/* STEP: preview */}
          {step === 'preview' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {preview.length} trovate{preview.filter((t) => t.isDuplicate).length > 0 && ` · ${preview.filter((t) => t.isDuplicate).length} già importate`}
                </p>
                <button
                  onClick={toggleAll}
                  className="text-xs px-3 py-1 rounded-full transition"
                  style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-light)' }}
                >
                  {selected.size === preview.length ? 'Deseleziona tutto' : 'Seleziona tutto'}
                </button>
              </div>

              <div
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--border)', maxHeight: '320px', overflowY: 'auto' }}
              >
                {preview.map((tx, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition"
                    style={{
                      borderBottom: i < preview.length - 1 ? '1px solid var(--border)' : 'none',
                      backgroundColor: selected.has(i) ? 'transparent' : 'rgba(0,0,0,0.15)',
                      opacity: selected.has(i) ? 1 : 0.45,
                    }}
                    onClick={() => toggleOne(i)}
                  >
                    <div
                      className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center"
                      style={{
                        backgroundColor: selected.has(i) ? 'var(--accent)' : 'var(--bg-secondary)',
                        border: `1.5px solid ${selected.has(i) ? 'var(--accent)' : 'var(--border)'}`,
                      }}
                    >
                      {selected.has(i) && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {tx.description || tx.hermesCategory}
                        </p>
                        {tx.isDuplicate && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{ backgroundColor: 'rgba(234,179,8,0.15)', color: '#ca8a04', fontSize: '10px' }}
                          >
                            già importata
                          </span>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {tx.date} · {tx.hermesCategory}
                      </p>
                    </div>
                    <span
                      className="text-sm font-bold flex-shrink-0"
                      style={{ color: tx.hermesType === 'entrata' ? 'var(--accent)' : '#ef4444' }}
                    >
                      {tx.hermesType === 'entrata' ? '+' : '-'}{tx.amount.toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleImport}
                disabled={selected.size === 0}
                className="w-full py-3 rounded-xl font-bold text-sm transition active:scale-95"
                style={{
                  background: selected.size > 0 ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: selected.size > 0 ? 'var(--fab-text)' : 'var(--text-muted)',
                  opacity: selected.size > 0 ? 1 : 0.5,
                  cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                Importa {selected.size} transazioni
              </button>
            </>
          )}

          {/* STEP: done */}
          {step === 'done' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <span className="text-4xl">✅</span>
              <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Importazione completata
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{metaInfo}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default MoneyPlusImporter
