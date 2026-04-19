import { describe, it, expect, beforeEach } from 'vitest'
import { setLocale, getLocale, LAYOUT, DASHBOARD, MASCOTTE, FORM, CATEGORIE, NOT_FOUND } from '../shared/labels'

describe('labels.ts', () => {
  beforeEach(() => {
    localStorage.clear()
    setLocale('it')
  })

  describe('setLocale / getLocale', () => {
    it('defaults to it', () => {
      expect(getLocale()).toBe('it')
    })

    it('switches to en', () => {
      setLocale('en')
      expect(getLocale()).toBe('en')
    })

    it('switches to es', () => {
      setLocale('es')
      expect(getLocale()).toBe('es')
    })
  })

  describe('LAYOUT labels', () => {
    it('returns Italian by default', () => {
      expect(LAYOUT.appName).toContain('AstroCoin')
    })

    it('returns English when locale is en', () => {
      setLocale('en')
      expect(LAYOUT.appName).toContain('AstroCoin')
    })
  })

  describe('DASHBOARD labels', () => {
    it('returns Italian strings', () => {
      expect(DASHBOARD.entrate).toBe('Entrate')
      expect(DASHBOARD.uscite).toBe('Uscite')
    })

    it('returns English strings', () => {
      setLocale('en')
      expect(DASHBOARD.entrate).toBe('Income')
      expect(DASHBOARD.uscite).toBe('Expenses')
    })

    it('returns Spanish strings', () => {
      setLocale('es')
      expect(DASHBOARD.entrate).toBe('Ingresos')
      expect(DASHBOARD.uscite).toBe('Gastos')
    })
  })

  describe('MASCOTTE labels', () => {
    it('returns mascot messages as strings', () => {
      expect(typeof MASCOTTE.messaggi.vuoto).toBe('string')
      expect(typeof MASCOTTE.messaggi.ottimo).toBe('string')
      expect(typeof MASCOTTE.messaggi.pari).toBe('string')
    })

    it('returns parametric functions', () => {
      expect(typeof MASCOTTE.messaggi.bene).toBe('function')
      const msg = MASCOTTE.messaggi.bene('€100')
      expect(msg).toContain('€100')
    })
  })

  describe('FORM labels', () => {
    it('has all required form labels', () => {
      expect(FORM.labelQuanto).toBeTruthy()
      expect(FORM.labelPerCosa).toBeTruthy()
      expect(FORM.labelCategoria).toBeTruthy()
      expect(FORM.labelQuando).toBeTruthy()
      expect(FORM.submitEntrata).toBeTruthy()
      expect(FORM.submitUscita).toBeTruthy()
    })
  })

  describe('CATEGORIE', () => {
    it('returns arrays for entrata and uscita', () => {
      expect(Array.isArray(CATEGORIE.entrata)).toBe(true)
      expect(Array.isArray(CATEGORIE.uscita)).toBe(true)
      expect(CATEGORIE.entrata.length).toBeGreaterThan(0)
      expect(CATEGORIE.uscita.length).toBeGreaterThan(0)
    })

    it('changes language for categories', () => {
      setLocale('en')
      expect(CATEGORIE.entrata).toContain('Salary')
    })
  })

  describe('NOT_FOUND labels', () => {
    it('returns 404 message', () => {
      expect(NOT_FOUND.messaggio).toBeTruthy()
      expect(NOT_FOUND.tornaHome).toBeTruthy()
    })
  })
})
