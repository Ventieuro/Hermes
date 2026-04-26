/**
 * Utility per il parsing degli scontrini fiscali italiani.
 *
 * Esporta:
 *  - ReceiptItem        → singolo articolo estratto
 *  - ParsedReceipt      → risultato completo del parsing
 *  - processImage()     → pre-processing canvas (contrasto + scala di grigi)
 *  - parseReceiptText() → trasforma testo OCR grezzo in array di ReceiptItem
 */

// ─── Tipi ────────────────────────────────────────────────

export interface ReceiptItem {
  id: string
  name: string
  price: number
  /** Numero di pezzi, se la riga precedente era "N × prezzo_unitario" */
  qty?: number
  /** Prezzo unitario, se la riga precedente era "N × prezzo_unitario" */
  unitPrice?: number
  /** Confidenza del prezzo: 'uncertain' = verificare manualmente */
  confidence?: 'ok' | 'uncertain'
  /** Motivo dell'incertezza sul prezzo */
  uncertainReason?: 'iva8' | 'linea_rumorosa' | 'moltiplicatore_errato'
}

export interface ParsedReceipt {
  items: ReceiptItem[]
  total: number | null
  /** true se la somma degli articoli corrisponde al totale (±2 centesimi) */
  isValid: boolean
  /** Data dello scontrino in formato ISO yyyy-mm-dd, se rilevata */
  date?: string
}

// ─── Pre-processing immagine (Canvas) ────────────────────

/**
 * Converte il file immagine in un data URL PNG pre-processato:
 * scala di grigi + aumento del contrasto per migliorare il riconoscimento OCR.
 *
 * Ridimensiona l'immagine se supera MAX_DIM px sul lato più lungo,
 * per mantenere performance accettabili su mobile.
 */
export function processImage(file: File): Promise<string> {
  const MAX_DIM = 2400

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      // ── Ridimensionamento opzionale ───────────────────
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w > MAX_DIM || h > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / w, MAX_DIM / h)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error('Canvas non supportato')); return }

      ctx.drawImage(img, 0, 0, w, h)

      // ── Scala di grigi + contrasto ────────────────────
      const imgData = ctx.getImageData(0, 0, w, h)
      const data = imgData.data
      for (let i = 0; i < data.length; i += 4) {
        // Luminosità percepita (formula BT.601)
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
        // Aumento contrasto: spinge i valori verso i poli
        const factor = 1.6
        const contrasted = Math.min(255, Math.max(0, Math.round((gray - 128) * factor + 128)))
        data[i] = data[i + 1] = data[i + 2] = contrasted
        // alpha invariato
      }
      ctx.putImageData(imgData, 0, 0)

      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Impossibile caricare l\'immagine'))
    }

    img.src = url
  })
}

// ─── Parsing testo OCR ───────────────────────────────────

/**
 * Analizza il testo grezzo restituito da Tesseract e produce una lista
 * di articoli con nome e prezzo, più il totale se rilevato.
 *
 * Formato atteso degli scontrini italiani:
 *   DESCRIZIONE ARTICOLO          1,50 A
 *   TOTALE                       24,90
 *
 * Gestisce:
 *  - prezzi con virgola italiana (1,50) o punto (1.50)
 *  - riga TOTALE / TOT. / IMPORTO
 *  - suffisso IVA (A/B/C/D) dopo il prezzo
 *  - righe moltiplicatore "N × prezzo_unitario" → annotate sull'articolo successivo
 *  - estrazione data dallo scontrino (dd/mm/yyyy, dd-mm-yyyy, yyyy-mm-dd)
 *  - righe non pertinenti (intestazione, P.IVA, ecc.)
 */
export function parseReceiptText(rawText: string): ParsedReceipt {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const items: ReceiptItem[] = []
  let total: number | null = null
  let date: string | undefined

  // Prezzo italiano: 1–4 cifre, virgola/punto, 2-3 decimali,
  // eventuale lettera IVA (A-D, inclusa D=22%), simbolo €, o OCR-misread (8 al posto di B)
  const priceRegex = /(\d{1,4}[,.]\d{2,3})\s*([ABCDabcd8€¢])?\s*$/

  // Parole chiave che identificano la riga TOTALE
  const totalKw = /\b(?:TOTALE?|TOT\.?|IMPORTO|TOTALE\s+EURO)\b/i

  // Riga moltiplicatore: "3 X 2,00" → qty=3, unitPrice=2.00
  // Cattura qty e prezzo unitario per associarli all'articolo successivo
  const qtyUnitRegex = /^(\d+)\s*[xX×][a-zA-Z]*\s*(\d{1,4}[,.]\d{2,3})/

  // Data: dd/mm/yyyy, dd-mm-yyyy, yyyy-mm-dd
  const dateRegex = /\b(\d{2})[\-\/](\d{2})[\-\/](\d{4})\b|\b(\d{4})[\-\/](\d{2})[\-\/](\d{2})\b/

  // Righe da ignorare (non sono articoli)
  // NOTA: non usare CARTA da sola — matcherebbe "CARTA IGIENICA" ecc.
  // Per il metodo di pagamento usare BANCOMAT o "CARTA DI CREDITO" / "MASTERCARD" / "VISA"
  const skipKw = /\b(?:SUBTOTALE|S\.TOTALE|IVA|SCONTO|SCONTI|RESTO|CONTANTE|BANCOMAT|MASTERCARD|VISA|PAGATO|PAGAMENTO|PUNTI|TESSERA|OPERATORE|CASSA|P\.?IVA|C\.?F\.?|SCONTRINO|FISCALE|CAMBIO|BORSINA|SACCHETTO|GRAZIE|ARRIVEDERCI|WWW\.|HTTP|TEL|FAX|EMAIL|ORARIO|APERTURA|DATA|ORA)\b/i

  // Stato: riga moltiplicatore in attesa di essere associata all'articolo successivo
  let pendingQty: number | undefined
  let pendingUnitPrice: number | undefined

  for (const line of lines) {
    // ── Cerca data (su tutte le righe, anche quelle skippate) ──
    if (!date) {
      const dm = line.match(dateRegex)
      if (dm) {
        if (dm[4]) {
          // yyyy-mm-dd
          date = `${dm[4]}-${dm[5]}-${dm[6]}`
        } else {
          // dd/mm/yyyy o dd-mm-yyyy → converti in ISO
          const [d, m, y] = [dm[1], dm[2], dm[3]]
          date = `${y}-${m}-${d}`
        }
      }
    }

    // ── Riga TOTALE (controlla PRIMA di skipKw) ──────────
    // Necessario perché "IMPORTO PAGATO" e simili contengono parole
    // presenti in skipKw (PAGATO) ma devono aggiornare il totale.
    const earlyMatch = line.match(priceRegex)
    if (earlyMatch && totalKw.test(line)) {
      const earlyPrice = parseFloat(parseFloat(earlyMatch[1].replace(',', '.')).toFixed(2))
      if (!isNaN(earlyPrice) && earlyPrice > 0 && earlyPrice <= 9999) {
        if (total === null || earlyPrice > total) total = earlyPrice
      }
      pendingQty = undefined; pendingUnitPrice = undefined
      continue
    }

    if (skipKw.test(line)) { pendingQty = undefined; pendingUnitPrice = undefined; continue }

    // ── Riga moltiplicatore "N × prezzo_unitario" ──
    const qtyMatch = line.match(qtyUnitRegex)
    if (qtyMatch) {
      pendingQty = parseInt(qtyMatch[1], 10)
      pendingUnitPrice = parseFloat(parseFloat(qtyMatch[2].replace(',', '.')).toFixed(2))
      continue
    }

    const match = line.match(priceRegex)
    if (!match) { pendingQty = undefined; pendingUnitPrice = undefined; continue }

    const priceStr = match[1].replace(',', '.')
    const ivaChar = match[2] ?? ''
    // Prezzi al peso hanno 3 decimali (es. 3.780 = 3,78€): arrotonda a 2
    const price = parseFloat(parseFloat(priceStr).toFixed(2))
    if (isNaN(price) || price <= 0 || price > 9999) { pendingQty = undefined; pendingUnitPrice = undefined; continue }

    // ── Riga TOTALE ──────────────────────────────────────
    if (totalKw.test(line)) {
      // Conserva il valore più alto trovato (alcuni scontrini stampano il totale più volte)
      if (total === null || price > total) total = price
      pendingQty = undefined; pendingUnitPrice = undefined
      continue
    }

    // ── Articolo ─────────────────────────────────────────
    // Il nome è tutto ciò che precede il prezzo nel testo
    const nameRaw = line.slice(0, match.index ?? line.length).trim()
    const name = nameRaw
      // Rimuove caratteri non alfanumerici di contorno (simboli OCR-spurii)
      .replace(/^[|\\/*~_^`#@_]+/, '')
      .replace(/[|\\/*~_^`#@_]+$/, '')
      .replace(/\s{2,}/g, ' ')
      .trim()

    if (name.length < 2) { pendingQty = undefined; pendingUnitPrice = undefined; continue }

    // ── Valutazione confidenza prezzo ────────────────────
    // '8' dopo il prezzo = probabile OCR misread di 'B' → zona cifre inaffidabile
    const reasonIva = ivaChar === '8'
    // '!' nel nome = suffisso IVA finito nel campo descrizione → riga OCR rumorosa
    const reasonNoise = name.endsWith('!') || name.startsWith('!')
    const itemUncertain = reasonIva || reasonNoise
    const itemReason = reasonIva ? 'iva8' as const
                     : reasonNoise ? 'linea_rumorosa' as const
                     : undefined

    const item: ReceiptItem = {
      id: crypto.randomUUID(),
      name,
      price,
      confidence: itemUncertain ? 'uncertain' : 'ok',
      ...(itemReason ? { uncertainReason: itemReason } : {}),
    }
    if (pendingQty !== undefined && pendingUnitPrice !== undefined) {
      item.qty = pendingQty
      item.unitPrice = pendingUnitPrice
      // Verifica moltiplicazione: se non torna il parser ha letto male qty o prezzo
      const expectedTotal = parseFloat((pendingQty * pendingUnitPrice).toFixed(2))
      if (Math.abs(expectedTotal - price) > 0.02) {
        item.confidence = 'uncertain'
        item.uncertainReason = item.uncertainReason ?? 'moltiplicatore_errato'
      }
    }
    items.push(item)
    pendingQty = undefined
    pendingUnitPrice = undefined
  }

  // ── Validazione somma vs totale ───────────────────────
  const sum = parseFloat(items.reduce((acc, i) => acc + i.price, 0).toFixed(2))
  const isValid = total !== null && Math.abs(sum - total) <= 0.02

  return { items, total, isValid, ...(date ? { date } : {}) }
}
