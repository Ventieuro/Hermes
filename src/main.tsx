import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { ThemeProvider } from './shared/ThemeContext'
import { DialogProvider } from './shared/DialogContext'
import { initPersistentStorage, migrateCategoryKeys } from './shared/storage'
import App from './App'
import './index.css'

async function bootstrap() {
  // Migrazione one-time: porta i dati esistenti su IndexedDB e mantiene fallback sicuro.
  await initPersistentStorage()

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
}

void bootstrap()
