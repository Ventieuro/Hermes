import { describe, it, expect, beforeEach } from 'vitest'

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to spazio theme in localStorage', () => {
    expect(localStorage.getItem('astrocoin-theme')).toBeNull()
  })

  it('stores and reads spazio theme', () => {
    localStorage.setItem('astrocoin-theme', 'spazio')
    expect(localStorage.getItem('astrocoin-theme')).toBe('spazio')
  })

  it('data-theme attribute defaults correctly', () => {
    document.documentElement.setAttribute('data-theme', 'spazio')
    expect(document.documentElement.getAttribute('data-theme')).toBe('spazio')
  })
})
