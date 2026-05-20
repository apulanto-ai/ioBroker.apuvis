import { Power } from 'lucide-react'
import { useIoBrokerState } from '../../hooks/useIoBrokerState'
import { Switch } from '../ui/switch'
import type { SwitchWidgetConfig } from '../../types/widget.types'

export default function SwitchWidget({ config }: { config: SwitchWidgetConfig }) {
  const [state, setState] = useIoBrokerState(config.stateId)
  const isOn = Boolean(state?.val)

  return (
    <div className="flex items-center justify-between h-full">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg transition-colors ${isOn ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
          <Power size={20} />
        </div>
        <span className={`text-sm font-medium ${isOn ? 'text-white' : 'text-slate-400'}`}>
          {isOn ? 'An' : 'Aus'}
        </span>
      </div>
      <Switch
        checked={isOn}
        onCheckedChange={(v) => setState(v)}
        disabled={!state}
      />
    </div>
  )
}
