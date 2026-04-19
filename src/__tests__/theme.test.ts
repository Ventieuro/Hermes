import { describe, it, expect, beforeEach } from 'vitest'

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to spazio theme in localStorage', () => {
    expect(localStorage.getItem('hermes-theme')).toBeNull()
  })

  it('stores and reads spazio theme', () => {
    localStorage.setItem('hermes-theme', 'spazio')
    expect(localStorage.getItem('hermes-theme')).toBe('spazio')
  })

  it('data-theme attribute defaults correctly', () => {
    document.documentElement.setAttribute('data-theme', 'spazio')
    expect(document.documentElement.getAttribute('data-theme')).toBe('spazio')
  })
})
