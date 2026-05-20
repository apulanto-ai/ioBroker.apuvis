import { Lightbulb } from 'lucide-react'
import { useIoBrokerState } from '../../hooks/useIoBrokerState'
import { Switch } from '../ui/switch'
import { Slider } from '../ui/slider'
import type { LightWidgetConfig } from '../../types/widget.types'

export default function LightWidget({ config }: { config: LightWidgetConfig }) {
  const [onState, setOn] = useIoBrokerState(config.stateId)
  const [brightnessState, setBrightness] = useIoBrokerState(config.brightnessId)

  const isOn = Boolean(onState?.val)
  const brightness = Number(brightnessState?.val ?? 100)

  return (
    <div className="flex flex-col justify-between h-full gap-3">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg transition-colors ${isOn ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
          <Lightbulb size={20} />
        </div>
        <Switch checked={isOn} onCheckedChange={(v) => setOn(v)} />
      </div>

      {config.brightnessId && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Helligkeit</span>
            <span>{brightness}%</span>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[brightness]}
            onValueChange={([v]) => setBrightness(v)}
            disabled={!isOn}
            className={!isOn ? 'opacity-40' : ''}
          />
        </div>
      )}
    </div>
  )
}
