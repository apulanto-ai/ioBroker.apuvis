import { useAppStore } from '../../store/useAppStore'
import { cn } from '../../lib/utils/cn'

export default function ConnectionBadge() {
  const status = useAppStore((s) => s.connectionStatus)

  const config = {
    connected: { dot: 'bg-green-400', label: 'Verbunden', text: 'text-green-400' },
    connecting: { dot: 'bg-amber-400 animate-pulse', label: 'Verbinde...', text: 'text-amber-400' },
    reconnecting: { dot: 'bg-amber-400 animate-pulse', label: 'Reconnect...', text: 'text-amber-400' },
    disconnected: { dot: 'bg-red-500', label: 'Getrennt', text: 'text-red-400' },
  }[status]

  return (
    <div className={cn('flex items-center gap-1.5 text-xs', config.text)}>
      <span className={cn('w-2 h-2 rounded-full', config.dot)} />
      <span className="hidden sm:inline">{config.label}</span>
    </div>
  )
}
