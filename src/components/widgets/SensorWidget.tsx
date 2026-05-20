import { Activity } from 'lucide-react'
import { useIoBrokerState } from '../../hooks/useIoBrokerState'
import type { SensorWidgetConfig } from '../../types/widget.types'

export default function SensorWidget({ config }: { config: SensorWidgetConfig }) {
  const [state] = useIoBrokerState(config.stateId)
  const val = state?.val

  const display =
    val === null || val === undefined
      ? '–'
      : typeof val === 'boolean'
      ? val ? 'Ja' : 'Nein'
      : typeof val === 'number'
      ? Number.isInteger(val) ? String(val) : val.toFixed(1)
      : String(val)

  return (
    <div className="flex items-center justify-between h-full">
      <Activity size={18} className="text-slate-500" />
      <div className="text-right">
        <div className="text-2xl font-bold text-white">
          {display}
          {config.unit && <span className="text-sm font-normal text-slate-400 ml-1">{config.unit}</span>}
        </div>
        {!state && <div className="text-xs text-slate-600">Laden...</div>}
      </div>
    </div>
  )
}
