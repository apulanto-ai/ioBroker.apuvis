import { useEffect, useState } from 'react'
import { Sliders, Loader, ChevronDown, ChevronRight } from 'lucide-react'
import { useWizardStore } from '../../store/useWizardStore'
import { discoverRooms, discoverDataPoints, getWidgetGroups } from '../../lib/ioBroker/discovery'
import { Button } from '../../components/ui/button'

const WIDGET_LABELS: Record<string, string> = {
  switch: 'Schalter',
  light: 'Licht',
  thermostat: 'Thermostat',
  chart: 'Diagramm',
  sensor: 'Sensor',
}

const WIDGET_ICONS: Record<string, string> = {
  switch: '🔌',
  light: '💡',
  thermostat: '🌡️',
  chart: '📈',
  sensor: '📡',
}

export default function Step3_WidgetSelection() {
  const { rooms, setRoomDataPoints, toggleDataPoint, setStep } = useWizardStore()
  const selectedRooms = rooms.filter((r) => r.selected)
  const [loadingRoomId, setLoadingRoomId] = useState<string | null>(null)
  const [expandedRoom, setExpandedRoom] = useState<string | null>(selectedRooms[0]?.id ?? null)

  useEffect(() => {
    const loadRoom = async (room: typeof selectedRooms[0]) => {
      if (room.dataPoints.length > 0) return
      setLoadingRoomId(room.id)
      try {
        const discovered = await discoverRooms()
        const memberIds = discovered.find(r => r.id === room.ioBrokerId)?.memberIds ?? []
        const dataPoints = await discoverDataPoints(memberIds)
        setRoomDataPoints(room.id, dataPoints)
      } catch {
        // leave empty
      } finally {
        setLoadingRoomId(null)
      }
    }

    selectedRooms.forEach((r) => loadRoom(r))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totalSelected = selectedRooms.reduce(
    (acc, r) => acc + r.selectedDataPointIds.length, 0
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Sliders className="text-blue-400" size={24} />
        <div>
          <h2 className="text-lg font-semibold text-white">Widgets auswählen</h2>
          <p className="text-slate-400 text-sm">Welche Datenpunkte sollen als Widgets angezeigt werden?</p>
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {selectedRooms.map((room) => {
          const groups = getWidgetGroups(room.dataPoints)
          const isExpanded = expandedRoom === room.id
          const isLoading = loadingRoomId === room.id

          return (
            <div key={room.id} className="border border-white/5 rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-750 text-left"
                onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
              >
                <span className="text-sm font-medium text-white">{room.name}</span>
                <div className="flex items-center gap-2">
                  {isLoading && <Loader size={14} className="animate-spin text-slate-400" />}
                  <span className="text-xs text-slate-400">{room.selectedDataPointIds.length} gewählt</span>
                  {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                </div>
              </button>

              {isExpanded && !isLoading && (
                <div className="p-3 space-y-3">
                  {groups.length === 0 && (
                    <p className="text-sm text-slate-500">Keine Datenpunkte gefunden.</p>
                  )}
                  {groups.map(({ type, items }) => (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-400">
                          {WIDGET_ICONS[type]} {WIDGET_LABELS[type] ?? type}
                        </span>
                        <button
                          className="text-xs text-blue-400 hover:text-blue-300"
                          onClick={() => {
                            items.forEach(dp => {
                              if (!room.selectedDataPointIds.includes(dp.id)) {
                                toggleDataPoint(room.id, dp.id)
                              }
                            })
                          }}
                        >
                          Alle
                        </button>
                      </div>
                      <div className="space-y-1">
                        {items.map((dp) => {
                          const selected = room.selectedDataPointIds.includes(dp.id)
                          return (
                            <div
                              key={dp.id}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer text-xs transition-colors ${
                                selected ? 'bg-blue-500/15 text-slate-200' : 'text-slate-400 hover:bg-slate-700'
                              }`}
                              onClick={() => toggleDataPoint(room.id, dp.id)}
                            >
                              <div className={`w-3 h-3 rounded-sm border flex-shrink-0 flex items-center justify-center ${
                                selected ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
                              }`}>
                                {selected && <span className="text-white" style={{ fontSize: 9 }}>✓</span>}
                              </div>
                              <span className="truncate">{dp.name}</span>
                              {dp.unit && <span className="text-slate-500 ml-auto flex-shrink-0">{dp.unit}</span>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={() => setStep(2)}>← Zurück</Button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">{totalSelected} Widgets</span>
          <Button onClick={() => setStep(4)}>Weiter →</Button>
        </div>
      </div>
    </div>
  )
}
