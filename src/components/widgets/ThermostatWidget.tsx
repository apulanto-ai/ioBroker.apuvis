import { Thermometer, ChevronUp, ChevronDown } from 'lucide-react'
import { useIoBrokerState } from '../../hooks/useIoBrokerState'
import type { ThermostatWidgetConfig } from '../../types/widget.types'

export default function ThermostatWidget({ config }: { config: ThermostatWidgetConfig }) {
  const [setpointState, setSetpoint] = useIoBrokerState(config.setpointId)
  const [actualState] = useIoBrokerState(config.actualTempId)

  const setpoint = Number(setpointState?.val ?? 20)
  const actual = actualState ? Number(actualState.val) : null
  const step = config.step ?? 0.5

  const adjust = (delta: number) => {
    setSetpoint(Math.round((setpoint + delta) * 10) / 10)
  }

  return (
    <div className="flex items-center justify-between h-full">
      <div className="flex items-center gap-2">
        <Thermometer size={20} className="text-rose-400" />
        <div>
          {actual !== null && (
            <div className="text-2xl font-bold text-white">{actual.toFixed(1)}°</div>
          )}
          <div className="text-xs text-slate-400">Soll: {setpoint.toFixed(1)}°</div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <button
          onClick={() => adjust(step)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <ChevronUp size={16} />
        </button>
        <button
          onClick={() => adjust(-step)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  )
}
