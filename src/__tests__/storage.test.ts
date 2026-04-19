import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadTransactions,
  addTransaction,
  deleteTransaction,
  getTransactionsInPeriod,
  generateId,
} from '../shared/storage'
import type { Transaction } from '../shared/types'

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: generateId(),
    type: 'uscita',
    description: 'Test',
    amount: 10,
    date: '2026-04-15',
    category: 'Altro',
    recurring: false,
    recurringMonths: 0,
    ...overrides,
  }
}

describe('storage.ts', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('generateId', () => {
    it('returns a non-empty string', () => {
      const id = generateId()
      expect(id).toBeTruthy()
      expect(typeof id).toBe('string')
    })

    it('returns unique ids', () => {
      const ids = Array.from({ length: 100 }, () => generateId())
      expect(new Set(ids).size).toBe(100)
    })
  })

  describe('loadTransactions / addTransaction', () => {
    it('returns empty array when no data', () => {
      expect(loadTransactions()).toEqual([])
    })

    it('adds and loads a transaction', () => {
      const tx = makeTx({ description: 'Spesa' })
      addTransaction(tx)
      const loaded = loadTransactions()
      expect(loaded).toHaveLength(1)
      expect(loaded[0].description).toBe('Spesa')
    })

    it('adds multiple transactions', () => {
      addTransaction(makeTx({ description: 'A' }))
      addTransaction(makeTx({ description: 'B' }))
      expect(loadTransactions()).toHaveLength(2)
    })
  })

  describe('deleteTransaction', () => {
    it('removes a transaction by id', () => {
      const tx = makeTx()
      addTransaction(tx)
      expect(loadTransactions()).toHaveLength(1)
      deleteTransaction(tx.id)
      expect(loadTransactions()).toHaveLength(0)
    })

    it('does nothing when id not found', () => {
      addTransaction(makeTx())
      deleteTransaction('nonexistent')
      expect(loadTransactions()).toHaveLength(1)
    })
  })

  describe('getTransactionsInPeriod', () => {
    it('filters transactions within date range', () => {
      const txs = [
        makeTx({ date: '2026-04-01' }),
        makeTx({ date: '2026-04-15' }),
        makeTx({ date: '2026-05-01' }),
      ]
      txs.forEach(addTransaction)

      const start = new Date('2026-04-01')
      const end = new Date('2026-04-30')
      const result = getTransactionsInPeriod(loadTransactions(), start, end)
      expect(result).toHaveLength(2)
    })

    it('returns empty array when no matches', () => {
      addTransaction(makeTx({ date: '2026-01-01' }))
      const start = new Date('2026-06-01')
      const end = new Date('2026-06-30')
      expect(getTransactionsInPeriod(loadTransactions(), start, end)).toHaveLength(0)
    })

    it('includes boundary dates', () => {
      const tx = makeTx({ date: '2026-04-01' })
      addTransaction(tx)
      const start = new Date('2026-04-01')
      const end = new Date('2026-04-01')
      expect(getTransactionsInPeriod(loadTransactions(), start, end)).toHaveLength(1)
    })
  })

  describe('handles corrupt data gracefully', () => {
    it('returns empty array on invalid JSON', () => {
      localStorage.setItem('hermes-transactions', 'not json')
      expect(loadTransactions()).toEqual([])
    })
  })
})
