import { Palette } from 'lucide-react'
import { useWizardStore } from '../../store/useWizardStore'
import { Button } from '../../components/ui/button'
import { cn } from '../../lib/utils/cn'

const ACCENTS = [
  { value: 'blue', label: 'Blau', color: 'bg-blue-500' },
  { value: 'green', label: 'Grün', color: 'bg-green-500' },
  { value: 'amber', label: 'Amber', color: 'bg-amber-500' },
  { value: 'rose', label: 'Rosa', color: 'bg-rose-500' },
  { value: 'purple', label: 'Lila', color: 'bg-purple-500' },
] as const

const DENSITIES = [
  { value: 'compact', label: 'Kompakt', desc: '3 Spalten' },
  { value: 'comfortable', label: 'Komfortabel', desc: '4 Spalten' },
  { value: 'spacious', label: 'Großzügig', desc: '5 Spalten' },
] as const

export default function Step4_ThemeLayout() {
  const { theme, accentColor, layoutDensity, setTheme, setAccentColor, setLayoutDensity, setStep } = useWizardStore()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Palette className="text-blue-400" size={24} />
        <div>
          <h2 className="text-lg font-semibold text-white">Design & Layout</h2>
          <p className="text-slate-400 text-sm">Passe das Erscheinungsbild an</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-300 block mb-2">Farbschema</label>
          <div className="grid grid-cols-3 gap-2">
            {(['dark', 'light', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  'py-2 px-3 rounded-lg border text-sm transition-colors',
                  theme === t
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
          <label className="text-sm text-slate-300 block mb-2">Akzentfarbe</label>
          <div className="flex gap-3">
            {ACCENTS.map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => setAccentColor(value)}
                title={label}
                className={cn(
                  'w-8 h-8 rounded-full transition-all',
                  color,
                  accentColor === value ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                )}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-300 block mb-2">Layout-Dichte</label>
          <div className="grid grid-cols-3 gap-2">
            {DENSITIES.map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => setLayoutDensity(value)}
                className={cn(
                  'py-2 px-3 rounded-lg border text-left transition-colors',
                  layoutDensity === value
                    ? 'border-blue-500 bg-blue-500/15'
                    : 'border-white/5 bg-slate-800 hover:bg-slate-700'
                )}
              >
                <div className={`text-sm ${layoutDensity === value ? 'text-white' : 'text-slate-300'}`}>{label}</div>
                <div className="text-xs text-slate-500">{desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={() => setStep(3)}>← Zurück</Button>
        <Button onClick={() => setStep(5)}>Weiter →</Button>
      </div>
    </div>
  )
}
