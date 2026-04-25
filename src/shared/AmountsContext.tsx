import { createContext, useContext, useState } from 'react'

const STORAGE_KEY = 'hermes-amounts-visible'

interface AmountsContextValue {
  amountsVisible: boolean
  toggleAmounts: () => void
}

const AmountsContext = createContext<AmountsContextValue>({
  amountsVisible: true,
  toggleAmounts: () => {},
})

export function AmountsProvider({ children }: { children: React.ReactNode }) {
  const [amountsVisible, setAmountsVisible] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored === null ? false : stored === 'true'
    } catch {
      return false
    }
  })

  function toggleAmounts() {
    setAmountsVisible((prev) => {
      const next = !prev
      try { localStorage.setItem(STORAGE_KEY, String(next)) } catch { /* noop */ }
      return next
    })
  }

  return (
    <AmountsContext.Provider value={{ amountsVisible, toggleAmounts }}>
      {children}
    </AmountsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAmounts() {
  return useContext(AmountsContext)
}
