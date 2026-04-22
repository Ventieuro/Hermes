import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import PinLock from './components/PinLock'
import WhatsNew from './components/WhatsNew'
import InstallPrompt from './components/InstallPrompt'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import NotFound from './pages/NotFound'
import {
  isUnlocked,
  importAllData,
  ingestQrTransferHash,
  getPendingQrTransferPayload,
  clearPendingQrTransferPayload,
} from './shared/storage'
import { SETTINGS } from './shared/labels'
import { useNotificationScheduler } from './shared/useNotifications'

function App() {
  const [unlocked, setUnlocked] = useState(isUnlocked())
  useNotificationScheduler()

  useEffect(() => {
    async function handleQrTransferFlow() {
      const ingestResult = ingestQrTransferHash(window.location.hash)
      if (ingestResult !== 'ignored') {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
      }

      const pendingPayload = getPendingQrTransferPayload()
      if (!pendingPayload) return

      const pwd = window.prompt(SETTINGS.qrImportPrompt)
      if (!pwd) return

      const result = await importAllData(pendingPayload, pwd, { mode: 'merge' })
      if (result === 'ok') {
        clearPendingQrTransferPayload()
        window.alert(SETTINGS.importaOk)
        window.location.reload()
        return
      }

      if (result === 'wrong-password') {
        window.alert(SETTINGS.passwordErrata)
        return
      }

      clearPendingQrTransferPayload()
      window.alert(SETTINGS.importaErrore)
    }

    void handleQrTransferFlow()
  }, [])

  if (!unlocked) {
    return <PinLock onUnlocked={() => setUnlocked(true)} />
  }

  return (
    <>
      <WhatsNew />
      <InstallPrompt />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
