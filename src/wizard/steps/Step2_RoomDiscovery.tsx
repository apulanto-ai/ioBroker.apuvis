import { useEffect, useState } from 'react'
import { Home, Pencil, Loader, AlertCircle } from 'lucide-react'
import { useWizardStore } from '../../store/useWizardStore'
import { discoverRooms } from '../../lib/ioBroker/discovery'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

export default function Step2_RoomDiscovery() {
  const { rooms, setDiscoveredRooms, toggleRoom, renameRoom, setStep } = useWizardStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    if (rooms.length > 0) return
    setLoading(true)
    discoverRooms()
      .then((discovered) => {
        if (discovered.length === 0) setError('Keine Räume gefunden. Stelle sicher, dass unter Aufzählungen → Räume Geräte zugeordnet sind.')
        else setDiscoveredRooms(discovered)
      })
      .catch((e: unknown) => setError(`Fehler beim Laden der Räume: ${e instanceof Error ? e.message : String(e)}`))
      .finally(() => setLoading(false))
  }, [])

  const selectedCount = rooms.filter((r) => r.selected).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Home className="text-blue-400" size={24} />
        <div>
          <h2 className="text-lg font-semibold text-white">Räume auswählen</h2>
          <p className="text-slate-400 text-sm">Welche Räume soll das Dashboard zeigen?</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400">
          <Loader size={16} className="animate-spin" />
          Suche Räume in ioBroker...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-900/20 rounded-lg p-3">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {rooms.length > 0 && (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                room.selected
                  ? 'border-blue-500/50 bg-blue-500/10'
                  : 'border-white/5 bg-slate-800/50 hover:bg-slate-800'
              }`}
              onClick={() => toggleRoom(room.id)}
            >
              <div
                className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                  room.selected ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
                }`}
              >
                {room.selected && <span className="text-white text-xs">✓</span>}
              </div>

              {editingId === room.id ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => { renameRoom(room.id, editName); setEditingId(null) }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { renameRoom(room.id, editName); setEditingId(null) } }}
                  className="h-7 text-sm flex-1"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="flex-1 text-sm text-slate-200">{room.name}</span>
              )}

              <button
                className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                onClick={(e) => { e.stopPropagation(); setEditingId(room.id); setEditName(room.name) }}
              >
                <Pencil size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={() => setStep(1)}>← Zurück</Button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">{selectedCount} ausgewählt</span>
          <Button onClick={() => setStep(3)} disabled={selectedCount === 0}>
            Weiter →
          </Button>
        </div>
      </div>
    </div>
  )
}
