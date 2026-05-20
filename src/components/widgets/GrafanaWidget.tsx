import { BarChart2 } from 'lucide-react'
import type { GrafanaWidgetConfig } from '../../types/widget.types'

export default function GrafanaWidget({ config }: { config: GrafanaWidgetConfig }) {
  if (!config.grafanaUrl || !config.dashboardUid || !config.panelId) {
    return (
      <div className="flex items-center gap-2 h-full text-slate-500 text-xs">
        <BarChart2 size={16} />
        Grafana nicht konfiguriert
      </div>
    )
  }

  const params = new URLSearchParams({
    orgId: String(config.orgId ?? 1),
    panelId: String(config.panelId),
    theme: config.theme ?? 'dark',
    from: config.from ?? 'now-24h',
    to: config.to ?? 'now',
  })

  const url = `${config.grafanaUrl}/d-solo/${config.dashboardUid}?${params.toString()}`

  return (
    <div className="h-full overflow-hidden rounded-lg">
      <iframe
        src={url}
        className="w-full h-full border-0"
        title={config.title}
      />
    </div>
  )
}
