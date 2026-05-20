import { useWizardStore } from '../store/useWizardStore'
import Step1_ServerAddress from './steps/Step1_ServerAddress'
import Step2_RoomDiscovery from './steps/Step2_RoomDiscovery'
import Step3_WidgetSelection from './steps/Step3_WidgetSelection'
import Step4_ThemeLayout from './steps/Step4_ThemeLayout'
import Step5_Confirmation from './steps/Step5_Confirmation'

const STEPS = [
  { label: 'Verbindung' },
  { label: 'Räume' },
  { label: 'Widgets' },
  { label: 'Design' },
  { label: 'Fertig' },
]

export default function WizardShell() {
  const step = useWizardStore((s) => s.step)

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-1">apuVIS</h1>
          <p className="text-slate-400 text-sm">Dein modernes ioBroker Dashboard</p>
        </div>

        {/* Progress */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => {
            const num = i + 1
            const done = step > num
            const active = step === num
            return (
              <div key={num} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      done
                        ? 'bg-green-500 text-white'
                        : active
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {done ? '✓' : num}
                  </div>
                  <span className={`text-xs hidden sm:block ${active ? 'text-white' : 'text-slate-500'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      step > num ? 'bg-green-500' : 'bg-slate-700'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Step content */}
        <div className="bg-slate-900 rounded-2xl border border-white/5 p-6 shadow-2xl">
          {step === 1 && <Step1_ServerAddress />}
          {step === 2 && <Step2_RoomDiscovery />}
          {step === 3 && <Step3_WidgetSelection />}
          {step === 4 && <Step4_ThemeLayout />}
          {step === 5 && <Step5_Confirmation />}
        </div>
      </div>
    </div>
  )
}
