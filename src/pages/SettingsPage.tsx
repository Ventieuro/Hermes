import { useNavigate } from 'react-router-dom'
import Settings from '../components/Settings'

function SettingsPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100%' }}>
      <Settings onClose={() => navigate(-1)} />
    </div>
  )
}

export default SettingsPage
