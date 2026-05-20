import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Loader } from 'lucide-react'
import { useWizardStore } from '../../store/useWizardStore'
import { useAppStore } from '../../store/useAppStore'
import { useConfigStore } from '../../store/useConfigStore'
import { Button } from '../../components/ui/button'

export default function Step5_Confirmation() {
  const wizard = useWizardStore()
  const appStore = useAppStore()
  const configStore = useConfigStore()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const selectedRooms = wizard.getSelectedRooms()
  const totalWidgets = selectedRooms.reduce((acc, r) => acc + r.selectedDataPointIds.length, 0)

  const handleFinish = async () => {
    setSaving(true)

    appStore.setServerUrl(wizard.serverUrl)
    appStore.setTheme(wizard.theme)
    appStore.setAccentColor(wizard.accentColor)
    appStore.setLayoutDensity(wizard.layoutDensity)

    const rooms = selectedRooms.map((r, i) => ({
      id: r.id,
      ioBrokerId: r.ioBrokerId,
      name: r.name,
      order: i,
    }))
    configStore.setRooms(rooms)

    const widgetConfigs = wizard.buildWidgetConfigs()
    for (const [roomId, widgets] of Object.entries(widgetConfigs)) {
      configStore.setWidgets(roomId, widgets)
    }

    appStore.setHasCompletedWizard(true)
    wizard.reset()

    navigate(`/dashboard/${rooms[0]?.id ?? ''}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <CheckCircle className="text-green-400" size={24} />
        <div>
          <h2 className="text-lg font-semibold text-white">Alles bereit!</h2>
          <p className="text-slate-400 text-sm">Überprüfe deine Einstellungen</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-slate-800 rounded-lg p-4 space-y-2">
          <Row label="Server" value={wizard.serverUrl} />
          <Row label="Räume" value={`${selectedRooms.length} Räume`} />
          <Row label="Widgets" value={`${totalWidgets} Widgets`} />
          <Row label="Design" value={`${wizard.theme === 'dark' ? 'Dunkel' : wizard.theme === 'light' ? 'Hell' : 'System'} / ${wizard.accentColor}`} />
          <Row label="Layout" value={wizard.layoutDensity} />
        </div>

        <div className="space-y-1">
          {selectedRooms.map((r) => (
            <div key={r.id} className="flex items-center justify-between text-sm py-1 border-b border-white/5">
              <span className="text-slate-300">{r.name}</span>
              <span className="text-slate-500">{r.selectedDataPointIds.length} Widgets</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={() => wizard.setStep(4)}>← Zurück</Button>
        <Button onClick={handleFinish} disabled={saving}>
          {saving ? <Loader size={16} className="animate-spin mr-2" /> : null}
          Setup abschließen ✓
        </Button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-200 font-medium">{value}</span>
    </div>
  )
}
