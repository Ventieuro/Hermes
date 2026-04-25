/**
 * ReceiptScanner — Scanner OCR di scontrini fiscali italiani.
 *
 * Funzionalità:
 *  - Fotocamera con barre guida verticali per allineamento scontrino
 *  - Upload/scatto di più foto con merge OCR automatico
 *  - Risultati parziali visibili in tempo reale durante l'analisi
 *  - Tabella completamente editabile: modifica, elimina, aggiungi righe
 *  - Barra progresso somma → totale; badge "Approvato" al raggiungimento
 *  - Categoria unica selezionabile per tutti gli articoli importati
 */

import { useReducer, useRef, useEffect } from 'react'
import { createWorker } from 'tesseract.js'
import { processImage, parseReceiptText, type ReceiptItem } from '../shared/receiptUtils'
import { addTransaction, generateId } from '../shared/storage'
import { OCR, getCanonicalCategories } from '../shared/labels'
import { getCategoryIcon } from '../shared/categoryIcons'

// ─── Stato con useReducer ─────────────────────────────────

type Fase = 'input' | 'camera' | 'elaborazione' | 'risultati'

interface ScanState {
  fase: Fase
  foto: File[]
  progress: number
  fotoCorrente: number
  articoli: ReceiptItem[]
  totale: number | null
  totaleValido: boolean
  categoriaSelezionata: string
  errore: string | null
}

type ScanAction =
  | { type: 'AGGIUNGI_FOTO'; files: File[] }
  | { type: 'RIMUOVI_FOTO'; index: number }
  | { type: 'APRI_CAMERA' }
  | { type: 'CHIUDI_CAMERA' }
  | { type: 'AVVIA_ELABORAZIONE' }
  | { type: 'AGGIORNA_PROGRESS'; progress: number; fotoCorrente: number }
  | { type: 'AGGIORNA_PARZIALE'; articoli: ReceiptItem[]; totale: number | null; totaleValido: boolean }
  | { type: 'SET_RISULTATI'; articoli: ReceiptItem[]; totale: number | null; totaleValido: boolean }
  | { type: 'SET_ERRORE'; errore: string }
  | { type: 'MODIFICA_NOME'; id: string; valore: string }
  | { type: 'MODIFICA_PREZZO'; id: string; valore: string }
  | { type: 'RIMUOVI_ARTICOLO'; id: string }
  | { type: 'AGGIUNGI_ARTICOLO_MANUALE' }
  | { type: 'SET_CATEGORIA'; categoria: string }
  | { type: 'MODIFICA_TOTALE'; valore: string }
  | { type: 'RESET' }

const STATO_INIZIALE: ScanState = {
  fase: 'input',
  foto: [],
  progress: 0,
  fotoCorrente: 0,
  articoli: [],
  totale: null,
  totaleValido: false,
  categoriaSelezionata: 'Spesa',
  errore: null,
}

function scanReducer(state: ScanState, action: ScanAction): ScanState {
  switch (action.type) {
    case 'AGGIUNGI_FOTO':
      return { ...state, foto: [...state.foto, ...action.files], errore: null }

    case 'RIMUOVI_FOTO':
      return { ...state, foto: state.foto.filter((_, i) => i !== action.index) }

    case 'APRI_CAMERA':
      return { ...state, fase: 'camera' }

    case 'CHIUDI_CAMERA':
      return { ...state, fase: 'input' }

    case 'AVVIA_ELABORAZIONE':
      return { ...state, fase: 'elaborazione', progress: 0, fotoCorrente: 0, articoli: [], totale: null, totaleValido: false, errore: null }

    case 'AGGIORNA_PROGRESS':
      return { ...state, progress: action.progress, fotoCorrente: action.fotoCorrente }

    case 'AGGIORNA_PARZIALE':
      return { ...state, articoli: action.articoli, totale: action.totale, totaleValido: action.totaleValido }

    case 'SET_RISULTATI':
      return {
        ...state,
        fase: 'risultati',
        articoli: action.articoli,
        totale: action.totale,
        totaleValido: action.totaleValido,
      }

    case 'SET_ERRORE':
      return { ...state, fase: 'input', errore: action.errore }

    case 'MODIFICA_NOME':
      return {
        ...state,
        articoli: state.articoli.map((a) =>
          a.id === action.id ? { ...a, name: action.valore } : a,
        ),
      }

    case 'MODIFICA_PREZZO': {
      const price = parseFloat(action.valore.replace(',', '.'))
      return {
        ...state,
        articoli: state.articoli.map((a) =>
          a.id === action.id ? { ...a, price: isNaN(price) ? a.price : price } : a,
        ),
      }
    }

    case 'RIMUOVI_ARTICOLO':
      return { ...state, articoli: state.articoli.filter((a) => a.id !== action.id) }

    case 'AGGIUNGI_ARTICOLO_MANUALE':
      return { ...state, articoli: [...state.articoli, { id: crypto.randomUUID(), name: '', price: 0 }] }

    case 'MODIFICA_TOTALE': {
      const newTotale = parseFloat(action.valore.replace(',', '.'))
      if (isNaN(newTotale) || newTotale <= 0) return state
      return { ...state, totale: newTotale }
    }

    case 'SET_CATEGORIA':
      return { ...state, categoriaSelezionata: action.categoria }

    case 'RESET':
      return STATO_INIZIALE

    default:
      return state
  }
}

// ─── Helpers ────────────────────────────────────────────

function formatEuro(n: number) {
  return n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}

// ─── Componente principale ───────────────────────────────

interface ReceiptScannerProps {
  onClose: () => void
  /** Chiamata dopo che le transazioni sono state create */
  onDone: () => void
}

function ReceiptScanner({ onClose, onDone }: ReceiptScannerProps) {
  const [state, dispatch] = useReducer(scanReducer, STATO_INIZIALE)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const today = new Date().toISOString().slice(0, 10)

  const categorieUscita = getCanonicalCategories('uscita')

  // ── Somma corrente degli articoli ──────────────────
  const sommaArticoli = parseFloat(
    state.articoli.reduce((acc, a) => acc + a.price, 0).toFixed(2),
  )
  const progressoPerc = state.totale ? Math.min(100, Math.round((sommaArticoli / state.totale) * 100)) : 0
  const approvatoScontrino = state.totale !== null && Math.abs(sommaArticoli - state.totale) <= 0.02

  // ── Setup camera quando la fase diventa 'camera' ──────
  useEffect(() => {
    if (state.fase !== 'camera') return
    navigator.mediaDevices?.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
    }).then(stream => {
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {/* autoplay policy */})
      }
    }).catch(() => {
      dispatch({ type: 'CHIUDI_CAMERA' })
    })
  }, [state.fase])

  // ── Cleanup stream all'unmount ─────────────────────
  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  // ── Apri fotocamera (o fallback al file picker) ──────
  function aprireCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      fileInputRef.current?.click()
      return
    }
    dispatch({ type: 'APRI_CAMERA' })
  }

  function chiudiCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    dispatch({ type: 'CHIUDI_CAMERA' })
  }

  function scattaFoto() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      if (!blob) return
      const file = new File([blob], `scontrino-${Date.now()}.jpg`, { type: 'image/jpeg' })
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      dispatch({ type: 'AGGIUNGI_FOTO', files: [file] })
      dispatch({ type: 'CHIUDI_CAMERA' })
    }, 'image/jpeg', 0.92)
  }

  // ── Gestione input file ──────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) dispatch({ type: 'AGGIUNGI_FOTO', files })
    e.target.value = '' // Permette di selezionare di nuovo lo stesso file
  }

  // ── Avvia OCR su tutte le foto ───────────────────────
  async function handleAnalizza() {
    if (state.foto.length === 0) return
    dispatch({ type: 'AVVIA_ELABORAZIONE' })

    try {
      let testoCompleto = ''
      const n = state.foto.length

      for (let i = 0; i < n; i++) {
        dispatch({ type: 'AGGIORNA_PROGRESS', progress: Math.round((i / n) * 100), fotoCorrente: i })

        // Pre-processing canvas: scala di grigi + contrasto
        const dataUrl = await processImage(state.foto[i])

        // Riconoscimento OCR (italiano + inglese per fallback)
        const worker = await createWorker(['ita', 'eng'], 1, {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const p = Math.round(((i + m.progress) / n) * 100)
              dispatch({ type: 'AGGIORNA_PROGRESS', progress: p, fotoCorrente: i })
            }
          },
        })
        const { data: { text } } = await worker.recognize(dataUrl)
        await worker.terminate()

        // Concatena i testi delle varie foto (merge)
        testoCompleto += '\n' + text
      }

      const { items, total, isValid } = parseReceiptText(testoCompleto)
      dispatch({ type: 'SET_RISULTATI', articoli: items, totale: total, totaleValido: isValid })
    } catch {
      dispatch({ type: 'SET_ERRORE', errore: OCR.errore })
    }
  }

  // ── Crea una transazione per ogni articolo ───────────
  function handleCreaArticoli() {
    state.articoli.forEach((item) => {
      addTransaction({
        id: generateId(),
        type: 'uscita',
        description: item.name || state.categoriaSelezionata,
        amount: item.price,
        date: today,
        category: state.categoriaSelezionata,
        recurring: false,
        recurringMonths: 0,
      })
    })
    onDone()
    onClose()
  }

  // ── Crea un'unica transazione con il totale ──────────
  function handleCreaTotale() {
    addTransaction({
      id: generateId(),
      type: 'uscita',
      description: 'Scontrino',
      amount: state.totale ?? sommaArticoli,
      date: today,
      category: state.categoriaSelezionata,
      recurring: false,
      recurringMonths: 0,
    })
    onDone()
    onClose()
  }

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────

  // ── FASE: CAMERA ─────────────────────────────────
  if (state.fase === 'camera') {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9200, background: '#000', display: 'flex', flexDirection: 'column' }}>

        {/* Live preview + overlay guida */}
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Overlay con barre verticali e zone scure */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'stretch', pointerEvents: 'none' }}>
            <div style={{ flex: '0 0 14%', background: 'rgba(0,0,0,0.52)' }} />
            <div style={{ width: '2px', flexShrink: 0, background: 'rgba(255,255,255,0.9)', boxShadow: '0 0 10px rgba(255,255,255,0.7)' }} />
            {/* Centro: area scontrino con angolini */}
            <div style={{ flex: 1, position: 'relative' }}>
              {([{ top: 0, left: 0 }, { top: 0, right: 0 }, { bottom: 0, left: 0 }, { bottom: 0, right: 0 }] as const).map((pos, i) => (
                <div key={i} style={{
                  position: 'absolute', ...pos, width: '22px', height: '22px',
                  borderTop: ('top' in pos) ? '3px solid #fff' : 'none',
                  borderBottom: ('bottom' in pos) ? '3px solid #fff' : 'none',
                  borderLeft: ('left' in pos) ? '3px solid #fff' : 'none',
                  borderRight: ('right' in pos) ? '3px solid #fff' : 'none',
                }} />
              ))}
            </div>
            <div style={{ width: '2px', flexShrink: 0, background: 'rgba(255,255,255,0.9)', boxShadow: '0 0 10px rgba(255,255,255,0.7)' }} />
            <div style={{ flex: '0 0 14%', background: 'rgba(0,0,0,0.52)' }} />
          </div>

          {/* Testo guida */}
          <div style={{
            position: 'absolute',
            top: 'max(16px, env(safe-area-inset-top, 16px))',
            left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.6)', borderRadius: '20px',
            padding: '6px 18px', color: '#fff', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            {OCR.guidaAllineamento}
          </div>
        </div>

        {/* Controlli fotocamera */}
        <div style={{
          background: '#111', padding: '20px 40px',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button onClick={chiudiCamera}
            style={{ background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '10px 20px', borderRadius: '12px' }}>
            {OCR.chiudiCamera}
          </button>
          {/* Pulsante scatto */}
          <button onClick={scattaFoto}
            style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#fff', border: '5px solid rgba(255,255,255,0.35)', cursor: 'pointer', outline: 'none', boxShadow: '0 0 0 4px rgba(255,255,255,0.2)' }}
            aria-label={OCR.scatta}
          />
          <div style={{ width: '60px' }} />
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9100,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: '100%', maxWidth: '520px',
          maxHeight: '90dvh', overflowY: 'auto',
          borderRadius: '22px',
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* ── Header ──────────────────────────────────── */}
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {OCR.titolo}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">

          {/* ── FASE: INPUT ──────────────────────────── */}
          {(state.fase === 'input') && (
            <>
              {/* Griglia anteprime foto */}
              {state.foto.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {state.foto.map((file, idx) => (
                    <div key={idx} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Foto ${idx + 1}`}
                        style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block' }}
                      />
                      <button
                        onClick={() => dispatch({ type: 'RIMUOVI_FOTO', index: idx })}
                        style={{
                          position: 'absolute', top: '4px', right: '4px',
                          width: '22px', height: '22px', borderRadius: '50%',
                          background: 'rgba(0,0,0,0.6)', color: '#fff',
                          border: 'none', cursor: 'pointer', fontSize: '11px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        aria-label={OCR.rimuoviFoto}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input file nascosto */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {/* Pulsanti camera + carica file */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={aprireCamera}
                  className="py-3 rounded-xl font-bold text-sm transition active:scale-95"
                  style={{ background: 'var(--accent)', color: 'var(--fab-text)', border: 'none', cursor: 'pointer' }}
                >
                  📷 {OCR.scatta}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3 rounded-xl font-semibold text-sm transition active:scale-95"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  🖼️ {state.foto.length > 0 ? OCR.nuovaFoto : OCR.aggiungi}
                </button>
              </div>

              {/* Errore */}
              {state.errore && (
                <p className="text-sm text-center" style={{ color: '#ef4444' }}>{state.errore}</p>
              )}

              {/* Pulsante analizza */}
              <button
                onClick={handleAnalizza}
                disabled={state.foto.length === 0}
                className="w-full py-3 rounded-xl font-bold text-sm transition active:scale-95"
                style={{
                  background: state.foto.length > 0 ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: state.foto.length > 0 ? 'var(--fab-text)' : 'var(--text-muted)',
                  cursor: state.foto.length > 0 ? 'pointer' : 'not-allowed',
                  opacity: state.foto.length > 0 ? 1 : 0.5,
                }}
              >
                {OCR.analizza}
              </button>
            </>
          )}

          {/* ── FASE: ELABORAZIONE ───────────────────── */}
          {state.fase === 'elaborazione' && (
            <>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-center" style={{ color: 'var(--text-primary)' }}>
                  {OCR.elaborazione}
                  {state.foto.length > 1 && ` · ${OCR.fotoLabel(state.fotoCorrente + 1, state.foto.length)}`}
                </p>
                <div style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '3px', background: 'var(--accent)', width: `${state.progress}%`, transition: 'width 0.3s ease' }} />
                </div>
                <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>{state.progress}%</p>
              </div>

              {/* Risultati parziali in tempo reale */}
              {state.articoli.length > 0 && (
                <>
                  <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    {OCR.parzialeMentre}
                  </p>
                  <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', padding: '8px 12px', background: 'var(--bg-secondary)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <span>{OCR.colonnaArticolo}</span>
                      <span style={{ textAlign: 'right' }}>{OCR.colonnaPrezzo}</span>
                    </div>
                    {state.articoli.map((item, idx) => (
                      <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px', padding: '5px 12px', borderBottom: idx < state.articoli.length - 1 ? '1px solid var(--border)' : 'none', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name || '—'}</span>
                        <span style={{ textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{formatEuro(item.price)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', padding: '7px 12px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <span>Totale</span>
                      <span style={{ textAlign: 'right' }}>{formatEuro(sommaArticoli)}</span>
                    </div>
                  </div>
                  {state.totale !== null && (
                    <p className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>
                      {OCR.totaleRilevato}: <strong style={{ color: 'var(--text-primary)' }}>{formatEuro(state.totale)}</strong>
                    </p>
                  )}
                </>
              )}
            </>
          )}

          {/* ── FASE: RISULTATI ──────────────────────── */}
          {state.fase === 'risultati' && (
            <>
              {/* Barra progresso somma → totale */}
              {state.totale !== null ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    <span>{formatEuro(sommaArticoli)}</span>
                    <span>{OCR.totaleRilevato}: <strong style={{ color: 'var(--text-primary)' }}>{formatEuro(state.totale)}</strong></span>
                  </div>
                  <div style={{ height: '10px', borderRadius: '5px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '5px', background: approvatoScontrino ? '#22c55e' : 'var(--accent)', width: `${progressoPerc}%`, transition: 'width 0.5s ease' }} />
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, textAlign: 'center', color: approvatoScontrino ? '#16a34a' : 'var(--text-muted)' }}>
                    {approvatoScontrino ? OCR.approvatoScontrino : OCR.sommaNonValida}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>{OCR.nessunTotale}</p>
              )}

              {/* Nessun articolo */}
              {state.articoli.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  {OCR.nessunArticolo}
                </p>
              )}

              {/* Tabella articoli editabile */}
              {state.articoli.length > 0 && (
                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  {/* Intestazione */}
                  <div
                    className="grid text-xs font-semibold uppercase"
                    style={{
                      gridTemplateColumns: '1fr 80px 32px',
                      padding: '8px 12px',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-muted)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <span>{OCR.colonnaArticolo}</span>
                    <span style={{ textAlign: 'right' }}>{OCR.colonnaPrezzo}</span>
                    <span />
                  </div>

                  {/* Righe articoli */}
                  {state.articoli.map((item, idx) => (
                    <div
                      key={item.id}
                      className="grid items-center"
                      style={{
                        gridTemplateColumns: '1fr 80px 32px',
                        padding: '5px 8px',
                        borderBottom: idx < state.articoli.length - 1 ? '1px solid var(--border)' : 'none',
                        gap: '6px',
                      }}
                    >
                      {/* Nome articolo */}
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => dispatch({ type: 'MODIFICA_NOME', id: item.id, valore: e.target.value })}
                        style={{
                          fontSize: '13px',
                          background: 'var(--input-bg)',
                          border: '1px solid var(--input-border)',
                          borderRadius: '8px',
                          padding: '4px 8px',
                          outline: 'none',
                          color: 'var(--text-primary)',
                          width: '100%',
                          minWidth: 0,
                        }}
                      />
                      {/* Prezzo */}
                      <input
                        type="text"
                        inputMode="decimal"
                        value={item.price.toFixed(2).replace('.', ',')}
                        onChange={(e) => dispatch({ type: 'MODIFICA_PREZZO', id: item.id, valore: e.target.value })}
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          textAlign: 'right',
                          background: 'var(--input-bg)',
                          border: '1px solid var(--input-border)',
                          borderRadius: '8px',
                          padding: '4px 6px',
                          outline: 'none',
                          color: 'var(--text-primary)',
                          width: '100%',
                        }}
                      />
                      {/* Elimina riga */}
                      <button
                        onClick={() => dispatch({ type: 'RIMUOVI_ARTICOLO', id: item.id })}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: '14px', color: 'var(--text-muted)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        aria-label="Rimuovi articolo"
                      >🗑</button>
                    </div>
                  ))}

                  {/* Riga totale calcolato (+ totale letto se diversi) */}
                  <div
                    className="grid items-center font-bold"
                    style={{
                      gridTemplateColumns: '1fr 80px 32px',
                      padding: '8px 12px',
                      background: 'var(--bg-secondary)',
                      borderTop: '1px solid var(--border)',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span>{state.totale !== null && !approvatoScontrino ? OCR.totaleCalcolato : 'Totale'}</span>
                    <span style={{ textAlign: 'right' }}>{formatEuro(sommaArticoli)}</span>
                    <span />
                  </div>
                  {state.totale !== null && !approvatoScontrino && (
                    <div
                      className="grid items-center font-bold"
                      style={{
                        gridTemplateColumns: '1fr 80px 32px',
                        padding: '6px 12px',
                        background: 'var(--bg-secondary)',
                        borderTop: '1px solid var(--border)',
                        fontSize: '13px',
                        color: '#ef4444',
                      }}
                    >
                      <span>{OCR.totaleRilevato}</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        key={state.totale}
                        defaultValue={state.totale.toFixed(2).replace('.', ',')}
                        onBlur={(e) => dispatch({ type: 'MODIFICA_TOTALE', valore: e.target.value })}
                        style={{
                          fontSize: '13px', fontWeight: 700,
                          textAlign: 'right',
                          background: 'var(--input-bg)',
                          border: '1px solid #ef4444',
                          borderRadius: '8px', padding: '4px 6px',
                          color: '#ef4444', outline: 'none',
                          width: '100%',
                        }}
                      />
                      <span />
                    </div>
                  )}
                </div>
              )}

              {/* Aggiungi riga manuale */}
              <button
                onClick={() => dispatch({ type: 'AGGIUNGI_ARTICOLO_MANUALE' })}
                style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '2px dashed var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}
              >
                {OCR.aggiungiManuale}
              </button>

              {/* Selezione categoria */}
              {state.articoli.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                    {OCR.categoriaLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categorieUscita.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => dispatch({ type: 'SET_CATEGORIA', categoria: cat })}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition"
                        style={{
                          background: state.categoriaSelezionata === cat
                            ? 'var(--accent)'
                            : 'var(--bg-secondary)',
                          color: state.categoriaSelezionata === cat
                            ? 'var(--fab-text)'
                            : 'var(--text-secondary)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <span>{getCategoryIcon(cat)}</span>
                        <span>{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pulsanti azione */}
              {state.articoli.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCreaTotale}
                    className="py-3 rounded-xl text-sm font-semibold transition active:scale-95"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {OCR.creaTotale}
                  </button>
                  <button
                    onClick={handleCreaArticoli}
                    className="py-3 rounded-xl text-sm font-bold transition active:scale-95"
                    style={{ background: 'var(--accent)', color: 'var(--fab-text)' }}
                  >
                    {OCR.creaArticoli(state.articoli.length)}
                  </button>
                </div>
              )}

              {/* Bottone riprova */}
              <button
                onClick={() => dispatch({ type: 'RESET' })}
                className="w-full py-2 text-sm transition"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {OCR.tornaIndietro}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default ReceiptScanner
