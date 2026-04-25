import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { ThemeProvider } from './shared/ThemeContext'
import { DialogProvider } from './shared/DialogContext'
import { AmountsProvider } from './shared/AmountsContext'
import { initPersistentStorage, migrateCategoryKeys } from './shared/storage'
import App from './App'
import './index.css'

// Listener per aggiornamenti Service Worker
function setupSWUpdateListener() {
  if ('serviceWorker' in navigator) {
    console.log('📱 Setup SW update listener...')
    
    // Controlla periodicamente se c'è un update disponibile
    setInterval(() => {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        console.log(`🔍 Checking updates... (${registrations.length} SW registrations)`)
        registrations.forEach((reg) => {
          reg.update().then(() => {
            // Se c'è un nuovo SW in attesa, mostra notifica
            if (reg.waiting) {
              console.log('✨ Nuovo SW in waiting!')
              showUpdateNotification(reg)
            }
          })
        })
      })
    }, 60000) // Check ogni minuto

    // Check anche al caricamento
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      console.log(`⚡ Initial check: ${registrations.length} SW registrations`)
      registrations.forEach((reg) => {
        if (reg.waiting) {
          console.log('✨ Trovato SW in waiting al caricamento!')
          showUpdateNotification(reg)
        }
      })
    })
  }
}

function showUpdateNotification(registration: ServiceWorkerRegistration) {
  // Controlla se già mostriamo una notifica
  if (document.getElementById('sw-update-notification')) return

  console.log('🔄 Update disponibile, mostrando notifica...')
  
  const msg = document.createElement('div')
  msg.id = 'sw-update-notification'
  msg.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      max-width: 400px;
      padding: 16px;
      background: var(--accent);
      color: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      font-size: 14px;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 12px;
    ">
      ✅ Nuova versione disponibile
      <button style="
        padding: 6px 12px;
        background: white;
        color: var(--accent);
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
      ">Aggiorna</button>
    </div>
  `
  
  const btn = msg.querySelector('button')
  if (btn) {
    btn.onclick = () => {
      console.log('👆 Utente ha cliccato Aggiorna')
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        window.location.reload()
      }
    }
  }
  
  document.body.appendChild(msg)
}

// ─── Fix iOS Safari black screen (Quick Note / viewport change) ───
// Quando iOS "Note Rapide" o un overlay cambia il viewport e poi lo ripristina,
// Safari a volte non ridisegna la pagina. Forziamo un repaint al ritorno.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    document.body.style.display = 'none'
    // Trigger reflow — accesso a offsetHeight è intenzionale
    void document.body.offsetHeight
    document.body.style.display = ''
  }
})

// Stesso fix per il caso BFCache (tasto Indietro del browser)
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    document.body.style.display = 'none'
    void document.body.offsetHeight
    document.body.style.display = ''
  }
})

async function bootstrap() {
  // Setup listener per aggiornamenti SW
  setupSWUpdateListener()

  // Migrazione one-time: porta i dati esistenti su IndexedDB e mantiene fallback sicuro.
  await initPersistentStorage()

  // Migrazione one-time: normalizza categorie salvate in lingua diversa dall'italiano
  migrateCategoryKeys()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <HashRouter>
        <ThemeProvider>
          <AmountsProvider>
            <DialogProvider>
              <App />
            </DialogProvider>
          </AmountsProvider>
        </ThemeProvider>
      </HashRouter>
    </StrictMode>,
  )
}

void bootstrap()
