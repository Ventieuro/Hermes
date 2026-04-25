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
}

export interface ParsedReceipt {
  items: ReceiptItem[]
  total: number | null
  /** true se la somma degli articoli corrisponde al totale (±2 centesimi) */
  isValid: boolean
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
 *  - suffisso IVA (A/B/C) dopo il prezzo
 *  - righe non pertinenti (intestazione, P.IVA, ecc.)
 */
export function parseReceiptText(rawText: string): ParsedReceipt {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const items: ReceiptItem[] = []
  let total: number | null = null

  // Prezzo italiano: 1–4 cifre, virgola/punto, 2 decimali, eventuale lettera IVA
  const priceRegex = /(\d{1,4}[,.](?:\d{2}))\s*[ABCabc]?\s*$/

  // Parole chiave che identificano la riga TOTALE
  const totalKw = /\b(?:TOTALE?|TOT\.?|IMPORTO|TOTALE\s+EURO)\b/i

  // Righe "quantità × prezzo unitario" (es: "3 X 2,00", "22 X 1,50", "22 XK 1,50"):
  // non sono articoli, sono il dettaglio moltiplicativo che precede l'articolo col totale.
  // [a-zA-Z]* copre varianti OCR come "XK", "Xx", ecc.
  const qtyUnitLineRegex = /^\d+\s*[xX×][a-zA-Z]*\s*\d/

  // Righe da ignorare (non sono articoli)
  const skipKw = /\b(?:SUBTOTALE|S\.TOTALE|IVA|SCONTO|SCONTI|RESTO|CONTANTE|CARTA|PAGATO|PAGAMENTO|PUNTI|TESSERA|OPERATORE|CASSA|P\.?IVA|C\.?F\.?|SCONTRINO|FISCALE|CAMBIO|BORSINA|SACCHETTO|GRAZIE|ARRIVEDERCI|WWW\.|HTTP|TEL|FAX|EMAIL|ORARIO|APERTURA|DATA|ORA)\b/i

  for (const line of lines) {
    if (skipKw.test(line)) continue
    if (qtyUnitLineRegex.test(line)) continue  // salta "N x prezzo_unitario"

    const match = line.match(priceRegex)
    if (!match) continue

    const priceStr = match[1].replace(',', '.')
    const price = parseFloat(priceStr)
    if (isNaN(price) || price <= 0 || price > 9999) continue

    // ── Riga TOTALE ──────────────────────────────────────
    if (totalKw.test(line)) {
      // Conserva il valore più alto trovato (alcuni scontrini stampano il totale più volte)
      if (total === null || price > total) total = price
      continue
    }

    // ── Articolo ─────────────────────────────────────────
    // Il nome è tutto ciò che precede il prezzo nel testo
    const nameRaw = line.slice(0, match.index ?? line.length).trim()
    const name = nameRaw
      // Rimuove caratteri non alfanumerici di contorno (simboli OCR-spurii)
      .replace(/^[|\\/*~_^`#@]+/, '')
      .replace(/[|\\/*~_^`#@]+$/, '')
      .replace(/\s{2,}/g, ' ')
      .trim()

    if (name.length < 2) continue

    items.push({ id: crypto.randomUUID(), name, price })
  }

  // ── Validazione somma vs totale ───────────────────────
  const sum = parseFloat(items.reduce((acc, i) => acc + i.price, 0).toFixed(2))
  const isValid = total !== null && Math.abs(sum - total) <= 0.02

  return { items, total, isValid }
}
