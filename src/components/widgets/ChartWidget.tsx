import { useState, useEffect } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { getHistory } from '../../lib/ioBroker/iobroker-api'
import { useIoBrokerState } from '../../hooks/useIoBrokerState'
import type { ChartWidgetConfig } from '../../types/widget.types'
import type { HistoryDataPoint } from '../../lib/ioBroker/iobroker-types'

const RANGES = [
  { label: '1h', value: '1h', ms: 3_600_000 },
  { label: '6h', value: '6h', ms: 6 * 3_600_000 },
  { label: '24h', value: '24h', ms: 24 * 3_600_000 },
  { label: '7d', value: '7d', ms: 7 * 86_400_000 },
] as const

export default function ChartWidget({ config }: { config: ChartWidgetConfig }) {
  const [range, setRange] = useState(config.defaultRange ?? '24h')
  const [data, setData] = useState<HistoryDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [liveState] = useIoBrokerState(config.stateId)

  useEffect(() => {
    const ms = RANGES.find((r) => r.value === range)?.ms ?? 86_400_000
    setLoading(true)
    getHistory(config.stateId, { start: Date.now() - ms, end: Date.now(), aggregate: 'minmax', count: 200 })
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [config.stateId, range])

  const currentVal = liveState?.val !== undefined && liveState?.val !== null
    ? typeof liveState.val === 'number' ? liveState.val.toFixed(1) : String(liveState.val)
    : null

  const chartData = data
    .filter((d) => d.val !== null)
    .map((d) => ({ ts: d.ts, val: d.val as number }))

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center justify-between flex-shrink-0">
        {currentVal !== null && (
          <span className="text-xl font-bold text-white">
            {currentVal}
            {config.unit && <span className="text-sm font-normal text-slate-400 ml-1">{config.unit}</span>}
          </span>
        )}
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                range === r.value ? 'bg-blue-500/30 text-blue-300' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-slate-500">Lade...</div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-slate-600">Keine Daten</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 2, right: 4, left: -20, bottom: 2 }}>
              <XAxis
                dataKey="ts"
                type="number"
                domain={['auto', 'auto']}
                scale="time"
                tickFormatter={(ts) => format(new Date(ts), 'HH:mm', { locale: de })}
                tick={{ fill: '#475569', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#475569', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, fontSize: 12 }}
                labelFormatter={(ts) => format(new Date(Number(ts)), 'dd.MM HH:mm', { locale: de })}
                formatter={(v) => [`${Number(v).toFixed(1)}${config.unit ? ' ' + config.unit : ''}`, config.title]}
              />
              <Line
                type="monotone"
                dataKey="val"
                stroke={config.color ?? '#3b82f6'}
                dot={false}
                strokeWidth={1.5}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
