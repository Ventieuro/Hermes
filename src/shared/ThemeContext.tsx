import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export type Theme = 'spazio'

const THEME_KEY = 'astrocoin-theme'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'spazio',
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY) as Theme
      return saved === 'spazio' ? saved : 'spazio'
    } catch {
      return 'spazio'
    }
  })

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
