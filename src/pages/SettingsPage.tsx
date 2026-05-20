import { useState } from 'react'
import { Server, Palette, Trash2, CheckCircle, XCircle, Loader } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useConfigStore } from '../store/useConfigStore'
import { connect } from '../lib/ioBroker/socket'
import { getSystemConfig } from '../lib/ioBroker/iobroker-api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { cn } from '../lib/utils/cn'

type TestState = 'idle' | 'testing' | 'success' | 'error'

const ACCENTS = [
  { value: 'blue', color: 'bg-blue-500' },
  { value: 'green', color: 'bg-green-500' },
  { value: 'amber', color: 'bg-amber-500' },
  { value: 'rose', color: 'bg-rose-500' },
  { value: 'purple', color: 'bg-purple-500' },
] as const

export default function SettingsPage() {
  const app = useAppStore()
  const config = useConfigStore()

  const [serverInput, setServerInput] = useState(app.serverUrl)
  const [weatherInput, setWeatherInput] = useState(app.weatherApiKey)
  const [testState, setTestState] = useState<TestState>('idle')
  const [testError, setTestError] = useState('')

  const handleTestConnection = async () => {
    setTestState('testing')
    setTestError('')
    try {
      await connect(serverInput)
      await getSystemConfig()
      app.setServerUrl(serverInput)
      setTestState('success')
    } catch (e) {
      setTestState('error')
      setTestError(e instanceof Error ? e.message : 'Verbindung fehlgeschlagen')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold text-white mb-6">Einstellungen</h1>

      {/* Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-300">
            <Server size={16} />
            ioBroker Verbindung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={serverInput}
              onChange={(e) => { setServerInput(e.target.value); setTestState('idle') }}
              placeholder="http://192.168.1.100:8082"
              className="flex-1"
            />
            <Button variant="outline" onClick={handleTestConnection} disabled={testState === 'testing'}>
              {testState === 'testing' ? <Loader size={14} className="animate-spin" /> : 'Testen'}
            </Button>
          </div>
          {testState === 'success' && (
            <p className="text-xs text-green-400 flex items-center gap-1">
              <CheckCircle size={12} /> Verbunden – Adresse gespeichert
            </p>
          )}
          {testState === 'error' && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <XCircle size={12} /> {testError}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-300">
            <Palette size={16} />
            Design
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-2">Farbschema</label>
            <div className="grid grid-cols-3 gap-2">
              {(['dark', 'light', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => app.setTheme(t)}
                  className={cn(
                    'py-2 px-3 rounded-lg border text-sm transition-colors',
                    app.theme === t
                      ? 'border-blue-500 bg-blue-500/15 text-white'
                      : 'border-white/5 bg-slate-800 text-slate-400 hover:bg-slate-700'
                  )}
                >
                  {t === 'dark' ? '🌙 Dunkel' : t === 'light' ? '☀️ Hell' : '💻 System'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-2">Akzentfarbe</label>
            <div className="flex gap-3">
              {ACCENTS.map(({ value, color }) => (
                <button
                  key={value}
                  onClick={() => app.setAccentColor(value)}
                  className={cn(
                    'w-7 h-7 rounded-full transition-all',
                    color,
                    app.accentColor === value
                      ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110'
                      : 'opacity-50 hover:opacity-80'
                  )}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather API */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-300">Wetter API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-slate-500">OpenWeatherMap API-Key (kostenlos auf openweathermap.org)</p>
          <div className="flex gap-2">
            <Input
              value={weatherInput}
              onChange={(e) => setWeatherInput(e.target.value)}
              placeholder="API Key eingeben..."
              type="password"
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => app.setWeatherApiKey(weatherInput)}
            >
              Speichern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rooms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-300">Räume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {config.rooms.length === 0 && (
            <p className="text-xs text-slate-500">Keine Räume konfiguriert.</p>
          )}
          {config.rooms
            .sort((a, b) => a.order - b.order)
            .map((room) => (
              <div key={room.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-slate-200">{room.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {config.widgets[room.id]?.length ?? 0} Widgets
                  </span>
                  <button
                    onClick={() => config.removeRoom(room.id)}
                    className="p-1 text-slate-600 hover:text-red-400 transition-colors rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-400">Zurücksetzen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500 mb-3">
            Setzt das gesamte Dashboard zurück und startet den Setup-Wizard neu.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm('Wirklich alles zurücksetzen?')) {
                config.setRooms([])
                app.resetWizard()
              }
            }}
          >
            Dashboard zurücksetzen
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
