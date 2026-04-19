import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import PinLock from './components/PinLock'
import WhatsNew from './components/WhatsNew'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import NotFound from './pages/NotFound'
import { isUnlocked } from './shared/storage'
import { useNotificationScheduler } from './shared/useNotifications'

function App() {
  const [unlocked, setUnlocked] = useState(isUnlocked())
  useNotificationScheduler()

  if (!unlocked) {
    return <PinLock onUnlocked={() => setUnlocked(true)} />
  }

  return (
    <>
      <WhatsNew />
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
