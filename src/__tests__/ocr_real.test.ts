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
  it('estrae articoli e totale', { timeout: 120_000 }, async () => {
    const dir = join(FIXTURES, 'ScontrinoLungo1')
    const expected = JSON.parse(readFileSync(join(dir, 'expected.json'), 'utf-8'))

    const text = await ocrFiles([
      join(dir, 'foto_1.jpeg'),
      join(dir, 'foto_2.jpeg'),
      join(dir, 'foto_3.jpeg'),
    ])
    const result = parseReceiptText(text)

    console.log('\n=== ARTICOLI ESTRATTI ===')
    result.items.forEach((item, i) =>
      console.log(`  ${i + 1}. "${item.name}" → ${item.price.toFixed(2)} €`),
    )
    console.log(`\n  Totale estratto : ${result.total?.toFixed(2) ?? 'non trovato'} €`)
    console.log(`  Somma articoli  : ${result.items.reduce((s, i) => s + i.price, 0).toFixed(2)} €`)
    console.log(`  N. articoli     : ${result.items.length}`)
    console.log(`  Valido          : ${result.isValid}`)

    expect(result.total).toBe(expected.expected.total)
    expect(result.items.length).toBe(expected.expected.itemCount)
    expect(result.isValid).toBe(expected.expected.isValid)
  })
})

// ─── ScontrinoCorto1 — ristorante, screenshot app ───────

describe('ScontrinoCorto1 — ristorante (1 foto, screenshot app)', () => {
  it('legge il totale anche senza articoli', { timeout: 60_000 }, async () => {
    const dir = join(FIXTURES, 'ScontrinoCorto1')
    const expected = JSON.parse(readFileSync(join(dir, 'expected.json'), 'utf-8'))

    const text = await ocrFiles([join(dir, 'foto_1.jpg')])
    const result = parseReceiptText(text)

    console.log('\n--- TESTO GREZZO ---')
    console.log(text)
    console.log('\n=== ARTICOLI ESTRATTI ===')
    result.items.forEach((item, i) =>
      console.log(`  ${i + 1}. "${item.name}" → ${item.price.toFixed(2)} €`),
    )
    console.log(`\n  Totale estratto : ${result.total?.toFixed(2) ?? 'non trovato'} €`)

    expect(result.total).toBe(expected.expected.total)
    expect(result.items.length).toBe(expected.expected.itemCount)
  })
})
