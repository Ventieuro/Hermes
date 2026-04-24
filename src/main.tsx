import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { ThemeProvider } from './shared/ThemeContext'
import { DialogProvider } from './shared/DialogContext'
import { migrateCategoryKeys } from './shared/storage'
import App from './App'
import './index.css'

// Migrazione one-time: normalizza categorie salvate in lingua diversa dall'italiano
migrateCategoryKeys()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ThemeProvider>
        <DialogProvider>
          <App />
        </DialogProvider>
      </ThemeProvider>
    </HashRouter>
  </StrictMode>,
)
