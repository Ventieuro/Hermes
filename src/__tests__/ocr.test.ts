/**
 * Test OCR parser — scontrino lungo (20 articoli)
 *
 * Verifica che `parseReceiptText` estragga correttamente articoli,
 * prezzi e totale da un testo OCR realistico di supermercato.
 *
 * Per testare con una foto reale:
 * 1. Aggiungi l'immagine in fixtures/receipts/
 * 2. Usa Tesseract fuori dal browser (CLI o node) per ottenere il testo grezzo
 * 3. Sostituisci SCONTRINO_LUNGO con il testo estratto
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { describe, it, expect } from 'vitest'
import { parseReceiptText } from '../shared/receiptUtils'

const SCONTRINO_LUNGO = readFileSync(
  join(__dirname, 'fixtures/receipts/synthetic/scontrino_lungo.txt'),
  'utf-8',
)

describe('parseReceiptText — scontrino lungo supermercato', () => {
  it('stampa output grezzo (debug)', () => {
    const result = parseReceiptText(SCONTRINO_LUNGO)
    console.log('\n=== ARTICOLI ESTRATTI ===')
    result.items.forEach((item, i) => {
      console.log(`  ${i + 1}. "${item.name}" → ${item.price.toFixed(2)} €`)
    })
    console.log(`\n=== TOTALE ESTRATTO: ${result.total?.toFixed(2) ?? 'non trovato'} €`)
    console.log(`=== SOMMA ARTICOLI: ${result.items.reduce((s, i) => s + i.price, 0).toFixed(2)} €`)
    console.log(`=== VALIDO: ${result.isValid}`)

    // Questo test passa sempre — serve solo per vedere l'output
    expect(result).toBeDefined()
  })

  it('estrae il totale corretto (55,69 €)', () => {
    const { total } = parseReceiptText(SCONTRINO_LUNGO)
    expect(total).toBe(55.69)
  })

  it('estrae tutti e 20 gli articoli', () => {
    const { items } = parseReceiptText(SCONTRINO_LUNGO)
    expect(items).toHaveLength(20)
  })

  it('il primo articolo è PASTA BARILLA a 1,29 €', () => {
    const { items } = parseReceiptText(SCONTRINO_LUNGO)
    expect(items[0].name).toMatch(/PASTA/i)
    expect(items[0].price).toBe(1.29)
  })

  it('valida la somma vs totale', () => {
    const { isValid } = parseReceiptText(SCONTRINO_LUNGO)
    expect(isValid).toBe(true)
  })
})
