import { Menu, Lock, Unlock } from 'lucide-react'
import ConnectionBadge from './ConnectionBadge'
import { Button } from '../ui/button'

interface TopBarProps {
  title?: string
  editMode?: boolean
  onToggleEdit?: () => void
  onToggleSidebar?: () => void
}

export default function TopBar({ title, editMode, onToggleEdit, onToggleSidebar }: TopBarProps) {
  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-white/5 bg-slate-950/80 backdrop-blur-sm flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded transition-colors"
        >
          <Menu size={18} />
        </button>
        {title && <span className="text-sm font-medium text-slate-200">{title}</span>}
      </div>

      <div className="flex items-center gap-3">
        <ConnectionBadge />
        {onToggleEdit && (
          <Button variant="ghost" size="sm" onClick={onToggleEdit} className="gap-1.5 text-xs">
            {editMode ? <Unlock size={14} /> : <Lock size={14} />}
            {editMode ? 'Fertig' : 'Bearbeiten'}
          </Button>
        )}
      </div>
    </header>
  )
}
