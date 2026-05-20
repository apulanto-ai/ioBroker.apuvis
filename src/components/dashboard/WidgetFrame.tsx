import { GripVertical, X } from 'lucide-react'
import { cn } from '../../lib/utils/cn'
import type { WidgetConfig } from '../../types/widget.types'

interface WidgetFrameProps {
  widget: WidgetConfig
  editMode: boolean
  onRemove: () => void
  children: React.ReactNode
}

export function WidgetFrame({ widget, editMode, onRemove, children }: WidgetFrameProps) {
  return (
    <div className={cn(
      'h-full rounded-xl border border-white/5 bg-slate-900 flex flex-col overflow-hidden',
      editMode && 'ring-1 ring-blue-500/30 ring-offset-1 ring-offset-transparent'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1 flex-shrink-0">
        <span className="text-xs font-medium text-slate-400 truncate">{widget.title}</span>
        {editMode && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="drag-handle cursor-grab active:cursor-grabbing p-1 text-slate-600 hover:text-slate-400">
              <GripVertical size={14} />
            </div>
            <button
              onClick={onRemove}
              className="p-1 text-slate-600 hover:text-red-400 transition-colors rounded"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-3 pb-3 min-h-0">
        {children}
      </div>
    </div>
  )
}
