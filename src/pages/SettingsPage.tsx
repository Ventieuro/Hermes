import Settings from '../components/Settings'
import { PageHeader } from '../components/ui'
import { SETTINGS } from '../shared/labels'

function SettingsPage() {
  return (
    <div style={{ minHeight: '100%' }}>
      <PageHeader title={SETTINGS.impostazioni} />
      <Settings onClose={() => {}} />
    </div>
  )
}

export default SettingsPage
