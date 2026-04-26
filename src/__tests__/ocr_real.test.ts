/**
 * Test OCR reale — foto scontrini fisici
 *
 * Usa Tesseract.js sui file nelle sottocartelle di fixtures/receipts/.
 * Ogni cartella ha expected.json con i valori attesi.
 * Timeout alto perché OCR richiede ~5-15s per foto.
 */
// @vitest-environment node
import { join } from 'path'
import { readFileSync } from 'fs'
import { describe, it, expect } from 'vitest'

/**
 * stableIt — usa it.skip per i test con stable:false in expected.json.
 * I test non stabili vengono saltati durante il build/CI ma girano
 * esplicitamente quando si lavora su quello scontrino.
 */
function stableIt(stable: boolean) {
  return stable ? it : it.skip
}
import { createWorker } from 'tesseract.js'
import { parseReceiptText } from '../shared/receiptUtils'

const FIXTURES = join(__dirname, 'fixtures/receipts')

// ─── Helper ─────────────────────────────────────────────

async function ocrFiles(paths: string[]): Promise<string> {
  const worker = await createWorker('ita+eng')
  const texts: string[] = []
  for (let i = 0; i < paths.length; i++) {
    console.log(`  [OCR] foto ${i + 1}/${paths.length}…`)
    const { data } = await worker.recognize(paths[i])
    texts.push(data.text)
  }
  await worker.terminate()
  return texts.join('\n')
}

// ─── ScontrinoLungo1 — supermercato, 3 foto reali ───────

describe('ScontrinoLungo1 — supermercato (3 foto)', () => {
  const expected = JSON.parse(readFileSync(join(FIXTURES, 'ScontrinoLungo1', 'expected.json'), 'utf-8'))
  stableIt(expected.stable)('estrae articoli e totale', { timeout: 120_000 }, async () => {
    const dir = join(FIXTURES, 'ScontrinoLungo1')

    const text = await ocrFiles([
      join(dir, 'foto_1.jpeg'),
      join(dir, 'foto_2.jpeg'),
      join(dir, 'foto_3.jpeg'),
    ])
    const result = parseReceiptText(text)

    console.log('\n=== ARTICOLI ESTRATTI ===')
    result.items.forEach((item, i) => {
      const breakdown = item.qty !== undefined
        ? ` (${item.qty} × ${item.unitPrice?.toFixed(2)} €)`
        : ''
      console.log(`  ${i + 1}. "${item.name}"${breakdown} → ${item.price.toFixed(2)} €`)
    })
    console.log(`\n  Data             : ${result.date ?? 'non trovata'}`)
    console.log(`  Totale estratto  : ${result.total?.toFixed(2) ?? 'non trovato'} €`)
    console.log(`  Somma articoli   : ${result.items.reduce((s, i) => s + i.price, 0).toFixed(2)} €`)
    console.log(`  N. articoli      : ${result.items.length}`)
    console.log(`  Valido           : ${result.isValid}`)

    // parserReadTotal/Date: valore che il parser legge oggi (può essere null se non trovato).
    // Se il campo è absent (undefined) usa il ground truth. Non usare ?? perché null è un valore valido.
    const e = expected.expected
    const expectedTotal = e.parserReadTotal !== undefined ? e.parserReadTotal : e.total
    const expectedDate  = e.parserReadDate  !== undefined ? e.parserReadDate  : e.date
    expect(result.total).toBe(expectedTotal)
    expect(result.items.length).toBe(e.itemCount)
    expect(result.isValid).toBe(e.isValid)
    expect(result.date ?? null).toBe(expectedDate)

    // Verifica articoli attesi (quelli che il parser DEVE trovare, senza parserMissing)
    // usedIdx evita che duplicati con lo stesso nome prefisso matchino sempre il primo
    const mustFind = (e.items ?? []).filter((i: { parserMissing?: boolean }) => !i.parserMissing)
    const usedIdx = new Set<number>()
    mustFind.forEach((exp: { name: string; price: number; parserReadPrice?: number }) => {
      const assertPrice = exp.parserReadPrice ?? exp.price
      const idx = result.items.findIndex((i, pos) => !usedIdx.has(pos) && i.name.startsWith(exp.name.slice(0, 6)))
      expect(idx, `articolo "${exp.name}" non trovato`).toBeGreaterThanOrEqual(0)
      if (idx >= 0) {
        usedIdx.add(idx)
        // toBeCloseTo(x, 1) → tolleranza ±0.05 € (copre errori OCR di 1-2 centesimi)
        expect(result.items[idx].price).toBeCloseTo(assertPrice, 1)
      }
    })
  })
})

// ─── ScontrinoLungo2 — supermercato, 3 foto parziali ───────────────

describe('ScontrinoLungo2 — supermercato (3 foto, copertura parziale)', () => {
  const expected = JSON.parse(readFileSync(join(FIXTURES, 'ScontrinoLungo2', 'expected.json'), 'utf-8'))
  stableIt(expected.stable)('estrae articoli e totale', { timeout: 120_000 }, async () => {
    const dir = join(FIXTURES, 'ScontrinoLungo2')

    const text = await ocrFiles([
      join(dir, 'foto_1.jpg'),
      join(dir, 'foto_2.jpg'),
      join(dir, 'foto_3.jpg'),
    ])
    const result = parseReceiptText(text)

    console.log('\n=== ARTICOLI ESTRATTI ===')
    result.items.forEach((item, i) => {
      const breakdown = item.qty !== undefined
        ? ` (${item.qty} × ${item.unitPrice?.toFixed(2)} €)`
        : ''
      console.log(`  ${i + 1}. "${item.name}"${breakdown} → ${item.price.toFixed(2)} €`)
    })
    console.log(`\n  Data             : ${result.date ?? 'non trovata'}`)
    console.log(`  Totale estratto  : ${result.total?.toFixed(2) ?? 'non trovato'} €`)
    console.log(`  Somma articoli   : ${result.items.reduce((s, i) => s + i.price, 0).toFixed(2)} €`)
    console.log(`  N. articoli      : ${result.items.length}`)
    console.log(`  Valido           : ${result.isValid}`)

    const e2 = expected.expected
    const expectedTotal = e2.parserReadTotal !== undefined ? e2.parserReadTotal : e2.total
    const expectedDate  = e2.parserReadDate  !== undefined ? e2.parserReadDate  : e2.date
    expect(result.total).toBe(expectedTotal)
    expect(result.items.length).toBe(e2.itemCount)
    expect(result.isValid).toBe(e2.isValid)
    expect(result.date ?? null).toBe(expectedDate)

    // Verifica articoli attesi (quelli che il parser DEVE trovare, senza parserMissing)
    const mustFind2 = (e2.items ?? []).filter((i: { parserMissing?: boolean }) => !i.parserMissing)
    const usedIdx2 = new Set<number>()
    mustFind2.forEach((exp: { name: string; price: number; parserReadPrice?: number }) => {
      const assertPrice = exp.parserReadPrice ?? exp.price
      const idx = result.items.findIndex((i, pos) => !usedIdx2.has(pos) && i.name.startsWith(exp.name.slice(0, 6)))
      expect(idx, `articolo "${exp.name}" non trovato`).toBeGreaterThanOrEqual(0)
      if (idx >= 0) {
        usedIdx2.add(idx)
        // toBeCloseTo(x, 1) → tolleranza ±0.05 € (copre errori OCR di 1-2 centesimi)
        expect(result.items[idx].price).toBeCloseTo(assertPrice, 1)
      }
    })
  })
})

// ─── ScontrinoCorto1 — ristorante, screenshot app ───────

describe('ScontrinoCorto1 — ristorante (1 foto, scontrino fisico)', () => {
  const expected = JSON.parse(readFileSync(join(FIXTURES, 'ScontrinoCorto1', 'expected.json'), 'utf-8'))
  stableIt(expected.stable)('legge il totale anche senza articoli', { timeout: 60_000 }, async () => {
    const dir = join(FIXTURES, 'ScontrinoCorto1')

    const text = await ocrFiles([join(dir, 'foto_1.jpg')])
    const result = parseReceiptText(text)

    console.log('\n--- TESTO GREZZO ---')
    console.log(text)
    console.log('\n=== ARTICOLI ESTRATTI ===')
    result.items.forEach((item, i) => {
      const breakdown = item.qty !== undefined
        ? ` (${item.qty} × ${item.unitPrice?.toFixed(2)} €)`
        : ''
      console.log(`  ${i + 1}. "${item.name}"${breakdown} → ${item.price.toFixed(2)} €`)
    })
    console.log(`\n  Data            : ${result.date ?? 'non trovata'}`)
    console.log(`  Totale estratto : ${result.total?.toFixed(2) ?? 'non trovato'} €`)

    expect(result.total).toBe(expected.expected.total)
    expect(result.items.length).toBe(expected.expected.itemCount)
    expect(result.isValid).toBe(expected.expected.isValid)
    expect(result.date).toBe(expected.expected.date)
    // Verifica qty/unitPrice sugli articoli con moltiplicatore
    const itemsWithQty = result.items.filter((i) => i.qty !== undefined)
    expect(itemsWithQty.length).toBeGreaterThan(0)
    expected.expected.items
      .filter((e: { qty?: number }) => e.qty !== undefined)
      .forEach((e: { name: string; qty: number; unitPrice: number }) => {
        const match = result.items.find((i) => i.name.startsWith(e.name.slice(0, 5)))
        expect(match?.qty).toBe(e.qty)
        expect(match?.unitPrice).toBe(e.unitPrice)
      })
  })
})

// ─── ScontrinoCorto2 — bar/caffetteria, 1 foto ──────────

describe('ScontrinoCorto2 — bar (1 foto)', () => {
  const expected = JSON.parse(readFileSync(join(FIXTURES, 'ScontrinoCorto2', 'expected.json'), 'utf-8'))
  stableIt(expected.stable)('estrae articoli e totale', { timeout: 120_000 }, async () => {
    const dir = join(FIXTURES, 'ScontrinoCorto2')
    const e = expected.expected

    const text = await ocrFiles([join(dir, 'foto_1.jpg')])
    const result = parseReceiptText(text)

    console.log('\n--- TESTO GREZZO ---\n' + text)
    console.log('\n=== ARTICOLI ESTRATTI ===')
    result.items.forEach((item, i) => {
      const breakdown = item.qty !== undefined
        ? ` (${item.qty} × ${item.unitPrice?.toFixed(2)} €)`
        : ''
      console.log(`  ${i + 1}. "${item.name}"${breakdown} → ${item.price.toFixed(2)} €`)
    })
    console.log(`\n  Data            : ${result.date ?? 'non trovata'}`)
    console.log(`  Totale estratto : ${result.total?.toFixed(2) ?? 'non trovato'} €`)

    const expectedTotal = e.parserReadTotal !== undefined ? e.parserReadTotal : e.total
    const expectedDate  = e.parserReadDate  !== undefined ? e.parserReadDate  : e.date

    if (expectedTotal !== null) expect(result.total).toBe(expectedTotal)
    expect(result.items.length).toBe(e.itemCount)
    expect(result.isValid).toBe(e.isValid)
    if (expectedDate !== null) expect(result.date).toBe(expectedDate)

    // Verifica articoli item per item
    const mustFind = (e.items ?? []).filter((i: { parserMissing?: boolean }) => !i.parserMissing)
    const usedIdx = new Set<number>()
    mustFind.forEach((exp: { name: string; price: number; parserReadPrice?: number }) => {
      const assertPrice = exp.parserReadPrice ?? exp.price
      const idx = result.items.findIndex(
        (item, pos) => !usedIdx.has(pos) && item.name.startsWith(exp.name.slice(0, 6)),
      )
      expect(idx, `articolo "${exp.name}" non trovato`).toBeGreaterThanOrEqual(0)
      if (idx >= 0) {
        usedIdx.add(idx)
        expect(result.items[idx].price).toBe(assertPrice)
      }
    })
  })
})
